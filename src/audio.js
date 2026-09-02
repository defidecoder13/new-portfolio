// ──────────────────────────────────────────────────────────────────────────
// TACTILE INTERACTION SOUND FX & BACKGROUND MUSIC PLAYER
// ──────────────────────────────────────────────────────────────────────────

let ctx = null;
let masterGain = null;
let sfxGain = null;
let bgMusicAudio = null;
let isMuted = false;
let musicStarted = false;
const DEFAULT_MUSIC_VOL = 0.40;

function getAudioContext() {
  if (!ctx) {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    ctx = new AudioCtx();

    // Master bus
    masterGain = ctx.createGain();
    masterGain.gain.setValueAtTime(0.85, ctx.currentTime);
    masterGain.connect(ctx.destination);

    // SFX bus
    sfxGain = ctx.createGain();
    sfxGain.gain.setValueAtTime(0.75, ctx.currentTime);
    sfxGain.connect(masterGain);
  }
  if (ctx.state === 'suspended') {
    ctx.resume().catch(() => {});
  }
  return ctx;
}

// ──────────────────────────────────────────────────────────────────────────
// 1. BACKGROUND MUSIC SYSTEM
// ──────────────────────────────────────────────────────────────────────────

export function initBackgroundMusic(musicSrc = '/assets/bg-music.mp3') {
  if (bgMusicAudio) return;

  bgMusicAudio = new Audio(musicSrc);
  bgMusicAudio.loop = true;
  bgMusicAudio.volume = 0.0;
  bgMusicAudio.preload = 'auto';

  bgMusicAudio.addEventListener('error', (e) => {
    console.warn('[Audio] bg-music.mp3 not found or failed to load:', e);
  });
}

function fadeAudio(audio, targetVol, durationMs = 1200) {
  if (!audio) return;
  const startVol = audio.volume;
  const startTime = performance.now();

  function step(now) {
    const elapsed = now - startTime;
    const progress = Math.min(1, elapsed / durationMs);
    const nextVol = startVol + (targetVol - startVol) * progress;
    audio.volume = Math.max(0.0, Math.min(1.0, nextVol));
    if (progress < 1) {
      requestAnimationFrame(step);
    }
  }
  requestAnimationFrame(step);
}

export function startBackgroundMusic() {
  if (musicStarted || !bgMusicAudio) return;
  bgMusicAudio.play().then(() => {
    musicStarted = true;
    fadeAudio(bgMusicAudio, DEFAULT_MUSIC_VOL, 2000);
  }).catch(() => {});
}

export function setMusicDucked(ducked) {
  if (!bgMusicAudio || isMuted) return;
  const target = ducked ? 0.12 : DEFAULT_MUSIC_VOL;
  fadeAudio(bgMusicAudio, target, 800);
}

export function toggleMute() {
  const actx = getAudioContext();
  isMuted = !isMuted;

  if (masterGain) {
    masterGain.gain.cancelScheduledValues(actx.currentTime);
    masterGain.gain.linearRampToValueAtTime(isMuted ? 0.0 : 0.85, actx.currentTime + 0.1);
  }

  if (bgMusicAudio) {
    if (isMuted) {
      fadeAudio(bgMusicAudio, 0.0, 300);
      setTimeout(() => { if (isMuted) bgMusicAudio.pause(); }, 320);
    } else {
      bgMusicAudio.play().catch(() => {});
      fadeAudio(bgMusicAudio, DEFAULT_MUSIC_VOL, 800);
    }
  }

  return isMuted;
}

export function isAudioMuted() {
  return isMuted;
}

// ──────────────────────────────────────────────────────────────────────────
// 2. TACTILE SOUND EFFECTS
// ──────────────────────────────────────────────────────────────────────────

// Desk lamp pull-chain switch
export function playLampClick() {
  const actx = getAudioContext();
  const t = actx.currentTime;
  const tick = (start, peak) => {
    const osc = actx.createOscillator();
    const g = actx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(2200, start);
    osc.frequency.exponentialRampToValueAtTime(480, start + 0.018);
    g.gain.setValueAtTime(0.0001, start);
    g.gain.exponentialRampToValueAtTime(peak, start + 0.002);
    g.gain.exponentialRampToValueAtTime(0.0001, start + 0.045);
    osc.connect(g);
    g.connect(sfxGain);
    osc.start(start);
    osc.stop(start + 0.06);
  };
  tick(t, 0.45);
  tick(t + 0.07, 0.22);
}

// Subtle organic tick when hovering room objects (pitch randomized)
export function playHoverTick() {
  const actx = getAudioContext();
  const t = actx.currentTime;
  const osc = actx.createOscillator();
  const g = actx.createGain();

  const freq = 1600 + (Math.random() * 300 - 150);
  osc.type = 'sine';
  osc.frequency.setValueAtTime(freq, t);
  osc.frequency.exponentialRampToValueAtTime(freq * 0.7, t + 0.012);

  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(0.04, t + 0.001);
  g.gain.exponentialRampToValueAtTime(0.0001, t + 0.014);

  osc.connect(g);
  g.connect(sfxGain);
  osc.start(t);
  osc.stop(t + 0.02);
}

// Play uploaded Cat Meow sound effect
let meowPool = [];
export function playCatMeow() {
  if (isMuted) return;
  try {
    const audio = new Audio('/assets/meow%20sound.mp3');
    audio.volume = 0.70;
    audio.play().catch(() => {});
  } catch (_) {}
}

// Window Portal Cinematic Glide
export function playPortalWhoosh() {
  const actx = getAudioContext();
  const t = actx.currentTime;

  const bufferSize = actx.sampleRate * 1.5;
  const buffer = actx.createBuffer(1, bufferSize, actx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;

  const noise = actx.createBufferSource();
  noise.buffer = buffer;

  const filter = actx.createBiquadFilter();
  filter.type = 'bandpass';
  filter.frequency.setValueAtTime(120, t);
  filter.frequency.exponentialRampToValueAtTime(2400, t + 0.7);
  filter.frequency.exponentialRampToValueAtTime(400, t + 1.4);
  filter.Q.setValueAtTime(2.5, t);

  const g = actx.createGain();
  g.gain.setValueAtTime(0.001, t);
  g.gain.linearRampToValueAtTime(0.35, t + 0.6);
  g.gain.exponentialRampToValueAtTime(0.0001, t + 1.45);

  noise.connect(filter);
  filter.connect(g);
  g.connect(sfxGain);

  noise.start(t);
  noise.stop(t + 1.5);
}

// Button / Card tactile mechanical click
export function playKeyClick() {
  const actx = getAudioContext();
  const t = actx.currentTime;

  const osc = actx.createOscillator();
  const g = actx.createGain();

  osc.type = 'triangle';
  osc.frequency.setValueAtTime(900 + Math.random() * 200, t);
  osc.frequency.exponentialRampToValueAtTime(200, t + 0.02);

  g.gain.setValueAtTime(0.001, t);
  g.gain.exponentialRampToValueAtTime(0.06, t + 0.002);
  g.gain.exponentialRampToValueAtTime(0.0001, t + 0.025);

  osc.connect(g);
  g.connect(sfxGain);
  osc.start(t);
  osc.stop(t + 0.03);
}

// Authentic Telephone DTMF Dual-Tone Frequency
export function playPhoneBeep(freq1 = 697, freq2 = 1209) {
  if (isMuted) return;
  const actx = getAudioContext();
  const t = actx.currentTime;

  const osc1 = actx.createOscillator();
  const osc2 = actx.createOscillator();
  const g = actx.createGain();

  osc1.type = 'sine';
  osc1.frequency.setValueAtTime(freq1, t);

  osc2.type = 'sine';
  osc2.frequency.setValueAtTime(freq2, t);

  g.gain.setValueAtTime(0.001, t);
  g.gain.linearRampToValueAtTime(0.08, t + 0.01);
  g.gain.exponentialRampToValueAtTime(0.0001, t + 0.12);

  osc1.connect(g);
  osc2.connect(g);
  g.connect(sfxGain);

  osc1.start(t);
  osc2.start(t);
  osc1.stop(t + 0.14);
  osc2.stop(t + 0.14);
}

// Side Drawer Open (Smooth wooden whoosh + slide)
export function playDrawerOpen() {
  const actx = getAudioContext();
  const t = actx.currentTime;

  const osc = actx.createOscillator();
  const g = actx.createGain();
  osc.type = 'sine';
  osc.frequency.setValueAtTime(280, t);
  osc.frequency.exponentialRampToValueAtTime(460, t + 0.08);

  g.gain.setValueAtTime(0.0001, t);
  g.gain.linearRampToValueAtTime(0.05, t + 0.02);
  g.gain.exponentialRampToValueAtTime(0.0001, t + 0.12);

  osc.connect(g);
  g.connect(sfxGain);
  osc.start(t);
  osc.stop(t + 0.14);
}

// Side Drawer Close (Soft return click)
export function playDrawerClose() {
  const actx = getAudioContext();
  const t = actx.currentTime;

  const osc = actx.createOscillator();
  const g = actx.createGain();
  osc.type = 'sine';
  osc.frequency.setValueAtTime(420, t);
  osc.frequency.exponentialRampToValueAtTime(220, t + 0.08);

  g.gain.setValueAtTime(0.0001, t);
  g.gain.linearRampToValueAtTime(0.04, t + 0.02);
  g.gain.exponentialRampToValueAtTime(0.0001, t + 0.10);

  osc.connect(g);
  g.connect(sfxGain);
  osc.start(t);
  osc.stop(t + 0.12);
}

// CRT Monitor Turn On
export function playCrtTurnOn() {
  const actx = getAudioContext();
  const t = actx.currentTime;

  const osc = actx.createOscillator();
  const g = actx.createGain();
  osc.type = 'sine';
  osc.frequency.setValueAtTime(14000, t);
  osc.frequency.linearRampToValueAtTime(15600, t + 0.18);

  g.gain.setValueAtTime(0.0001, t);
  g.gain.linearRampToValueAtTime(0.03, t + 0.05);
  g.gain.exponentialRampToValueAtTime(0.0001, t + 0.22);

  osc.connect(g);
  g.connect(sfxGain);
  osc.start(t);
  osc.stop(t + 0.24);
}

// CRT Monitor Turn Off
export function playCrtTurnOff() {
  const actx = getAudioContext();
  const t = actx.currentTime;

  const osc = actx.createOscillator();
  const g = actx.createGain();
  osc.type = 'sine';
  osc.frequency.setValueAtTime(15600, t);
  osc.frequency.exponentialRampToValueAtTime(400, t + 0.12);

  g.gain.setValueAtTime(0.0001, t);
  g.gain.linearRampToValueAtTime(0.04, t + 0.01);
  g.gain.exponentialRampToValueAtTime(0.0001, t + 0.14);

  osc.connect(g);
  g.connect(sfxGain);
  osc.start(t);
  osc.stop(t + 0.16);
}

// Vintage Mechanical Terminal Keyboard Clack
export function playTerminalKey() {
  const actx = getAudioContext();
  const t = actx.currentTime;
  const baseFreq = 700 + Math.random() * 300;

  const osc = actx.createOscillator();
  const g = actx.createGain();
  osc.type = 'triangle';
  osc.frequency.setValueAtTime(baseFreq, t);
  osc.frequency.exponentialRampToValueAtTime(120, t + 0.025);

  g.gain.setValueAtTime(0.0001, t);
  g.gain.linearRampToValueAtTime(0.06, t + 0.003);
  g.gain.exponentialRampToValueAtTime(0.0001, t + 0.035);

  osc.connect(g);
  g.connect(sfxGain);
  osc.start(t);
  osc.stop(t + 0.04);
}

// Retro Terminal Bell Beep
export function playTerminalBeep(freq = 920) {
  const actx = getAudioContext();
  const t = actx.currentTime;

  const osc = actx.createOscillator();
  const g = actx.createGain();
  osc.type = 'sine';
  osc.frequency.setValueAtTime(freq, t);

  g.gain.setValueAtTime(0.0001, t);
  g.gain.linearRampToValueAtTime(0.08, t + 0.01);
  g.gain.exponentialRampToValueAtTime(0.0001, t + 0.12);

  osc.connect(g);
  g.connect(sfxGain);
  osc.start(t);
  osc.stop(t + 0.14);
}

// Warm Coffee Sip Audio
export function playCoffeeSip() {
  const actx = getAudioContext();
  const t = actx.currentTime;

  // Liquid noise sip
  const bufferSize = actx.sampleRate * 0.18;
  const buffer = actx.createBuffer(1, bufferSize, actx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < bufferSize; i++) {
    data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.4));
  }

  const noise = actx.createBufferSource();
  noise.buffer = buffer;

  const filter = actx.createBiquadFilter();
  filter.type = 'bandpass';
  filter.frequency.setValueAtTime(800, t);
  filter.frequency.exponentialRampToValueAtTime(1600, t + 0.15);
  filter.Q.value = 4.0;

  const g = actx.createGain();
  g.gain.setValueAtTime(0.0001, t);
  g.gain.linearRampToValueAtTime(0.12, t + 0.04);
  g.gain.exponentialRampToValueAtTime(0.0001, t + 0.18);

  noise.connect(filter);
  filter.connect(g);
  g.connect(sfxGain);

  noise.start(t);
}

// Ceramic Porcelain Mug Clink
export function playCupClink() {
  const actx = getAudioContext();
  const t = actx.currentTime;

  const osc = actx.createOscillator();
  const g = actx.createGain();
  osc.type = 'sine';
  osc.frequency.setValueAtTime(1760, t);
  osc.frequency.exponentialRampToValueAtTime(880, t + 0.1);

  g.gain.setValueAtTime(0.0001, t);
  g.gain.linearRampToValueAtTime(0.08, t + 0.002);
  g.gain.exponentialRampToValueAtTime(0.0001, t + 0.15);

  osc.connect(g);
  g.connect(sfxGain);
  osc.start(t);
  osc.stop(t + 0.16);
}

// Houseplant Leaf Rustle
export function playPlantRustle() {
  const actx = getAudioContext();
  const t = actx.currentTime;

  const bufferSize = actx.sampleRate * 0.15;
  const buffer = actx.createBuffer(1, bufferSize, actx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < bufferSize; i++) {
    data[i] = (Math.random() * 2 - 1) * Math.sin((i / bufferSize) * Math.PI);
  }

  const noise = actx.createBufferSource();
  noise.buffer = buffer;

  const filter = actx.createBiquadFilter();
  filter.type = 'bandpass';
  filter.frequency.setValueAtTime(1200, t);
  filter.frequency.linearRampToValueAtTime(600, t + 0.14);
  filter.Q.value = 2.0;

  const g = actx.createGain();
  g.gain.setValueAtTime(0.0001, t);
  g.gain.linearRampToValueAtTime(0.09, t + 0.03);
  g.gain.exponentialRampToValueAtTime(0.0001, t + 0.15);

  noise.connect(filter);
  filter.connect(g);
  g.connect(sfxGain);

  noise.start(t);
}



