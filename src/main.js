// ──────────────────────────────────────────────────────────────────────────
// MAIN APPLICATION ENTRYPOINT WITH PIXEL CAT COMPANION & SOUNDS
// ──────────────────────────────────────────────────────────────────────────

import { createParallax } from './parallax.js';
import { makePlaceholders } from './placeholder.js';
import { HOTSPOTS } from './hotspots.js';
import { createUI, showFallback } from './ui.js';
import { createStickyWall } from './board.js';
import { createPhoneConsole } from './phone.js';
import { createAboutPage } from './about.js';
import { createProjectsPage } from './projects.js';
import { createTerminalConsole } from './terminal.js';
import { createEducationPage } from './education.js';
import { createTechStackPage } from './techstack.js';
import {
  initBackgroundMusic,
  startBackgroundMusic,
  setMusicDucked,
  toggleMute,
  isAudioMuted,
  playLampClick,
  playHoverTick,
  playCatMeow,
  playPortalWhoosh,
  playKeyClick,
  playPlantRustle,
  playTerminalKey,
} from './audio.js';

window.__roomStarted = true;

const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const EDIT = new URLSearchParams(location.search).has('edit');
const isPhone = () => window.matchMedia('(max-width: 520px)').matches;
const hasTouch = () => navigator.maxTouchPoints > 0 || 'ontouchstart' in window;

// Screen Mode (Monitor zoom settings)
const SCREEN_DOLLY = 0.76;
const SCREEN_SCALE = 1.02;
const SCREEN_ZOOM_LERP = 0.085;
const SCREEN_LIT_AT = 0.96;
const SCREEN_BOX = { x: 0.475, y: 0.375, w: 0.158, h: 0.205 };

function screenFitsViewport() {
  const r = px.coverRect();
  const grow = SCREEN_SCALE / (1 - SCREEN_DOLLY);
  const w = SCREEN_BOX.w * r.w * grow, h = SCREEN_BOX.h * r.h * grow;
  return w <= window.innerWidth * 0.98 && h <= window.innerHeight * 0.98;
}

const app = document.getElementById('app');
const placeholders = makePlaceholders();

// ── Initialize Music & Audio on First Gesture ───────────────────────────────
initBackgroundMusic('/assets/bg-music.mp3');

let hasInteracted = false;
function onFirstGesture() {
  if (!hasInteracted) {
    hasInteracted = true;
    startBackgroundMusic();
  }
}
window.addEventListener('click', onFirstGesture, { passive: true });
window.addEventListener('touchstart', onFirstGesture, { passive: true });
window.addEventListener('keydown', onFirstGesture, { passive: true });

const px = createParallax(app, {
  colorURL: '/assets/studio.webp',
  depthURL: '/assets/studio-depth.webp',
  maskURL: '/assets/studio-sunmask.webp',
  nightURL: '/assets/studio-night.webp',
  fallbackColor: placeholders.color,
  fallbackDepth: placeholders.depth,
  aspect: placeholders.aspect,
  strength: reduceMotion ? 0.005 : 0.015,
});

if (!px.ok) {
  showFallback('WebGL initialization error');
  throw px.error;
}

const loadStartTime = Date.now();
const MIN_LOADER_DURATION = 2200; // 2.2s showcase duration for smooth atomic animation

const ui = createUI({ onClose: () => px.zoomOut() });
ui.updateProgress(18, 'Initializing atomic spatial engine…');

setTimeout(() => {
  ui.updateProgress(45, 'Generating orbital electron matrix…');
}, 450);

setTimeout(() => {
  ui.updateProgress(72, 'Compiling 2.5D depth shaders & lighting…');
}, 950);

setTimeout(() => {
  ui.updateProgress(90, 'Calibrating interactive studio workspace…');
}, 1500);

// ── Floating Room Bubble & Sparks ──────────────────────────────────────────
function spawnRoomBubble(x, y, text) {
  const b = document.createElement('div');
  b.className = 'floating-room-bubble';
  b.textContent = text;
  b.style.left = `${x}px`;
  b.style.top = `${y}px`;
  document.body.appendChild(b);
  setTimeout(() => b.remove(), 2500);
}

function spawnSparkItem(x, y, text) {
  const s = document.createElement('div');
  s.className = 'floating-spark-item';
  s.textContent = text;
  s.style.left = `${x}px`;
  s.style.top = `${y}px`;
  document.body.appendChild(s);
  setTimeout(() => s.remove(), 1600);
}

// ── Living Pixel Cat Companion (Rug) ────────────────────────────────────────
const CAT = {
  x: 0.725,
  y: 0.815,
  w: 0.088,
  h: 0.088 * (232 / 259) * (16 / 9),
  depth: 0.58,
  drift: 2.6,
};
const CAT_LABEL = 'Mochi the Studio Cat · Click to pet 🐾';

const catShadow = document.createElement('div');
catShadow.id = 'cat-shadow';
document.body.appendChild(catShadow);

const catBtn = document.createElement('button');
catBtn.id = 'cat';
catBtn.type = 'button';
catBtn.setAttribute('aria-label', CAT_LABEL);

function onPetCat(e) {
  if (EDIT) return;
  playCatMeow();
  const rect = catBtn.getBoundingClientRect();
  const cx = rect.left + rect.width / 2;
  const cy = rect.top;
  spawnSparkItem(cx + (Math.random() * 20 - 10), cy - 10, Math.random() > 0.5 ? '💖' : '🐾');
  spawnRoomBubble(cx, cy - 20, 'Mochi says: Purrrr... (=^･ω･^=)');
}

catBtn.addEventListener('click', onPetCat);
catBtn.addEventListener('touchstart', onPetCat, { passive: true });

catBtn.addEventListener('pointerenter', (e) => {
  if (!EDIT && !ui.isOpen()) {
    ui.tooltip(CAT_LABEL, e.clientX, e.clientY);
    playHoverTick();
  }
});
catBtn.addEventListener('pointermove', (e) => {
  if (!EDIT && !ui.isOpen()) ui.tooltip(CAT_LABEL, e.clientX, e.clientY);
});
catBtn.addEventListener('pointerleave', () => ui.tooltip(null));
document.body.appendChild(catBtn);

function layoutCat() {
  const cr = px.projectImageRect(CAT);
  catBtn.style.left = cr.x + 'px';
  catBtn.style.top = cr.y + 'px';
  catBtn.style.width = cr.w + 'px';
  catBtn.style.height = cr.h + 'px';
  catBtn.style.setProperty('--cw', cr.w + 'px');

  catShadow.style.left = (cr.x + cr.w * 0.06) + 'px';
  catShadow.style.top = (cr.y + cr.h * 0.82) + 'px';
  catShadow.style.width = (cr.w * 1.38) + 'px';
  catShadow.style.height = (cr.h * 0.22) + 'px';

  const u = px.uniforms;
  if (!u || !u.uPointer) return;
  const t = u.uTime.value;
  const swx = Math.sin(t * 0.25) * 0.12, swy = Math.cos(t * 0.20) * 0.12;
  const s = u.uStrength.value * (CAT.depth - 0.5) * u.uParallaxScale.value * CAT.drift;
  const r = px.coverRect();
  const pdx = (-(u.uPointer.value.x + swx) * s * r.w) + 'px';
  const pdy = ((u.uPointer.value.y + swy) * s * r.h) + 'px';

  catBtn.style.setProperty('--pdx', pdx);
  catBtn.style.setProperty('--pdy', pdy);
  catShadow.style.setProperty('--pdx', pdx);
  catShadow.style.setProperty('--pdy', pdy);
}

// ── Living Mechanical Keyboard Interaction ──────────────────────────────────
const KEYBOARD = {
  x: 0.488,
  y: 0.548,
  w: 0.125,
  h: 0.052,
  depth: 0.65,
};
const KEYBOARD_LABEL = 'Mechanical Keyboard · Click to type ⌨️';

const keyboardBtn = document.createElement('button');
keyboardBtn.className = 'room-micro-btn';
keyboardBtn.setAttribute('aria-label', KEYBOARD_LABEL);

const CODE_SPARKS = ['{;}', '</>', 'console.log()', 'return true;', 'npm run dev', 'git push', 'Three.js'];

keyboardBtn.addEventListener('click', (e) => {
  if (EDIT || ui.isOpen()) return;
  playTerminalKey();
  setTimeout(playTerminalKey, 60);
  setTimeout(playTerminalKey, 130);

  const rect = keyboardBtn.getBoundingClientRect();
  const cx = rect.left + rect.width / 2;
  const cy = rect.top;

  const spark = CODE_SPARKS[Math.floor(Math.random() * CODE_SPARKS.length)];
  spawnSparkItem(cx + (Math.random() * 40 - 20), cy - 10, spark);
});

keyboardBtn.addEventListener('pointerenter', (e) => {
  if (!EDIT && !ui.isOpen()) {
    ui.tooltip(KEYBOARD_LABEL, e.clientX, e.clientY);
    playHoverTick();
  }
});
keyboardBtn.addEventListener('pointermove', (e) => {
  if (!EDIT && !ui.isOpen()) ui.tooltip(KEYBOARD_LABEL, e.clientX, e.clientY);
});
keyboardBtn.addEventListener('pointerleave', () => ui.tooltip(null));
document.body.appendChild(keyboardBtn);

function layoutKeyboard() {
  const cr = px.projectImageRect(KEYBOARD);
  keyboardBtn.style.left = cr.x + 'px';
  keyboardBtn.style.top = cr.y + 'px';
  keyboardBtn.style.width = cr.w + 'px';
  keyboardBtn.style.height = cr.h + 'px';
}

// ── Developer Pegboard & Hardware Tool Rack Interaction ─────────────────────
const PEGBOARD = {
  x: 0.785,
  y: 0.300,
  w: 0.190,
  h: 0.520,
  depth: 0.55,
};
const PEGBOARD_LABEL = 'Developer Pegboard · Tech Stack & Engineering Toolkit 🛠️ ⚡';

const pegboardBtn = document.createElement('button');
pegboardBtn.className = 'room-micro-btn';
pegboardBtn.setAttribute('aria-label', PEGBOARD_LABEL);

const TECH_SPARKS = ['⚡', '🛠️', 'React', 'Node.js', 'Next.js', 'Python', 'Gemini AI', 'MongoDB', 'Docker', 'Three.js'];

pegboardBtn.addEventListener('click', (e) => {
  if (EDIT || ui.isOpen() || anyModalOpen()) return;
  playKeyClick();

  const rect = pegboardBtn.getBoundingClientRect();
  const cx = rect.left + rect.width / 2;
  const cy = rect.top + rect.height * 0.3;

  const spark = TECH_SPARKS[Math.floor(Math.random() * TECH_SPARKS.length)];
  spawnSparkItem(cx, cy, spark);
  openTechStackPage(0.88, 0.55);
});

pegboardBtn.addEventListener('pointerenter', (e) => {
  if (!EDIT && !ui.isOpen() && !anyModalOpen()) {
    ui.tooltip(PEGBOARD_LABEL, e.clientX, e.clientY);
    playHoverTick();
  }
});
pegboardBtn.addEventListener('pointermove', (e) => {
  if (!EDIT && !ui.isOpen() && !anyModalOpen()) ui.tooltip(PEGBOARD_LABEL, e.clientX, e.clientY);
});
pegboardBtn.addEventListener('pointerleave', () => ui.tooltip(null));
document.body.appendChild(pegboardBtn);

function layoutPegboard() {
  const cr = px.projectImageRect(PEGBOARD);
  pegboardBtn.style.left = cr.x + 'px';
  pegboardBtn.style.top = cr.y + 'px';
  pegboardBtn.style.width = cr.w + 'px';
  pegboardBtn.style.height = cr.h + 'px';
}

// ── Window Portal (Procedural Seascape) ──────────────────────────────────────
const BEACH_DOLLY = 0.94, BEACH_ZOOM_LERP = 0.018;
const WHITEOUT_MS = 1200;
const whiteout = document.createElement('div');
whiteout.id = 'whiteout';
document.body.appendChild(whiteout);

const beachMsg = document.createElement('div');
beachMsg.id = 'beach-msg';
beachMsg.textContent = 'Don’t forget to look outside and enjoy the view 🌊 (Press ESC / Back to return)';
document.body.appendChild(beachMsg);

let beach = null, beachActive = false, beachBusy = false, beachHist = false;
let beachModPromise = null;
const loadBeach = () => (beachModPromise = beachModPromise || import('./beach.js'));

async function enterBeach(fx, fy) {
  if (beachActive || beachBusy) return;
  beachBusy = true;
  if (document.activeElement) document.activeElement.blur();
  ui.tooltip(null);
  px.clearHover();
  playPortalWhoosh();
  setMusicDucked(true);
  px.zoomTo(fx, fy, BEACH_DOLLY, BEACH_ZOOM_LERP);
  whiteout.classList.add('show');
  
  let mod = null;
  try { mod = await loadBeach(); } catch (_) {}
  
  const isNightTime = px.isNight();
  beachMsg.textContent = isNightTime
    ? 'Midnight ocean gazing under the stars 🌙✨🚀 (Press ESC / Back to return)'
    : 'Golden daytime sea & soaring birds ☀️🕊️ (Press ESC / Back to return)';

  setTimeout(() => {
    try {
      if (!mod) throw new Error('Beach module failed');
      beach = beach || mod.createBeach(app);
    } catch (_) {
      beachBusy = false;
      setMusicDucked(false);
      px.zoomOut();
      whiteout.classList.remove('show');
      return;
    }
    px.renderer.domElement.style.visibility = 'hidden';
    document.body.classList.add('beach-mode');
    beach.start(isNightTime);
    beachActive = true;
    beachBusy = false;
    if (!beachHist) {
      beachHist = true;
      try { history.pushState({ beach: true }, ''); } catch (_) {}
    }
    whiteout.classList.remove('show');
  }, WHITEOUT_MS);
}

function exitBeach(fromPop) {
  if (!beachActive || beachBusy) return;
  beachBusy = true;
  if (document.activeElement) document.activeElement.blur();
  ui.tooltip(null);
  px.clearHover();
  playPortalWhoosh();
  setMusicDucked(false);
  whiteout.classList.add('show');
  if (beachHist) {
    beachHist = false;
    if (!fromPop) { try { history.back(); } catch (_) {} }
  }
  setTimeout(() => {
    beach.stop();
    document.body.classList.remove('beach-mode');
    px.renderer.domElement.style.visibility = '';
    px.zoomOut();
    px.clearHover();
    ui.tooltip(null);
    if (document.activeElement) document.activeElement.blur();
    beachActive = false;
    beachBusy = false;
    whiteout.classList.remove('show');
  }, WHITEOUT_MS);
}

// ── Interactive Sticky Notes Wall Portal ─────────────────────────────────────
let stickyWall = null;
let wallActive = false;
let wallHist = false;

function openStickyWall(fx, fy) {
  if (wallActive || beachActive) return;
  wallActive = true;
  if (document.activeElement) document.activeElement.blur();
  ui.tooltip(null);
  px.clearHover();
  playPortalWhoosh();
  px.zoomTo(fx, fy, 0.76, 0.035);
  
  if (!stickyWall) {
    stickyWall = createStickyWall(document.body);
  }
  
  setTimeout(() => {
    stickyWall.open(px.isNight(), () => closeStickyWall(false));
    if (!wallHist) {
      wallHist = true;
      try { history.pushState({ wall: true }, ''); } catch (_) {}
    }
  }, 220);
}

function closeStickyWall(fromPop) {
  if (!wallActive) return;
  wallActive = false;
  playPortalWhoosh();
  if (stickyWall) stickyWall.close();
  px.zoomOut();
  if (wallHist) {
    wallHist = false;
    if (!fromPop) { try { history.back(); } catch (_) {} }
  }
}

// ── Retro Telephone Direct Line Hotline Portal ─────────────────────────────
let phoneConsole = null;
let phoneActive = false;
let phoneHist = false;

function openPhoneConsole(fx, fy) {
  if (phoneActive || beachActive || wallActive) return;
  phoneActive = true;
  if (document.activeElement) document.activeElement.blur();
  ui.tooltip(null);
  px.clearHover();
  playPortalWhoosh();
  px.zoomTo(fx, fy, 0.74, 0.035);

  if (!phoneConsole) {
    phoneConsole = createPhoneConsole(document.body);
  }

  setTimeout(() => {
    phoneConsole.open(px.isNight(), () => closePhoneConsole(false));
    if (!phoneHist) {
      phoneHist = true;
      try { history.pushState({ phone: true }, ''); } catch (_) {}
    }
  }, 220);
}

function closePhoneConsole(fromPop) {
  if (!phoneActive) return;
  phoneActive = false;
  playPortalWhoosh();
  if (phoneConsole) phoneConsole.close();
  px.zoomOut();
  if (phoneHist) {
    phoneHist = false;
    if (!fromPop) { try { history.back(); } catch (_) {} }
  }
}

// ── Illustrated Portrait "About Me" Modal Portal ───────────────────────────
let aboutPage = null;
let aboutActive = false;
let aboutHist = false;

function openAboutPage(fx, fy) {
  if (aboutActive || phoneActive || beachActive || wallActive) return;
  aboutActive = true;
  if (document.activeElement) document.activeElement.blur();
  ui.tooltip(null);
  px.clearHover();
  playPortalWhoosh();
  px.zoomTo(fx, fy, 0.74, 0.035);

  if (!aboutPage) {
    aboutPage = createAboutPage(document.body);
  }

  setTimeout(() => {
    aboutPage.open(px.isNight(), () => closeAboutPage(false));
    if (!aboutHist) {
      aboutHist = true;
      try { history.pushState({ about: true }, ''); } catch (_) {}
    }
  }, 220);
}

function closeAboutPage(fromPop) {
  if (!aboutActive) return;
  aboutActive = false;
  playPortalWhoosh();
  if (aboutPage) aboutPage.close();
  px.zoomOut();
  if (aboutHist) {
    aboutHist = false;
    if (!fromPop) { try { history.back(); } catch (_) {} }
  }
}

// ── Illustrated "Projects" Modal Portal ─────────────────────────────────────
let projectsPage = null;
let projectsActive = false;
let projectsHist = false;

function openProjectsPage(fx, fy) {
  if (projectsActive || aboutActive || phoneActive || beachActive || wallActive) return;
  projectsActive = true;
  if (document.activeElement) document.activeElement.blur();
  ui.tooltip(null);
  px.clearHover();
  playPortalWhoosh();
  px.zoomTo(fx, fy, 0.74, 0.035);

  if (!projectsPage) {
    projectsPage = createProjectsPage(document.body);
  }

  setTimeout(() => {
    projectsPage.open(px.isNight(), () => closeProjectsPage(false));
    if (!projectsHist) {
      projectsHist = true;
      try { history.pushState({ projects: true }, ''); } catch (_) {}
    }
  }, 220);
}

function closeProjectsPage(fromPop) {
  if (!projectsActive) return;
  projectsActive = false;
  playPortalWhoosh();
  if (projectsPage) projectsPage.close();
  px.zoomOut();
  if (projectsHist) {
    projectsHist = false;
    if (!fromPop) { try { history.back(); } catch (_) {} }
  }
}

// ── Retro CRT Dev Terminal (SubhamOS) Modal Portal ─────────────────────────
let terminalConsole = null;
let terminalActive = false;
let terminalHist = false;

function openTerminalConsole(fx, fy) {
  if (terminalActive || projectsActive || aboutActive || phoneActive || beachActive || wallActive) return;
  terminalActive = true;
  if (document.activeElement) document.activeElement.blur();
  ui.tooltip(null);
  px.clearHover();
  playPortalWhoosh();
  px.zoomTo(SCREEN_BOX.x + SCREEN_BOX.w / 2, SCREEN_BOX.y + SCREEN_BOX.h / 2, 0.76, 0.035);

  if (!terminalConsole) {
    terminalConsole = createTerminalConsole(document.body);
  }

  setTimeout(() => {
    terminalConsole.open(px.isNight(), () => closeTerminalConsole(false));
    if (!terminalHist) {
      terminalHist = true;
      try { history.pushState({ terminal: true }, ''); } catch (_) {}
    }
  }, 220);
}

function closeTerminalConsole(fromPop) {
  if (!terminalActive) return;
  terminalActive = false;
  playPortalWhoosh();
  if (terminalConsole) terminalConsole.close();
  px.zoomOut();
  if (terminalHist) {
    terminalHist = false;
    if (!fromPop) { try { history.back(); } catch (_) {} }
  }
}

// ── Illustrated "Education & Bookshelf" Modal Portal ────────────────────────
let educationPage = null;
let educationActive = false;
let educationHist = false;

function openEducationPage(fx, fy) {
  if (educationActive || terminalActive || projectsActive || aboutActive || phoneActive || beachActive || wallActive) return;
  educationActive = true;
  if (document.activeElement) document.activeElement.blur();
  ui.tooltip(null);
  px.clearHover();
  playPortalWhoosh();
  px.zoomTo(fx, fy, 0.74, 0.035);

  if (!educationPage) {
    educationPage = createEducationPage(document.body);
  }

  setTimeout(() => {
    educationPage.open(px.isNight(), () => closeEducationPage(false));
    if (!educationHist) {
      educationHist = true;
      try { history.pushState({ education: true }, ''); } catch (_) {}
    }
  }, 220);
}

function closeEducationPage(fromPop) {
  if (!educationActive) return;
  educationActive = false;
  playPortalWhoosh();
  if (educationPage) educationPage.close();
  px.zoomOut();
  if (educationHist) {
    educationHist = false;
    if (!fromPop) { try { history.back(); } catch (_) {} }
  }
}

// ── Illustrated "Tech Stack & Developer Toolkit" Modal Portal ───────────────
let techStackPage = null;
let techstackActive = false;
let techstackHist = false;

function openTechStackPage(fx, fy) {
  if (techstackActive || educationActive || terminalActive || projectsActive || aboutActive || phoneActive || beachActive || wallActive) return;
  techstackActive = true;
  if (document.activeElement) document.activeElement.blur();
  ui.tooltip(null);
  px.clearHover();
  playPortalWhoosh();
  px.zoomTo(fx, fy, 0.74, 0.035);

  if (!techStackPage) {
    techStackPage = createTechStackPage(document.body);
  }

  setTimeout(() => {
    techStackPage.open(px.isNight(), () => closeTechStackPage(false));
    if (!techstackHist) {
      techstackHist = true;
      try { history.pushState({ techstack: true }, ''); } catch (_) {}
    }
  }, 220);
}

function closeTechStackPage(fromPop) {
  if (!techstackActive) return;
  techstackActive = false;
  playPortalWhoosh();
  if (techStackPage) techStackPage.close();
  px.zoomOut();
  if (techstackHist) {
    techstackHist = false;
    if (!fromPop) { try { history.back(); } catch (_) {} }
  }
}

window.addEventListener('popstate', () => {
  if (beachActive) exitBeach(true);
  if (wallActive) closeStickyWall(true);
  if (phoneActive) closePhoneConsole(true);
  if (aboutActive) closeAboutPage(true);
  if (projectsActive) closeProjectsPage(true);
  if (terminalActive) closeTerminalConsole(true);
  if (educationActive) closeEducationPage(true);
  if (techstackActive) closeTechStackPage(true);
});
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    if (beachActive) exitBeach(false);
    if (wallActive) closeStickyWall(false);
    if (phoneActive) closePhoneConsole(false);
    if (aboutActive) closeAboutPage(false);
    if (projectsActive) closeProjectsPage(false);
    if (terminalActive) closeTerminalConsole(false);
    if (educationActive) closeEducationPage(false);
    if (techstackActive) closeTechStackPage(false);
  }
});

// ── Interactive Hotspots ────────────────────────────────────────────────────
const layer = document.getElementById('hotspots');
const spots = HOTSPOTS.map((h) => {
  const b = document.createElement('button');
  b.className = 'hotspot';
  b.type = 'button';
  b.dataset.section = h.section;
  b.setAttribute('aria-label', h.label);
  const fx = h.x + h.w / 2, fy = h.y + h.h / 2;

  b.addEventListener('click', (e) => {
    b.blur();
    if (EDIT) return;
    
    // Desk lamp toggle
    if (h.toggle === 'night') {
      px.loadNight();
      px.toggleNight();
      playLampClick();
      document.body.classList.toggle('night');
      return;
    }

    // Vintage Radio Music toggle
    if (h.toggle === 'music') {
      onFirstGesture();
      const muted = toggleMute();
      playKeyClick();
      ui.tooltip(muted ? 'Vintage Radio · Music Paused 🔇' : 'Vintage Radio · Music Playing 🎵', e.clientX, e.clientY);
      return;
    }

    // Illustrated Bookshelf -> Education & Knowledge Portal
    if (h.education || h.section === 'education') {
      openEducationPage(fx, fy);
      return;
    }

    // Developer Pegboard -> Tech Stack & Toolkit Portal
    if (h.techstack || h.section === 'techstack') {
      openTechStackPage(fx, fy);
      return;
    }

    // Illustrated Portrait Frame -> About Me Portal
    if (h.about || h.section === 'about') {
      openAboutPage(fx, fy);
      return;
    }

    // Illustrated Project Shelf -> Projects Portal
    if (h.projects) {
      openProjectsPage(fx, fy);
      return;
    }

    // CRT Monitor -> SubhamOS Dev Terminal
    if (h.terminal || h.section === 'terminal') {
      openTerminalConsole(fx, fy);
      return;
    }

    // Interactive Sticky Notes Wall
    if (h.wall) {
      openStickyWall(fx, fy);
      return;
    }

    // Retro Telephone Hotline Console
    if (h.phone) {
      openPhoneConsole(fx, fy);
      return;
    }

    // Window portal
    if (h.beach) {
      enterBeach(fx, fy);
      return;
    }

    // External link
    if (h.href) {
      playKeyClick();
      window.open(h.href, '_blank', 'noopener');
      return;
    }

    px.clearHover();
    ui.tooltip(null);

    // Standard Section Modal Drawer
    px.zoomTo(fx, fy);
    const side = isPhone()
      ? (e.clientY < window.innerHeight / 2 ? 'bottom' : 'top')
      : (e.clientX > window.innerWidth / 2 ? 'left' : 'right');
    ui.open(h.section, side);
  });

  const getTipLabel = () => {
    if (h.toggle === 'music') {
      return isAudioMuted() ? 'Vintage Radio · Click to Play Music 🎵' : 'Vintage Radio · Click to Pause Music 🔇';
    }
    if (h.toggle === 'night') {
      return 'Desk Lamp · Day / Night Switch 💡';
    }
    return h.label;
  };

  const hoverAt = (e) => {
    if (EDIT || ui.isOpen()) return;
    ui.tooltip(getTipLabel(), e.clientX, e.clientY);
    const r = px.coverRect();
    const u = (e.clientX - r.x) / r.w, v = 1 - (e.clientY - r.y) / r.h;
    px.setHover(u, v, h.x, 1 - h.y - h.h, h.x + h.w, 1 - h.y);
  };

  b.addEventListener('pointerenter', (e) => {
    hoverAt(e);
    if (!h.toggle) playHoverTick();
  });
  b.addEventListener('pointermove', hoverAt);
  b.addEventListener('pointerleave', () => { ui.tooltip(null); px.clearHover(); });
  layer.appendChild(b);
  return { h, b };
});

function layoutHotspots() {
  const r = px.coverRect();
  for (const { h, b } of spots) {
    b.style.left = (r.x + h.x * r.w) + 'px';
    b.style.top = (r.y + h.y * r.h) + 'px';
    b.style.width = (h.w * r.w) + 'px';
    b.style.height = (h.h * r.h) + 'px';
  }
  layoutCat();
}
window.addEventListener('resize', layoutHotspots);
layoutHotspots();

// ── Pointer & Parallax Movement ─────────────────────────────────────────────
window.addEventListener('pointermove', (e) => {
  const nx = (e.clientX / window.innerWidth) * 2 - 1;
  const ny = -((e.clientY / window.innerHeight) * 2 - 1);
  px.setPointer(nx, ny);
  if (beachActive && beach) beach.setPointer(nx, ny);
});

// ── Mobile Touch Panning with Inertia Flick ─────────────────────────────────
let touchPan = null;
let suppressClick = false;
let flickRaf = null;

window.addEventListener('touchstart', (e) => {
  if (flickRaf) { cancelAnimationFrame(flickRaf); flickRaf = null; }
  if (EDIT || ui.isOpen() || beachActive || !px.canPan() || e.touches.length !== 1) return;
  touchPan = {
    x0: e.touches[0].clientX,
    y0: e.touches[0].clientY,
    pan0: px.getPan(),
    moved: false,
    xLast: e.touches[0].clientX,
    tLast: performance.now(),
    vel: 0,
    wLast: px.getPan(),
  };
}, { passive: true });

window.addEventListener('touchmove', (e) => {
  if (!touchPan || e.touches.length !== 1) return;
  const x = e.touches[0].clientX;
  const dx = x - touchPan.x0;
  const dy = e.touches[0].clientY - touchPan.y0;
  if (!touchPan.moved && Math.hypot(dx, dy) < 8) return;
  touchPan.moved = true;
  const now = performance.now(), dt = now - touchPan.tLast;
  if (dt > 0) { touchPan.vel = (x - touchPan.xLast) / dt; touchPan.xLast = x; touchPan.tLast = now; }
  touchPan.wLast = touchPan.pan0 - dx * px.worldPerPx();
  px.setPan(touchPan.wLast, 1);
}, { passive: true });

window.addEventListener('touchend', () => {
  if (touchPan && touchPan.moved) {
    suppressClick = true;
    setTimeout(() => { suppressClick = false; }, 120);
    flick(touchPan.vel, touchPan.wLast);
  }
  touchPan = null;
});

function flick(velPx, from) {
  if (flickRaf) { cancelAnimationFrame(flickRaf); flickRaf = null; }
  let v = Math.max(-4, Math.min(4, velPx || 0));
  if (Math.abs(v) < 0.15) { px.setPan(from); return; }
  let wx = from, last = performance.now();
  const step = (now) => {
    const dt = Math.min(34, now - last); last = now;
    wx -= v * dt * px.worldPerPx();
    const lim = px.panMax();
    if (wx <= -lim || wx >= lim) { wx = Math.max(-lim, Math.min(lim, wx)); v = 0; }
    v *= Math.pow(0.995, dt);
    if (Math.abs(v) > 0.02 && !beachActive) {
      px.setPan(wx, 1);
      flickRaf = requestAnimationFrame(step);
    } else {
      px.setPan(wx, 1);
      flickRaf = null;
    }
  };
  flickRaf = requestAnimationFrame(step);
}

window.addEventListener('click', (e) => {
  if (suppressClick) { e.stopPropagation(); e.preventDefault(); }
}, true);

// ── Mobile Pan Hint Arrows ──────────────────────────────────────────────────
const makeArrow = (dir, glyph, label) => {
  const b = document.createElement('button');
  b.className = `pan-arrow pan-arrow-${dir}`;
  b.type = 'button';
  b.setAttribute('aria-label', label);
  b.textContent = glyph;
  b.addEventListener('click', () => {
    const step = px.worldPerPx() * window.innerWidth * 0.6;
    px.setPan(px.getPan() + (dir === 'left' ? -step : step));
  });
  document.body.appendChild(b);
  return b;
};
const panLeftArrow = makeArrow('left', '‹', 'Look left');
const panRightArrow = makeArrow('right', '›', 'Look right');

function anyModalOpen() {
  return beachActive || wallActive || phoneActive || aboutActive || projectsActive || terminalActive || educationActive || techstackActive || ui.isOpen() || EDIT;
}

function updatePanArrows() {
  const on = hasTouch() && !EDIT && !anyModalOpen() && px.canPan();
  const lim = px.panMax(), p = px.getPan(), eps = lim * 0.04 + 0.001;
  panLeftArrow.classList.toggle('show', on && p > -lim + eps);
  panRightArrow.classList.toggle('show', on && p < lim - eps);
}

// ── Gyroscope Tilt (Mobile) ─────────────────────────────────────────────────
window.addEventListener('deviceorientation', (e) => {
  if (e.gamma == null) return;
  const nx = Math.max(-1, Math.min(1, e.gamma / 35));
  const ny = Math.max(-1, Math.min(1, (e.beta - 45) / 35));
  px.setPointer(nx, ny);
  if (beachActive && beach) beach.setPointer(nx, ny);
}, true);

// ── In-Browser Calibration Mode (?edit) ─────────────────────────────────────
if (EDIT) {
  document.body.classList.add('edit');
  const read = document.createElement('div');
  read.id = 'editor-readout';
  read.textContent = 'CALIBRATION MODE: Drag a box to move, drag handles to resize. Release auto-copies array to clipboard.';
  document.body.appendChild(read);

  const HANDLES = ['nw', 'n', 'ne', 'e', 'se', 's', 'sw', 'w'];
  const clamp01 = (v) => Math.max(0, Math.min(1, v));
  const rectToImg = (cx, cy) => {
    const r = px.coverRect();
    return { x: (cx - r.x) / r.w, y: (cy - r.y) / r.h };
  };
  const dump = () => 'export const HOTSPOTS = [\n' + HOTSPOTS.map((h) =>
    `  { section: '${h.section}', id: ${h.id}, label: '${h.label}', ` +
    `x: ${h.x.toFixed(3)}, y: ${h.y.toFixed(3)}, w: ${h.w.toFixed(3)}, h: ${h.h.toFixed(3)}` +
    (h.toggle ? `, toggle: '${h.toggle}'` : '') +
    (h.beach ? `, beach: true` : '') +
    ` },`
  ).join('\n') + '\n];';

  for (const { b } of spots) {
    for (const dir of HANDLES) {
      const el = document.createElement('span');
      el.className = 'eh eh-' + dir;
      el.dataset.dir = dir;
      b.appendChild(el);
    }
  }

  let drag = null;
  const onMove = (e) => {
    if (!drag) return;
    const p = rectToImg(e.clientX, e.clientY), b0 = drag.box0, m = drag.mode;
    let x0 = b0.x, y0 = b0.y, x1 = b0.x + b0.w, y1 = b0.y + b0.h;
    if (m === 'move') {
      const dx = p.x - drag.start.x, dy = p.y - drag.start.y;
      x0 += dx; x1 += dx; y0 += dy; y1 += dy;
    } else {
      if (m.includes('w')) x0 = p.x;
      if (m.includes('e')) x1 = p.x;
      if (m.includes('n')) y0 = p.y;
      if (m.includes('s')) y1 = p.y;
    }
    const nx = clamp01(Math.min(x0, x1)), ny = clamp01(Math.min(y0, y1));
    const nw = Math.max(0.01, clamp01(Math.max(x0, x1)) - nx);
    const nh = Math.max(0.01, clamp01(Math.max(y0, y1)) - ny);
    Object.assign(drag.h, { x: nx, y: ny, w: nw, h: nh });
    layoutHotspots();
    read.textContent = `${drag.h.section}: x ${nx.toFixed(3)} y ${ny.toFixed(3)} w ${nw.toFixed(3)} h ${nh.toFixed(3)}`;
  };

  const onUp = () => {
    window.removeEventListener('pointermove', onMove);
    if (drag) {
      navigator.clipboard && navigator.clipboard.writeText(dump()).catch(() => {});
      read.textContent = `Copied updated HOTSPOTS to clipboard! Paste into src/hotspots.js`;
    }
    drag = null;
  };

  for (const spot of spots) {
    spot.b.addEventListener('pointerdown', (e) => {
      e.preventDefault(); e.stopPropagation();
      drag = {
        h: spot.h,
        mode: (e.target.dataset && e.target.dataset.dir) || 'move',
        start: rectToImg(e.clientX, e.clientY),
        box0: { x: spot.h.x, y: spot.h.y, w: spot.h.w, h: spot.h.h },
      };
      window.addEventListener('pointermove', onMove);
      window.addEventListener('pointerup', onUp, { once: true });
    });
  }
}

// ── Main Render Loop ────────────────────────────────────────────────────────
let t0 = null;
function tick(now) {
  requestAnimationFrame(tick);
  if (t0 === null) t0 = now;
  if (beachActive) return;
  const t = (now - t0) / 1000;
  px.render(t);

  layer.style.transform = `translateX(${px.panShiftPx()}px)`;
  layoutCat();
  layoutKeyboard();
  layoutPegboard();
  updatePanArrows();

  if (ui.isScreen() && SCREEN_BOX) {
    if (isPhone() || !screenFitsViewport()) {
      ui.placeScreen({ x: 0, y: 0, w: window.innerWidth, h: window.innerHeight });
    } else {
      const r = px.projectImageRect(SCREEN_BOX);
      const g = (SCREEN_SCALE - 1) / 2;
      r.x -= r.w * g;
      r.y -= r.h * g;
      r.w *= SCREEN_SCALE;
      r.h *= SCREEN_SCALE;
      ui.placeScreen(r);
    }
    if (px.zoomValue() > SCREEN_LIT_AT) ui.litScreen();
  }
}
requestAnimationFrame(tick);

px.onReady(() => {
  const elapsed = Date.now() - loadStartTime;
  const remaining = Math.max(0, MIN_LOADER_DURATION - elapsed);

  setTimeout(() => {
    layoutHotspots();
    ui.loadingDone(() => {
      const idle = window.requestIdleCallback || ((f) => setTimeout(f, 1500));
      idle(() => {
        px.loadNight();
        loadBeach();
      });
    });
  }, remaining);
});
