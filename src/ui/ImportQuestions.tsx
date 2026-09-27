// Nhập câu hỏi từ nhiều nguồn: kho mẫu, dán JSON, hoặc file Excel (.xlsx).
// Luôn xem trước và báo lỗi theo từng câu trước khi thêm vào trò chơi.
import { useMemo, useRef, useState } from 'react';
import type { Question } from '../types';
import { SAMPLE_QUESTIONS } from '../data/sampleQuestions';
import { coerceQuestions, type Issues } from '../storage/validation';
// Lưu ý: module '../utils/excel' (kéo theo thư viện xlsx khá nặng) chỉ được
// nạp động khi người dùng thực sự dùng tính năng Excel, giúp bundle chính nhẹ.

type Tab = 'sample' | 'json' | 'excel';

interface Props {
  onImport(questions: Question[]): void;
  onClose(): void;
}

export function ImportQuestions({ onImport, onClose }: Props) {
  const [tab, setTab] = useState<Tab>('sample');
  const [picked, setPicked] = useState<Set<string>>(() => new Set(SAMPLE_QUESTIONS.map((q) => q.id)));
  const [jsonText, setJsonText] = useState('');
  const [parsed, setParsed] = useState<{ questions: Question[]; issues: Issues } | null>(null);
  const [excelBusy, setExcelBusy] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const toggle = (id: string) =>
    setPicked((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });

  const parseJson = (text: string) => {
    setJsonText(text);
    if (!text.trim()) return setParsed(null);
    try {
      const data = JSON.parse(text);
      const arr = Array.isArray(data) ? data : Array.isArray(data?.questions) ? data.questions : [];
      setParsed(coerceQuestions(arr));
    } catch {
      setParsed({ questions: [], issues: ['JSON không hợp lệ (không đọc được).'] });
    }
  };

  const onExcel = async (file: File) => {
    setExcelBusy(true);
    try {
      const buf = await file.arrayBuffer();
      const { parseExcel } = await import('../utils/excel');
      const res = parseExcel(buf);
      setParsed({ questions: res.questions, issues: res.issues });
    } catch {
      setParsed({ questions: [], issues: ['Không tải được trình đọc Excel. Hãy thử lại.'] });
    } finally {
      setExcelBusy(false);
    }
  };

  const onDownloadTemplate = async () => {
    setExcelBusy(true);
    try {
      const { downloadTemplate } = await import('../utils/excel');
      downloadTemplate();
    } catch {
      setParsed({ questions: [], issues: ['Không tạo được file mẫu. Hãy thử lại.'] });
    } finally {
      setExcelBusy(false);
    }
  };

  const sampleSelected = useMemo(
    () => SAMPLE_QUESTIONS.filter((q) => picked.has(q.id)),
    [picked],
  );

  const doImport = () => {
    if (tab === 'sample') onImport(clone(sampleSelected));
    else if (parsed) onImport(clone(parsed.questions));
  };

  const canImport =
    tab === 'sample' ? sampleSelected.length > 0 : (parsed?.questions.length ?? 0) > 0;
  const importCount = tab === 'sample' ? sampleSelected.length : parsed?.questions.length ?? 0;

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true">
        <h2>Nhập câu hỏi</h2>
        <div className="row" style={{ marginBottom: '1rem' }}>
          <button className={`btn ${tab === 'sample' ? 'btn-primary' : ''}`} onClick={() => setTab('sample')}>
            Từ kho mẫu
          </button>
          <button className={`btn ${tab === 'json' ? 'btn-primary' : ''}`} onClick={() => setTab('json')}>
            Dán JSON
          </button>
          <button className={`btn ${tab === 'excel' ? 'btn-primary' : ''}`} onClick={() => setTab('excel')}>
            File Excel
          </button>
        </div>

        {tab === 'sample' && (
          <>
            <div className="row" style={{ justifyContent: 'space-between' }}>
              <span className="hint">Đã chọn {sampleSelected.length}/{SAMPLE_QUESTIONS.length} câu</span>
              <button
                className="btn btn-ghost"
                onClick={() =>
                  setPicked((p) =>
                    p.size === SAMPLE_QUESTIONS.length
                      ? new Set()
                      : new Set(SAMPLE_QUESTIONS.map((q) => q.id)),
                  )
                }
              >
                {picked.size === SAMPLE_QUESTIONS.length ? 'Bỏ chọn tất cả' : 'Chọn tất cả'}
              </button>
            </div>
            <div className="pick-list">
              {SAMPLE_QUESTIONS.map((q) => (
                <label className="pick-row" key={q.id}>
                  <input type="checkbox" checked={picked.has(q.id)} onChange={() => toggle(q.id)} />
                  <span>
                    <strong>{q.text}</strong>
                    <br />
                    <span className="hint">{q.topic}</span>
                  </span>
                </label>
              ))}
            </div>
          </>
        )}

        {tab === 'json' && (
          <div className="field">
            <label>Dán mảng câu hỏi dạng JSON</label>
            <textarea
              rows={8}
              value={jsonText}
              onChange={(e) => parseJson(e.target.value)}
              placeholder='[{ "text": "…", "options": [{"text":"A"},…], "correctAnswer": "A", "explanation": "…", "topic": "…" }]'
            />
          </div>
        )}

        {tab === 'excel' && (
          <div className="field">
            <label>Tải lên file .xlsx</label>
            <p className="hint">
              Các cột: question, optionA, optionB, optionC, optionD, correctAnswer (A/B/C/D),
              explanation, topic.
            </p>
            <div className="row">
              <input
                ref={fileRef}
                type="file"
                accept=".xlsx,.xls,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                disabled={excelBusy}
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) onExcel(f);
                }}
              />
              <button className="btn" onClick={onDownloadTemplate} disabled={excelBusy}>
                ⭱ Tải file mẫu
              </button>
            </div>
            {excelBusy && <p className="hint">Đang xử lý file Excel…</p>}
          </div>
        )}

        {parsed && tab !== 'sample' && (
          <div>
            <p className="preview-ok">Đọc được {parsed.questions.length} câu hợp lệ.</p>
            {parsed.issues.length > 0 && (
              <div className="issues">
                <strong>{parsed.issues.length} vấn đề (các câu lỗi sẽ bị bỏ qua):</strong>
                <ul>
                  {parsed.issues.slice(0, 12).map((m, i) => (
                    <li key={i}>{m}</li>
                  ))}
                  {parsed.issues.length > 12 && <li>… và {parsed.issues.length - 12} vấn đề khác</li>}
                </ul>
              </div>
            )}
          </div>
        )}

        <div className="modal-actions">
          <button className="btn" onClick={onClose}>
            Hủy
          </button>
          <button className="btn btn-primary" onClick={doImport} disabled={!canImport}>
            Thêm {importCount} câu
          </button>
        </div>
      </div>
    </div>
  );
}

function clone(qs: Question[]): Question[] {
  return qs.map((q) => ({ ...q, options: q.options.map((o) => ({ ...o })) }));
}
