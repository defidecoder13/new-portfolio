// ──────────────────────────────────────────────────────────────────────────
// UI & MODAL DRAWER CONTROLLER WITH TACTILE SOUNDS
// ──────────────────────────────────────────────────────────────────────────

import { SECTIONS } from './content.js';
import { enhanceCarousels, pauseCarousels } from './carousel.js';
import {
  playDrawerOpen,
  playDrawerClose,
  playCrtTurnOn,
  playCrtTurnOff,
  playKeyClick,
} from './audio.js';

const $ = (id) => document.getElementById(id);

export function createUI({ onClose } = {}) {
  const panel = $('panel');
  const backdrop = $('backdrop');
  const titleEl = $('panel-title');
  const tagEl = $('panel-tag');
  const bodyEl = $('panel-body');
  const closeBtn = $('panel-close');
  const tip = $('tooltip');
  const loading = $('loading');
  const hint = $('hint');

  // Dedicated "Screen Mode" on the computer monitor
  const dim = $('screen-dim');
  const screen = $('screen');
  const screenBody = $('screen-body');
  const screenClose = $('screen-close');

  let openKey = null;
  let openSide = null;
  let sideTimer = null;
  const PLACEMENTS = ['left', 'right', 'top', 'bottom'];
  const placePanel = (side) => {
    panel.classList.remove(...PLACEMENTS);
    panel.classList.add(side);
  };

  let screenKey = null;
  let screenActive = false;
  let screenTimer = null;

  // ── Back Button Handling (Mobile & Desktop) ───────────────────────────────
  const isPhone = () => window.matchMedia('(max-width: 520px)').matches;
  let historyPushed = false;
  let historyGuard = false;

  function pushOverlay() {
    if (isPhone() && !historyPushed) {
      historyPushed = true;
      try { history.pushState({ rmOverlay: true }, ''); } catch (_) {}
    }
  }

  function afterClose() {
    if (historyGuard) { historyPushed = false; return; }
    if (historyPushed) {
      historyPushed = false;
      try { history.back(); } catch (_) {}
    }
  }

  window.addEventListener('popstate', () => {
    if (historyPushed && (openKey || screenKey)) {
      historyGuard = true;
      if (screenKey) closeScreen();
      else close();
      historyGuard = false;
      historyPushed = false;
    }
  });

  // ── Side Drawer ──────────────────────────────────────────────────────────
  function applyContent(key) {
    const s = SECTIONS[key];
    if (!s) return;
    pauseCarousels(bodyEl);
    titleEl.textContent = s.title;
    tagEl.textContent = s.tagline || '';
    bodyEl.innerHTML = s.body;
    bodyEl.scrollTop = 0;
    enhanceCarousels(bodyEl);

    // Attach click audio to interactive elements inside the drawer
    bodyEl.querySelectorAll('a, button, .project-card, .social-card').forEach((el) => {
      el.addEventListener('click', () => playKeyClick());
    });
  }

  function reveal(side) {
    placePanel(side);
    panel.classList.add('open');
    backdrop.classList.add('show');
    panel.setAttribute('aria-hidden', 'false');
    if (hint) hint.classList.add('faded');
    playDrawerOpen();
  }

  function open(key, side) {
    if (!SECTIONS[key]) return;
    const switching = !!openKey && openSide !== side;
    openKey = key;
    openSide = side;
    pushOverlay();
    if (sideTimer) { clearTimeout(sideTimer); sideTimer = null; }

    if (switching) {
      panel.classList.remove('open');
      sideTimer = setTimeout(() => {
        applyContent(key);
        panel.style.transition = 'none';
        placePanel(side);
        void panel.offsetWidth;
        panel.style.transition = '';
        reveal(side);
        sideTimer = null;
      }, 460);
    } else {
      applyContent(key);
      const current = PLACEMENTS.find((p) => panel.classList.contains(p));
      if (current && current !== side) {
        panel.style.transition = 'none';
        placePanel(side);
        void panel.offsetWidth;
        panel.style.transition = '';
      }
      reveal(side);
    }
  }

  function close() {
    if (!openKey) return;
    openKey = null;
    openSide = null;
    if (sideTimer) { clearTimeout(sideTimer); sideTimer = null; }
    pauseCarousels(bodyEl);
    panel.classList.remove('open');
    backdrop.classList.remove('show');
    panel.setAttribute('aria-hidden', 'true');
    playDrawerClose();
    onClose && onClose();
    afterClose();
  }

  // ── Computer Screen Mode ──────────────────────────────────────────────────
  function openScreen(key) {
    if (!SECTIONS[key] || !screen) return;
    screenKey = key;
    screenActive = true;
    pushOverlay();
    if (screenTimer) { clearTimeout(screenTimer); screenTimer = null; }
    const s = SECTIONS[key];
    pauseCarousels(screenBody);
    screenBody.innerHTML =
      `<p class="screen-tag">${s.tagline || ''}</p>` +
      `<h2 class="screen-title">${s.title}</h2>` + s.body;
    screenBody.scrollTop = 0;

    // Attach click audio to screen interactive elements
    screenBody.querySelectorAll('a, button, .project-card').forEach((el) => {
      el.addEventListener('click', () => playKeyClick());
    });

    document.body.classList.add('screen-mode');
    screen.setAttribute('aria-hidden', 'false');
    screen.classList.remove('lit');
    screen.classList.add('open');
    if (hint) hint.classList.add('faded');
    playCrtTurnOn();
  }

  function litScreen() {
    if (screenActive && screen && !screen.classList.contains('lit')) {
      screen.classList.add('lit');
      enhanceCarousels(screenBody);
    }
  }

  function closeScreen() {
    if (!screenKey) return;
    screenKey = null;
    pauseCarousels(screenBody);
    screen.classList.remove('open');
    screen.classList.remove('lit');
    document.body.classList.remove('screen-mode');
    screen.setAttribute('aria-hidden', 'true');
    playCrtTurnOff();
    if (screenTimer) clearTimeout(screenTimer);
    screenTimer = setTimeout(() => { screenActive = false; screenTimer = null; }, 520);
    onClose && onClose();
    afterClose();
  }

  function placeScreen(r) {
    if (!screen) return;
    screen.style.left = r.x + 'px';
    screen.style.top = r.y + 'px';
    screen.style.width = r.w + 'px';
    screen.style.height = r.h + 'px';
  }

  const isScreen = () => screenActive;
  const closeAny = () => { if (screenKey) closeScreen(); else close(); };

  document.addEventListener('click', (e) => {
    const el = e.target.closest && e.target.closest('.email-link');
    if (el) {
      e.preventDefault();
      location.href = `mailto:${el.dataset.u}@${el.dataset.d}`;
    }
  });

  closeBtn.addEventListener('click', close);
  backdrop.addEventListener('click', close);
  if (screenClose) screenClose.addEventListener('click', closeScreen);
  if (dim) dim.addEventListener('click', closeScreen);
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeAny(); });

  function tooltip(label, x, y) {
    if (!label) { tip.classList.remove('show'); return; }
    tip.textContent = label;
    tip.style.transform = `translate(${x + 14}px, ${y + 14}px)`;
    tip.classList.add('show');
  }

  const progressBar = $('loader-progress-bar');
  const percentLabel = $('loader-percent');
  const statusLabel = $('loader-status');

  let currentPercent = 0;

  function updateProgress(targetPercent, message) {
    if (!loading || loading.classList.contains('hide')) return;
    currentPercent = Math.min(100, Math.max(currentPercent, targetPercent));
    if (progressBar) progressBar.style.width = `${currentPercent}%`;
    if (percentLabel) percentLabel.textContent = `${Math.round(currentPercent)}%`;
    if (message && statusLabel) statusLabel.textContent = message;
  }

  function loadingDone(onComplete) {
    updateProgress(100, 'Studio Ready! Welcome.');
    setTimeout(() => {
      loading.classList.add('hide');
      if (hint) {
        const isTouch = navigator.maxTouchPoints > 0 || 'ontouchstart' in window;
        hint.textContent = isTouch ? 'Tap around the room or swipe to explore 👆' : 'Click around the room to explore';
        hint.classList.add('show');
        setTimeout(() => hint.classList.add('faded'), 7000);
      }
      if (onComplete) onComplete();
    }, 450);
  }

  return {
    open,
    close,
    openScreen,
    closeScreen,
    placeScreen,
    isScreen,
    litScreen,
    tooltip,
    updateProgress,
    loadingDone,
    isOpen: () => !!openKey || !!screenKey,
    currentKey: () => openKey,
  };
}

export function showFallback(reason) {
  const wrap = document.createElement('div');
  wrap.className = 'fallback';
  const items = Object.values(SECTIONS).map(
    (s) => `<section><h2>${s.title}</h2>${s.body}</section>`
  ).join('');
  wrap.innerHTML = `
    <div class="fallback-inner">
      <h1>Interactive 3D Portfolio</h1>
      <p class="muted">Your browser could not initialize the 3D room${reason ? ` (${reason})` : ''}, so here is the complete portfolio as plain text.</p>
      ${items}
    </div>`;
  document.body.appendChild(wrap);
  const loading = document.getElementById('loading');
  if (loading) loading.classList.add('hide');
}
