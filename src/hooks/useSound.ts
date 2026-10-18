// Âm thanh sinh bằng Web Audio API (không kèm file nhạc, tránh vấn đề bản quyền).
// Mọi trạng thái đều còn tín hiệu bằng chữ/hình, âm thanh chỉ là bổ trợ.
import { useEffect, useMemo, useRef } from 'react';

export interface SoundControls {
  unlock(): void; // gọi trong một cử chỉ người dùng để mở khóa audio
  playCorrect(): void;
  playCheer(): void;
  playWrong(): void;
  playFinish(): void;
  startMusic(): void;
  stopMusic(): void;
}

interface SoundOptions {
  soundEnabled: boolean;
  musicEnabled: boolean;
  volume: number; // 0..1
}

type AudioCtx = AudioContext;

export function useSound(opts: SoundOptions): SoundControls {
  const ctxRef = useRef<AudioCtx | null>(null);
  const masterRef = useRef<GainNode | null>(null);
  const musicRef = useRef<{ stop(): void } | null>(null);
  const lastCheerAtRef = useRef(0);
  const optsRef = useRef(opts);
  optsRef.current = opts;

  const ensureCtx = (): AudioCtx | null => {
    if (typeof window === 'undefined') return null;
    const Ctor = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!Ctor) return null;
    if (!ctxRef.current) {
      const ctx = new Ctor();
      const master = ctx.createGain();
      master.gain.value = optsRef.current.volume;
      master.connect(ctx.destination);
      ctxRef.current = ctx;
      masterRef.current = master;
    }
    return ctxRef.current;
  };

  // Cập nhật âm lượng tổng khi thay đổi cài đặt.
  useEffect(() => {
    if (masterRef.current && ctxRef.current) {
      masterRef.current.gain.setTargetAtTime(opts.volume, ctxRef.current.currentTime, 0.05);
    }
  }, [opts.volume]);

  // Dừng nhạc nền khi tắt cài đặt nhạc.
  useEffect(() => {
    if (!opts.musicEnabled && musicRef.current) {
      musicRef.current.stop();
      musicRef.current = null;
    }
  }, [opts.musicEnabled]);

  useEffect(() => {
    return () => {
      musicRef.current?.stop();
      ctxRef.current?.close().catch(() => undefined);
      ctxRef.current = null;
    };
  }, []);

  return useMemo<SoundControls>(() => {
    const tone = (
      freqs: number[],
      startGap: number,
      dur: number,
      type: OscillatorType,
      peak: number,
    ) => {
      if (!optsRef.current.soundEnabled) return;
      const ctx = ensureCtx();
      const master = masterRef.current;
      if (!ctx || !master) return;
      if (ctx.state === 'suspended') ctx.resume().catch(() => undefined);
      freqs.forEach((f, i) => {
        const osc = ctx.createOscillator();
        const g = ctx.createGain();
        osc.type = type;
        osc.frequency.value = f;
        const t0 = ctx.currentTime + i * startGap;
        g.gain.setValueAtTime(0.0001, t0);
        g.gain.exponentialRampToValueAtTime(peak, t0 + 0.02);
        g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
        osc.connect(g).connect(master);
        osc.start(t0);
        osc.stop(t0 + dur + 0.02);
      });
    };

    return {
      unlock() {
        const ctx = ensureCtx();
        if (ctx && ctx.state === 'suspended') ctx.resume().catch(() => undefined);
      },
      playCorrect() {
        tone([523.25, 783.99], 0.09, 0.16, 'sine', 0.28); // Đô → Sol đi lên
      },
      playCheer() {
        if (!optsRef.current.soundEnabled) return;
        const now = Date.now();
        // Tránh hai tiếng reo chồng lên nhau khi cả hai đội cùng ghi điểm.
        if (now - lastCheerAtRef.current < 650) return;
        lastCheerAtRef.current = now;

        if (typeof window !== 'undefined' && 'speechSynthesis' in window && typeof SpeechSynthesisUtterance !== 'undefined') {
          const shout = new SpeechSynthesisUtterance('Yee!');
          shout.lang = 'en-US';
          shout.rate = 0.82;
          shout.pitch = 1.55;
          shout.volume = optsRef.current.volume;
          window.speechSynthesis.speak(shout);
          return;
        }

        // Dự phòng cho trình duyệt không có giọng đọc: tiếng reo cao dần.
        tone([392, 523.25, 659.25, 783.99], 0.065, 0.2, 'triangle', 0.2);
      },
      playWrong() {
        tone([196, 155.56], 0.1, 0.2, 'sawtooth', 0.2); // hai nốt trầm đi xuống
      },
      playFinish() {
        tone([523.25, 659.25, 783.99, 1046.5], 0.12, 0.28, 'triangle', 0.26); // hợp âm vui
      },
      startMusic() {
        if (!optsRef.current.musicEnabled) return;
        const ctx = ensureCtx();
        const master = masterRef.current;
        if (!ctx || !master || musicRef.current) return;
        if (ctx.state === 'suspended') ctx.resume().catch(() => undefined);
        musicRef.current = createMusicLoop(ctx, master);
      },
      stopMusic() {
        musicRef.current?.stop();
        musicRef.current = null;
      },
    };
  }, []);
}

// Tạo vòng nhạc nền vui tươi, lặp lại bằng bộ lập lịch look-ahead của Web Audio:
// trống (kick + hi-hat), bè trầm và giai điệu rải hợp âm theo vòng I–V–vi–IV.
function createMusicLoop(ctx: AudioContext, dest: AudioNode): { stop(): void } {
  const bus = ctx.createGain();
  bus.gain.value = 0.5; // nhỏ hơn tiếng hiệu ứng để không lấn tiếng
  bus.connect(dest);

  // Nhiễu trắng ngắn dùng cho tiếng hi-hat.
  const noise = ctx.createBuffer(1, Math.floor(ctx.sampleRate * 0.2), ctx.sampleRate);
  const nd = noise.getChannelData(0);
  for (let i = 0; i < nd.length; i++) nd[i] = Math.random() * 2 - 1;

  const note = (freq: number, t: number, dur: number, type: OscillatorType, peak: number) => {
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.type = type;
    o.frequency.setValueAtTime(freq, t);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(peak, t + 0.01);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(g).connect(bus);
    o.start(t);
    o.stop(t + dur + 0.02);
  };
  const kick = (t: number) => {
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.type = 'sine';
    o.frequency.setValueAtTime(150, t);
    o.frequency.exponentialRampToValueAtTime(50, t + 0.12);
    g.gain.setValueAtTime(0.8, t);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 0.16);
    o.connect(g).connect(bus);
    o.start(t);
    o.stop(t + 0.18);
  };
  const hat = (t: number, open: boolean) => {
    const src = ctx.createBufferSource();
    src.buffer = noise;
    const hp = ctx.createBiquadFilter();
    hp.type = 'highpass';
    hp.frequency.value = 7000;
    const g = ctx.createGain();
    const dur = open ? 0.09 : 0.035;
    g.gain.setValueAtTime(0.25, t);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    src.connect(hp).connect(g).connect(bus);
    src.start(t);
    src.stop(t + dur + 0.02);
  };
  // Vòng hòa thanh vui tươi I–V–vi–IV (Đô trưởng), mỗi ô nhịp một hợp âm.
  const BARS = [
    { bass: 130.81, tones: [261.63, 329.63, 392.0] }, // C
    { bass: 98.0, tones: [246.94, 293.66, 392.0] }, // G
    { bass: 110.0, tones: [261.63, 329.63, 440.0] }, // Am
    { bass: 87.31, tones: [261.63, 349.23, 440.0] }, // F
  ];
  const stepDur = 60 / 130 / 4; // 130 BPM, mỗi bước là nốt 1/16
  const STEPS = BARS.length * 16;
  let step = 0;
  let nextTime = ctx.currentTime + 0.08;

  const scheduleStep = (s: number, t: number) => {
    const bar = BARS[Math.floor(s / 16) % BARS.length];
    const i = s % 16;
    if (i % 4 === 0) kick(t); // trống bốn phách/ô nhịp
    if (i % 2 === 0 && i % 4 !== 0) hat(t, i === 6 || i === 14); // hi-hat phách lẻ
    if (i === 0 || i === 8) note(bar.bass, t, stepDur * 3.2, 'triangle', 0.5); // bè trầm mạnh
    if (i === 4 || i === 12) note(bar.bass, t, stepDur * 1.6, 'triangle', 0.32);
    if (i % 4 === 2) bar.tones.forEach((f) => note(f, t, stepDur * 1.4, 'square', 0.06)); // đệm giật
    if (i % 2 === 0) note(bar.tones[(i / 2) % bar.tones.length] * 2, t, stepDur * 1.3, 'triangle', 0.16); // giai điệu
  };

  const tick = () => {
    while (nextTime < ctx.currentTime + 0.12) {
      scheduleStep(step, nextTime);
      nextTime += stepDur;
      step = (step + 1) % STEPS;
    }
  };
  tick();
  const timer = window.setInterval(tick, 25);

  return {
    stop() {
      window.clearInterval(timer);
      bus.gain.setTargetAtTime(0.0001, ctx.currentTime, 0.06);
      window.setTimeout(() => {
        try {
          bus.disconnect();
        } catch {
          /* đã ngắt */
        }
      }, 250);
    },
  };
}
