// Hộp luật chơi hiển thị trước trận (nền tím, tiêu đề vàng) theo cấu hình.
import type { GameConfig } from '../../types';
import { MODE_META } from '../labels';
import { KEY_HINTS } from '../../engine/selectors';

interface Props {
  config: GameConfig;
  onStart(): void;
  onBack(): void;
}

export function PreMatch({ config, onStart, onBack }: Props) {
  const minutes = Math.round(config.durationSeconds / 60);
  const rules: string[] = [
    `Chế độ ${MODE_META[config.mode].name}: ${MODE_META[config.mode].desc}`,
    config.mode === 'race'
      ? `Đội nào đạt ${config.winThreshold} điểm trước sẽ chiến thắng.`
      : `Chênh lệch điểm đạt ${config.winThreshold} là thắng (kéo đứt dây).`,
    `Trả lời đúng: ghi điểm và kéo dây về phía đội mình.`,
    `Trả lời sai: bị đóng băng ${config.freezeSeconds} giây, không thể bấm tiếp.`,
    `Thời gian thi đấu: ${minutes} phút. Hết giờ mà chưa phân thắng bại sẽ vào loạt sinh tử.`,
    `Điều khiển: chạm/bấm vào đáp án, hoặc dùng phím ${KEY_HINTS.blue.join('/')} (Xanh) và ${KEY_HINTS.red.join('/')} (Đỏ).`,
  ];

  return (
    <div className="prematch">
      <div className="rules-box">
        <h1>{config.title}</h1>
        <div className="rules-teams">
          <span style={{ color: '#93c5fd' }}>🔵 {config.teamNames[0]}</span>
          <span className="vs">⚔</span>
          <span style={{ color: '#fca5a5' }}>🔴 {config.teamNames[1]}</span>
        </div>
        <ul className="rules-list">
          {rules.map((r, i) => (
            <li key={i}>
              <span className="ico">✔</span>
              <span>{r}</span>
            </li>
          ))}
        </ul>
        <div className="start-row">
          <button className="btn btn-lg" onClick={onBack}>
            ← Quay lại
          </button>
          <button className="btn btn-primary btn-lg" onClick={onStart}>
            ▶ Bắt đầu trận đấu
          </button>
        </div>
      </div>
    </div>
  );
}
