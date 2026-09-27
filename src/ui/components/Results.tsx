// Màn kết quả: đội thắng/hòa, thống kê và ôn tập đáp án kèm giải thích.
import type { MatchState } from '../../engine/model';
import { Confetti } from './Confetti';

interface Props {
  state: MatchState;
  onRestart(): void;
  onExit(): void;
  onEdit(): void;
}

export function Results({ state, onRestart, onExit, onEdit }: Props) {
  const result = state.result;
  const [blue, red] = state.config.teamNames;
  const winner = result?.winner ?? 'draw';
  const winnerName = winner === 'blue' ? blue : winner === 'red' ? red : 'Hòa';

  const title =
    winner === 'draw' ? '🤝 Hai đội hòa!' : `🏆 ${winnerName} chiến thắng!`;

  return (
    <div className="results-root">
      {winner !== 'draw' && <Confetti />}
      <div className="results-card">
        <h1 className={`winner-title ${winner}`}>{title}</h1>
        {result && <p style={{ textAlign: 'center', color: '#a7f3d0' }}>{result.reason}</p>}

        <div className="stats">
          {(['blue', 'red'] as const).map((side) => {
            const t = state.teams[side];
            const name = side === 'blue' ? blue : red;
            return (
              <div className="stat-box" key={side}>
                <h3 style={{ color: side === 'blue' ? '#93c5fd' : '#fca5a5' }}>
                  {side === 'blue' ? '🔵' : '🔴'} {name}
                </h3>
                <div className="stat-line">
                  <span>Điểm</span>
                  <strong>{t.score}</strong>
                </div>
                <div className="stat-line">
                  <span>Số câu trả lời đúng</span>
                  <strong>{t.score}</strong>
                </div>
                <div className="stat-line">
                  <span>Số câu trả lời sai</span>
                  <strong>{t.wrong}</strong>
                </div>
                <div className="stat-line">
                  <span>Tổng lượt trả lời</span>
                  <strong>{t.attempts}</strong>
                </div>
                <div className="stat-line">
                  <span>Độ chính xác</span>
                  <strong>{t.attempts > 0 ? Math.round((t.score / t.attempts) * 100) : 0}%</strong>
                </div>
              </div>
            );
          })}
        </div>

        <details className="review">
          <summary style={{ cursor: 'pointer', fontWeight: 700 }}>
            📖 Ôn tập đáp án ({state.questions.length} câu)
          </summary>
          {state.questions.map((q, i) => {
            const correct = q.options.find((o) => o.id === q.correctOptionId);
            return (
              <div className="review-q" key={q.id}>
                <div>
                  <strong>
                    {i + 1}. {q.text}
                  </strong>
                </div>
                <div className="r-correct">✓ Đáp án: {correct?.text ?? '—'}</div>
                {q.explanation && <div className="r-expl">{q.explanation}</div>}
                {q.sourceUrl && (
                  <div className="r-expl">
                    Nguồn:{' '}
                    <a href={q.sourceUrl} target="_blank" rel="noreferrer noopener">
                      {q.sourceUrl}
                    </a>
                  </div>
                )}
              </div>
            );
          })}
        </details>

        <div className="results-actions">
          <button className="btn btn-primary btn-lg" onClick={onRestart}>
            ↻ Chơi lại
          </button>
          <button className="btn btn-lg" onClick={onEdit}>
            ✎ Sửa trò chơi
          </button>
          <button className="btn btn-lg" onClick={onExit}>
            ⌂ Về thư viện
          </button>
        </div>
      </div>
    </div>
  );
}
