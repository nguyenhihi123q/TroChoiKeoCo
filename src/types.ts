// Kiểu dữ liệu dùng chung cho toàn bộ ứng dụng Kéo co kiến thức.

/** Chế độ chơi. independent = Độc lập, shared = Cùng câu hỏi, race = Chạm mốc. */
export type GameMode = 'independent' | 'shared' | 'race';

/** Phương thức điều khiển. */
export type InputMode = 'touch' | 'keyboard';

/** Hai phía sân: blue = đội trái, red = đội phải. */
export type Side = 'blue' | 'red';

/** Một lựa chọn đáp án, có ID ổn định để chấm theo ID chứ không theo vị trí. */
export interface Option {
  id: string;
  text: string;
}

/** Một câu hỏi trắc nghiệm 4 lựa chọn. */
export interface Question {
  id: string;
  text: string;
  options: Option[];
  correctOptionId: string;
  explanation: string;
  topic: string;
  sourceUrl?: string;
}

/** Cấu hình một trò chơi (một "bài" trong thư viện). */
export interface GameConfig {
  id: string;
  title: string;
  teamNames: [string, string];
  durationSeconds: number;
  winThreshold: number;
  freezeSeconds: number;
  mode: GameMode;
  inputMode: InputMode;
  shuffleQuestions: boolean;
  shuffleOptions: boolean;
  endWhenQuestionsExhausted: boolean;
  soundEnabled: boolean;
  musicEnabled: boolean;
  volume: number;
  questions: Question[];
  createdAt: string;
  updatedAt: string;
}

/** Bản ghi lưu trữ có phiên bản để migrate an toàn. */
export interface StorageEnvelope {
  version: number;
  games: GameConfig[];
}

/** Kết quả xuất một trò chơi ra JSON. */
export interface GameExport {
  kind: 'keo-co-kien-thuc/game';
  version: number;
  game: GameConfig;
}
