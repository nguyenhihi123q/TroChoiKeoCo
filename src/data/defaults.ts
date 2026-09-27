// Giá trị mặc định cho trò chơi mới và trò chơi mẫu ban đầu.
import type { GameConfig } from '../types';
import { uid } from '../utils/id';
import { SAMPLE_QUESTIONS } from './sampleQuestions';

export const DURATION_OPTIONS = [60, 120, 180, 300];
export const FREEZE_MIN = 1;
export const FREEZE_MAX = 10;

/** Cấu hình mặc định khi tạo trò chơi mới (theo kế hoạch nghiên cứu). */
export function defaultConfig(): GameConfig {
  const now = new Date().toISOString();
  return {
    id: uid('game-'),
    title: 'Kéo co kiến thức về lối sống xanh',
    teamNames: ['Đội Xanh', 'Đội Đỏ'],
    durationSeconds: 300,
    winThreshold: 5,
    freezeSeconds: 3,
    mode: 'independent',
    inputMode: 'touch',
    shuffleQuestions: true,
    shuffleOptions: true,
    endWhenQuestionsExhausted: false,
    soundEnabled: true,
    musicEnabled: true,
    volume: 0.6,
    questions: [],
    createdAt: now,
    updatedAt: now,
  };
}

/** Trò chơi mẫu về lối sống xanh, có sẵn để chơi ngay lần đầu mở ứng dụng. */
export function sampleGame(): GameConfig {
  const now = new Date().toISOString();
  return {
    id: 'sample-song-xanh',
    title: 'Sống xanh & ứng phó bão lụt (bài mẫu)',
    teamNames: ['Đội Xanh', 'Đội Đỏ'],
    durationSeconds: 300,
    winThreshold: 5,
    freezeSeconds: 3,
    mode: 'independent',
    inputMode: 'touch',
    shuffleQuestions: true,
    shuffleOptions: true,
    endWhenQuestionsExhausted: false,
    soundEnabled: true,
    musicEnabled: true,
    volume: 0.6,
    questions: SAMPLE_QUESTIONS.map((q) => ({ ...q, options: q.options.map((o) => ({ ...o })) })),
    createdAt: now,
    updatedAt: now,
  };
}
