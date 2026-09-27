// Mô hình trạng thái của bộ máy trận đấu. Tách riêng để dễ đọc và kiểm thử.
import type { GameConfig, GameMode, Question, Side } from '../types';

/** Thời gian khóa phản hồi sau khi trả lời đúng (ms), trong khoảng 300–500. */
export const FEEDBACK_MS = 450;
/** Mỗi lượt sinh tử tối đa 20 giây. */
export const SUDDEN_DEATH_ROUND_MS = 20_000;

export type MatchPhase =
  | 'ready'
  | 'countdown'
  | 'playing'
  | 'paused'
  | 'suddenDeath'
  | 'finished';

export type Feedback = 'correct' | 'wrong' | 'tie' | null;

export interface MatchResult {
  winner: Side | 'draw';
  reason: string;
}

/** Trạng thái runtime của một đội. */
export interface TeamState {
  score: number;
  wrong: number;
  attempts: number;
  order: number[]; // thứ tự câu (chỉ số trong questions) cho chế độ độc lập/race
  cursor: number; // vị trí hiện tại trong order
  round: number; // số vòng đã lặp lại bộ câu
  completed: boolean; // đã hết bộ câu (khi bật "hết câu thì kết thúc")
  frozenUntil: number | null; // mốc match-clock ms hết đóng băng
  lockUntil: number | null; // mốc match-clock ms hết khóa phản hồi
  feedback: Feedback;
  pendingAdvance: boolean; // đang chờ chuyển câu sau khi đúng
  sdAnswered: boolean; // đã chọn trong lượt sinh tử hiện tại
  sdLocked: boolean; // bị khóa hết lượt sinh tử (đã sai)
}

export interface AnswerEvent {
  side: Side;
  optionId: string;
  questionId: string;
  matchVersion: number; // loại bỏ sự kiện từ trận đã reset
}

export interface MatchState {
  phase: MatchPhase;
  mode: GameMode;
  config: GameConfig;
  questions: Question[];
  seed: number;
  teams: Record<Side, TeamState>;
  rope: number; // = điểm Đỏ - điểm Xanh (chế độ độc lập & cùng câu)
  clockMs: number; // thời gian trận đã trôi (match-clock)
  durationMs: number;
  countdownValue: number;

  // Chế độ cùng câu hỏi
  sharedOrder: number[];
  sharedCursor: number;
  sharedRound: number;
  sharedLocked: boolean; // câu chung đã có người đúng, đang chuyển câu
  sharedAdvanceAt: number | null;

  // Thứ tự đáp án theo từng đội (map theo ID câu hỏi)
  optionOrders: Record<Side, Record<string, string[]>>;

  // Sinh tử
  sdPool: number[];
  sdCursor: number;
  sdRoundEndsAt: number | null;

  inbox: AnswerEvent[];
  result: MatchResult | null;
  version: number; // tăng mỗi lần reset
}

export type MatchAction =
  | { type: 'START' }
  | { type: 'SET_COUNTDOWN'; value: number }
  | { type: 'BEGIN_PLAY' }
  | { type: 'ANSWER'; side: Side; optionId: string; questionId: string; matchVersion: number }
  | { type: 'TICK'; clockMs: number }
  | { type: 'PAUSE' }
  | { type: 'RESUME' }
  | { type: 'SKIP'; side: Side }
  | { type: 'SKIP_SHARED' }
  | { type: 'ADJUST_SCORE'; side: Side; delta: number }
  | { type: 'MANUAL_FINISH'; winner: Side | 'draw' }
  | { type: 'RESTART' };

export const OTHER: Record<Side, Side> = { blue: 'red', red: 'blue' };
