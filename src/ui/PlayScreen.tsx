// Điều phối màn chơi theo phase: luật chơi → đếm ngược → thi đấu → kết quả.
// Gắn âm thanh theo phản hồi, phím tắt hai đội, tự tạm dừng khi ẩn tab.
import { useEffect, useMemo, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getGame } from '../storage/storage';
import { useMatch } from '../hooks/useMatch';
import { useSound } from '../hooks/useSound';
import { useFullscreen } from '../hooks/useFullscreen';
import { KEY_HINTS, orderedOptions } from '../engine/selectors';
import { modeName, formatClock } from './labels';
import { timeLeftMs } from '../engine/selectors';
import { PreMatch } from './components/PreMatch';
import { MatchScreen } from './components/MatchScreen';
import { ControlPanel } from './components/ControlPanel';
import { Results } from './components/Results';
import type { Side } from '../types';
import type { Feedback } from '../engine/model';

export function PlayScreen() {
  const { id } = useParams();
  const nav = useNavigate();
  const game = useMemo(() => (id ? getGame(id) : undefined), [id]);

  if (!game) {
    return (
      <div className="shell">
        <p>Không tìm thấy trò chơi.</p>
        <button className="btn btn-primary" onClick={() => nav('/')}>
          ← Về thư viện
        </button>
      </div>
    );
  }
  if (game.questions.length === 0) {
    return (
      <div className="shell">
        <p>Trò chơi này chưa có câu hỏi. Hãy thêm câu hỏi trước khi chơi.</p>
        <button className="btn btn-primary" onClick={() => nav(`/edit/${game.id}`)}>
          ✎ Sửa trò chơi
        </button>
      </div>
    );
  }
  return <PlayInner gameId={game.id} />;
}

function PlayInner({ gameId }: { gameId: string }) {
  const nav = useNavigate();
  const game = useMemo(() => getGame(gameId)!, [gameId]);
  const match = useMatch(game);
  const sound = useSound({
    soundEnabled: game.soundEnabled,
    musicEnabled: game.musicEnabled,
    volume: game.volume,
  });
  const fs = useFullscreen();
  const { state, answer, pause, resume } = match;

  const stateRef = useRef(state);
  stateRef.current = state;

  // Phát âm theo thay đổi phản hồi và chuyển phase.
  const prevFb = useRef<Record<Side, Feedback>>({ blue: null, red: null });
  const prevPhase = useRef(state.phase);
  useEffect(() => {
    for (const side of ['blue', 'red'] as const) {
      const fb = state.teams[side].feedback;
      if (fb !== prevFb.current[side]) {
        if (fb === 'correct') {
          sound.playCorrect();
          sound.playCheer();
        } else if (fb === 'wrong') sound.playWrong();
        prevFb.current[side] = fb;
      }
    }
    if (state.phase !== prevPhase.current) {
      // Nhạc nền chạy khi đang thi đấu / sinh tử, dừng khi tạm dừng hoặc kết thúc.
      if (game.musicEnabled) {
        if (state.phase === 'playing' || state.phase === 'suddenDeath') sound.startMusic();
        else sound.stopMusic();
      }
      if (state.phase === 'finished') sound.playFinish();
      prevPhase.current = state.phase;
    }
  }, [state, sound, game.musicEnabled]);

  // Phím tắt hai đội + phím cách để tạm dừng/tiếp tục.
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const s = stateRef.current;
      if (e.code === 'Space') {
        if (s.phase === 'playing' || s.phase === 'suddenDeath') {
          pause();
          e.preventDefault();
        } else if (s.phase === 'paused') {
          resume();
          e.preventDefault();
        }
        return;
      }
      if (s.phase !== 'playing' && s.phase !== 'suddenDeath') return;
      const key = e.key.toUpperCase();
      for (const side of ['blue', 'red'] as const) {
        const idx = KEY_HINTS[side].indexOf(key);
        if (idx >= 0) {
          const op = orderedOptions(s, side)[idx];
          if (op) {
            answer(side, op.option.id);
            e.preventDefault();
          }
          return;
        }
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [answer, pause, resume]);

  useEffect(() => () => sound.stopMusic(), [sound]);

  const exit = () => {
    if (state.phase === 'finished' || window.confirm('Thoát khỏi trận đang chơi?')) nav('/');
  };

  if (state.phase === 'ready') {
    return (
      <PreMatch
        config={game}
        onStart={() => {
          sound.unlock();
          match.start();
        }}
        onBack={() => nav('/')}
      />
    );
  }

  if (state.phase === 'finished') {
    return (
      <Results
        state={state}
        onRestart={match.restart}
        onExit={() => nav('/')}
        onEdit={() => nav(`/edit/${game.id}`)}
      />
    );
  }

  const timeLeft = timeLeftMs(state);
  const low = state.durationMs > 0 && timeLeft <= 15000 && state.phase !== 'suddenDeath';

  return (
    <div className="play-root">
      <div className="play-topbar">
        <span className="play-mode">Chế độ: {modeName(state.mode)}</span>
        <span className={`play-clock ${low ? 'low' : ''}`}>
          {state.phase === 'suddenDeath' ? 'Sinh tử' : formatClock(timeLeft)}
        </span>
        <span className="play-mode">
          {game.teamNames[0]} {state.teams.blue.score} – {state.teams.red.score}{' '}
          {game.teamNames[1]}
        </span>
      </div>

      <MatchScreen state={state} onAnswer={answer} />

      <ControlPanel
        state={state}
        onPause={pause}
        onResume={resume}
        onSkip={match.skip}
        onSkipShared={match.skipShared}
        onAdjust={match.adjustScore}
        onRestart={match.restart}
        onFinish={match.manualFinish}
        onExit={exit}
        isFullscreen={fs.isFullscreen}
        onToggleFullscreen={fs.toggle}
      />

      {state.phase === 'countdown' && (
        <div className="countdown-overlay">
          <div className="countdown-num" key={state.countdownValue}>
            {state.countdownValue}
          </div>
        </div>
      )}
    </div>
  );
}
