// Pháo giấy khi có đội thắng. Tự tắt khi bật prefers-reduced-motion (qua CSS).
import { useMemo } from 'react';

const COLORS = ['#2563eb', '#dc2626', '#facc15', '#16a34a', '#a855f7', '#f97316'];

export function Confetti({ count = 90 }: { count?: number }) {
  const pieces = useMemo(
    () =>
      Array.from({ length: count }, (_, i) => ({
        left: Math.random() * 100,
        delay: Math.random() * 0.8,
        dur: 2.4 + Math.random() * 2.2,
        color: COLORS[i % COLORS.length],
        rot: Math.random() * 360,
      })),
    [count],
  );
  return (
    <div className="confetti" aria-hidden="true">
      {pieces.map((p, i) => (
        <i
          key={i}
          style={{
            left: `${p.left}%`,
            background: p.color,
            transform: `rotate(${p.rot}deg)`,
            animationDelay: `${p.delay}s`,
            animationDuration: `${p.dur}s`,
          }}
        />
      ))}
    </div>
  );
}
