// Kết nối bộ máy trận (pure reducer) với React: vòng lặp requestAnimationFrame
// bơm TICK bằng match-clock đơn điệu (performance.now), đếm ngược 3-2-1, tự tạm
// dừng khi tab bị ẩn. Mọi mốc thời gian đóng băng/khóa đều theo match-clock nên
// tạm dừng sẽ bảo toàn thời gian còn lại.
import { useReducer, useRef, useEffect, useCallback } from 'react';
import { matchReducer, initMatch, teamQuestionIndex } from '../engine/reducer';
import type { MatchState } from '../engine/model';
import type { GameConfig, Side } from '../types';

export interface UseMatch {
  state: MatchState;
  start(): void;
  answer(side: Side, optionId: string): void;
  pause(): void;
  resume(): void;
  skip(side: Side): void;
  skipShared(): void;
  adjustScore(side: Side, delta: number): void;
  manualFinish(winner: Side | 'draw'): void;
  restart(): void;
}

const PLAYING = (p: MatchState['phase']) => p === 'playing' || p === 'suddenDeath';

export function useMatch(config: GameConfig): UseMatch {
  const [state, dispatch] = useReducer(matchReducer, config, (c) => initMatch(c));

  // Giữ trạng thái mới nhất cho các callback đọc mà không phụ thuộc closure cũ.
  const stateRef = useRef(state);
  stateRef.current = state;

  // Match-clock: tổng thời gian đã trôi (ref) + đoạn đang chạy hiện tại.
  const accumRef = useRef(0);
  const segStartRef = useRef(0);

  // Đưa clock về 0 mỗi khi trận sẵn sàng lại (RESTART hoặc lần đầu).
  useEffect(() => {
    if (state.phase === 'ready') accumRef.current = 0;
  }, [state.phase]);

  // Đếm ngược 3 → 2 → 1 → vào trận.
  useEffect(() => {
    if (state.phase !== 'countdown') return;
    const id = window.setTimeout(() => {
      if (state.countdownValue > 1) {
        dispatch({ type: 'SET_COUNTDOWN', value: state.countdownValue - 1 });
      } else {
        accumRef.current = 0;
        dispatch({ type: 'BEGIN_PLAY' });
      }
    }, 1000);
    return () => window.clearTimeout(id);
  }, [state.phase, state.countdownValue]);

  // Vòng lặp bơm TICK khi đang chơi hoặc loạt sinh tử.
  useEffect(() => {
    if (!PLAYING(state.phase)) return;
    let raf = 0;
    segStartRef.current = performance.now();
    const loop = () => {
      const clockMs = accumRef.current + (performance.now() - segStartRef.current);
      dispatch({ type: 'TICK', clockMs });
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => {
      cancelAnimationFrame(raf);
      // Cộng dồn đoạn vừa chạy để bảo toàn thời gian khi tạm dừng/đổi phase.
      accumRef.current += performance.now() - segStartRef.current;
    };
  }, [state.phase]);

  // Tự tạm dừng khi tab bị ẩn (không tự chạy lại — để giáo viên chủ động).
  useEffect(() => {
    const onHidden = () => {
      if (document.hidden && PLAYING(stateRef.current.phase)) {
        dispatch({ type: 'PAUSE' });
      }
    };
    document.addEventListener('visibilitychange', onHidden);
    return () => document.removeEventListener('visibilitychange', onHidden);
  }, []);

  const start = useCallback(() => dispatch({ type: 'START' }), []);

  const answer = useCallback((side: Side, optionId: string) => {
    const s = stateRef.current;
    if (!PLAYING(s.phase)) return;
    const q = s.questions[teamQuestionIndex(s, side)];
    if (!q) return;
    dispatch({ type: 'ANSWER', side, optionId, questionId: q.id, matchVersion: s.version });
  }, []);

  const pause = useCallback(() => dispatch({ type: 'PAUSE' }), []);
  const resume = useCallback(() => dispatch({ type: 'RESUME' }), []);
  const skip = useCallback((side: Side) => dispatch({ type: 'SKIP', side }), []);
  const skipShared = useCallback(() => dispatch({ type: 'SKIP_SHARED' }), []);
  const adjustScore = useCallback(
    (side: Side, delta: number) => dispatch({ type: 'ADJUST_SCORE', side, delta }),
    [],
  );
  const manualFinish = useCallback(
    (winner: Side | 'draw') => dispatch({ type: 'MANUAL_FINISH', winner }),
    [],
  );
  const restart = useCallback(() => dispatch({ type: 'RESTART' }), []);

  return {
    state,
    start,
    answer,
    pause,
    resume,
    skip,
    skipShared,
    adjustScore,
    manualFinish,
    restart,
  };
}
