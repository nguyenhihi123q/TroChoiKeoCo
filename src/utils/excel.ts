// Nhập câu hỏi từ file Excel (.xlsx) và tạo file mẫu để giáo viên điền.
// Cột: question, optionA, optionB, optionC, optionD, correctAnswer (A/B/C/D),
// explanation, topic. Dùng SheetJS (xlsx) đã cài từ CDN để tránh CVE bản npm cũ.
import * as XLSX from 'xlsx';
import type { Question } from '../types';
import { coerceQuestions, type Issues } from '../storage/validation';
import { triggerDownload } from './download';

const COLUMNS = [
  'question',
  'optionA',
  'optionB',
  'optionC',
  'optionD',
  'correctAnswer',
  'explanation',
  'topic',
] as const;

// Ánh xạ tiêu đề cột về khóa chuẩn (không phân biệt hoa thường, khoảng trắng).
const HEADER_ALIASES: Record<string, string> = {
  question: 'question',
  cauhoi: 'question',
  optiona: 'optionA',
  a: 'optionA',
  optionb: 'optionB',
  b: 'optionB',
  optionc: 'optionC',
  c: 'optionC',
  optiond: 'optionD',
  d: 'optionD',
  correctanswer: 'correctAnswer',
  dapan: 'correctAnswer',
  dapandung: 'correctAnswer',
  explanation: 'explanation',
  giaithich: 'explanation',
  topic: 'topic',
  chude: 'topic',
};

function normHeader(h: string): string {
  const key = String(h)
    .trim()
    .toLowerCase()
    .normalize('NFD') // tách dấu tiếng Việt khỏi chữ cái gốc
    .replace(/[^a-z]/g, ''); // giữ lại chữ cái gốc a-z
  return HEADER_ALIASES[key] ?? '';
}

export interface ExcelParseResult {
  questions: Question[];
  issues: Issues;
  rowCount: number;
}

/** Đọc file .xlsx (ArrayBuffer) và chuẩn hóa thành danh sách câu hỏi. */
export function parseExcel(data: ArrayBuffer): ExcelParseResult {
  let wb: XLSX.WorkBook;
  try {
    wb = XLSX.read(data, { type: 'array' });
  } catch {
    return { questions: [], issues: ['Không đọc được file Excel (định dạng không hợp lệ).'], rowCount: 0 };
  }
  const sheetName = wb.SheetNames[0];
  if (!sheetName) {
    return { questions: [], issues: ['File Excel không có sheet nào.'], rowCount: 0 };
  }
  const sheet = wb.Sheets[sheetName];
  const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet, { defval: '' });
  if (rows.length === 0) {
    return { questions: [], issues: ['Sheet không có dữ liệu câu hỏi.'], rowCount: 0 };
  }

  const raw = rows.map((row) => {
    const mapped: Record<string, string> = {};
    for (const [header, value] of Object.entries(row)) {
      const key = normHeader(header);
      if (key) mapped[key] = String(value ?? '').trim();
    }
    return {
      text: mapped.question ?? '',
      options: [
        { text: mapped.optionA ?? '' },
        { text: mapped.optionB ?? '' },
        { text: mapped.optionC ?? '' },
        { text: mapped.optionD ?? '' },
      ],
      correctAnswer: (mapped.correctAnswer ?? '').toUpperCase(),
      explanation: mapped.explanation ?? '',
      topic: mapped.topic ?? '',
    };
  });

  const { questions, issues } = coerceQuestions(raw);
  return { questions, issues, rowCount: rows.length };
}

const TEMPLATE_ROWS = [
  {
    question: 'Ví dụ: Trước khi bão đến nên chuẩn bị gì?',
    optionA: 'Túi đồ khẩn cấp: nước, thực phẩm, đèn pin, thuốc',
    optionB: 'Chỉ cần điện thoại',
    optionC: 'Không cần chuẩn bị',
    optionD: 'Mua nhiều đồ nhựa dùng một lần',
    correctAnswer: 'A',
    explanation: 'Túi đồ khẩn cấp giúp chủ động khi mất điện, nước hoặc phải sơ tán.',
    topic: 'Ứng phó an toàn',
  },
];

/** Tạo nội dung file mẫu .xlsx (Uint8Array) để người dùng tải về và điền. */
export function buildTemplate(): Uint8Array {
  const ws = XLSX.utils.json_to_sheet(TEMPLATE_ROWS, { header: [...COLUMNS] });
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'CauHoi');
  return XLSX.write(wb, { type: 'array', bookType: 'xlsx' }) as Uint8Array;
}

/** Kích hoạt tải file mẫu trong trình duyệt. */
export function downloadTemplate(filename = 'mau-cau-hoi-keo-co.xlsx'): void {
  const bytes = buildTemplate();
  // Sao chép sang buffer riêng để chắc chắn tương thích kiểu BlobPart.
  const part = new Uint8Array(bytes.length);
  part.set(bytes);
  const blob = new Blob([part], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  });
  triggerDownload(blob, filename);
}

