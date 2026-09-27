// Kiểm thử bộ máy trận đấu bằng đồng hồ giả (match-clock truyền qua TICK).
import { describe, expect, it } from 'vitest';
import type { GameConfig, Question, Side } from '../types';
import { initMatch, matchReducer } from './reducer';
import { currentQuestion } from './selectors';
import type { MatchState } from './model';
import { FEEDBACK_MS } from './model';

function q(n: number, correct = 'a'): Question {
  const options = ['a', 'b', 'c', 'd'].map((l) => ({ id: `q${n}o${l}`, text: `q${n}-${l}` }));
  return {
    id: `q${n}`,
    text: `Câu ${n}`,
    options,
    correctOptionId: `q${n}o${correct}`,
    explanation: `giải thích ${n}`,
    topic: 'chủ đề',
  };
}

function makeConfig(over: Partial<GameConfig> = {}): GameConfig {
  return {
    id: 'g1',
    title: 'Trận thử',
    teamNames: ['Xanh', 'Đỏ'],
    durationSeconds: 300,
    winThreshold: 3,
    freezeSeconds: 3,
    mode: 'independent',
    inputMode: 'keyboard',
    shuffleQuestions: false,
    shuffleOptions: false,
    endWhenQuestionsExhausted: false,
    soundEnabled: false,
    musicEnabled: false,
    volume: 0.5,
    questions: [q(0), q(1), q(2), q(3), q(4), q(5)],
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
    ...over,
  };
}

class H {
  state: MatchState;
  constructor(config: GameConfig, seed = 1) {
    this.state = initMatch(config, seed);
  }
  d(a: Parameters<typeof matchReducer>[1]) {
    this.state = matchReducer(this.state, a);
    return this.state;
  }
  begin() {
    this.d({ type: 'START' });
    this.d({ type: 'BEGIN_PLAY' });
  }
  answerCorrect(side: Side) {
    const cq = currentQuestion(this.state, side)!;
    this.d({ type: 'ANSWER', side, optionId: cq.correctOptionId, questionId: cq.id, matchVersion: this.state.version });
  }
  answerWrong(side: Side) {
    const cq = currentQuestion(this.state, side)!;
    const wrong = cq.options.find((o) => o.id !== cq.correctOptionId)!.id;
    this.d({ type: 'ANSWER', side, optionId: wrong, questionId: cq.id, matchVersion: this.state.version });
  }
  tick(now: number) {
    this.d({ type: 'TICK', clockMs: now });
  }
}

describe('Chế độ độc lập', () => {
  it('Xanh đúng kéo trái, Đỏ đúng kéo phải; đạt ngưỡng thì kết thúc đúng đội', () => {
    const h = new H(makeConfig({ winThreshold: 3 }));
    h.begin();
    let t = 0;
    // Xanh trả lời đúng 3 lần, mỗi lần chờ hết khóa phản hồi để chuyển câu.
    for (let i = 0; i < 3; i += 1) {
      h.answerCorrect('blue');
      h.tick(t);
      t += FEEDBACK_MS + 10;
      h.tick(t);
    }
    expect(h.state.teams.blue.score).toBe(3);
    expect(h.state.rope).toBe(-3); // âm nghiêng về Xanh
    expect(h.state.phase).toBe('finished');
    expect(h.state.result?.winner).toBe('blue');
  });

  it('Đỏ đúng đẩy dây dương và thắng khi đạt ngưỡng', () => {
    const h = new H(makeConfig({ winThreshold: 2 }));
    h.begin();
    let t = 0;
    for (let i = 0; i < 2; i += 1) {
      h.answerCorrect('red');
      h.tick(t);
      t += FEEDBACK_MS + 10;
      h.tick(t);
    }
    expect(h.state.rope).toBe(2);
    expect(h.state.result?.winner).toBe('red');
  });

  it('Sai đóng băng đúng một đội, không chặn đối thủ; hết đóng băng vẫn ở câu cũ', () => {
    const h = new H(makeConfig({ freezeSeconds: 3 }));
    h.begin();
    const blueQBefore = currentQuestion(h.state, 'blue')!.id;
    h.answerWrong('blue');
    h.tick(0);
    expect(h.state.teams.blue.frozenUntil).toBe(3000);
    expect(h.state.teams.red.frozenUntil).toBeNull();
    // Đỏ vẫn trả lời được khi Xanh đang đóng băng
    h.answerCorrect('red');
    h.tick(10);
    expect(h.state.teams.red.score).toBe(1);
    // Hết đóng băng, Xanh vẫn ở đúng câu cũ
    h.tick(3000);
    expect(h.state.teams.blue.frozenUntil).toBeNull();
    expect(currentQuestion(h.state, 'blue')!.id).toBe(blueQBefore);
    expect(h.state.teams.blue.score).toBe(0);
  });
});

describe('Sự kiện đồng thời (độc lập)', () => {
  function bringBlueToRope(h: H, times: number) {
    let t = 0;
    for (let i = 0; i < times; i += 1) {
      h.answerCorrect('blue');
      h.tick(t);
      t += FEEDBACK_MS + 10;
      h.tick(t);
    }
    return t;
  }

  it('Hai bên cùng đúng trong một frame không gây chiến thắng sai ở sát ngưỡng', () => {
    const h = new H(makeConfig({ winThreshold: 3 }));
    h.begin();
    const t = bringBlueToRope(h, 2); // rope = -2, sát ngưỡng 3
    expect(h.state.rope).toBe(-2);
    h.answerCorrect('blue');
    h.answerCorrect('red');
    h.tick(t);
    expect(h.state.teams.blue.score).toBe(3);
    expect(h.state.teams.red.score).toBe(1);
    expect(h.state.rope).toBe(-2); // lực triệt tiêu, không đổi chênh lệch
    expect(h.state.phase).toBe('playing'); // không thắng
  });

  it('Chỉ một bên đúng ở sát ngưỡng thì thắng đúng đội', () => {
    const h = new H(makeConfig({ winThreshold: 3 }));
    h.begin();
    const t = bringBlueToRope(h, 2);
    h.answerCorrect('blue');
    h.tick(t);
    expect(h.state.rope).toBe(-3);
    expect(h.state.phase).toBe('finished');
    expect(h.state.result?.winner).toBe('blue');
  });
});

describe('Chế độ cùng câu hỏi', () => {
  it('Không cộng hai lần cho một lượt câu chung', () => {
    const h = new H(makeConfig({ mode: 'shared', winThreshold: 5 }));
    h.begin();
    h.answerCorrect('blue');
    h.tick(0);
    expect(h.state.teams.blue.score).toBe(1);
    expect(h.state.sharedLocked).toBe(true);
    // Đỏ đến muộn cùng câu -> bị bỏ qua
    h.answerCorrect('red');
    h.tick(10);
    expect(h.state.teams.red.score).toBe(0);
    // Hết phản hồi -> chuyển câu cho cả hai
    h.tick(FEEDBACK_MS + 20);
    expect(h.state.sharedLocked).toBe(false);
    expect(currentQuestion(h.state, 'blue')!.id).toBe('q1');
    expect(currentQuestion(h.state, 'red')!.id).toBe('q1');
  });

  it('Hai đội cùng đúng một frame: không đổi điểm, chuyển câu', () => {
    const h = new H(makeConfig({ mode: 'shared', winThreshold: 5 }));
    h.begin();
    h.answerCorrect('blue');
    h.answerCorrect('red');
    h.tick(0);
    expect(h.state.teams.blue.score).toBe(0);
    expect(h.state.teams.red.score).toBe(0);
    expect(h.state.rope).toBe(0);
    expect(h.state.sharedLocked).toBe(true);
  });

  it('Sai chỉ đóng băng đội sai, đội kia vẫn trả lời', () => {
    const h = new H(makeConfig({ mode: 'shared', winThreshold: 5, freezeSeconds: 3 }));
    h.begin();
    h.answerWrong('blue');
    h.tick(0);
    expect(h.state.teams.blue.frozenUntil).toBe(3000);
    expect(h.state.teams.red.frozenUntil).toBeNull();
    h.answerCorrect('red');
    h.tick(10);
    expect(h.state.teams.red.score).toBe(1);
  });
});

describe('Chế độ chạm mốc (race)', () => {
  it('Xét điểm tuyệt đối, không theo chênh lệch', () => {
    const h = new H(makeConfig({ mode: 'race', winThreshold: 3 }));
    h.begin();
    // Đỏ ghi 2 điểm trước
    let t = 0;
    for (let i = 0; i < 2; i += 1) {
      h.answerCorrect('red');
      h.tick(t);
      t += FEEDBACK_MS + 10;
      h.tick(t);
    }
    // Xanh ghi đủ 3 điểm -> thắng dù chênh lệch chỉ là 1
    for (let i = 0; i < 3; i += 1) {
      h.answerCorrect('blue');
      h.tick(t);
      t += FEEDBACK_MS + 10;
      h.tick(t);
    }
    expect(h.state.teams.blue.score).toBe(3);
    expect(h.state.phase).toBe('finished');
    expect(h.state.result?.winner).toBe('blue');
    expect(h.state.result?.reason).toBe('Đạt mốc điểm trước');
  });

  it('Cùng đạt mốc trong một frame thì vào sinh tử', () => {
    const h = new H(makeConfig({ mode: 'race', winThreshold: 1 }));
    h.begin();
    h.answerCorrect('blue');
    h.answerCorrect('red');
    h.tick(0);
    expect(h.state.phase).toBe('suddenDeath');
  });
});

describe('Đảo đáp án chấm theo ID', () => {
  it('Đáp án đúng theo ID vẫn được tính dù xáo trộn vị trí', () => {
    const h = new H(makeConfig({ shuffleOptions: true }));
    h.begin();
    const cq = currentQuestion(h.state, 'blue')!;
    h.d({ type: 'ANSWER', side: 'blue', optionId: cq.correctOptionId, questionId: cq.id, matchVersion: h.state.version });
    h.tick(0);
    expect(h.state.teams.blue.score).toBe(1);
  });
});

describe('Hết giờ và sinh tử', () => {
  it('Hết giờ khi hòa điểm thì vào sinh tử; sinh tử xử lý cả hai sai và cùng đúng', () => {
    const h = new H(makeConfig({ durationSeconds: 5, winThreshold: 100 }));
    h.begin();
    h.tick(5000); // hết giờ, 0-0
    expect(h.state.phase).toBe('suddenDeath');
    const startCursor = h.state.sdCursor;

    // Cả hai sai trong một frame -> đổi câu, chưa ai thắng
    h.answerWrong('blue');
    h.answerWrong('red');
    h.tick(5001);
    expect(h.state.phase).toBe('suddenDeath');
    expect(h.state.sdCursor).toBe(startCursor + 1);

    // Cả hai đúng trong một frame -> đổi câu tiếp
    h.answerCorrect('blue');
    h.answerCorrect('red');
    h.tick(5002);
    expect(h.state.phase).toBe('suddenDeath');
    expect(h.state.sdCursor).toBe(startCursor + 2);

    // Một đội đúng -> thắng
    h.answerCorrect('red');
    h.tick(5003);
    expect(h.state.phase).toBe('finished');
    expect(h.state.result?.winner).toBe('red');
  });

  it('Hết lượt sinh tử mà chưa ai thắng thì đổi câu', () => {
    const h = new H(makeConfig({ durationSeconds: 1, winThreshold: 100 }));
    h.begin();
    h.tick(1000);
    expect(h.state.phase).toBe('suddenDeath');
    const c0 = h.state.sdCursor;
    h.tick(1000 + 20_000); // quá 20s không ai trả lời
    expect(h.state.phase).toBe('suddenDeath');
    expect(h.state.sdCursor).toBe(c0 + 1);
  });
});

describe('Tạm dừng và reset', () => {
  it('Pause/Resume giữ nguyên thời gian đóng băng còn lại', () => {
    const h = new H(makeConfig({ freezeSeconds: 3 }));
    h.begin();
    h.answerWrong('blue');
    h.tick(1000);
    expect(h.state.teams.blue.frozenUntil).toBe(4000);
    h.d({ type: 'PAUSE' });
    expect(h.state.phase).toBe('paused');
    h.d({ type: 'RESUME' });
    expect(h.state.phase).toBe('playing');
    h.tick(1500); // đồng hồ trận tiếp tục từ chỗ dừng, vẫn còn đóng băng
    expect(h.state.teams.blue.frozenUntil).toBe(4000);
    h.tick(4000);
    expect(h.state.teams.blue.frozenUntil).toBeNull();
  });

  it('Reset loại bỏ sự kiện của trận trước (theo version)', () => {
    const h = new H(makeConfig());
    h.begin();
    h.answerCorrect('blue');
    h.tick(0);
    expect(h.state.teams.blue.score).toBe(1);

    h.d({ type: 'RESTART' });
    expect(h.state.version).toBe(1);
    expect(h.state.teams.blue.score).toBe(0);
    h.begin();
    const cq = currentQuestion(h.state, 'blue')!;
    // Sự kiện version cũ (0) bị loại bỏ
    h.d({ type: 'ANSWER', side: 'blue', optionId: cq.correctOptionId, questionId: cq.id, matchVersion: 0 });
    h.tick(0);
    expect(h.state.teams.blue.score).toBe(0);
    // Sự kiện version hiện tại được nhận
    h.answerCorrect('blue');
    h.tick(1);
    expect(h.state.teams.blue.score).toBe(1);
  });

  it('Trận đã kết thúc thì không nhận thêm đáp án', () => {
    const h = new H(makeConfig({ winThreshold: 1 }));
    h.begin();
    h.answerCorrect('blue');
    h.tick(0);
    expect(h.state.phase).toBe('finished');
    const before = h.state.teams.red.score;
    h.answerCorrect('red'); // bị guard ở phase finished
    h.tick(1);
    expect(h.state.teams.red.score).toBe(before);
  });
});

