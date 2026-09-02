// ──────────────────────────────────────────────────────────────────────────
// DEDICATED ILLUSTRATED "ABOUT ME" MODAL (1:1 REPLICA OF USER DESIGN)
// ──────────────────────────────────────────────────────────────────────────

import { playKeyClick, playHoverTick, playPhoneBeep } from './audio.js';

export function createAboutPage(container) {
  let root = document.getElementById('pixel-about-modal');
  if (root) root.remove();

  root = document.createElement('div');
  root.id = 'pixel-about-modal';
  root.className = 'about-page-overlay';
  root.innerHTML = `
    <!-- Top-Right Close Button -->
    <button class="about-close-btn" id="about-close-btn" type="button" aria-label="Close About Modal">
      <span>✕</span>
    </button>

    <!-- Main Illustrated About Card Container -->
    <div class="about-card" id="about-card">
      
      <!-- Top Decorative Subheader -->
      <div class="about-header-rule">
        <span class="about-tag">01 — ABOUT</span>
        <div class="about-rule-line"></div>
        <span class="about-rule-dot"></span>
      </div>

      <!-- Main Two-Column Content Layout -->
      <div class="about-grid">
        
        <!-- Left Column: Framed Portrait & Identity Info -->
        <div class="about-left-col">
          <div class="about-portrait-wrap">
            <img src="/assets/subham-portrait.webp" alt="Subham Santra Portrait" class="about-portrait-img" draggable="false" />
          </div>

          <div class="about-identity">
            <div class="about-salutation">Hi, I'm</div>
            <h2 class="about-name">Subham Santra</h2>
            <div class="about-role-badge">
              <span class="badge-dot">•</span> FULL STACK DEVELOPER <span class="badge-dot">•</span>
            </div>
            <div class="about-location">
              <svg class="loc-icon" viewBox="0 0 24 24" width="14" height="14" fill="currentColor">
                <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
              </svg>
              <span>Kolkata, India</span>
            </div>
          </div>
        </div>

        <!-- Vertical Dotted Divider -->
        <div class="about-col-divider"></div>

        <!-- Right Column: Philosophy & Bio -->
        <div class="about-right-col">
          <h1 class="about-title">
            Building at the edge of engineering and craft.<span class="about-sparkle">彡</span>
          </h1>

          <p class="about-p">
            I build full stack digital experiences that combine scalable engineering with refined visual design. My work focuses on frontend architecture, backend systems, motion-driven interfaces, and building products that feel immersive, fast, and deeply intentional.
          </p>

          <div class="about-p-divider"></div>

          <p class="about-p">
            I care about the things that are hard to quantify — the feeling of a transition, the weight of a typeface, the moment an interface becomes invisible. Good engineering makes that possible.
          </p>

          <div class="about-actions">
            <a href="/assets/Subham_Santra_Resume.pdf" target="_blank" rel="noopener" class="about-resume-btn" id="about-resume-btn" aria-label="Open Subham's Resume in default browser PDF viewer">
              <span>Resume</span>
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M3.5 1.5h7v7M10.5 1.5l-9 9"/>
              </svg>
            </a>
          </div>
        </div>

      </div>

    </div>
  `;
  document.body.appendChild(root);

  const closeBtn = root.querySelector('#about-close-btn');
  const card = root.querySelector('#about-card');
  const resumeBtn = root.querySelector('#about-resume-btn');
  const portraitWrap = root.querySelector('.about-portrait-wrap');

  portraitWrap.addEventListener('pointerenter', () => playHoverTick());
  resumeBtn.addEventListener('pointerenter', () => playHoverTick());
  
  resumeBtn.addEventListener('click', () => {
    playPhoneBeep(770, 1336);
    playKeyClick();
  });

  let onExitCallback = null;

  function close() {
    root.classList.remove('show');
    if (document.activeElement) document.activeElement.blur();
  }

  closeBtn.addEventListener('click', () => {
    playKeyClick();
    if (onExitCallback) onExitCallback();
  });

  root.addEventListener('click', (e) => {
    if (e.target === root) {
      playKeyClick();
      if (onExitCallback) onExitCallback();
    }
  });

  return {
    open(isNight, onExit) {
      onExitCallback = onExit;
      root.classList.add('show');
    },
    close,
    isOpen() {
      return root.classList.contains('show');
    },
  };
}
