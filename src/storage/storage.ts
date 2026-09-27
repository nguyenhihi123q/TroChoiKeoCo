// Lưu trữ thư viện trò chơi trên localStorage, có phiên bản dữ liệu và
// xuất/nhập JSON. Không làm trắng trang khi dữ liệu hỏng: giữ bản sao lỗi và
// báo cho người dùng.
import type { GameConfig, GameExport } from '../types';
import { sampleGame } from '../data/defaults';
import { uid } from '../utils/id';
import { coerceGame, type Issues } from './validation';

export const STORAGE_KEY = 'keo-co-kien-thuc:data';
export const BACKUP_KEY = 'keo-co-kien-thuc:backup';
export const SEEDED_KEY = 'keo-co-kien-thuc:seeded';
export const STORAGE_VERSION = 1;
export const EXPORT_VERSION = 1;

interface Envelope {
  version: number;
  games: GameConfig[];
}

let lastError: string | null = null;

export function getStorageError(): string | null {
  return lastError;
}

function hasLS(): boolean {
  try {
    return typeof localStorage !== 'undefined';
  } catch {
    return false;
  }
}

function readRaw(): string | null {
  if (!hasLS()) return null;
  try {
    return localStorage.getItem(STORAGE_KEY);
  } catch {
    return null;
  }
}

/** Nạp danh sách trò chơi. Dữ liệu hỏng được sao lưu và bỏ qua an toàn. */
export function loadGames(): GameConfig[] {
  lastError = null;
  const raw = readRaw();
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw) as Partial<Envelope>;
    const arr = Array.isArray(parsed?.games) ? parsed.games : [];
    const games: GameConfig[] = [];
    for (const g of arr) {
      const { game } = coerceGame(g);
      if (game) games.push(game);
    }
    return games;
  } catch {
    lastError = 'Dữ liệu lưu trong trình duyệt bị hỏng. Đã giữ một bản sao lưu để khôi phục.';
    try {
      if (hasLS() && raw) localStorage.setItem(BACKUP_KEY, raw);
    } catch {
      /* bỏ qua */
    }
    return [];
  }
}

function persist(games: GameConfig[]): void {
  if (!hasLS()) return;
  const envelope: Envelope = { version: STORAGE_VERSION, games };
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(envelope));
  } catch {
    lastError = 'Không thể lưu dữ liệu (bộ nhớ trình duyệt đầy hoặc bị chặn).';
  }
}

/** Danh sách trò chơi, mới cập nhật xếp lên trước. */
export function listGames(): GameConfig[] {
  return loadGames().sort((a, b) => (a.updatedAt < b.updatedAt ? 1 : -1));
}

export function getGame(id: string): GameConfig | undefined {
  return loadGames().find((g) => g.id === id);
}

/** Thêm mới hoặc cập nhật một trò chơi (theo id) và tự cập nhật updatedAt. */
export function saveGame(game: GameConfig): GameConfig {
  const games = loadGames();
  const saved: GameConfig = { ...game, updatedAt: new Date().toISOString() };
  const i = games.findIndex((g) => g.id === saved.id);
  if (i >= 0) games[i] = saved;
  else games.push(saved);
  persist(games);
  return saved;
}

export function deleteGame(id: string): void {
  persist(loadGames().filter((g) => g.id !== id));
}

/** Nhân bản một trò chơi (kèm id mới cho câu hỏi) để chỉnh sửa an toàn. */
export function duplicateGame(id: string): GameConfig | undefined {
  const src = getGame(id);
  if (!src) return undefined;
  const now = new Date().toISOString();
  const copy: GameConfig = {
    ...src,
    id: uid('game-'),
    title: `${src.title} (bản sao)`,
    questions: src.questions.map((q) => ({
      ...q,
      id: uid('q-'),
      options: q.options.map((o) => ({ ...o })),
    })),
    createdAt: now,
    updatedAt: now,
  };
  // Giữ đáp án đúng trỏ đúng lựa chọn sau khi đổi id.
  copy.questions.forEach((q, qi) => {
    const srcQ = src.questions[qi];
    const pos = srcQ.options.findIndex((o) => o.id === srcQ.correctOptionId);
    if (pos >= 0 && q.options[pos]) q.correctOptionId = q.options[pos].id;
  });
  const games = loadGames();
  games.push(copy);
  persist(games);
  return copy;
}

/**
 * Cung cấp trò chơi mẫu ở lần mở đầu tiên. Dùng cờ riêng để không tự thêm lại
 * sau khi người dùng đã xóa bài mẫu.
 */
export function ensureSeeded(): GameConfig[] {
  let seeded = false;
  try {
    seeded = hasLS() && localStorage.getItem(SEEDED_KEY) === '1';
  } catch {
    /* bỏ qua */
  }
  const games = loadGames();
  if (!seeded && games.length === 0) {
    const sample = sampleGame();
    persist([sample]);
    try {
      if (hasLS()) localStorage.setItem(SEEDED_KEY, '1');
    } catch {
      /* bỏ qua */
    }
    return [sample];
  }
  if (!seeded) {
    try {
      if (hasLS()) localStorage.setItem(SEEDED_KEY, '1');
    } catch {
      /* bỏ qua */
    }
  }
  return games;
}

/** Xuất một trò chơi ra chuỗi JSON để sao lưu / chuyển máy. */
export function exportGameJSON(game: GameConfig): string {
  const payload: GameExport = {
    kind: 'keo-co-kien-thuc/game',
    version: EXPORT_VERSION,
    game,
  };
  return JSON.stringify(payload, null, 2);
}

/**
 * Nhập trò chơi từ chuỗi JSON. Chấp nhận cả dạng có vỏ bọc export lẫn object
 * trò chơi thuần. Không ném lỗi ra ngoài: trả về danh sách vấn đề để hiển thị.
 */
export function importGameJSON(text: string): { game?: GameConfig; issues: Issues } {
  let parsed: unknown;
  try {
    parsed = JSON.parse(text);
  } catch {
    return { issues: ['File JSON không hợp lệ (không đọc được).'] };
  }
  const raw =
    parsed && typeof parsed === 'object' && 'game' in (parsed as Record<string, unknown>)
      ? (parsed as Record<string, unknown>).game
      : parsed;
  const { game, issues } = coerceGame(raw);
  if (game) {
    // Dùng id mới khi nhập để không ghi đè bài đang có cùng id.
    return { game: { ...game, id: uid('game-') }, issues };
  }
  return { issues: issues.length ? issues : ['Không nhập được trò chơi từ file này.'] };
}

