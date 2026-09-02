// ──────────────────────────────────────────────────────────────────────────
// AUTHENTIC MACOS DEV TERMINAL (SUBHAM-OS / ZSH)
// ──────────────────────────────────────────────────────────────────────────

import {
  playTerminalKey,
  playTerminalBeep,
  playKeyClick,
  playCatMeow,
  toggleMute,
} from './audio.js';

export function createTerminalConsole(container) {
  let root = document.getElementById('pixel-terminal-modal');
  if (root) root.remove();

  root = document.createElement('div');
  root.id = 'pixel-terminal-modal';
  root.className = 'macos-terminal-overlay';
  root.innerHTML = `
    <!-- macOS Terminal Window -->
    <div class="macos-window" id="macos-window">
      
      <!-- macOS Titlebar -->
      <div class="macos-titlebar">
        <div class="macos-traffic-lights">
          <button class="traffic-light btn-close" id="macos-btn-close" type="button" aria-label="Close Terminal"></button>
          <button class="traffic-light btn-minimize" id="macos-btn-theme" type="button" aria-label="Cycle Theme"></button>
          <button class="traffic-light btn-maximize" id="macos-btn-matrix" type="button" aria-label="Matrix Mode"></button>
        </div>
        <div class="macos-window-title">
          <span class="title-icon">📁</span>
          <span class="title-text">subham — zsh — 80×24</span>
        </div>
        <div class="macos-titlebar-right"></div>
      </div>

      <!-- Terminal Body -->
      <div class="macos-terminal-body" id="macos-terminal-body">
        
        <!-- Output History -->
        <div class="terminal-output" id="terminal-output"></div>

        <!-- Active Input Line -->
        <div class="terminal-prompt-line" id="terminal-prompt-line">
          <span class="prompt-host">subham@studio</span>:<span class="prompt-path">~/portfolio</span><span class="prompt-char">$</span>
          <div class="terminal-input-wrapper">
            <span class="input-mirror" id="input-mirror"></span><span class="terminal-cursor">█</span>
            <input type="text" id="terminal-input" class="real-terminal-input" autocomplete="off" spellcheck="false" autofocus />
          </div>
        </div>

        <!-- Matrix Overlay -->
        <canvas class="macos-matrix-canvas" id="macos-matrix-canvas"></canvas>

        <!-- Snake Game Container (Fixed overlay inside terminal) -->
        <div class="macos-snake-layer" id="macos-snake-layer">
          <div class="snake-top-bar">
            <span>🐍 SNAKE.EXE</span>
            <span id="snake-score-val">SCORE: 0</span>
            <span class="snake-quit-tip">Press [Q] or [ESC] to Exit</span>
          </div>
          <div class="snake-canvas-box">
            <canvas id="macos-snake-canvas" width="460" height="260"></canvas>
          </div>
        </div>

      </div>

    </div>
  `;
  document.body.appendChild(root);

  const windowEl = root.querySelector('#macos-window');
  const bodyEl = root.querySelector('#macos-terminal-body');
  const outputEl = root.querySelector('#terminal-output');
  const inputEl = root.querySelector('#terminal-input');
  const inputMirror = root.querySelector('#input-mirror');
  const closeBtn = root.querySelector('#macos-btn-close');
  const themeBtn = root.querySelector('#macos-btn-theme');
  const matrixBtn = root.querySelector('#macos-btn-matrix');
  const matrixCanvas = root.querySelector('#macos-matrix-canvas');
  const snakeLayer = root.querySelector('#macos-snake-layer');
  const snakeCanvas = root.querySelector('#macos-snake-canvas');
  const snakeScoreVal = root.querySelector('#snake-score-val');

  let history = ['help', 'neofetch'];
  let historyIdx = -1;
  const THEMES = ['theme-dark', 'theme-amber', 'theme-matrix', 'theme-cyberpunk'];
  let currentThemeIdx = 0;

  const COMMANDS = [
    'help',
    'about',
    'projects',
    'skills',
    'contact',
    'neofetch',
    'cat',
    'ls',
    'snake',
    'matrix',
    'theme',
    'music',
    'meow',
    'clear',
    'exit',
  ];

  function printWelcome() {
    outputEl.innerHTML = `
<div class="term-banner">
<pre class="term-ascii">
   ___       __    __                 ____  ____ 
  / __|_  _ / /_  / /  ___ ___ _ ___ / __ \\/ __/ 
 _\\ \\/ /_/ // _ \\/ _ \\/ _ \`/  ' \\___/ /_/ /\\ \\   
/___/\\_,_/_/_.__/_//_/\\_,_/_/_/_/   \\____/___/   
</pre>
  <div class="term-welcome-sub">
    <span>Last login: ${new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })} on ttys001</span>
    <span>Welcome to <strong>SubhamOS (macOS Terminal Edition)</strong></span>
    <span>Type <span class="cmd-badge">help</span> for commands, <span class="cmd-badge">neofetch</span> for specs, or <span class="cmd-badge">snake</span> for a mini-game.</span>
  </div>
</div>
`;
  }

  function executeCommand(raw) {
    const trimmed = raw.trim();
    if (!trimmed) return;

    history.push(trimmed);
    historyIdx = history.length;

    // Render executed line
    const line = document.createElement('div');
    line.className = 'terminal-executed-line';
    line.innerHTML = `
      <span class="prompt-host">subham@studio</span>:<span class="prompt-path">~/portfolio</span><span class="prompt-char">$</span>
      <span class="cmd-executed-text">${escapeHTML(trimmed)}</span>
    `;
    outputEl.appendChild(line);

    const parts = trimmed.split(/\s+/);
    const cmd = parts[0].toLowerCase();
    const args = parts.slice(1);

    const res = document.createElement('div');
    res.className = 'terminal-output-block';

    switch (cmd) {
      case 'help':
        res.innerHTML = `
<div class="help-table">
  <div class="help-row"><span class="h-cmd">about</span><span class="h-desc">Developer bio, background & philosophy</span></div>
  <div class="help-row"><span class="h-cmd">education</span><span class="h-desc">Academic degrees (MCA, BCA) & certifications</span></div>
  <div class="help-row"><span class="h-cmd">resume</span><span class="h-desc">View & download verified Curriculum Vitae / PDF</span></div>
  <div class="help-row"><span class="h-cmd">projects</span><span class="h-desc">Featured fullstack & 3D projects</span></div>
  <div class="help-row"><span class="h-cmd">skills</span><span class="h-desc">Frontend, 3D/GLSL, Backend & Devops tech stack</span></div>
  <div class="help-row"><span class="h-cmd">contact</span><span class="h-desc">Email, GitHub, LinkedIn & X direct channels</span></div>
  <div class="help-row"><span class="h-cmd">neofetch</span><span class="h-desc">Developer specs & system hardware info</span></div>
  <div class="help-row"><span class="h-cmd">ls</span><span class="h-desc">List studio directory contents</span></div>
  <div class="help-row"><span class="h-cmd">cat &lt;file&gt;</span><span class="h-desc">Read file (e.g. cat philosophy.txt)</span></div>
  <div class="help-row"><span class="h-cmd">snake</span><span class="h-desc">Play retro arcade Snake mini-game</span></div>
  <div class="help-row"><span class="h-cmd">matrix</span><span class="h-desc">Fullscreen digital rain screensaver</span></div>
  <div class="help-row"><span class="h-cmd">theme</span><span class="h-desc">Cycle theme (dark | amber | matrix | cyberpunk)</span></div>
  <div class="help-row"><span class="h-cmd">music</span><span class="h-desc">Toggle studio background radio music</span></div>
  <div class="help-row"><span class="h-cmd">meow</span><span class="h-desc">Pet Mochi the studio cat 🐾</span></div>
  <div class="help-row"><span class="h-cmd">clear</span><span class="h-desc">Clear terminal screen</span></div>
  <div class="help-row"><span class="h-cmd">exit</span><span class="h-desc">Close terminal window</span></div>
</div>
        `;
        playTerminalBeep(920);
        break;

      case 'neofetch':
      case 'fetch':
        res.innerHTML = `
<div class="neofetch-container">
  <pre class="neofetch-cat">
   /\\_/\\  
  ( o.o ) 
   > ^ <  
 [MOCHI]
  </pre>
  <div class="neofetch-meta">
    <div class="nf-user-host"><span class="nf-hi-user">subham</span>@<span class="nf-hi-host">macbook-pro</span></div>
    <div class="nf-divider">-------------------------</div>
    <div class="nf-entry"><span class="nf-label">OS:</span> SubhamOS macOS Edition (Darwin 24.1)</div>
    <div class="nf-entry"><span class="nf-label">Host:</span> 3D Parallax Creative Studio</div>
    <div class="nf-entry"><span class="nf-label">Uptime:</span> 100% Continuous Uptime</div>
    <div class="nf-entry"><span class="nf-label">Shell:</span> zsh 5.9 (x86_64-apple-darwin24.0)</div>
    <div class="nf-entry"><span class="nf-label">Role:</span> Full Stack Developer & Creative Technologist</div>
    <div class="nf-entry"><span class="nf-label">Location:</span> Kolkata, India 📍</div>
    <div class="nf-entry"><span class="nf-label">Core Stack:</span> TypeScript · React · Three.js · Node.js · GLSL</div>
    <div class="nf-entry"><span class="nf-label">Theme:</span> ${windowEl.className.replace('macos-window ', '') || 'dark'}</div>
    <div class="nf-palette">
      <span class="p-chip p-black"></span>
      <span class="p-chip p-red"></span>
      <span class="p-chip p-green"></span>
      <span class="p-chip p-yellow"></span>
      <span class="p-chip p-blue"></span>
      <span class="p-chip p-magenta"></span>
      <span class="p-chip p-cyan"></span>
      <span class="p-chip p-white"></span>
    </div>
  </div>
</div>
        `;
        playTerminalBeep(1050);
        break;

      case 'about':
        res.innerHTML = `
<div class="term-card">
  <div class="card-title">SUBHAM SANTRA · FULL STACK DEVELOPER</div>
  <p>I build digital experiences that combine scalable engineering with refined visual design.</p>
  <p>My work focuses on frontend architecture, distributed backend systems, motion-driven interfaces, and building products that feel immersive, fast, and deeply intentional.</p>
  <p class="term-quote">"I care about the things that are hard to quantify — the feeling of a transition, the weight of a typeface, the moment an interface becomes invisible."</p>
  <div class="term-links">
    <span>GitHub: <a href="https://github.com/defidecoder13" target="_blank" rel="noopener">@defidecoder13</a></span>
    <span>LinkedIn: <a href="https://www.linkedin.com/in/subham-santra001/" target="_blank" rel="noopener">in/subham-santra001</a></span>
  </div>
</div>
        `;
        playTerminalBeep(880);
        break;

      case 'resume':
      case 'cv':
        res.innerHTML = `
<div class="term-card">
  <div class="card-title">SUBHAM SANTRA · RESUME & CV</div>
  <p><strong>Education:</strong> MCA (GPA: 8.42/10), BCA (GPA: 9.11/10) · Brainware University</p>
  <p><strong>Stack:</strong> React, Next.js, Node.js, Express, PostgreSQL, MongoDB, Gemini API, Docker</p>
  <p><strong>Experience:</strong> Freelance (MedSathi Pharmacy), Node.js Intern (WebGuru Infosystems)</p>
  <div class="term-links" style="margin-top: 10px;">
    <a href="/assets/Subham_Santra_Resume.pdf" download="Subham_Santra_Resume.pdf" class="cmd-badge" style="color:#5af78e; border-color:#5af78e; text-decoration:none;">📥 Download PDF</a>
    <a href="/assets/Subham_Santra_Resume.pdf" target="_blank" rel="noopener" class="cmd-badge" style="color:#ffd276; border-color:#ffd276; text-decoration:none;">📄 Open PDF ↗</a>
  </div>
</div>
        `;
        playTerminalBeep(980);
        break;

      case 'experience':
      case 'work':
        res.innerHTML = `
<div class="term-card">
  <div class="card-title">PROFESSIONAL WORK EXPERIENCE</div>
  <p><strong>💼 Freelance Full-Stack Developer</strong> · MedSathi Pharmacy (Live Production Application)</p>
  <p style="color:#ffd276; margin-left: 14px;">• Built & deployed full-stack pharmacy management system for real-world operations.</p>
  <p style="color:#ffd276; margin-left: 14px;">• Developed billing, inventory tracking, and automated reporting workflows.</p>
  <p style="color:#ffd276; margin-left: 14px;">• Gathered client requirements & improved usability through iterative releases.</p>
  <p style="margin-top: 8px;"><strong>💼 Node.js Development Intern</strong> · WebGuru Infosystems (Nov 2024 – Jan 2025)</p>
  <p style="color:#ffd276; margin-left: 14px;">• Completed 3-month internship focused on Node.js and MongoDB development.</p>
</div>
        `;
        playTerminalBeep(920);
        break;

      case 'education':
      case 'degrees':
        res.innerHTML = `
<div class="term-card">
  <div class="card-title">ACADEMIC BACKGROUND & DEGREES</div>
  <p><strong>🎓 Master of Computer Application (MCA)</strong> · Brainware University (2023–2025)</p>
  <p style="color:#ffd276; margin-left: 14px;">• Grade: GPA 8.42/10.0 | Focus: Distributed Backend Systems, AI & Cloud Computing</p>
  <p><strong>🎓 Bachelor of Computer Application (BCA)</strong> · Brainware University (2020–2023)</p>
  <p style="color:#ffd276; margin-left: 14px;">• Grade: GPA 9.11/10.0 (High Distinction 🏆) | Focus: Computer Science & Data Structures</p>
  <p><strong>📜 Certifications:</strong> Full Stack Node.js Development · Prompt Engineering for Developers</p>
</div>
        `;
        playTerminalBeep(920);
        break;

      case 'projects':
        res.innerHTML = `
<div class="term-projects-list">
  <div class="term-p-item">
    <div class="p-title-row"><span class="p-badge">01</span> <span class="p-name">Medsathi — Offline Pharmacy Platform</span></div>
    <div class="p-desc">Enterprise retail POS checkout, batch tracking, barcode scan & offline PWA IndexedDB mutation queuing.</div>
    <div class="p-pills">Tags: POS Checkout · Batch Tracking · IndexedDB · Background Sync</div>
  </div>
  <div class="term-p-item">
    <div class="p-title-row"><span class="p-badge">02</span> <span class="p-name">Studium — AI Academic Copilot & Assessment Engine</span></div>
    <div class="p-desc">Intelligent study platform with synchronized PDF textbook reading & Google Gemini AI tutor citations.</div>
    <div class="p-pills">Tags: Gemini API · PDF Reader · Quiz Generator · Smart Learning</div>
  </div>
  <div class="term-p-item">
    <div class="p-title-row"><span class="p-badge">03</span> <span class="p-name">UniRoomies — Student Accommodation Platform</span></div>
    <div class="p-desc">Fullstack web platform connecting students with affordable rental accommodations & vacancy manager.</div>
    <div class="p-pills">Tags: Fullstack · Room Vacancies · Booking · Responsive</div>
  </div>
  <div class="term-p-item">
    <div class="p-title-row"><span class="p-badge">04</span> <span class="p-name">InterviewAI — AI Interview Platform</span></div>
    <div class="p-desc">Automated evaluation engine analyzing multi-turn transcripts, scoring responses & synthesizing 10/10 STAR answers.</div>
    <div class="p-pills">Tags: Gemini API · Resume Parser · Multi-Turn · STAR 10/10</div>
  </div>
</div>
        `;
        playTerminalBeep(920);
        break;

      case 'skills':
      case 'tech':
        res.innerHTML = `
<div class="term-skills-grid">
  <div class="s-block">
    <span class="s-category">FRONTEND:</span>
    <span class="s-techs">TypeScript, JavaScript (ESNext), React.js, Next.js, HTML5/CSS3, Tailwind CSS</span>
  </div>
  <div class="s-block">
    <span class="s-category">3D & GRAPHICS:</span>
    <span class="s-techs">Three.js, WebGL, GLSL Shaders, Canvas API, 2.5D Depth Displacement</span>
  </div>
  <div class="s-block">
    <span class="s-category">BACKEND:</span>
    <span class="s-techs">Node.js, Express, PostgreSQL, MongoDB, Prisma ORM, RESTful APIs, WebSockets</span>
  </div>
  <div class="s-block">
    <span class="s-category">DEV & TOOLS:</span>
    <span class="s-techs">Git, Docker, Linux, Vite, IndexedDB, PWA Service Workers, Vercel/Render</span>
  </div>
</div>
        `;
        playTerminalBeep(940);
        break;

      case 'contact':
        res.innerHTML = `
<div class="term-card">
  <div class="card-title">DIRECT CONTACT CHANNELS</div>
  <div><span class="term-label">Email:</span> <a href="mailto:subhamsaantra001@gmail.com">subhamsaantra001@gmail.com</a></div>
  <div><span class="term-label">GitHub:</span> <a href="https://github.com/defidecoder13" target="_blank" rel="noopener">github.com/defidecoder13</a></div>
  <div><span class="term-label">LinkedIn:</span> <a href="https://www.linkedin.com/in/subham-santra001/" target="_blank" rel="noopener">linkedin.com/in/subham-santra001</a></div>
  <div><span class="term-label">X / Twitter:</span> <a href="https://x.com/subham_sl" target="_blank" rel="noopener">x.com/subham_sl</a></div>
  <div><span class="term-label">Location:</span> Kolkata, West Bengal, India 📍</div>
</div>
        `;
        playTerminalBeep(900);
        break;

      case 'ls':
      case 'dir':
        res.innerHTML = `
<div class="term-files">
  <span class="f-doc">about.md</span>
  <span class="f-doc">philosophy.txt</span>
  <span class="f-doc">skills.json</span>
  <span class="f-doc">projects.txt</span>
  <span class="f-doc">contact.info</span>
  <span class="f-sec">secrets.env</span>
</div>
        `;
        break;

      case 'cat':
        const file = (args[0] || '').toLowerCase();
        if (!file) {
          res.innerHTML = `<span class="term-err">Usage: cat &lt;filename&gt; (try 'cat philosophy.txt' or 'cat secrets.env')</span>`;
        } else if (file === 'about.md') {
          res.innerHTML = `<div class="term-file-box"># Subham Santra\nFull Stack Developer & Creative Technologist based in Kolkata, India.</div>`;
        } else if (file === 'philosophy.txt') {
          res.innerHTML = `<div class="term-file-box">"The magic of software engineering is turning pure logic into tactile, delightful human experiences."</div>`;
        } else if (file === 'skills.json') {
          res.innerHTML = `<pre class="term-file-box">{\n  "frontend": ["React", "TypeScript", "Three.js"],\n  "backend": ["Node.js", "PostgreSQL", "Prisma"],\n  "passion": "Building fast, immersive 3D interfaces"\n}</pre>`;
        } else if (file === 'projects.txt') {
          res.innerHTML = `<div class="term-file-box">1. Medsathi (Offline Pharmacy Platform)\n2. Studium (AI Copilot)\n3. UniRoomies (Housing Marketplace)\n4. InterviewAI (Evaluation Engine)</div>`;
        } else if (file === 'contact.info') {
          res.innerHTML = `<div class="term-file-box">Email: subhamsaantra001@gmail.com\nGitHub: defidecoder13\nLocation: Kolkata, India</div>`;
        } else if (file === 'secrets.env') {
          res.innerHTML = `<div class="term-secret-box">
  <div class="sec-title">🔒 EASTER EGG DECRYPTED:</div>
  <div>SUPER_POWER=Unmatched Curiosity & Pixel-Perfect Precision</div>
  <div>COFFEE_LEVEL=100%</div>
  <div>MOCHI_HAPPINESS=100%</div>
</div>`;
          playCatMeow();
        } else {
          res.innerHTML = `<span class="term-err">cat: ${escapeHTML(file)}: No such file in directory</span>`;
        }
        break;

      case 'theme':
        currentThemeIdx = (currentThemeIdx + 1) % THEMES.length;
        setTheme(THEMES[currentThemeIdx]);
        res.innerHTML = `<span>Terminal theme switched to: <strong class="cmd-badge">${THEMES[currentThemeIdx].replace('theme-', '')}</strong></span>`;
        playTerminalBeep(1200);
        break;

      case 'matrix':
        startMatrix();
        return;

      case 'snake':
        startSnakeGame();
        return;

      case 'music':
        const muted = toggleMute();
        res.innerHTML = `<span>Studio Vintage Radio: <strong class="cmd-badge">${muted ? 'MUTED 🔇' : 'PLAYING 🎵'}</strong></span>`;
        playKeyClick();
        break;

      case 'meow':
        playCatMeow();
        res.innerHTML = `<span>🐾 Mochi purrs softly: "Meow! (=^･ω･^=)"</span>`;
        break;

      case 'clear':
      case 'cls':
        outputEl.innerHTML = '';
        inputEl.value = '';
        inputMirror.textContent = '';
        return;

      case 'exit':
      case 'quit':
        if (onExitCallback) onExitCallback();
        return;

      default:
        res.innerHTML = `<span class="term-err">zsh: command not found: ${escapeHTML(cmd)}. Type <span class="cmd-badge">help</span> for list.</span>`;
        playTerminalBeep(440);
        break;
    }

    outputEl.appendChild(res);
    inputEl.value = '';
    inputMirror.textContent = '';
    bodyEl.scrollTop = bodyEl.scrollHeight;
  }

  function setTheme(themeClass) {
    windowEl.className = `macos-window ${themeClass}`;
  }

  // ──────────────────────────────────────────────────────────────────────────
  // MATRIX DIGITAL CODE RAIN
  // ──────────────────────────────────────────────────────────────────────────
  let matrixRunning = false;
  let matrixAnimId = null;

  function startMatrix() {
    matrixRunning = true;
    matrixCanvas.classList.add('active');
    const ctx = matrixCanvas.getContext('2d');
    matrixCanvas.width = bodyEl.clientWidth;
    matrixCanvas.height = bodyEl.clientHeight;

    const chars = '0123456789ABCDEF$#@%&*+-=<>{}[]SUBHAM';
    const fontSize = 14;
    const columns = Math.floor(matrixCanvas.width / fontSize);
    const drops = Array(columns).fill(1);

    playTerminalBeep(1400);

    function draw() {
      if (!matrixRunning) return;
      ctx.fillStyle = 'rgba(16, 16, 20, 0.15)';
      ctx.fillRect(0, 0, matrixCanvas.width, matrixCanvas.height);

      ctx.fillStyle = '#4ade80';
      ctx.font = `${fontSize}px monospace`;

      for (let i = 0; i < drops.length; i++) {
        const text = chars[Math.floor(Math.random() * chars.length)];
        ctx.fillText(text, i * fontSize, drops[i] * fontSize);

        if (drops[i] * fontSize > matrixCanvas.height && Math.random() > 0.975) {
          drops[i] = 0;
        }
        drops[i]++;
      }
      matrixAnimId = requestAnimationFrame(draw);
    }
    draw();
  }

  function stopMatrix() {
    if (!matrixRunning) return;
    matrixRunning = false;
    if (matrixAnimId) cancelAnimationFrame(matrixAnimId);
    matrixCanvas.classList.remove('active');
  }

  // ──────────────────────────────────────────────────────────────────────────
  // RETRO ARCADE SNAKE (FIXED OVERLAY - ZERO RESIZE GLITCH)
  // ──────────────────────────────────────────────────────────────────────────
  let snakeRunning = false;
  let snakeInterval = null;

  function startSnakeGame() {
    snakeRunning = true;
    snakeLayer.classList.add('active');
    const ctx = snakeCanvas.getContext('2d');
    const grid = 10;
    let snake = [{ x: 10, y: 10 }, { x: 9, y: 10 }, { x: 8, y: 10 }];
    let dx = 1, dy = 0;
    let food = { x: 20, y: 12 };
    let score = 0;

    snakeScoreVal.textContent = `SCORE: 0`;
    playTerminalBeep(880);

    function placeFood() {
      food.x = Math.floor(Math.random() * (snakeCanvas.width / grid));
      food.y = Math.floor(Math.random() * (snakeCanvas.height / grid));
    }

    function step() {
      const head = { x: snake[0].x + dx, y: snake[0].y + dy };

      // Wall collision wraps around
      if (head.x < 0) head.x = snakeCanvas.width / grid - 1;
      if (head.x >= snakeCanvas.width / grid) head.x = 0;
      if (head.y < 0) head.y = snakeCanvas.height / grid - 1;
      if (head.y >= snakeCanvas.height / grid) head.y = 0;

      // Self collision
      if (snake.some(seg => seg.x === head.x && seg.y === head.y)) {
        playTerminalBeep(320);
        stopSnakeGame();
        return;
      }

      snake.unshift(head);

      // Eat food
      if (head.x === food.x && head.y === food.y) {
        score += 10;
        snakeScoreVal.textContent = `SCORE: ${score}`;
        playTerminalKey();
        placeFood();
      } else {
        snake.pop();
      }

      // Render Frame
      ctx.fillStyle = '#141418';
      ctx.fillRect(0, 0, snakeCanvas.width, snakeCanvas.height);

      // Draw Grid lines subtle
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.03)';
      ctx.lineWidth = 1;
      for (let x = 0; x < snakeCanvas.width; x += grid) {
        ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, snakeCanvas.height); ctx.stroke();
      }

      // Draw Food
      ctx.fillStyle = '#f87171';
      ctx.fillRect(food.x * grid, food.y * grid, grid - 1, grid - 1);

      // Draw Snake
      snake.forEach((seg, idx) => {
        ctx.fillStyle = idx === 0 ? '#4ade80' : '#22c55e';
        ctx.fillRect(seg.x * grid, seg.y * grid, grid - 1, grid - 1);
      });
    }

    snakeInterval = setInterval(step, 75);

    const onSnakeKey = (e) => {
      if (!snakeRunning) return;
      if (e.key === 'ArrowUp' || e.key === 'w') { if (dy === 0) { dx = 0; dy = -1; playTerminalKey(); } e.preventDefault(); }
      if (e.key === 'ArrowDown' || e.key === 's') { if (dy === 0) { dx = 0; dy = 1; playTerminalKey(); } e.preventDefault(); }
      if (e.key === 'ArrowLeft' || e.key === 'a') { if (dx === 0) { dx = -1; dy = 0; playTerminalKey(); } e.preventDefault(); }
      if (e.key === 'ArrowRight' || e.key === 'd') { if (dx === 0) { dx = 1; dy = 0; playTerminalKey(); } e.preventDefault(); }
      if (e.key === 'Escape' || e.key === 'q') {
        stopSnakeGame();
      }
    };
    window.addEventListener('keydown', onSnakeKey);
    snakeLayer._keyHandler = onSnakeKey;
  }

  function stopSnakeGame() {
    if (!snakeRunning) return;
    snakeRunning = false;
    if (snakeInterval) clearInterval(snakeInterval);
    if (snakeLayer._keyHandler) window.removeEventListener('keydown', snakeLayer._keyHandler);
    snakeLayer.classList.remove('active');
    inputEl.focus();
  }

  // Keyboard Event Handlers
  inputEl.addEventListener('input', () => {
    inputMirror.textContent = inputEl.value;
  });

  inputEl.addEventListener('keydown', (e) => {
    playTerminalKey();

    if (e.key === 'Enter') {
      e.preventDefault();
      executeCommand(inputEl.value);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (history.length > 0) {
        historyIdx = Math.max(0, historyIdx - 1);
        inputEl.value = history[historyIdx] || '';
        inputMirror.textContent = inputEl.value;
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (history.length > 0) {
        historyIdx = Math.min(history.length, historyIdx + 1);
        inputEl.value = history[historyIdx] || '';
        inputMirror.textContent = inputEl.value;
      }
    } else if (e.key === 'Tab') {
      e.preventDefault();
      const current = inputEl.value.trim();
      const match = COMMANDS.find(c => c.startsWith(current));
      if (match) {
        inputEl.value = match;
        inputMirror.textContent = match;
      }
    }
  });

  bodyEl.addEventListener('click', () => {
    if (matrixRunning) {
      stopMatrix();
      return;
    }
    inputEl.focus();
  });

  themeBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    currentThemeIdx = (currentThemeIdx + 1) % THEMES.length;
    setTheme(THEMES[currentThemeIdx]);
    playKeyClick();
  });

  matrixBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    startMatrix();
  });

  let onExitCallback = null;

  closeBtn.addEventListener('click', () => {
    if (onExitCallback) onExitCallback();
  });

  function escapeHTML(str) {
    return (str || '').replace(/[&<>'"]/g, 
      tag => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[tag] || tag)
    );
  }

  return {
    open(isNight, onExit) {
      onExitCallback = onExit;
      root.classList.add('show');
      printWelcome();
      inputEl.value = '';
      inputMirror.textContent = '';
      setTimeout(() => inputEl.focus(), 150);
    },
    close() {
      stopMatrix();
      stopSnakeGame();
      root.classList.remove('show');
      if (document.activeElement) document.activeElement.blur();
    },
    isOpen() {
      return root.classList.contains('show');
    },
  };
}
