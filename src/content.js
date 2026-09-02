// ──────────────────────────────────────────────────────────────────────────
// PORTFOLIO CONTENT & SECTIONS DATA
// ──────────────────────────────────────────────────────────────────────────

export const SECTIONS = {
  projects: {
    title: 'Featured Projects & Experiments',
    tagline: 'Code, Shaders & Immersive Experiences',
    body: `
      <p class="lead">Here is a curated collection of interactive experiences, web applications, and creative coding experiments.</p>
      
      <div class="project-card">
        <div class="project-header">
          <h3>01. 3D Spatial Audio & Visualizer</h3>
          <span class="project-badge">WebGL / Three.js</span>
        </div>
        <p>A real-time spatial audio synthesizer and reactive particle visualizer running entirely inside the browser using WebGL shaders and Web Audio API.</p>
        <div class="tech-tags">
          <span>Three.js</span>
          <span>GLSL Shaders</span>
          <span>Web Audio API</span>
          <span>TypeScript</span>
        </div>
        <div class="project-links">
          <a href="https://github.com" target="_blank" rel="noopener">GitHub ↗</a>
          <a href="#" class="accent-btn">Live Demo ↗</a>
        </div>
      </div>

      <div class="project-card">
        <div class="project-header">
          <h3>02. Neural Depth & NeRF Viewer</h3>
          <span class="project-badge">AI / Spatial Computing</span>
        </div>
        <p>Zero-shot 3D reconstruction from single 2D images using monocular depth estimation and real-time mesh displacement shaders.</p>
        <div class="tech-tags">
          <span>WebGL</span>
          <span>Depth Anything V2</span>
          <span>React</span>
          <span>Python</span>
        </div>
        <div class="project-links">
          <a href="https://github.com" target="_blank" rel="noopener">GitHub ↗</a>
          <a href="#" class="accent-btn">Live Demo ↗</a>
        </div>
      </div>

      <div class="project-card">
        <div class="project-header">
          <h3>03. PolyPulse: Parametric 3D Engine</h3>
          <span class="project-badge">Creative Tech</span>
        </div>
        <p>A procedural 3D model generator where meshes are computed as mathematical algorithms rather than static files, exportable directly to GLTF and Unity.</p>
        <div class="tech-tags">
          <span>Three.js</span>
          <span>Procedural Geometry</span>
          <span>GLTF</span>
          <span>Vite</span>
        </div>
        <div class="project-links">
          <a href="https://github.com" target="_blank" rel="noopener">GitHub ↗</a>
          <a href="#" class="accent-btn">Live Demo ↗</a>
        </div>
      </div>
    `,
  },

  about: {
    title: 'About Me',
    tagline: 'Developer, Creative Technologist & Builder',
    body: `
      <p>Hi! I'm a developer and creative technologist passionate about the intersection of <strong>code, 3D graphics, and intuitive user experiences</strong>.</p>
      
      <p>I enjoy building things that feel alive—whether that's an interactive WebGL world, a performant full-stack application, or experimental developer tools.</p>
      
      <h3>Core Technologies</h3>
      <div class="tech-tags skills-grid">
        <span class="skill-tag">JavaScript / TypeScript</span>
        <span class="skill-tag">Three.js / WebGL</span>
        <span class="skill-tag">React / Next.js</span>
        <span class="skill-tag">GLSL Shaders</span>
        <span class="skill-tag">Node.js</span>
        <span class="skill-tag">Python</span>
        <span class="skill-tag">Tailwind CSS</span>
        <span class="skill-tag">Git / CI/CD</span>
      </div>

      <h3>Philosophy</h3>
      <p>I believe software should be fast, delightful to touch, and built with craftsmanship down to the finest micro-interaction.</p>
    `,
  },

  writing: {
    title: 'Articles, Reads & Insights',
    tagline: 'Deep Dives into Code & Graphics',
    body: `
      <p class="lead">Essays, tutorials, and architectural breakdowns on modern web development and graphics programming.</p>
      
      <ul class="article-list">
        <li>
          <div class="article-date">2026</div>
          <a href="#">Building 2.5D Depth-Displaced Parallax Scenes with Three.js and Custom Shaders ↗</a>
          <p>How to turn flat 2D artwork into immersive 3D rooms using vertex displacement and real perspective camera dollies.</p>
        </li>
        <li>
          <div class="article-date">2025</div>
          <a href="#">Zero-Dependency Sound Synthesis with the Web Audio API ↗</a>
          <p>Generating mechanical tactile switch clicks and physical audio feedback on the fly without external audio files.</p>
        </li>
        <li>
          <div class="article-date">2025</div>
          <a href="#">Optimizing WebGL Render Loops for 60 FPS on Mobile Devices ↗</a>
          <p>Techniques for battery-friendly GPU shaders, rejection sampling, and non-blocking background asset loading.</p>
        </li>
      </ul>
    `,
  },

  company: {
    title: 'Experience & Ventures',
    tagline: 'Career Path & Roles',
    body: `
      <div class="timeline">
        <div class="timeline-item">
          <div class="timeline-year">2024 — Present</div>
          <h4>Lead Creative Technologist & Full-Stack Engineer</h4>
          <p class="timeline-sub">Independent / Studio Work</p>
          <p>Architecting interactive WebGL web applications, custom 3D design systems, and high-performance frontend architectures for clients globally.</p>
        </div>

        <div class="timeline-item">
          <div class="timeline-year">2022 — 2024</div>
          <h4>Senior Frontend Engineer</h4>
          <p class="timeline-sub">Tech Ventures & Startups</p>
          <p>Built responsive, real-time collaboration tools, interactive dashboards, and design systems scaled to hundreds of thousands of active users.</p>
        </div>

        <div class="timeline-item">
          <div class="timeline-year">2020 — 2022</div>
          <h4>Frontend Developer & UI Engineer</h4>
          <p class="timeline-sub">Digital Agency</p>
          <p>Engineered award-winning marketing sites, e-commerce platforms, and interactive canvas experiences with GSAP and modern JavaScript.</p>
        </div>
      </div>
    `,
  },

  awards: {
    title: 'Awards & Hackathons',
    tagline: 'Competitions, Recognition & Wins',
    body: `
      <ul class="award-list">
        <li>
          <div class="award-badge">🏆 1st Place</div>
          <h4>Global Creative Tech Hackathon 2025</h4>
          <p>Awarded for building an AI-assisted spatial canvas that transforms sketches into live 3D web environments in seconds.</p>
        </li>
        <li>
          <div class="award-badge">🌟 Best UI/UX</div>
          <h4>Developer Experience Challenge 2024</h4>
          <p>Recognized for creating an ultra-lightweight terminal companion that logs developer activity locally.</p>
        </li>
        <li>
          <div class="award-badge">🥇 Grand Prize</div>
          <h4>Interactive Web Awards 2023</h4>
          <p>Awarded for outstanding technical achievement in WebGL and accessible creative web design.</p>
        </li>
      </ul>
    `,
  },

  gallery: {
    title: 'Creative Coding & Visuals',
    tagline: 'Generative Art & Experimental Shaders',
    body: `
      <p>A playground of algorithmic experiments, procedural noise patterns, and WebGL raymarching shaders.</p>
      
      <div class="gallery-grid">
        <div class="gallery-card">
          <h4>01. Organic Domain Warping</h4>
          <p>Layered simplex noise animating turbulent liquid flow fields in real-time GLSL.</p>
        </div>
        <div class="gallery-card">
          <h4>02. Procedural Seascape</h4>
          <p>Simulating wave crests, ordered dithering, and solar glare on a virtual pixel grid.</p>
        </div>
        <div class="gallery-card">
          <h4>03. Dithering & Retro Post-FX</h4>
          <p>Bayer matrix ordered dithering algorithms mimicking vintage 8-bit & 16-bit hardware.</p>
        </div>
      </div>
    `,
  },

  contact: {
    title: 'Direct Line · Get In Touch',
    tagline: 'Let\'s Connect & Build Together ☎️',
    body: `
      <p class="lead">Have a project in mind, an exciting role, or just want to chat about 3D, WebGL and full-stack software? My direct line is always open.</p>
      
      <div class="contact-box" style="margin: 1.5rem 0; padding: 1.25rem; background: rgba(255,255,255,0.06); border-radius: 10px; border: 1px solid rgba(255,255,255,0.12);">
        <p style="margin-bottom: 0.5rem; font-size: 0.85rem; color: #a0aec0; text-transform: uppercase; letter-spacing: 0.08em;"><strong>📧 Direct Email</strong></p>
        <a href="mailto:subhamsaantra001@gmail.com" class="email-btn email-link" style="font-size: 1.05rem; font-weight: 700; color: #e2b774; text-decoration: none;">subhamsaantra001@gmail.com ↗</a>
      </div>

      <h3>Connect Around The Web</h3>
      <div class="social-links-grid">
        <a href="https://github.com/defidecoder13" target="_blank" rel="noopener" class="social-card">
          <span style="font-weight: 700;">🐙 GitHub</span>
          <span class="social-handle">@defidecoder13 ↗</span>
        </a>
        <a href="https://www.linkedin.com/in/subham-santra001/" target="_blank" rel="noopener" class="social-card">
          <span style="font-weight: 700;">💼 LinkedIn</span>
          <span class="social-handle">subham-santra001 ↗</span>
        </a>
        <a href="https://x.com/subham_sl" target="_blank" rel="noopener" class="social-card">
          <span style="font-weight: 700;">🐦 X / Twitter</span>
          <span class="social-handle">@subham_sl ↗</span>
        </a>
      </div>
    `,
  },

  hobbies: {
    title: 'Hobbies & Beyond Tech',
    tagline: 'Off the Clock',
    body: `
      <p>When I'm not writing code or tweaking shaders, you can usually find me:</p>
      <ul class="hobby-list">
        <li>🌿 <strong>Urban Gardening & Plants:</strong> Caring for tropical houseplants (monstera, pothos, ficus).</li>
        <li>☕ <strong>Specialty Coffee:</strong> Dialing in espresso recipes and experimenting with V60 pour-overs.</li>
        <li>🕹️ <strong>Retro Gaming:</strong> Collecting classic pixel-art RPGs and indie games.</li>
        <li>🎹 <strong>Music & Synthesizers:</strong> Playing analog synths, ambient soundscapes, and lo-fi beats.</li>
      </ul>
    `,
  },
};
