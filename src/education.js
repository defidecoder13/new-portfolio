// ──────────────────────────────────────────────────────────────────────────
// DEDICATED ILLUSTRATED "EXPERIENCE & EDUCATION" MODAL
// ──────────────────────────────────────────────────────────────────────────

import { playKeyClick, playHoverTick, playPhoneBeep } from './audio.js';

const EXPERIENCE_DATA = [
  {
    role: 'Freelance Full-Stack Developer',
    company: 'MedSathi Pharmacy',
    badge: 'Live Production Application',
    timeline: 'Production Deployed',
    bullets: [
      'Built and deployed a full-stack pharmacy management system supporting real-world business operations.',
      'Developed billing, inventory tracking, and automated reporting workflows.',
      'Gathered client requirements and improved system usability through iterative product updates.',
    ],
    tags: ['FULL-STACK', 'PRODUCTION DEPLOYMENT', 'BILLING & POS', 'INVENTORY TRACKING', 'CLIENT REQUIREMENTS'],
  },
  {
    role: 'Node.js Development Intern',
    company: 'WebGuru Infosystems',
    badge: 'Professional Internship',
    timeline: 'Nov 2024 — Jan 2025',
    bullets: [
      'Completed a three-month internship focused on Node.js and MongoDB development.',
      'Engineered scalable RESTful API endpoints, backend route handlers, and database aggregation pipelines.',
    ],
    tags: ['NODE.JS', 'MONGODB', 'REST APIS', 'BACKEND ARCHITECTURE', 'EXPRESS.JS'],
  },
];

const EDUCATION_DATA = [
  {
    badge: 'MCA',
    degree: 'Master of Computer Application',
    institution: 'Brainware University',
    timeline: '2023 — 2025',
    grade: 'GPA: 8.42 / 10.0',
    gradeType: 'Star Achievement',
    desc: 'Deep-dive into scalable distributed backend systems, cloud microservices architecture, advanced database engineering, and applied Artificial Intelligence.',
  },
  {
    badge: 'BCA',
    degree: 'Bachelor of Computer Application',
    institution: 'Brainware University',
    timeline: '2020 — 2023',
    grade: 'GPA: 9.11 / 10.0',
    gradeType: 'Highest Academic Distinction 🏆',
    desc: 'Comprehensive foundation in computer science theory, algorithmic problem solving, core software engineering principles, and full-stack web technologies.',
  },
];

const CERTIFICATIONS_DATA = [
  {
    icon: '⚡',
    title: 'Full Stack Development · Node.js & Scalable APIs',
    issuer: 'Professional Developer Credential',
    year: '2024',
    desc: 'Advanced asynchronous event-loop patterns, REST & GraphQL API engineering, microservices, and database transaction caching.',
  },
  {
    icon: '🤖',
    title: 'Prompt Engineering & Generative AI for Developers',
    issuer: 'Deep Learning & AI Certification',
    year: '2024',
    desc: 'Applied LLM integration, structured JSON outputs, RAG citation architectures, multi-turn conversational agents, and evaluation workflows.',
  },
];

export function createEducationPage(container) {
  let root = document.getElementById('pixel-education-modal');
  if (root) root.remove();

  root = document.createElement('div');
  root.id = 'pixel-education-modal';
  root.className = 'education-page-overlay';
  root.innerHTML = `
    <!-- Top-Right Close Button -->
    <button class="education-close-btn" id="education-close-btn" type="button" aria-label="Close Modal">
      <span>✕</span>
    </button>

    <!-- Main Scrollable Illustrated Card Container -->
    <div class="education-card-container">
      <div class="education-card" id="education-card">
        
        <!-- Top Decorative Subheader -->
        <div class="education-header-rule">
          <span class="education-tag">02 — EXPERIENCE & EDUCATION</span>
          <div class="education-rule-line"></div>
          <span class="education-rule-dot"></span>
        </div>

        <!-- Header Title & Philosophy Block -->
        <div class="education-top-hero">
          <div class="education-hero-left">
            <h1 class="education-main-title">
              Experience &<br>academic roots.<span class="education-sparkle">彡</span>
            </h1>
          </div>
          <div class="education-hero-right">
            <p class="education-hero-sub">Production systems & solid fundamentals.</p>
            <p class="education-hero-desc">From client-facing fullstack platforms to rigorous distributed systems theory.</p>
          </div>
        </div>

        <!-- ══════════════════════════════════════════════════════════════════
             SECTION 1: WORK EXPERIENCE (TOP)
             ══════════════════════════════════════════════════════════════════ -->
        <div class="edu-section-block">
          <div class="edu-subhead-row">
            <span class="edu-subhead-title">💼 WORK EXPERIENCE</span>
            <span class="edu-subhead-line"></span>
          </div>

          <div class="exp-cards-list">
            ${EXPERIENCE_DATA.map((exp) => `
              <div class="exp-item-card">
                <div class="exp-header-row">
                  <div class="exp-title-group">
                    <h2 class="exp-role-title">${exp.role}</h2>
                    <div class="exp-company-row">
                      <span class="exp-company-name">${exp.company}</span>
                      <span class="exp-badge-pill">${exp.badge}</span>
                    </div>
                  </div>
                  <span class="exp-timeline-badge">${exp.timeline}</span>
                </div>

                <ul class="exp-bullets-list">
                  ${exp.bullets.map((b) => `<li>${b}</li>`).join('')}
                </ul>

                <div class="exp-tags-grid">
                  ${exp.tags.map((t) => `<span class="exp-tag-pill">${t}</span>`).join('')}
                </div>
              </div>
            `).join('')}
          </div>
        </div>

        <!-- ══════════════════════════════════════════════════════════════════
             SECTION 2: FORMAL EDUCATION & DEGREES (MIDDLE)
             ══════════════════════════════════════════════════════════════════ -->
        <div class="edu-section-block">
          <div class="edu-subhead-row">
            <span class="edu-subhead-title">🎓 FORMAL EDUCATION & DEGREES</span>
            <span class="edu-subhead-line"></span>
          </div>

          <div class="edu-degrees-list">
            ${EDUCATION_DATA.map((d) => `
              <div class="edu-item-card">
                <div class="edu-item-header">
                  <div class="edu-badge-box">
                    <span class="edu-badge-code">${d.badge}</span>
                  </div>
                  <div class="edu-title-group">
                    <div class="edu-degree-row">
                      <h2 class="edu-degree-name">${d.degree}</h2>
                      <span class="edu-timeline">${d.timeline}</span>
                    </div>
                    <div class="edu-institution-row">
                      <span class="edu-inst-name">${d.institution}</span>
                      <span class="edu-grade-pill ${d.badge === 'BCA' ? 'gold-award' : ''}">${d.grade}</span>
                    </div>
                  </div>
                </div>

                <p class="edu-item-desc" style="margin-bottom: 0;">${d.desc}</p>
              </div>
            `).join('')}
          </div>
        </div>

        <!-- ══════════════════════════════════════════════════════════════════
             SECTION 3: PROFESSIONAL CERTIFICATIONS (BOTTOM)
             ══════════════════════════════════════════════════════════════════ -->
        <div class="edu-section-block">
          <div class="edu-subhead-row">
            <span class="edu-subhead-title">📜 CERTIFICATIONS & SPECIALIZATIONS</span>
            <span class="edu-subhead-line"></span>
          </div>

          <div class="edu-certs-grid">
            ${CERTIFICATIONS_DATA.map((c) => `
              <div class="cert-item-card">
                <div class="cert-top-row">
                  <span class="cert-icon">${c.icon}</span>
                  <span class="cert-year">${c.year}</span>
                </div>
                <h3 class="cert-title">${c.title}</h3>
                <div class="cert-issuer">${c.issuer}</div>
                <p class="cert-desc">${c.desc}</p>
              </div>
            `).join('')}
          </div>
        </div>

      </div>
    </div>
  `;
  document.body.appendChild(root);

  const closeBtn = root.querySelector('#education-close-btn');
  const cardContainer = root.querySelector('.education-card-container');

  // Hover Audio on interactive cards
  root.querySelectorAll('.exp-item-card, .edu-item-card, .cert-item-card').forEach((el) => {
    el.addEventListener('pointerenter', () => playHoverTick());
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

  cardContainer.addEventListener('click', (e) => {
    if (e.target === cardContainer) {
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
