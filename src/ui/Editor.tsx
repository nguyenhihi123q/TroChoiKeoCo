// Tạo/sửa một trò chơi: cấu hình trận đấu và quản lý bộ câu hỏi.
import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { AppBar } from './Brand';
import { MODE_META } from './labels';
import { QuestionForm } from './QuestionForm';
import { ImportQuestions } from './ImportQuestions';
import { getGame, saveGame } from '../storage/storage';
import { defaultConfig, DURATION_OPTIONS, FREEZE_MIN, FREEZE_MAX } from '../data/defaults';
import type { GameConfig, GameMode, Question } from '../types';

export function Editor() {
  const { id } = useParams();
  const nav = useNavigate();
  const [game, setGame] = useState<GameConfig | null>(null);
  const [dirty, setDirty] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [showAdd, setShowAdd] = useState(false);
  const [showImport, setShowImport] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (id === 'new') {
      setGame(defaultConfig());
    } else {
      const g = id ? getGame(id) : undefined;
      setGame(g ?? defaultConfig());
    }
  }, [id]);

  // Cảnh báo khi rời trang lúc còn thay đổi chưa lưu.
  useEffect(() => {
    const onBeforeUnload = (e: BeforeUnloadEvent) => {
      if (dirty) {
        e.preventDefault();
        e.returnValue = '';
      }
    };
    window.addEventListener('beforeunload', onBeforeUnload);
    return () => window.removeEventListener('beforeunload', onBeforeUnload);
  }, [dirty]);

  const patch = (p: Partial<GameConfig>) => {
    setGame((g) => (g ? { ...g, ...p } : g));
    setDirty(true);
    setSaved(false);
  };

  const issues = useMemo(() => validate(game), [game]);

  if (!game) return <div className="shell">Đang tải…</div>;

  const doSave = (): boolean => {
    if (issues.blocking.length > 0) return false;
    saveGame(game);
    setDirty(false);
    setSaved(true);
    return true;
  };

  const back = () => {
    if (!dirty || window.confirm('Bạn có thay đổi chưa lưu. Rời khỏi trang?')) nav('/');
  };

  const addQuestions = (qs: Question[]) => {
    patch({ questions: [...game.questions, ...qs] });
    setShowImport(false);
  };

  const upsertQuestion = (q: Question) => {
    if (editingIndex === null) {
      patch({ questions: [...game.questions, q] });
    } else {
      patch({ questions: game.questions.map((x, i) => (i === editingIndex ? q : x)) });
    }
    setEditingIndex(null);
    setShowAdd(false);
  };

  const removeQuestion = (i: number) =>
    patch({ questions: game.questions.filter((_, j) => j !== i) });

  const moveQuestion = (i: number, dir: -1 | 1) => {
    const j = i + dir;
    if (j < 0 || j >= game.questions.length) return;
    const next = game.questions.slice();
    [next[i], next[j]] = [next[j], next[i]];
    patch({ questions: next });
  };

  return (
    <div className="shell">
      <AppBar
        subtitle={id === 'new' ? 'Tạo trò chơi mới' : 'Chỉnh sửa trò chơi'}
        right={
          <>
            <button className="btn" onClick={back}>
              ← Thư viện
            </button>
            <button className="btn" onClick={doSave} disabled={issues.blocking.length > 0}>
              {saved ? '✓ Đã lưu' : '💾 Lưu'}
            </button>
            <button
              className="btn btn-primary"
              onClick={() => {
                if (doSave()) nav(`/play/${game.id}`);
              }}
              disabled={issues.blocking.length > 0}
            >
              ▶ Lưu & chơi
            </button>
          </>
        }
      />

      {issues.blocking.length > 0 && (
        <div className="issues">
          <strong>Cần xử lý trước khi chơi:</strong>
          <ul>
            {issues.blocking.map((m, i) => (
              <li key={i}>{m}</li>
            ))}
          </ul>
        </div>
      )}
      {issues.warnings.length > 0 && (
        <div className="banner banner-warn">
          {issues.warnings.map((m, i) => (
            <div key={i}>⚠ {m}</div>
          ))}
        </div>
      )}

      <div className="editor-grid">
        <div>
          <section className="panel">
            <h2>Thông tin chung</h2>
            <div className="field">
              <label>Tên trò chơi</label>
              <input
                type="text"
                value={game.title}
                onChange={(e) => patch({ title: e.target.value })}
                placeholder="Ví dụ: Kéo co kiến thức về lối sống xanh"
              />
            </div>
            <div className="row" style={{ gap: '0.8rem' }}>
              <div className="field" style={{ flex: 1 }}>
                <label>Tên đội bên trái (Xanh)</label>
                <input
                  type="text"
                  value={game.teamNames[0]}
                  onChange={(e) => patch({ teamNames: [e.target.value, game.teamNames[1]] })}
                />
              </div>
              <div className="field" style={{ flex: 1 }}>
                <label>Tên đội bên phải (Đỏ)</label>
                <input
                  type="text"
                  value={game.teamNames[1]}
                  onChange={(e) => patch({ teamNames: [game.teamNames[0], e.target.value] })}
                />
              </div>
            </div>
          </section>

          <section className="panel">
            <h2>Chế độ chơi</h2>
            <div className="mode-options">
              {(Object.keys(MODE_META) as GameMode[]).map((m) => (
                <label className={`mode-option ${game.mode === m ? 'active' : ''}`} key={m}>
                  <input
                    type="radio"
                    name="mode"
                    checked={game.mode === m}
                    onChange={() => patch({ mode: m })}
                  />
                  <span>
                    <span className="t">{MODE_META[m].name}</span>
                    <br />
                    <span className="d">{MODE_META[m].desc}</span>
                  </span>
                </label>
              ))}
            </div>
          </section>
        </div>

        <div>
          <section className="panel">
            <h2>Luật & thời gian</h2>
            <div className="field">
              <label>Thời lượng trận</label>
              <select
                value={game.durationSeconds}
                onChange={(e) => patch({ durationSeconds: Number(e.target.value) })}
              >
                {DURATION_OPTIONS.map((d) => (
                  <option key={d} value={d}>
                    {d / 60} phút
                  </option>
                ))}
                {!DURATION_OPTIONS.includes(game.durationSeconds) && (
                  <option value={game.durationSeconds}>
                    {Math.round(game.durationSeconds / 60)} phút (tùy chỉnh)
                  </option>
                )}
              </select>
            </div>
            <div className="row" style={{ gap: '0.8rem' }}>
              <div className="field" style={{ flex: 1 }}>
                <label>
                  Mốc thắng{' '}
                  <span className="hint">
                    {game.mode === 'race' ? '(điểm tuyệt đối)' : '(chênh lệch điểm)'}
                  </span>
                </label>
                <input
                  type="number"
                  min={1}
                  max={99}
                  value={game.winThreshold}
                  onChange={(e) => patch({ winThreshold: clamp(e.target.value, 1, 99, 5) })}
                />
              </div>
              <div className="field" style={{ flex: 1 }}>
                <label>
                  Đóng băng khi sai <span className="hint">(giây)</span>
                </label>
                <input
                  type="number"
                  min={FREEZE_MIN}
                  max={FREEZE_MAX}
                  value={game.freezeSeconds}
                  onChange={(e) =>
                    patch({ freezeSeconds: clamp(e.target.value, FREEZE_MIN, FREEZE_MAX, 3) })
                  }
                />
              </div>
            </div>
            <Toggle
              label="Xáo trộn thứ tự câu hỏi"
              checked={game.shuffleQuestions}
              onChange={(v) => patch({ shuffleQuestions: v })}
            />
            <Toggle
              label="Xáo trộn thứ tự đáp án"
              checked={game.shuffleOptions}
              onChange={(v) => patch({ shuffleOptions: v })}
            />
            <Toggle
              label="Kết thúc khi trả lời hết câu hỏi"
              hint="Nếu tắt, bộ câu sẽ lặp lại đến khi hết giờ hoặc đạt mốc."
              checked={game.endWhenQuestionsExhausted}
              onChange={(v) => patch({ endWhenQuestionsExhausted: v })}
            />
            <Toggle
              label="Bật âm thanh hiệu ứng"
              checked={game.soundEnabled}
              onChange={(v) => patch({ soundEnabled: v })}
            />
            <Toggle
              label="Bật nhạc nền nhẹ"
              checked={game.musicEnabled}
              onChange={(v) => patch({ musicEnabled: v })}
            />
            <div className="field">
              <label>Âm lượng: {Math.round(game.volume * 100)}%</label>
              <input
                type="range"
                min={0}
                max={1}
                step={0.05}
                value={game.volume}
                onChange={(e) => patch({ volume: Number(e.target.value) })}
              />
            </div>
          </section>
        </div>
      </div>
      <section className="panel">
        <div className="row" style={{ justifyContent: 'space-between' }}>
          <h2>Câu hỏi ({game.questions.length})</h2>
          <div className="row">
            <button className="btn" onClick={() => setShowImport(true)}>
              ⭳ Nhập câu hỏi
            </button>
            <button
              className="btn btn-primary"
              onClick={() => {
                setEditingIndex(null);
                setShowAdd(true);
              }}
            >
              ＋ Thêm câu hỏi
            </button>
          </div>
        </div>

        {game.questions.length === 0 ? (
          <p className="hint">
            Chưa có câu hỏi. Hãy “Thêm câu hỏi” hoặc “Nhập câu hỏi” từ kho mẫu / Excel / JSON.
          </p>
        ) : (
          game.questions.map((q, i) => (
            <div className="q-item" key={q.id}>
              <div className="q-head">
                <div>
                  <span className="badge">{q.topic || 'Chung'}</span>{' '}
                  <span className="q-text">
                    {i + 1}. {q.text}
                  </span>
                </div>
                <div className="row" style={{ flexWrap: 'nowrap' }}>
                  <button className="btn btn-ghost" title="Lên" onClick={() => moveQuestion(i, -1)}>
                    ▲
                  </button>
                  <button className="btn btn-ghost" title="Xuống" onClick={() => moveQuestion(i, 1)}>
                    ▼
                  </button>
                  <button
                    className="btn btn-ghost"
                    onClick={() => {
                      setEditingIndex(i);
                      setShowAdd(true);
                    }}
                  >
                    ✎
                  </button>
                  <button className="btn btn-ghost btn-danger" onClick={() => removeQuestion(i)}>
                    🗑
                  </button>
                </div>
              </div>
              <ol className="q-opts">
                {q.options.map((o) => (
                  <li key={o.id} className={o.id === q.correctOptionId ? 'correct' : ''}>
                    {o.text}
                    {o.id === q.correctOptionId ? ' ✓' : ''}
                  </li>
                ))}
              </ol>
            </div>
          ))
        )}
      </section>

      {(showAdd || editingIndex !== null) && (
        <QuestionForm
          initial={editingIndex !== null ? game.questions[editingIndex] : undefined}
          onSave={upsertQuestion}
          onClose={() => {
            setShowAdd(false);
            setEditingIndex(null);
          }}
        />
      )}
      {showImport && (
        <ImportQuestions onImport={addQuestions} onClose={() => setShowImport(false)} />
      )}
    </div>
  );
}

interface ValidationResult {
  blocking: string[];
  warnings: string[];
}

function validate(game: GameConfig | null): ValidationResult {
  const blocking: string[] = [];
  const warnings: string[] = [];
  if (!game) return { blocking, warnings };
  if (!game.title.trim()) blocking.push('Cần đặt tên cho trò chơi.');
  if (game.questions.length === 0) blocking.push('Cần thêm ít nhất 1 câu hỏi.');
  if (game.questions.length > 0 && game.questions.length < 3)
    warnings.push('Nên có ít nhất 3 câu hỏi để trận đấu phong phú hơn.');
  if (
    game.endWhenQuestionsExhausted &&
    game.mode !== 'race' &&
    game.winThreshold > game.questions.length
  )
    warnings.push('Đã bật “kết thúc khi hết câu”: ngưỡng thắng có thể không đạt được với số câu hiện có.');
  return { blocking, warnings };
}

function clamp(v: string, min: number, max: number, fallback: number): number {
  const n = Math.round(Number(v));
  if (!Number.isFinite(n)) return fallback;
  return Math.max(min, Math.min(max, n));
}

function Toggle({
  label,
  hint,
  checked,
  onChange,
}: {
  label: string;
  hint?: string;
  checked: boolean;
  onChange(v: boolean): void;
}) {
  return (
    <label className="row" style={{ alignItems: 'flex-start', margin: '0.35rem 0', cursor: 'pointer' }}>
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        style={{ width: 'auto', marginTop: '0.25rem' }}
      />
      <span>
        {label}
        {hint && (
          <>
            <br />
            <span className="hint">{hint}</span>
          </>
        )}
      </span>
    </label>
  );
}
