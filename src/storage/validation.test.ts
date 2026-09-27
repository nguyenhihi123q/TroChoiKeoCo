// Kiểm thử chuẩn hóa dữ liệu nhập: file hỏng phải báo lỗi rõ ràng, dữ liệu
// hợp lệ phải được nhận và các giá trị ngoài phạm vi được kẹp về mức an toàn.
import { describe, it, expect } from 'vitest';
import { coerceGame, coerceQuestion } from './validation';
import { importGameJSON, exportGameJSON } from './storage';
import { sampleGame } from '../data/defaults';

describe('coerceQuestion', () => {
  it('báo lỗi khi không đủ 4 lựa chọn', () => {
    const { question, issues } = coerceQuestion(
      { text: 'Hỏi?', options: [{ text: 'A' }, { text: 'B' }] },
      'Câu 1',
    );
    expect(question).toBeUndefined();
    expect(issues.some((m) => m.includes('4 lựa chọn'))).toBe(true);
  });

  it('chấp nhận đáp án đúng chỉ định bằng chữ cái A/B/C/D', () => {
    const { question, issues } = coerceQuestion(
      {
        text: 'Thủ đô Việt Nam?',
        options: [{ text: 'Hà Nội' }, { text: 'Huế' }, { text: 'Đà Nẵng' }, { text: 'Cần Thơ' }],
        correctAnswer: 'A',
      },
      'Câu 1',
    );
    expect(issues).toHaveLength(0);
    expect(question).toBeDefined();
    expect(question?.options[0].id).toBe(question?.correctOptionId);
  });
});

describe('coerceGame', () => {
  it('kẹp các giá trị ngoài phạm vi về mức an toàn', () => {
    const { game } = coerceGame({
      title: 'Bài kiểm tra',
      durationSeconds: 999999,
      winThreshold: -5,
      freezeSeconds: 100,
      volume: 5,
      mode: 'khong-ton-tai',
      questions: [],
    });
    expect(game).toBeDefined();
    expect(game?.durationSeconds).toBe(3600);
    expect(game?.winThreshold).toBe(1);
    expect(game?.freezeSeconds).toBe(10);
    expect(game?.volume).toBe(1);
    expect(game?.mode).toBe('independent');
  });

  it('chặn khi thiếu tiêu đề nhưng vẫn giữ dữ liệu để sửa', () => {
    const { game, issues } = coerceGame({ questions: [] });
    // Vẫn dựng được game (tiêu đề mặc định) và nêu vấn đề để người dùng biết.
    expect(game).toBeDefined();
    expect(issues.some((m) => m.includes('tiêu đề'))).toBe(true);
  });
});

describe('importGameJSON', () => {
  it('báo lỗi rõ ràng với JSON hỏng, không ném ngoại lệ', () => {
    const { game, issues } = importGameJSON('{ đây không phải json');
    expect(game).toBeUndefined();
    expect(issues.length).toBeGreaterThan(0);
  });

  it('nhập lại được đúng trò chơi đã xuất (id mới để không đè bài cũ)', () => {
    const original = sampleGame();
    const json = exportGameJSON(original);
    const { game, issues } = importGameJSON(json);
    expect(issues).toHaveLength(0);
    expect(game).toBeDefined();
    expect(game?.title).toBe(original.title);
    expect(game?.questions.length).toBe(original.questions.length);
    expect(game?.id).not.toBe(original.id);
  });

  it('chấp nhận cả object trò chơi thuần (không có vỏ bọc export)', () => {
    const { game } = importGameJSON(JSON.stringify(sampleGame()));
    expect(game).toBeDefined();
    expect(game?.mode).toBe('independent');
  });
});
