// Cột của một đội: tên, điểm, trạng thái (kèm chữ), câu hỏi và lưới đáp án 2×2.
import type { Side } from '../../types';
import type { MatchState } from '../../engine/model';
import { orderedOptions, currentQuestion } from '../../engine/selectors';

interface Props {
  state: MatchState;
  side: Side;
  name: string;
  onAnswer(optionId: string): void;
}

export function TeamPanel({ state, side, name, onAnswer }: Props) {
  const team = state.teams[side];
  const q = currentQuestion(state, side);
  const options = orderedOptions(state, side);

  const frozen = team.frozenUntil !== null && state.clockMs < team.frozenUntil;
  const freezeLeft = frozen ? Math.ceil((team.frozenUntil! - state.clockMs) / 1000) : 0;
  const active = state.phase === 'playing' || state.phase === 'suddenDeath';
  const disabled =
    !active ||
    team.completed ||
    frozen ||
    team.pendingAdvance ||
    (state.phase === 'suddenDeath' && (team.sdAnswered || team.sdLocked));

  const status = statusOf(team.feedback, frozen, freezeLeft, team.completed);

  return (
    <div className={`team-col ${side} ${frozen ? 'frozen' : ''}`}>
      <div className="team-head">
        <span className="team-name">
          {side === 'blue' ? '🔵' : '🔴'} {name}
        </span>
        <span className="team-score" aria-label={`Điểm ${name}`}>
          {team.score}
        </span>
      </div>

      <span className={`status-tag ${status.cls}`} role="status">
        {status.text}
      </span>

      <div className="question-box">{q ? q.text : 'Đã hoàn thành bộ câu hỏi.'}</div>

      <div className="answers">
        {options.map((op) => (
          <button
            key={op.option.id}
            className="answer"
            disabled={disabled}
            onClick={() => onAnswer(op.option.id)}
          >
            <span className="key" aria-hidden="true">
              {op.keyHint}
            </span>
            <span>
              <strong>{op.label}.</strong> {op.option.text}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}

function statusOf(
  feedback: MatchState['teams']['blue']['feedback'],
  frozen: boolean,
  freezeLeft: number,
  completed: boolean,
): { cls: string; text: string } {
  if (completed) return { cls: 'status-idle', text: 'Đã trả lời hết câu hỏi' };
  if (frozen) return { cls: 'status-frozen', text: `❄ Đóng băng: ${freezeLeft}s` };
  if (feedback === 'correct') return { cls: 'status-correct', text: '✓ Chính xác! +1 điểm' };
  if (feedback === 'wrong') return { cls: 'status-wrong', text: '✗ Chưa đúng' };
  if (feedback === 'tie') return { cls: 'status-tie', text: '= Hai đội cùng đúng' };
  return { cls: 'status-idle', text: 'Sẵn sàng trả lời' };
}
