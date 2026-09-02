// ──────────────────────────────────────────────────────────────────────────
// WELCOME GUIDE & STUDIO DIRECTORY MODAL POPUP
// ──────────────────────────────────────────────────────────────────────────

import { playKeyClick, playHoverTick, playPortalWhoosh } from './audio.js';

export function createWelcomeModal(container, { onNavigate } = {}) {
  let root = document.getElementById('welcome-guide-modal');
  if (root) root.remove();

  root = document.createElement('div');
  root.id = 'welcome-guide-modal';
  root.className = 'welcome-guide-overlay';
  root.innerHTML = `
    <!-- Modal Card -->
    <div class="welcome-guide-card" id="welcome-guide-card">
      
      <!-- Close Button -->
      <button class="welcome-close-btn" id="welcome-close-btn" type="button" aria-label="Close Directory">
        <span>✕</span>
      </button>

      <!-- Header Section -->
      <div class="welcome-guide-header">
        <div class="welcome-avatar-wrap">
          <img src="/assets/subham-portrait.webp" alt="Subham Santra" class="welcome-avatar-img" />
          <span class="welcome-live-dot" title="Live in Studio"></span>
        </div>
        <div class="welcome-header-text">
          <span class="welcome-badge">✦ QUICK DIRECTORY</span>
          <h2 class="welcome-title">Welcome to Subham's Studio! 👋</h2>
          <p class="welcome-desc">Full-Stack Developer & AI Engineer. Select a destination below or click around the room to explore.</p>
        </div>
      </div>

      <!-- Quick Nav Grid -->
      <div class="welcome-grid">
        
        <!-- 01. Projects -->
        <button class="welcome-nav-card" data-section="projects" type="button">
          <div class="welcome-card-icon icon-projects">💼</div>
          <div class="welcome-card-content">
            <div class="welcome-card-title">
              <span>Featured Projects</span>
              <span class="welcome-arrow">→</span>
            </div>
            <p class="welcome-card-desc">Medsathi, Studium AI, InterviewAI & UniRoomies</p>
          </div>
        </button>

        <!-- 02. About Me -->
        <button class="welcome-nav-card" data-section="about" type="button">
          <div class="welcome-card-icon icon-about">👤</div>
          <div class="welcome-card-content">
            <div class="welcome-card-title">
              <span>About & Skills</span>
              <span class="welcome-arrow">→</span>
            </div>
            <p class="welcome-card-desc">Background, AI tech stack & philosophy</p>
          </div>
        </button>

        <!-- 03. Education -->
        <button class="welcome-nav-card" data-section="education" type="button">
          <div class="welcome-card-icon icon-education">🎓</div>
          <div class="welcome-card-content">
            <div class="welcome-card-title">
              <span>Education & Bookshelf</span>
              <span class="welcome-arrow">→</span>
            </div>
            <p class="welcome-card-desc">Master of Computer Application (MCA) & BCA</p>
          </div>
        </button>

        <!-- 04. Dev Terminal -->
        <button class="welcome-nav-card" data-section="terminal" type="button">
          <div class="welcome-card-icon icon-terminal">💻</div>
          <div class="welcome-card-content">
            <div class="welcome-card-title">
              <span>SubhamOS Terminal</span>
              <span class="welcome-arrow">→</span>
            </div>
            <p class="welcome-card-desc">Interactive CRT monitor developer CLI</p>
          </div>
        </button>

        <!-- 05. Guestbook -->
        <button class="welcome-nav-card" data-section="wall" type="button">
          <div class="welcome-card-icon icon-wall">📌</div>
          <div class="welcome-card-content">
            <div class="welcome-card-title">
              <span>Leave a Note</span>
              <span class="welcome-arrow">→</span>
            </div>
            <p class="welcome-card-desc">Live MongoDB Atlas collaborative guestbook</p>
          </div>
        </button>

        <!-- 06. Contact -->
        <button class="welcome-nav-card" data-section="phone" type="button">
          <div class="welcome-card-icon icon-phone">☎️</div>
          <div class="welcome-card-content">
            <div class="welcome-card-title">
              <span>Contact Hotline</span>
              <span class="welcome-arrow">→</span>
            </div>
            <p class="welcome-card-desc">Direct line, email, GitHub & socials</p>
          </div>
        </button>

      </div>

      <!-- Footer Action -->
      <div class="welcome-guide-footer">
        <button class="welcome-explore-btn" id="welcome-explore-btn" type="button">
          <span>✨ Explore Room Freely</span>
        </button>
        <span class="welcome-hint-text">Press [Esc] or click outside to dismiss</span>
      </div>

    </div>
  `;

  container.appendChild(root);

  // Trigger floating pill directory button
  let directoryPill = document.getElementById('studio-directory-btn');
  if (!directoryPill) {
    directoryPill = document.createElement('button');
    directoryPill.id = 'studio-directory-btn';
    directoryPill.className = 'studio-directory-pill';
    directoryPill.setAttribute('aria-label', 'Open Studio Directory');
    directoryPill.innerHTML = `
      <span class="pill-icon">🧭</span>
      <span class="pill-label">DIRECTORY</span>
    `;
    directoryPill.addEventListener('click', () => {
      open();
    });
    container.appendChild(directoryPill);
  }

  let isOpen = false;
  let closeCallback = null;

  function open(onClose) {
    if (isOpen) return;
    isOpen = true;
    closeCallback = onClose;
    root.classList.add('show');
    if (directoryPill) directoryPill.classList.add('active');
    playPortalWhoosh();
  }

  function close() {
    if (!isOpen) return;
    isOpen = false;
    root.classList.remove('show');
    if (directoryPill) directoryPill.classList.remove('active');
    playKeyClick();
    if (closeCallback) {
      const cb = closeCallback;
      closeCallback = null;
      cb();
    }
  }

  // Event Listeners
  const closeBtn = root.querySelector('#welcome-close-btn');
  const exploreBtn = root.querySelector('#welcome-explore-btn');

  closeBtn.addEventListener('click', close);
  exploreBtn.addEventListener('click', close);

  // Click outside on backdrop
  root.addEventListener('click', (e) => {
    if (e.target === root) close();
  });

  // Section card clicks
  root.querySelectorAll('.welcome-nav-card').forEach((btn) => {
    btn.addEventListener('pointerenter', () => playHoverTick());
    btn.addEventListener('click', () => {
      const section = btn.dataset.section;
      close();
      if (onNavigate) {
        setTimeout(() => onNavigate(section), 120);
      }
    });
  });

  return {
    open,
    close,
    isOpen: () => isOpen,
  };
}
