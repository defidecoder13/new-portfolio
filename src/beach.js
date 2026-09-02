import * as THREE from 'three';

// ─────────────────────────────────────────────────────────────────────────────
// BREATHTAKING LO-FI SEASCAPE SHADER (DAY & NIGHT ATMOSPHERES)
// 100% mathematical GLSL shader with rich celestial mechanics and ocean wave physics.
// ─────────────────────────────────────────────────────────────────────────────

const VERT = `
  precision highp float;
  varying vec2 vUv;
  void main() { vUv = uv; gl_Position = vec4(position.xy, 0.0, 1.0); }
`;

const FRAG = `
  precision highp float;
  varying vec2 vUv;
  uniform float uTime;
  uniform vec2  uRes;
  uniform vec2  uPointer;
  uniform float uNightMix; // 0.0 = Day, 1.0 = Night

  float hash(vec2 p){ return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
  float hash1(float n){ return fract(sin(n) * 43758.5453); }

  float vnoise(vec2 p){
    vec2 i = floor(p), f = fract(p);
    vec2 u = f * f * (3.0 - 2.0 * f);
    return mix(mix(hash(i),                 hash(i + vec2(1.0, 0.0)), u.x),
               mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x), u.y);
  }

  float fbm(vec2 p){
    float v = 0.0, a = 0.5;
    for (int i = 0; i < 4; i++) { v += a * vnoise(p); p = p * 2.04 + 11.3; a *= 0.5; }
    return v;
  }

  // ── High-Res Celestial Starfield with 4-Point Star Flares ─────────────────
  vec3 renderStars(vec2 uv, float time, float aspect) {
    vec3 starCol = vec3(0.0);
    
    // Fine star grid (high density, round points)
    vec2 stGrid = uv * vec2(110.0 * aspect, 110.0);
    vec2 stCell = floor(stGrid);
    vec2 stFract = fract(stGrid) - 0.5;
    float rnd = hash(stCell);

    if (rnd > 0.94) {
      float d = length(stFract);
      float twinkle = 0.45 + 0.55 * sin(time * (2.0 + rnd * 5.0) + rnd * 60.0);
      float brightness = (rnd - 0.94) / 0.06;
      
      // Core point
      float core = smoothstep(0.22, 0.02, d);
      
      // Rare 4-point cross flare for bright stars
      float flare = 0.0;
      if (rnd > 0.985) {
        flare = smoothstep(0.06, 0.0, abs(stFract.x)) * smoothstep(0.5, 0.0, abs(stFract.y))
              + smoothstep(0.06, 0.0, abs(stFract.y)) * smoothstep(0.5, 0.0, abs(stFract.x));
      }

      vec3 tint = mix(vec3(0.85, 0.92, 1.0), vec3(1.0, 0.88, 0.72), hash1(rnd * 17.0));
      starCol += tint * (core + flare * 0.7) * twinkle * brightness * 1.3;
    }
    return starCol;
  }

  // ── Smooth Glowing Shooting Star / Meteor ─────────────────────────────────
  float renderMeteor(vec2 uv, float time, float seed, float aspect) {
    float cycle = fract(time * 0.16 + seed * 23.45);
    if (cycle > 0.28) return 0.0;
    float progress = cycle / 0.28;

    vec2 start = vec2((-0.6 + seed * 1.3) * aspect, 0.98);
    vec2 dir = normalize(vec2(1.15, -0.65));
    vec2 head = start + dir * (progress * 1.6);

    vec2 delta = uv - head;
    float distAlong = dot(delta, dir);
    float distPerp = length(delta - dir * distAlong);

    if (distAlong > 0.0 || distAlong < -0.38) return 0.0;
    float tail = smoothstep(-0.38, 0.0, distAlong);
    float beam = smoothstep(0.0035, 0.0, distPerp);
    return beam * tail * (1.0 - progress);
  }

  // ── Cruising Retro Rocket with Animated Exhaust ───────────────────────────
  vec4 renderRocket(vec2 uv, float time, float aspect) {
    float cycle = fract(time * 0.045);
    vec2 rPos = vec2((-0.75 + cycle * 1.5) * aspect, 0.65 + cycle * 0.35);
    vec2 delta = uv - rPos;
    
    // Rotate 28 degrees
    float ang = 0.48;
    mat2 rot = mat2(cos(ang), -sin(ang), sin(ang), cos(ang));
    vec2 p = rot * delta;

    float body = smoothstep(0.012, 0.004, length(vec2(p.x * 2.5, p.y * 1.2)));
    
    // Fiery orange flickering exhaust
    float flameLen = 0.08 + sin(time * 45.0) * 0.02;
    float flame = 0.0;
    if (p.x < 0.0 && p.x > -flameLen) {
      flame = smoothstep(0.008, 0.0, abs(p.y)) * smoothstep(-flameLen, 0.0, p.x);
    }

    // Red beacon blinking light
    float beacon = smoothstep(0.006, 0.0, length(p - vec2(0.008, 0.004))) * (0.5 + 0.5 * sin(time * 12.0));

    vec3 rCol = vec3(0.92, 0.95, 1.0) * body;
    vec3 fCol = vec3(1.0, 0.55, 0.15) * flame * 1.5;
    vec3 bCol = vec3(1.0, 0.2, 0.2) * beacon;

    return vec4(rCol + fCol + bCol, max(body, max(flame, beacon)));
  }

  // ── Flying Birds ──────────────────────────────────────────────────────────
  float renderBird(vec2 uv, vec2 pos, float scale, float speed, float time) {
    vec2 p = (uv - pos) / scale;
    p.x *= 1.4;
    if (abs(p.x) > 1.0 || abs(p.y) > 0.8) return 0.0;
    float flap = sin(time * speed + pos.x * 12.0) * 0.45;
    float wingY = abs(p.x) * (0.8 + flap) - 0.2;
    float thickness = 0.14 * (1.0 - abs(p.x) * 0.55);
    return smoothstep(thickness, 0.0, abs(p.y - wingY));
  }

  void main(){
    float t = uTime;
    float aspect = uRes.x / uRes.y;
    vec2 uv = vUv;

    float x = (uv.x - 0.5) * aspect;
    float y = uv.y;
    float horizon = 0.54;

    vec3 col = vec3(0.0);

    // ─────────────────────────────────────────────────────────────────────────
    // ☀️ 1. DAYTIME LO-FI SEASCAPE
    // ─────────────────────────────────────────────────────────────────────────
    vec3 dayCol = vec3(0.0);
    {
      // Sky Gradient
      vec3 skyTop = vec3(0.06, 0.28, 0.68);
      vec3 skyMid = vec3(0.38, 0.65, 0.92);
      vec3 skyHor = vec3(0.88, 0.92, 0.95);
      float g = smoothstep(horizon, 1.05, y);
      vec3 sky = mix(skyHor, skyMid, smoothstep(0.0, 0.45, g));
      sky = mix(sky, skyTop, smoothstep(0.40, 1.0, g));

      // Drifting clouds
      float clouds = fbm(vec2(x * 0.5 - t * 0.015, y * 1.5));
      clouds = smoothstep(0.50, 0.78, clouds) * smoothstep(horizon + 0.05, horizon + 0.35, y);
      sky = mix(sky, vec3(1.0, 0.98, 0.95), clouds * 0.42);

      // Golden Sun & Volumetric Halo
      float sunX = 0.0;
      float sd = distance(vec2(x, y), vec2(sunX, horizon + 0.22));
      sky = mix(sky, vec3(1.00, 0.88, 0.68), clamp(exp(-sd * 3.8) * 0.45, 0.0, 1.0));
      sky = mix(sky, vec3(1.00, 0.95, 0.84), clamp(exp(-sd * 11.0) * 0.75, 0.0, 1.0));
      sky = mix(sky, vec3(1.00, 0.99, 0.94), smoothstep(0.062, 0.038, sd));

      // Soaring Seagulls
      float birds = 0.0;
      for (int i = 0; i < 4; i++) {
        float fi = float(i);
        float bx = mod(t * (0.05 + fi * 0.012) + fi * 0.4, 1.8 * aspect) - 0.9 * aspect;
        float by = horizon + 0.14 + sin(fi * 2.3) * 0.12;
        birds += renderBird(vec2(x, y), vec2(bx, by), 0.022 - fi * 0.003, 8.0 + fi * 1.5, t);
      }
      sky = mix(sky, vec3(0.18, 0.22, 0.32), clamp(birds, 0.0, 1.0));

      // Daytime Ocean Waves & Sun Path
      if (y < horizon) {
        float dist = (horizon - y) + 0.012;
        float den = max(dist, 1e-4) * 0.85 + 0.06;
        vec2 w = vec2(x / den * 0.8, 0.5 / den + t * 0.45);
        float swell = fbm(w * vec2(0.55, 1.1));
        float rip = fbm(vec2(w.x * 1.7 + 7.3, w.y * 3.0 - t * 0.12));
        float hgt = swell * 0.68 + rip * 0.32;

        vec3 deepSea = vec3(0.06, 0.22, 0.48);
        vec3 lightSea = vec3(0.18, 0.52, 0.74);
        vec3 sunGlint = vec3(1.00, 0.98, 0.86);

        float waterTone = smoothstep(0.2, 0.8, hgt);
        vec3 water = mix(deepSea, lightSea, waterTone);

        float sunColWidth = exp(-abs(x - sunX) * 4.0 / den);
        float sparkle = smoothstep(0.74, 0.92, hgt) * sunColWidth;
        water = mix(water, sunGlint, sparkle * 0.85);

        sky = water;
      }
      dayCol = sky;
    }

    // ─────────────────────────────────────────────────────────────────────────
    // 🌙 2. BREATHTAKING NIGHTTIME LO-FI SEASCAPE
    // ─────────────────────────────────────────────────────────────────────────
    vec3 nightCol = vec3(0.0);
    {
      // Deep Violet & Indigo Cosmic Sky
      vec3 nTop = vec3(0.02, 0.03, 0.12);
      vec3 nMid = vec3(0.09, 0.08, 0.24);
      vec3 nHor = vec3(0.16, 0.12, 0.28);
      float g = smoothstep(horizon, 1.05, y);
      vec3 sky = mix(nHor, nMid, smoothstep(0.0, 0.45, g));
      sky = mix(sky, nTop, smoothstep(0.40, 1.0, g));

      // Cosmic Purple/Cyan Nebula Dust Cloud
      float nebula = fbm(vec2(x * 0.7 + 2.0, y * 1.8 + 1.0));
      nebula = smoothstep(0.42, 0.75, nebula) * smoothstep(horizon + 0.08, horizon + 0.4, y);
      vec3 nebCol = mix(vec3(0.35, 0.15, 0.45), vec3(0.12, 0.30, 0.50), sin(x * 2.0) * 0.5 + 0.5);
      sky += nebCol * nebula * 0.35;

      // High-Precision Twinkling Starfield
      if (y > horizon) {
        sky += renderStars(uv, t, aspect);
      }

      // 🌠 Multiple Glowing Shooting Stars
      float s1 = renderMeteor(vec2(x, y), t, 0.12, aspect);
      float s2 = renderMeteor(vec2(x, y), t, 0.65, aspect);
      sky += vec3(0.92, 0.96, 1.0) * (s1 * 1.4 + s2 * 1.2);

      // 🚀 Cruising Retro Rocket with Flame
      vec4 rkt = renderRocket(vec2(x, y), t, aspect);
      sky = mix(sky, rkt.rgb, rkt.a);

      // 🌕 Luminous Glowing Moon with Bloom
      float moonX = -0.22 * aspect;
      float moonY = horizon + 0.24;
      float md = distance(vec2(x, y), vec2(moonX, moonY));
      
      // Moon core disc with crater details
      float moonDisc = smoothstep(0.048, 0.044, md);
      float craters = vnoise(vec2(x, y) * 45.0) * 0.14;
      vec3 moonSurface = vec3(0.97, 0.98, 0.94) - craters;

      // Soft Volumetric Moonlight Bloom
      float innerGlow = exp(-md * 10.0) * 0.9;
      float outerGlow = exp(-md * 3.5) * 0.45;
      vec3 moonBloom = vec3(0.65, 0.80, 1.0) * (innerGlow + outerGlow);

      sky = mix(sky + moonBloom, moonSurface, moonDisc);

      // 🌊 Shimmering Moonlit Waves
      if (y < horizon) {
        float dist = (horizon - y) + 0.012;
        float den = max(dist, 1e-4) * 0.85 + 0.06;
        vec2 w = vec2(x / den * 0.8, 0.5 / den + t * 0.42);
        
        // Multi-frequency wave swells
        float swell = fbm(w * vec2(0.6, 1.2));
        float rip = fbm(vec2(w.x * 2.0 + 5.1, w.y * 3.5 - t * 0.14));
        float hgt = swell * 0.65 + rip * 0.35;

        // Rich ocean depths
        vec3 deepNight = vec3(0.02, 0.04, 0.10);
        vec3 midNight = vec3(0.06, 0.12, 0.24);
        vec3 crestGlow = vec3(0.18, 0.32, 0.55);
        vec3 silverGlint = vec3(0.92, 0.96, 1.0);

        float waterTone = smoothstep(0.25, 0.75, hgt);
        vec3 water = mix(deepNight, midNight, waterTone);
        water = mix(water, crestGlow, smoothstep(0.65, 0.88, hgt) * 0.7);

        // 🌟 Vibrant Silver Moonlight Reflection Column
        float moonPillar = exp(-abs(x - moonX) * 2.8 / den);
        float moonSparkle = smoothstep(0.62, 0.88, hgt) * moonPillar;
        water = mix(water, silverGlint, moonSparkle * 0.95);

        sky = water;
      }

      // Distant Horizon Mountain / Coast Silhouette
      float mnt = (fbm(vec2(x * 1.8 + 5.0, 0.0)) - 0.5) * 0.028;
      float horizonRidge = smoothstep(0.003, 0.0, y - (horizon + mnt));
      if (y > horizon && y < horizon + 0.035) {
        sky = mix(sky, vec3(0.03, 0.04, 0.09), horizonRidge * 0.75);
      }

      nightCol = sky;
    }

    // ── Smooth Day / Night Crossfade ─────────────────────────────────────────
    col = mix(dayCol, nightCol, clamp(uNightMix, 0.0, 1.0));
    gl_FragColor = vec4(col, 1.0);
  }
`;

export function createBeach(container, opts = {}) {
  const scene = new THREE.Scene();
  const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
  const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'default' });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.domElement.id = 'beach-canvas';
  renderer.domElement.style.position = 'fixed';
  renderer.domElement.style.inset = '0';
  renderer.domElement.style.zIndex = '35';
  renderer.domElement.style.display = 'none';
  container.appendChild(renderer.domElement);

  const uniforms = {
    uTime: { value: 0 },
    uRes: { value: new THREE.Vector2(window.innerWidth, window.innerHeight) },
    uPointer: { value: new THREE.Vector2(0, 0) },
    uNightMix: { value: 0 },
  };

  const mat = new THREE.ShaderMaterial({ uniforms, vertexShader: VERT, fragmentShader: FRAG });
  const mesh = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), mat);
  scene.add(mesh);

  let raf = null;
  let t0 = null;

  function resize() {
    const w = window.innerWidth, h = window.innerHeight;
    renderer.setSize(w, h);
    uniforms.uRes.value.set(w, h);
  }
  window.addEventListener('resize', resize);
  resize();

  function tick(now) {
    if (t0 === null) t0 = now;
    uniforms.uTime.value = (now - t0) / 1000;
    renderer.render(scene, camera);
    raf = requestAnimationFrame(tick);
  }

  return {
    start(isNight = false) {
      uniforms.uNightMix.value = isNight ? 1.0 : 0.0;
      renderer.domElement.style.display = 'block';
      t0 = null;
      if (!raf) raf = requestAnimationFrame(tick);
    },
    stop() {
      renderer.domElement.style.display = 'none';
      if (raf) { cancelAnimationFrame(raf); raf = null; }
    },
    setNight(val) {
      uniforms.uNightMix.value = val ? 1.0 : 0.0;
    },
    setPointer(nx, ny) {
      uniforms.uPointer.value.set(nx, ny);
    },
  };
}
