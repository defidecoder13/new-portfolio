// ──────────────────────────────────────────────────────────────────────────
// DEDICATED ILLUSTRATED "PROJECTS" MODAL (1:1 REPLICA OF USER DESIGN)
// ──────────────────────────────────────────────────────────────────────────

import { playKeyClick, playHoverTick, playPhoneBeep } from './audio.js';

const PROJECTS_DATA = [
  {
    num: '01',
    title: 'Medsathi — Offline Pharmacy Platform',
    subtitle: 'Real-life retail pharmacy management system',
    description: 'A production-grade pharmaceutical enterprise platform engineered for instant POS checkout, batch inventory tracking, barcode scanning, stock-expiry triggers, and offline PWA IndexedDB mutation queuing with automatic background sync resilience.',
    tags: ['POS CHECKOUT', 'BATCH TRACKING', 'BARCODE SCAN', 'OFFLINE PWA', 'INDEXEDDB', 'BACKGROUND SYNC', 'EXPIRY ALERTS'],
    image: '/assets/project-medsathi.webp',
    github: 'https://github.com/defidecoder13',
  },
  {
    num: '02',
    title: 'Studium — AI Academic Copilot & Assessment Engine',
    subtitle: 'Smart textbook & YouTube learning assistant',
    description: 'Developed an intelligent study platform supporting synchronized PDF textbook reading and interactive YouTube video transcripts. Built an AI tutor powered by Google Gemini to answer questions with page-level citations and automatically generate interactive exam quizzes.',
    tags: ['PDF READER', 'YOUTUBE TRANSCRIPTS', 'AI TUTOR', 'GEMINI API', 'CITATIONS', 'QUIZ GENERATOR', 'SMART LEARNING'],
    image: '/assets/project-studium.webp',
    github: 'https://github.com/defidecoder13',
  },
  {
    num: '03',
    title: 'UniRoomies — Student Accommodation Platform',
    subtitle: 'Student rental marketplace & vacancy manager',
    description: 'Built a fullstack web platform connecting students with affordable rental accommodations. Developed a comprehensive listing management system for posting, editing, and managing room vacancies with a seamless mobile-responsive interface for inquiries.',
    tags: ['LISTING MANAGEMENT', 'ROOM VACANCIES', 'INQUIRIES', 'STUDENT PLATFORM', 'FULLSTACK', 'MOBILE RESPONSIVE'],
    image: '/assets/project-uniroomies.webp',
    github: 'https://github.com/defidecoder13',
  },
  {
    num: '04',
    title: 'InterviewAI — AI Interview Platform',
    subtitle: 'Automated technical & behavioral evaluation engine',
    description: 'Integrated Google Gemini API to dynamically generate role-specific technical & behavioral interview questions based on real-time resume parsing. Developed an automated evaluation engine analyzing multi-turn transcripts, scoring responses, and synthesizing 10/10 STAR-framework rectified answers.',
    tags: ['GEMINI API', 'RESUME PARSER', 'MULTI-TURN', 'TRANSCRIPT SCORING', 'STAR 10/10', 'ANSWERS SYNTHESIS', 'AUTO EVALUATION'],
    image: '/assets/project-interviewai.webp',
    github: 'https://github.com/defidecoder13',
  },
];

export function createProjectsPage(container) {
  let root = document.getElementById('pixel-projects-modal');
  if (root) root.remove();

  root = document.createElement('div');
  root.id = 'pixel-projects-modal';
  root.className = 'projects-page-overlay';
  root.innerHTML = `
    <!-- Top-Right Close Button -->
    <button class="projects-close-btn" id="projects-close-btn" type="button" aria-label="Close Projects Modal">
      <span>✕</span>
    </button>

    <!-- Main Scrollable Illustrated Projects Card Container -->
    <div class="projects-card-container">
      <div class="projects-card" id="projects-card">
        
        <!-- Top Decorative Subheader -->
        <div class="projects-header-rule">
          <span class="projects-tag">03 — PROJECTS</span>
          <div class="projects-rule-line"></div>
          <span class="projects-rule-dot"></span>
        </div>

        <!-- Header Title & Philosophy Block -->
        <div class="projects-top-hero">
          <div class="projects-hero-left">
            <h1 class="projects-main-title">
              Things I’ve built<br>and shipped.<span class="projects-sparkle">彡</span>
            </h1>
          </div>
          <div class="projects-hero-right">
            <p class="projects-hero-sub">Real products. Real users.</p>
            <p class="projects-hero-desc">Purpose-built solutions solving real world problems.</p>
          </div>
        </div>

        <!-- Vertical Stack of Illustrated Project Cards -->
        <div class="projects-list">
          ${PROJECTS_DATA.map((p) => `
            <div class="project-item-card" data-id="${p.num}">
              
              <!-- Left Details Column -->
              <div class="project-info-col">
                <div class="project-title-row">
                  <span class="project-num-badge">${p.num}</span>
                  <h2 class="project-name">${p.title}</h2>
                </div>
                <div class="project-subtitle">${p.subtitle}</div>
                <p class="project-body-desc">${p.description}</p>
                <div class="project-tags-grid">
                  ${p.tags.map((tag) => `<span class="project-tag-pill">${tag}</span>`).join('')}
                </div>
              </div>

              <!-- Right Visual Mockup / Demo Column -->
              <div class="project-preview-col">
                <div class="project-img-frame">
                  <img src="${p.image}" alt="${p.title} Demo" class="project-mockup-img" draggable="false" loading="lazy" />
                </div>
              </div>

            </div>
          `).join('')}
        </div>

      </div>
    </div>
  `;
  document.body.appendChild(root);

  const closeBtn = root.querySelector('#projects-close-btn');
  const cardContainer = root.querySelector('.projects-card-container');

  // Sound triggers on hover
  root.querySelectorAll('.project-item-card').forEach((card) => {
    card.addEventListener('pointerenter', () => playHoverTick());
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
    if (e.target === root || e.target === cardContainer) {
      playKeyClick();
      if (onExitCallback) onExitCallback();
    }
  });

  return {
    open(isNight, onExit) {
      onExitCallback = onExit;
      root.classList.add('show');
      cardContainer.scrollTop = 0;
    },
    close,
    isOpen() {
      return root.classList.contains('show');
    },
  };
}
