// Kiểm tra và chuẩn hóa dữ liệu từ file nhập hoặc localStorage trước khi dùng.
// Văn bản luôn được hiển thị dạng text (React tự escape), không chạy HTML.
import type { GameConfig, GameMode, InputMode, Option, Question } from '../types';
import { uid } from '../utils/id';

export type Issues = string[];

const MODES: GameMode[] = ['independent', 'shared', 'race'];
const INPUTS: InputMode[] = ['touch', 'keyboard'];

function asText(v: unknown): string {
  if (typeof v === 'string') return v;
  if (typeof v === 'number' || typeof v === 'boolean') return String(v);
  return '';
}

function clampInt(v: unknown, min: number, max: number, fallback: number): number {
  const n = Math.round(Number(v));
  if (!Number.isFinite(n)) return fallback;
  return Math.max(min, Math.min(max, n));
}

/** Chuẩn hóa một câu hỏi. Trả về câu hợp lệ hoặc danh sách lỗi cụ thể. */
export function coerceQuestion(
  raw: unknown,
  label: string,
): { question?: Question; issues: Issues } {
  const issues: Issues = [];
  if (!raw || typeof raw !== 'object') {
    return { issues: [`${label}: dữ liệu câu hỏi không hợp lệ.`] };
  }
  const r = raw as Record<string, unknown>;
  const text = asText(r.text).trim();
  if (!text) issues.push(`${label}: thiếu nội dung câu hỏi.`);

  const rawOptions = Array.isArray(r.options) ? r.options : [];
  if (rawOptions.length !== 4) {
    issues.push(`${label}: cần đúng 4 lựa chọn (hiện có ${rawOptions.length}).`);
  }
  const options: Option[] = rawOptions.slice(0, 4).map((o, i) => {
    const obj = (o && typeof o === 'object' ? o : {}) as Record<string, unknown>;
    const t = asText(obj.text).trim();
    if (!t) issues.push(`${label}: lựa chọn ${i + 1} bị trống.`);
    return { id: asText(obj.id).trim() || uid('opt-'), text: t };
  });

  let correctOptionId = asText(r.correctOptionId).trim();
  if (!options.some((o) => o.id === correctOptionId)) {
    // Cho phép chỉ định đáp án đúng bằng A/B/C/D hoặc chỉ số.
    const byLetter = 'ABCD'.indexOf(asText(r.correctAnswer).trim().toUpperCase());
    if (byLetter >= 0 && options[byLetter]) {
      correctOptionId = options[byLetter].id;
    } else {
      issues.push(`${label}: chưa xác định được đáp án đúng.`);
    }
  }

  if (issues.length > 0) return { issues };
  return {
    issues,
    question: {
      id: asText(r.id).trim() || uid('q-'),
      text,
      options,
      correctOptionId,
      explanation: asText(r.explanation).trim(),
      topic: asText(r.topic).trim() || 'Chung',
      sourceUrl: asText(r.sourceUrl).trim() || undefined,
    },
  };
}

/** Chuẩn hóa danh sách câu hỏi, báo lỗi theo từng câu. */
export function coerceQuestions(raw: unknown): { questions: Question[]; issues: Issues } {
  const arr = Array.isArray(raw) ? raw : [];
  const questions: Question[] = [];
  const issues: Issues = [];
  arr.forEach((item, i) => {
    const res = coerceQuestion(item, `Câu ${i + 1}`);
    if (res.question) questions.push(res.question);
    issues.push(...res.issues);
  });
  return { questions, issues };
}

/** Chuẩn hóa cấu hình một trò chơi từ dữ liệu bất kỳ (import/localStorage). */
export function coerceGame(raw: unknown): { game?: GameConfig; issues: Issues } {
  const issues: Issues = [];
  if (!raw || typeof raw !== 'object') {
    return { issues: ['Dữ liệu trò chơi không hợp lệ.'] };
  }
  const r = raw as Record<string, unknown>;
  const title = asText(r.title).trim();
  if (!title) issues.push('Thiếu tiêu đề trò chơi.');

  const { questions, issues: qIssues } = coerceQuestions(r.questions);
  issues.push(...qIssues);

  const mode = MODES.includes(r.mode as GameMode) ? (r.mode as GameMode) : 'independent';
  const inputMode = INPUTS.includes(r.inputMode as InputMode)
    ? (r.inputMode as InputMode)
    : 'touch';

  const teams = Array.isArray(r.teamNames) ? r.teamNames : [];
  const teamNames: [string, string] = [
    asText(teams[0]).trim() || 'Đội Xanh',
    asText(teams[1]).trim() || 'Đội Đỏ',
  ];

  const now = new Date().toISOString();
  const game: GameConfig = {
    id: asText(r.id).trim() || uid('game-'),
    title: title || 'Trò chơi chưa đặt tên',
    teamNames,
    durationSeconds: clampInt(r.durationSeconds, 10, 3600, 300),
    winThreshold: clampInt(r.winThreshold, 1, 999, 5),
    freezeSeconds: clampInt(r.freezeSeconds, 1, 10, 3),
    mode,
    inputMode,
    shuffleQuestions: r.shuffleQuestions !== false,
    shuffleOptions: r.shuffleOptions !== false,
    endWhenQuestionsExhausted: r.endWhenQuestionsExhausted === true,
    soundEnabled: r.soundEnabled !== false,
    musicEnabled: r.musicEnabled !== false,
    volume: Math.max(0, Math.min(1, Number(r.volume) || 0.6)),
    questions,
    createdAt: asText(r.createdAt).trim() || now,
    updatedAt: now,
  };
  // Chỉ chặn khi không cứu vãn được (thiếu tiêu đề). Câu lỗi đã liệt kê ở trên.
  return { game, issues };
}

