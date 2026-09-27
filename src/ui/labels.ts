// Nhãn hiển thị dùng chung cho các chế độ chơi và tiện ích định dạng.
import type { GameMode } from '../types';

export const MODE_META: Record<GameMode, { name: string; desc: string }> = {
  independent: {
    name: 'Độc lập',
    desc: 'Mỗi đội có bộ câu riêng, trả lời theo nhịp của mình. Đúng thì kéo dây về phía mình.',
  },
  shared: {
    name: 'Cùng câu hỏi',
    desc: 'Hai đội cùng một câu hỏi; đội trả lời đúng trước ghi điểm rồi chuyển câu.',
  },
  race: {
    name: 'Chạm mốc',
    desc: 'Đội nào đạt mốc điểm trước sẽ thắng (không tính chênh lệch).',
  },
};

export function modeName(mode: GameMode): string {
  return MODE_META[mode]?.name ?? mode;
}

export function formatClock(ms: number): string {
  const total = Math.max(0, Math.ceil(ms / 1000));
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

export function formatDate(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  return d.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
}
