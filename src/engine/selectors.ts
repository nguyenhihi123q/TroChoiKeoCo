// Bộ chọn dữ liệu (selectors) cho tầng giao diện: câu hỏi hiện tại, thứ tự
// đáp án theo đội, nhãn A/B/C/D theo vị trí và phím tắt.
import type { Option, Question, Side } from '../types';
import type { MatchState } from './model';
import { teamQuestionIndex } from './reducer';

export const POSITION_LABELS = ['A', 'B', 'C', 'D'];
export const KEY_HINTS: Record<Side, string[]> = {
  blue: ['Q', 'W', 'A', 'S'],
  red: ['O', 'P', 'K', 'L'],
};

export interface DisplayOption {
  option: Option;
  label: string; // nhãn theo vị trí hiện tại (A/B/C/D)
  keyHint: string; // phím tắt theo vị trí
  isCorrect: boolean;
}

/** Câu hỏi hiện tại mà một đội đang gặp. */
export function currentQuestion(state: MatchState, side: Side): Question | null {
  const idx = teamQuestionIndex(state, side);
  return state.questions[idx] ?? null;
}

/** Đáp án đã sắp thứ tự theo đội, kèm nhãn vị trí và phím tắt. */
export function orderedOptions(state: MatchState, side: Side): DisplayOption[] {
  const q = currentQuestion(state, side);
  if (!q) return [];
  const orderIds = state.optionOrders[side][q.id] ?? q.options.map((o) => o.id);
  const byId = new Map(q.options.map((o) => [o.id, o] as const));
  const hints = KEY_HINTS[side];
  return orderIds
    .map((id, i) => {
      const option = byId.get(id);
      if (!option) return null;
      return {
        option,
        label: POSITION_LABELS[i] ?? '',
        keyHint: hints[i] ?? '',
        isCorrect: q.correctOptionId === id,
      } satisfies DisplayOption;
    })
    .filter((x): x is DisplayOption => x !== null);
}

/** Thời gian còn lại (ms) của trận. Không áp dụng cho loạt sinh tử. */
export function timeLeftMs(state: MatchState): number {
  if (state.durationMs <= 0) return 0;
  return Math.max(0, state.durationMs - state.clockMs);
}

/** Vị trí dây theo tỉ lệ [-1, 1]: âm nghiêng về Xanh, dương nghiêng về Đỏ. */
export function ropeFraction(state: MatchState): number {
  const t = state.config.winThreshold || 1;
  return Math.max(-1, Math.min(1, state.rope / t));
}

/** Thời gian còn lại của lượt sinh tử (ms). */
export function suddenDeathLeftMs(state: MatchState): number {
  if (state.phase !== 'suddenDeath' || state.sdRoundEndsAt === null) return 0;
  return Math.max(0, state.sdRoundEndsAt - state.clockMs);
}
