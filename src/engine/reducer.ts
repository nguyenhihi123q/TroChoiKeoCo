// Bộ máy trận đấu thuần (pure reducer). Mọi mốc thời gian đến từ action TICK
// mang match-clock ms, nên toàn bộ logic kiểm thử được bằng đồng hồ giả.
import type { Side } from '../types';
import {
  FEEDBACK_MS,
  SUDDEN_DEATH_ROUND_MS,
  type AnswerEvent,
  type MatchAction,
  type MatchResult,
  type MatchState,
  type TeamState,
} from './model';
import { initMatch, nextRoundOrder } from './setup';
import { seedFromString } from '../utils/rng';

const SIDES: Side[] = ['blue', 'red'];

function clone(s: MatchState): MatchState {
  return {
    ...s,
    teams: { blue: { ...s.teams.blue }, red: { ...s.teams.red } },
    inbox: s.inbox.slice(),
  };
}

function isCorrect(s: MatchState, questionIndex: number, optionId: string): boolean {
  const q = s.questions[questionIndex];
  return !!q && q.correctOptionId === optionId;
}

/** Chỉ số câu (trong mảng questions) mà một đội đang gặp. */
export function teamQuestionIndex(s: MatchState, side: Side): number {
  if (s.mode === 'shared') return s.sharedOrder[s.sharedCursor];
  if (s.phase === 'suddenDeath') return s.sdPool[s.sdCursor];
  return s.teams[side].order[s.teams[side].cursor];
}

function recomputeRope(s: MatchState): void {
  s.rope = s.teams.red.score - s.teams.blue.score;
}

function advanceTeam(s: MatchState, side: Side): void {
  const t = s.teams[side];
  const lastIndex = t.order[t.cursor] ?? null;
  const nextCursor = t.cursor + 1;
  if (nextCursor < t.order.length) {
    t.cursor = nextCursor;
  } else if (s.config.endWhenQuestionsExhausted && s.mode !== 'race') {
    t.completed = true;
  } else {
    const round = t.round + 1;
    t.order = nextRoundOrder(s.questions.length, s.config.shuffleQuestions, s.seed, round, lastIndex);
    t.round = round;
    t.cursor = 0;
  }
  t.feedback = null;
  t.pendingAdvance = false;
  t.lockUntil = null;
}

function advanceShared(s: MatchState): void {
  const lastIndex = s.sharedOrder[s.sharedCursor] ?? null;
  const nextCursor = s.sharedCursor + 1;
  if (nextCursor < s.sharedOrder.length) {
    s.sharedCursor = nextCursor;
  } else if (s.config.endWhenQuestionsExhausted) {
    s.teams.blue.completed = true;
    s.teams.red.completed = true;
    return;
  } else {
    const round = s.sharedRound + 1;
    s.sharedOrder = nextRoundOrder(s.questions.length, s.config.shuffleQuestions, s.seed, round, lastIndex);
    s.sharedRound = round;
    s.sharedCursor = 0;
  }
  s.sharedLocked = false;
  s.sharedAdvanceAt = null;
  for (const side of SIDES) {
    if (s.teams[side].feedback !== 'wrong') s.teams[side].feedback = null;
  }
}

function finish(s: MatchState, result: MatchResult): void {
  s.phase = 'finished';
  s.result = result;
  s.inbox = [];
  for (const side of SIDES) {
    const t = s.teams[side];
    t.frozenUntil = null;
    t.lockUntil = null;
    t.pendingAdvance = false;
    t.feedback = null;
  }
}

function enterSuddenDeath(s: MatchState, now: number): void {
  s.phase = 'suddenDeath';
  s.sdPool = nextRoundOrder(s.questions.length, true, s.seed, 999, null);
  s.sdCursor = 0;
  s.sdRoundEndsAt = now + SUDDEN_DEATH_ROUND_MS;
  for (const side of SIDES) {
    const t = s.teams[side];
    t.sdAnswered = false;
    t.sdLocked = false;
    t.frozenUntil = null;
    t.lockUntil = null;
    t.pendingAdvance = false;
    t.feedback = null;
  }
}

function nextSuddenDeath(s: MatchState, now: number): void {
  let cursor = s.sdCursor + 1;
  if (cursor >= s.sdPool.length) {
    const last = s.sdPool[s.sdCursor] ?? null;
    s.sdPool = nextRoundOrder(s.questions.length, true, s.seed, s.sdCursor + 17, last);
    cursor = 0;
  }
  s.sdCursor = cursor;
  s.sdRoundEndsAt = now + SUDDEN_DEATH_ROUND_MS;
  for (const side of SIDES) {
    s.teams[side].sdAnswered = false;
    s.teams[side].sdLocked = false;
    s.teams[side].feedback = null;
  }
}

function resolveByScore(s: MatchState, now: number, reason: string): void {
  const b = s.teams.blue.score;
  const r = s.teams.red.score;
  if (b > r) finish(s, { winner: 'blue', reason });
  else if (r > b) finish(s, { winner: 'red', reason });
  else enterSuddenDeath(s, now);
}

function takeAnswers(s: MatchState): Partial<Record<Side, AnswerEvent>> {
  const picked: Partial<Record<Side, AnswerEvent>> = {};
  for (const ev of s.inbox) {
    if (ev.matchVersion !== s.version) continue; // sự kiện từ trận đã reset
    if (picked[ev.side]) continue; // bỏ nhấp đúp trong cùng frame
    picked[ev.side] = ev;
  }
  s.inbox = [];
  return picked;
}

function expireTimers(s: MatchState, now: number): void {
  for (const side of SIDES) {
    const t = s.teams[side];
    if (t.frozenUntil !== null && now >= t.frozenUntil) {
      t.frozenUntil = null;
      if (t.feedback === 'wrong') t.feedback = null;
    }
  }
  if (s.mode === 'shared') {
    if (s.sharedAdvanceAt !== null && now >= s.sharedAdvanceAt) advanceShared(s);
  } else {
    for (const side of SIDES) {
      const t = s.teams[side];
      if (t.pendingAdvance && t.lockUntil !== null && now >= t.lockUntil) advanceTeam(s, side);
    }
  }
}

function canAnswerProgress(t: TeamState, now: number): boolean {
  return (
    !t.completed &&
    t.frozenUntil === null &&
    !t.pendingAdvance &&
    (t.lockUntil === null || now >= t.lockUntil)
  );
}

function processProgress(s: MatchState, now: number, picked: Partial<Record<Side, AnswerEvent>>): void {
  const freezeMs = s.config.freezeSeconds * 1000;
  for (const side of SIDES) {
    const ev = picked[side];
    if (!ev) continue;
    const t = s.teams[side];
    if (!canAnswerProgress(t, now)) continue;
    const qIndex = teamQuestionIndex(s, side);
    const curQ = s.questions[qIndex];
    if (!curQ || curQ.id !== ev.questionId) continue;
    t.attempts += 1;
    if (isCorrect(s, qIndex, ev.optionId)) {
      t.score += 1;
      t.feedback = 'correct';
      t.pendingAdvance = true;
      t.lockUntil = now + FEEDBACK_MS;
    } else {
      t.wrong += 1;
      t.feedback = 'wrong';
      t.frozenUntil = now + freezeMs;
    }
  }
  recomputeRope(s);
}

function processShared(s: MatchState, now: number, picked: Partial<Record<Side, AnswerEvent>>): void {
  const freezeMs = s.config.freezeSeconds * 1000;
  const qIndex = s.sharedOrder[s.sharedCursor];
  const curQ = s.questions[qIndex];
  if (!curQ) return;

  const results: Partial<Record<Side, 'correct' | 'wrong'>> = {};
  for (const side of SIDES) {
    const ev = picked[side];
    if (!ev) continue;
    const t = s.teams[side];
    const usable = t.frozenUntil === null || now >= t.frozenUntil;
    if (!usable || s.sharedLocked || ev.questionId !== curQ.id) continue;
    t.attempts += 1;
    results[side] = isCorrect(s, qIndex, ev.optionId) ? 'correct' : 'wrong';
  }

  for (const side of SIDES) {
    if (results[side] === 'wrong') {
      const t = s.teams[side];
      t.wrong += 1;
      t.feedback = 'wrong';
      t.frozenUntil = now + freezeMs;
    }
  }

  if (!s.sharedLocked) {
    const correctSides = SIDES.filter((sd) => results[sd] === 'correct');
    if (correctSides.length === 1) {
      const w = correctSides[0];
      s.teams[w].score += 1;
      s.teams[w].feedback = 'correct';
      s.sharedLocked = true;
      s.sharedAdvanceAt = now + FEEDBACK_MS;
    } else if (correctSides.length === 2) {
      // đồng thời: không đổi chênh lệch, chỉ báo rồi chuyển câu
      s.teams.blue.feedback = 'tie';
      s.teams.red.feedback = 'tie';
      s.sharedLocked = true;
      s.sharedAdvanceAt = now + FEEDBACK_MS;
    }
  }
  recomputeRope(s);
}

function processSuddenDeath(s: MatchState, now: number, picked: Partial<Record<Side, AnswerEvent>>): void {
  const qIndex = s.sdPool[s.sdCursor];
  const curQ = s.questions[qIndex];
  if (!curQ) return;
  const correctSides: Side[] = [];
  for (const side of SIDES) {
    const ev = picked[side];
    if (!ev) continue;
    const t = s.teams[side];
    if (t.sdAnswered || t.sdLocked || ev.questionId !== curQ.id) continue;
    t.sdAnswered = true;
    t.attempts += 1;
    if (isCorrect(s, qIndex, ev.optionId)) correctSides.push(side);
    else {
      t.wrong += 1;
      t.sdLocked = true;
      t.feedback = 'wrong';
    }
  }
  if (correctSides.length === 1) {
    const w = correctSides[0];
    s.teams[w].score += 1;
    s.teams[w].feedback = 'correct';
    recomputeRope(s);
    finish(s, { winner: w, reason: 'Chiến thắng ở loạt sinh tử' });
    return;
  }
  if (correctSides.length === 2) {
    nextSuddenDeath(s, now);
    return;
  }
  if (SIDES.every((sd) => s.teams[sd].sdLocked || s.teams[sd].sdAnswered)) {
    nextSuddenDeath(s, now);
  }
}

function checkEndPlaying(s: MatchState, now: number): void {
  if (s.mode === 'race') {
    const t = s.config.winThreshold;
    const blue = s.teams.blue.score >= t;
    const red = s.teams.red.score >= t;
    if (blue && red) return enterSuddenDeath(s, now);
    if (blue) return finish(s, { winner: 'blue', reason: 'Đạt mốc điểm trước' });
    if (red) return finish(s, { winner: 'red', reason: 'Đạt mốc điểm trước' });
  } else {
    const t = s.config.winThreshold;
    if (s.rope <= -t) return finish(s, { winner: 'blue', reason: 'Đạt ngưỡng chênh lệch điểm' });
    if (s.rope >= t) return finish(s, { winner: 'red', reason: 'Đạt ngưỡng chênh lệch điểm' });
  }

  if (s.config.endWhenQuestionsExhausted && s.mode !== 'race') {
    if (s.teams.blue.completed && s.teams.red.completed) {
      return resolveByScore(s, now, 'Đã trả lời hết câu hỏi');
    }
  }

  if (s.durationMs > 0 && now >= s.durationMs) {
    resolveByScore(s, now, 'Hết thời gian thi đấu');
  }
}

function tick(state: MatchState, now: number): MatchState {
  if (state.phase !== 'playing' && state.phase !== 'suddenDeath') return state;
  const s = clone(state);
  s.clockMs = now;
  const picked = takeAnswers(s);

  if (s.phase === 'playing') {
    if (s.mode === 'shared') processShared(s, now, picked);
    else processProgress(s, now, picked);
    expireTimers(s, now);
    checkEndPlaying(s, now);
  } else {
    processSuddenDeath(s, now, picked);
    if (s.phase === 'suddenDeath' && s.sdRoundEndsAt !== null && now >= s.sdRoundEndsAt) {
      nextSuddenDeath(s, now);
    }
  }
  return s;
}

export function matchReducer(state: MatchState, action: MatchAction): MatchState {
  switch (action.type) {
    case 'START': {
      if (state.phase !== 'ready') return state;
      const s = clone(state);
      s.phase = 'countdown';
      s.countdownValue = 3;
      return s;
    }
    case 'SET_COUNTDOWN': {
      if (state.phase !== 'countdown') return state;
      const s = clone(state);
      s.countdownValue = action.value;
      return s;
    }
    case 'BEGIN_PLAY': {
      if (state.phase !== 'countdown') return state;
      const s = clone(state);
      s.phase = 'playing';
      s.clockMs = 0;
      s.countdownValue = 0;
      return s;
    }
    case 'ANSWER': {
      if (state.phase !== 'playing' && state.phase !== 'suddenDeath') return state;
      const s = clone(state);
      s.inbox.push({
        side: action.side,
        optionId: action.optionId,
        questionId: action.questionId,
        matchVersion: action.matchVersion,
      });
      return s;
    }
    case 'TICK':
      return tick(state, action.clockMs);
    case 'PAUSE': {
      if (state.phase !== 'playing' && state.phase !== 'suddenDeath') return state;
      const s = clone(state);
      s.phase = 'paused';
      return s;
    }
    case 'RESUME': {
      if (state.phase !== 'paused') return state;
      const s = clone(state);
      s.phase = s.sdPool.length > 0 && s.result === null ? 'suddenDeath' : 'playing';
      return s;
    }
    case 'SKIP': {
      if (state.phase !== 'playing' || state.mode === 'shared') return state;
      const s = clone(state);
      s.teams[action.side].frozenUntil = null;
      advanceTeam(s, action.side);
      return s;
    }
    case 'SKIP_SHARED': {
      if (state.phase !== 'playing' || state.mode !== 'shared') return state;
      const s = clone(state);
      s.teams.blue.frozenUntil = null;
      s.teams.red.frozenUntil = null;
      s.sharedLocked = false;
      s.sharedAdvanceAt = null;
      advanceShared(s);
      return s;
    }
    case 'ADJUST_SCORE': {
      if (state.phase === 'ready' || state.phase === 'countdown') return state;
      const s = clone(state);
      const t = s.teams[action.side];
      t.score = Math.max(0, t.score + action.delta);
      recomputeRope(s);
      return s;
    }
    case 'MANUAL_FINISH': {
      if (state.phase === 'ready') return state;
      const s = clone(state);
      finish(s, { winner: action.winner, reason: 'Giáo viên kết thúc trận' });
      return s;
    }
    case 'RESTART': {
      const seed = seedFromString(state.config.id + ':restart:' + (state.version + 1) + ':' + Date.now());
      const fresh = initMatch(state.config, seed);
      fresh.version = state.version + 1;
      return fresh;
    }
    default:
      return state;
  }
}

export { initMatch };
