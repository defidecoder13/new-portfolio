// ──────────────────────────────────────────────────────────────────────────
// DEDICATED ILLUSTRATED "TECH STACK & TOOLKIT" MODAL
// ──────────────────────────────────────────────────────────────────────────

import { playKeyClick, playHoverTick, playPhoneBeep } from './audio.js';

const TECH_CATEGORIES = [
  {
    category: 'AI & Machine Learning',
    icon: '🧠',
    skills: [
      { name: 'Google Gemini API', level: 'Production', tag: 'Core AI' },
      { name: 'OpenAI SDK', level: 'Advanced', tag: 'LLM' },
      { name: 'RAG Architectures', level: 'Advanced', tag: 'Retrieval' },
      { name: 'Vector Embeddings', level: 'Proficient', tag: 'Semantic' },
      { name: 'Prompt Engineering', level: 'Expert', tag: 'System Prompts' },
      { name: 'Web Speech & Audio', level: 'Proficient', tag: 'Voice AI' },
    ],
  },
  {
    category: 'Frontend & Creative Web',
    icon: '💻',
    skills: [
      { name: 'React', level: 'Expert', tag: 'Framework' },
      { name: 'Next.js', level: 'Advanced', tag: 'SSR / Full-Stack' },
      { name: 'TypeScript', level: 'Advanced', tag: 'Type-Safe' },
      { name: 'JavaScript (ESNext)', level: 'Expert', tag: 'Core' },
      { name: 'Three.js / WebGL', level: 'Advanced', tag: '3D / Shaders' },
      { name: 'Tailwind CSS', level: 'Expert', tag: 'UI Styling' },
      { name: 'GSAP Animations', level: 'Proficient', tag: 'Motion' },
      { name: 'HTML5 Canvas', level: 'Proficient', tag: '2D / Pixels' },
    ],
  },
  {
    category: 'Backend & Distributed Systems',
    icon: '⚙️',
    skills: [
      { name: 'Node.js', level: 'Expert', tag: 'Runtime' },
      { name: 'Express / Fastify', level: 'Expert', tag: 'REST APIs' },
      { name: 'Python', level: 'Advanced', tag: 'Scripting / AI' },
      { name: 'WebSockets', level: 'Proficient', tag: 'Real-Time' },
      { name: 'Serverless Functions', level: 'Advanced', tag: 'Vercel / Cloud' },
      { name: 'REST & GraphQL', level: 'Advanced', tag: 'API Design' },
    ],
  },
  {
    category: 'Databases & Storage',
    icon: '🗄️',
    skills: [
      { name: 'MongoDB Atlas', level: 'Expert', tag: 'NoSQL Cloud' },
      { name: 'PostgreSQL', level: 'Advanced', tag: 'Relational SQL' },
      { name: 'Redis', level: 'Proficient', tag: 'Caching / Queues' },
      { name: 'Prisma ORM', level: 'Advanced', tag: 'Schema / Queries' },
      { name: 'IndexedDB', level: 'Advanced', tag: 'Offline PWA' },
    ],
  },
  {
    category: 'DevOps, Cloud & Tooling',
    icon: '🛠️',
    skills: [
      { name: 'Git & GitHub Actions', level: 'Expert', tag: 'CI / CD' },
      { name: 'Docker', level: 'Proficient', tag: 'Containers' },
      { name: 'Vercel Deployment', level: 'Expert', tag: 'Hosting / Edge' },
      { name: 'Linux / Bash', level: 'Advanced', tag: 'Dev Environment' },
      { name: 'Postman & Testing', level: 'Advanced', tag: 'API Quality' },
      { name: 'Vite / Webpack', level: 'Expert', tag: 'Build Tools' },
    ],
  },
];

export function createTechStackPage(container) {
  let root = document.getElementById('pixel-techstack-modal');
  if (root) root.remove();

  root = document.createElement('div');
  root.id = 'pixel-techstack-modal';
  root.className = 'techstack-page-overlay';
  root.innerHTML = `
    <!-- Top-Right Close Button -->
    <button class="techstack-close-btn" id="techstack-close-btn" type="button" aria-label="Close Tech Stack Modal">
      <span>✕</span>
    </button>

    <!-- Main Illustrated Tech Stack Card Container -->
    <div class="techstack-card" id="techstack-card">
      
      <!-- Top Decorative Subheader -->
      <div class="techstack-header-rule">
        <span class="techstack-tag">04 — DEVELOPER TOOLKIT</span>
        <div class="techstack-rule-line"></div>
        <span class="techstack-rule-dot"></span>
      </div>

      <!-- Main Header -->
      <div class="techstack-header-wrap">
        <div class="techstack-header-left">
          <h1 class="techstack-main-title">Tech Stack & Engineering Skills</h1>
          <p class="techstack-main-sub">Core languages, frameworks, AI models, and infrastructure tools I use to build scalable products.</p>
        </div>
        <div class="techstack-stats-pill">
          <span class="stats-count">25+</span>
          <span class="stats-label">ACTIVE TECHNOLOGIES</span>
        </div>
      </div>

      <!-- Tech Categories Grid -->
      <div class="techstack-categories-grid">
        ${TECH_CATEGORIES.map((cat) => `
          <div class="tech-category-card">
            <div class="tech-cat-header">
              <span class="tech-cat-icon">${cat.icon}</span>
              <h3 class="tech-cat-title">${cat.category}</h3>
            </div>
            <div class="tech-skills-chips">
              ${cat.skills.map((s) => `
                <div class="tech-skill-pill">
                  <span class="skill-name">${s.name}</span>
                  <span class="skill-tag">${s.tag}</span>
                </div>
              `).join('')}
            </div>
          </div>
        `).join('')}
      </div>

      <!-- Bottom Tech Philosophy Note -->
      <div class="techstack-footer-card">
        <div class="footer-icon">⚡</div>
        <div class="footer-text">
          <h4>Philosophy: Right Tool for the Right Problem</h4>
          <p>Always prioritizing high performance, clean modular architecture, accessible UX, and reliable production durability over hype.</p>
        </div>
      </div>

    </div>
  `;

  container.appendChild(root);

  let isOpen = false;
  let closeCallback = null;

  function open(isNight, onClose) {
    if (isOpen) return;
    isOpen = true;
    closeCallback = onClose;

    root.classList.toggle('night-mode', isNight);
    root.classList.add('show');
    document.body.style.overflow = 'hidden';
    playPhoneBeep();
  }

  function close() {
    if (!isOpen) return;
    isOpen = false;
    root.classList.remove('show');
    document.body.style.overflow = '';
    playKeyClick();
    if (closeCallback) {
      const cb = closeCallback;
      closeCallback = null;
      cb();
    }
  }

  // Event Listeners
  const closeBtn = root.querySelector('#techstack-close-btn');
  closeBtn.addEventListener('click', close);

  // Click outside to close
  root.addEventListener('click', (e) => {
    if (e.target === root) close();
  });

  // Attach audio clicks on skill pills
  root.querySelectorAll('.tech-skill-pill').forEach((pill) => {
    pill.addEventListener('pointerenter', () => playHoverTick());
    pill.addEventListener('click', () => playKeyClick());
  });

  return {
    open,
    close,
    isOpen: () => isOpen,
  };
}
