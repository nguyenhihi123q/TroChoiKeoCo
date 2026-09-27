// Bảng điều khiển của giáo viên: tạm dừng, bỏ qua câu, chỉnh điểm, kết thúc,
// chơi lại, toàn màn hình và thoát.
import type { Side } from '../../types';
import type { MatchState } from '../../engine/model';

interface Props {
  state: MatchState;
  onPause(): void;
  onResume(): void;
  onSkip(side: Side): void;
  onSkipShared(): void;
  onAdjust(side: Side, delta: number): void;
  onRestart(): void;
  onFinish(winner: Side | 'draw'): void;
  onExit(): void;
  isFullscreen: boolean;
  onToggleFullscreen(): void;
}

export function ControlPanel(p: Props) {
  const { state } = p;
  const paused = state.phase === 'paused';
  const [blue, red] = [state.config.teamNames[0], state.config.teamNames[1]];

  const endNow = () => {
    const b = state.teams.blue.score;
    const r = state.teams.red.score;
    const winner: Side | 'draw' = b > r ? 'blue' : r > b ? 'red' : 'draw';
    if (window.confirm('Kết thúc trận ngay bây giờ?')) p.onFinish(winner);
  };

  return (
    <div className="control-panel">
      {paused ? (
        <button className="btn" onClick={p.onResume}>
          ▶ Tiếp tục
        </button>
      ) : (
        <button className="btn" onClick={p.onPause}>
          ⏸ Tạm dừng
        </button>
      )}
      {paused && <span className="paused-flag">Đang tạm dừng</span>}

      {state.mode === 'shared' ? (
        <button className="btn" onClick={p.onSkipShared} disabled={paused}>
          ⏭ Bỏ qua câu
        </button>
      ) : (
        <>
          <button className="btn" onClick={() => p.onSkip('blue')} disabled={paused}>
            ⏭ Bỏ qua ({blue})
          </button>
          <button className="btn" onClick={() => p.onSkip('red')} disabled={paused}>
            ⏭ Bỏ qua ({red})
          </button>
        </>
      )}

      <span className="score-adjust">
        {blue}
        <button className="btn btn-ghost" onClick={() => p.onAdjust('blue', -1)}>
          −
        </button>
        <button className="btn btn-ghost" onClick={() => p.onAdjust('blue', 1)}>
          ＋
        </button>
      </span>
      <span className="score-adjust">
        {red}
        <button className="btn btn-ghost" onClick={() => p.onAdjust('red', -1)}>
          −
        </button>
        <button className="btn btn-ghost" onClick={() => p.onAdjust('red', 1)}>
          ＋
        </button>
      </span>

      <span className="spacer" />

      <button className="btn" onClick={p.onToggleFullscreen}>
        {p.isFullscreen ? '🗕 Thoát toàn màn hình' : '⛶ Toàn màn hình'}
      </button>
      <button className="btn" onClick={p.onRestart}>
        ↻ Chơi lại
      </button>
      <button className="btn" onClick={endNow}>
        ⏹ Kết thúc
      </button>
      <button className="btn" onClick={p.onExit}>
        ⨯ Thoát
      </button>
    </div>
  );
}
