// Khởi tạo trận và các hàm tạo thứ tự câu hỏi/đáp án.
import type { GameConfig, Question, Side } from '../types';
import { mulberry32, seedFromString, shuffle } from '../utils/rng';
import type { MatchState, TeamState } from './model';

const SIDES: Side[] = ['blue', 'red'];

/** Tạo thứ tự câu hỏi cho một vòng. Xác định theo (seed, round). */
export function makeOrder(
  count: number,
  shuffleQuestions: boolean,
  seed: number,
  round: number,
): number[] {
  const base = Array.from({ length: count }, (_, i) => i);
  if (!shuffleQuestions || count <= 1) return base;
  return shuffle(base, mulberry32((seed ^ Math.imul(round + 1, 2654435761)) >>> 0));
}

/**
 * Thứ tự câu cho vòng mới, tránh lặp lại ngay câu cuối của vòng trước.
 * Nếu câu đầu vòng mới trùng câu cuối vòng cũ, xoay mảng một bước.
 */
export function nextRoundOrder(
  count: number,
  shuffleQuestions: boolean,
  seed: number,
  round: number,
  lastIndex: number | null,
): number[] {
  const order = makeOrder(count, shuffleQuestions, seed, round);
  if (order.length > 1 && lastIndex !== null && order[0] === lastIndex) {
    order.push(order.shift() as number);
  }
  return order;
}

function makeOptionOrders(
  questions: Question[],
  shuffleOptions: boolean,
  seed: number,
): Record<Side, Record<string, string[]>> {
  const build = (side: Side): Record<string, string[]> => {
    const map: Record<string, string[]> = {};
    for (const q of questions) {
      const ids = q.options.map((o) => o.id);
      if (!shuffleOptions) {
        map[q.id] = ids;
      } else {
        const s = (seed ^ seedFromString(side + ':' + q.id)) >>> 0;
        map[q.id] = shuffle(ids, mulberry32(s));
      }
    }
    return map;
  };
  return { blue: build('blue'), red: build('red') };
}

function freshTeam(order: number[]): TeamState {
  return {
    score: 0,
    wrong: 0,
    attempts: 0,
    order,
    cursor: 0,
    round: 0,
    completed: false,
    frozenUntil: null,
    lockUntil: null,
    feedback: null,
    pendingAdvance: false,
    sdAnswered: false,
    sdLocked: false,
  };
}

/** Tạo trạng thái trận mới ở phase 'ready'. */
export function initMatch(config: GameConfig, seedInput?: number): MatchState {
  const seed = seedInput ?? seedFromString(config.id + ':' + Date.now());
  const questions = config.questions;
  const count = questions.length;
  const order = makeOrder(count, config.shuffleQuestions, seed, 0);

  return {
    phase: 'ready',
    mode: config.mode,
    config,
    questions,
    seed,
    teams: { blue: freshTeam(order.slice()), red: freshTeam(order.slice()) },
    rope: 0,
    clockMs: 0,
    durationMs: config.durationSeconds * 1000,
    countdownValue: 3,
    sharedOrder: order.slice(),
    sharedCursor: 0,
    sharedRound: 0,
    sharedLocked: false,
    sharedAdvanceAt: null,
    optionOrders: makeOptionOrders(questions, config.shuffleOptions, seed),
    sdPool: [],
    sdCursor: 0,
    sdRoundEndsAt: null,
    inbox: [],
    result: null,
    version: 0,
  };
}

export { SIDES };
