// Bố cục màn thi đấu 3 cột: đội Xanh | khu kéo co | đội Đỏ.
import type { Side } from '../../types';
import type { MatchState } from '../../engine/model';
import { ropeFraction, suddenDeathLeftMs } from '../../engine/selectors';
import { TeamPanel } from './TeamPanel';
import { TugOfWar } from './TugOfWar';
import { formatClock } from '../labels';

interface Props {
  state: MatchState;
  onAnswer(side: Side, optionId: string): void;
}

export function MatchScreen({ state, onAnswer }: Props) {
  const frac = ropeFraction(state);
  const markerLeft = 50 + frac * 50;
  const [blue, red] = state.config.teamNames;
  const sd = state.phase === 'suddenDeath';

  return (
    <div className="match">
      <TeamPanel state={state} side="blue" name={blue} onAnswer={(o) => onAnswer('blue', o)} />

      <div className="center-col">
        {sd && <div className="sd-banner">⚡ LOẠT SINH TỬ ⚡</div>}
        {sd && (
          <div className="sd-timer" aria-label="Thời gian còn lại của lượt sinh tử">
            {formatClock(suddenDeathLeftMs(state))}
          </div>
        )}

        <TugOfWar fraction={frac} blueName={blue} redName={red} />

        <div className="rope-scale" aria-hidden="true">
          <span className="rope-marker" style={{ left: `${markerLeft}%` }} />
        </div>

        <div className="threshold-note">
          {state.mode === 'race'
            ? `Về đích ở ${state.config.winThreshold} điểm • ${blue} ${state.teams.blue.score} – ${state.teams.red.score} ${red}`
            : `Chênh lệch ${Math.abs(state.rope)}/${state.config.winThreshold} • ${blue} ${state.teams.blue.score} – ${state.teams.red.score} ${red}`}
        </div>
      </div>

      <TeamPanel state={state} side="red" name={red} onAnswer={(o) => onAnswer('red', o)} />
    </div>
  );
}
