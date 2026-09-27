// Biểu mẫu thêm/sửa một câu hỏi (4 lựa chọn, một đáp án đúng).
import { useState } from 'react';
import type { Option, Question } from '../types';
import { uid } from '../utils/id';

const LETTERS = ['A', 'B', 'C', 'D'];

interface Props {
  initial?: Question;
  onSave(q: Question): void;
  onClose(): void;
}

export function QuestionForm({ initial, onSave, onClose }: Props) {
  const [text, setText] = useState(initial?.text ?? '');
  const [opts, setOpts] = useState<string[]>(() => {
    const base = initial?.options.map((o) => o.text) ?? ['', '', '', ''];
    return [0, 1, 2, 3].map((i) => base[i] ?? '');
  });
  const [correct, setCorrect] = useState(() => {
    if (!initial) return 0;
    const idx = initial.options.findIndex((o) => o.id === initial.correctOptionId);
    return idx >= 0 ? idx : 0;
  });
  const [explanation, setExplanation] = useState(initial?.explanation ?? '');
  const [topic, setTopic] = useState(initial?.topic ?? 'Chung');
  const [sourceUrl, setSourceUrl] = useState(initial?.sourceUrl ?? '');
  const [error, setError] = useState<string | null>(null);

  const submit = () => {
    if (!text.trim()) return setError('Vui lòng nhập nội dung câu hỏi.');
    if (opts.some((o) => !o.trim())) return setError('Cả 4 lựa chọn đều phải có nội dung.');
    const options: Option[] = opts.map((t, i) => ({
      id: initial?.options[i]?.id ?? uid('opt-'),
      text: t.trim(),
    }));
    const q: Question = {
      id: initial?.id ?? uid('q-'),
      text: text.trim(),
      options,
      correctOptionId: options[correct].id,
      explanation: explanation.trim(),
      topic: topic.trim() || 'Chung',
      sourceUrl: sourceUrl.trim() || undefined,
    };
    onSave(q);
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true">
        <h2>{initial ? 'Sửa câu hỏi' : 'Thêm câu hỏi'}</h2>
        {error && <div className="issues">{error}</div>}

        <div className="field">
          <label>Nội dung câu hỏi</label>
          <textarea value={text} onChange={(e) => setText(e.target.value)} rows={2} />
        </div>

        <div className="field">
          <label>Các lựa chọn (chọn ô tròn ở đáp án đúng)</label>
          {opts.map((o, i) => (
            <div className="row" key={i} style={{ marginBottom: '0.4rem', flexWrap: 'nowrap' }}>
              <input
                type="radio"
                name="correct"
                checked={correct === i}
                onChange={() => setCorrect(i)}
                aria-label={`Đáp án đúng là ${LETTERS[i]}`}
                style={{ width: 'auto' }}
              />
              <span style={{ fontWeight: 800, width: '1.3rem' }}>{LETTERS[i]}</span>
              <input
                type="text"
                value={o}
                onChange={(e) => setOpts((prev) => prev.map((x, j) => (j === i ? e.target.value : x)))}
                placeholder={`Lựa chọn ${LETTERS[i]}`}
              />
            </div>
          ))}
        </div>

        <div className="row" style={{ alignItems: 'flex-start', gap: '0.8rem' }}>
          <div className="field" style={{ flex: 1 }}>
            <label>Chủ đề</label>
            <input type="text" value={topic} onChange={(e) => setTopic(e.target.value)} />
          </div>
          <div className="field" style={{ flex: 2 }}>
            <label>
              Nguồn tham khảo <span className="hint">(không bắt buộc)</span>
            </label>
            <input
              type="text"
              value={sourceUrl}
              onChange={(e) => setSourceUrl(e.target.value)}
              placeholder="https://…"
            />
          </div>
        </div>

        <div className="field">
          <label>
            Giải thích <span className="hint">(hiện ở phần ôn tập sau trận)</span>
          </label>
          <textarea value={explanation} onChange={(e) => setExplanation(e.target.value)} rows={2} />
        </div>

        <div className="modal-actions">
          <button className="btn" onClick={onClose}>
            Hủy
          </button>
          <button className="btn btn-primary" onClick={submit}>
            Lưu câu hỏi
          </button>
        </div>
      </div>
    </div>
  );
}
