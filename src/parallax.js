import * as THREE from 'three';

// ─────────────────────────────────────────────────────────────────────────────
// 2.5D Depth-Displaced Parallax & Perspective Dolly Engine
// ─────────────────────────────────────────────────────────────────────────────

const FOV = 38;             // Vertical perspective FOV (deg)
const SEG_X = 240;          // Horizontal vertex grid resolution
const SEG_Y = 140;          // Vertical vertex grid resolution
const DEPTH_SCALE = 0.20;   // 3D pop factor (plane height = 1)
const OVERSCAN = 1.00;      // 1.0 = exact cover fit
const ZOOM_IN = 0.24;       // Default dolly-in fraction for hotspots
const POINTER_LERP = 0.06;  // Mouse smoothing
const FOCUS_LERP = 0.08;    // Pan/look-at smoothing
const ZOOM_LERP = 0.06;     // Zoom dolly smoothing
const PAN_LERP = 0.15;      // Mobile pan smoothing
const TAN_HALF_FOV = Math.tan((FOV * Math.PI / 180) / 2);

const VERT = `
  precision highp float;
  varying vec2 vUv;

  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const FRAG = `
  precision highp float;
  varying vec2 vUv;
  uniform sampler2D uColor;
  uniform sampler2D uColorNight;
  uniform float uNightMix;
  uniform sampler2D uDepth;
  uniform float uStrength;
  uniform float uTime;
  uniform float uParallaxScale;
  uniform float uImageAspect;
  uniform float uHoverAmt;
  uniform vec2  uPointer;
  uniform vec2  uHoverPos;
  uniform vec4  uHoverRect; // (uMin, vMin, uMax, vMax)

  void main(){
    // Gentle organic ambient sway
    vec2 sway = vec2(sin(uTime * 0.22), cos(uTime * 0.18)) * 0.08;
    vec2 pVec = (uPointer + sway) * uStrength * uParallaxScale;

    // Edge-preserving smooth depth filtering (eliminates tearing & jagged glitch steps)
    vec2 texel = vec2(1.0 / 1920.0, 1.0 / 1080.0);
    float dCenter = texture2D(uDepth, vUv).r;
    float dL = texture2D(uDepth, vUv - vec2(texel.x * 2.5, 0.0)).r;
    float dR = texture2D(uDepth, vUv + vec2(texel.x * 2.5, 0.0)).r;
    float dU = texture2D(uDepth, vUv - vec2(0.0, texel.y * 2.5)).r;
    float dD = texture2D(uDepth, vUv + vec2(0.0, texel.y * 2.5)).r;

    // Detect depth boundaries / silhouette edges
    float edgeDiscontinuity = max(abs(dR - dL), abs(dD - dU));

    // Smooth bilateral filtering across sharp depth steps
    float dAvg = (dL + dR + dU + dD + dCenter * 2.0) / 6.0;
    float d = mix(dCenter, dAvg, clamp(edgeDiscontinuity * 3.5, 0.0, 0.8));

    // Edge-aware displacement damping: prevents jagged tearing across foreground contours
    float edgeDamping = 1.0 / (1.0 + edgeDiscontinuity * 10.0);
    vec2 uv = vUv + pVec * (d - 0.5) * edgeDamping;
    uv = clamp(uv, 0.001, 0.999);

    // Color sample with smooth day / night interpolation
    vec3 col = mix(texture2D(uColor, uv).rgb, texture2D(uColorNight, uv).rgb, uNightMix);

    // ── Silky Non-Distorting Hover Sheen (Zero pixel tearing / Zero warping) ──
    if (uHoverAmt > 0.001) {
      vec2 a = vec2(vUv.x * uImageAspect, vUv.y);
      vec2 h = vec2(uHoverPos.x * uImageAspect, uHoverPos.y);
      float dist = length(a - h);
      
      // Soft radial falloff within bounding box
      vec2 rp = (vUv - uHoverRect.xy) / max(uHoverRect.zw - uHoverRect.xy, vec2(1e-4));
      float fth = 0.25;
      float fx = smoothstep(0.0, fth, rp.x) * (1.0 - smoothstep(1.0 - fth, 1.0, rp.x));
      float fy = smoothstep(0.0, fth, rp.y) * (1.0 - smoothstep(1.0 - fth, 1.0, rp.y));
      float boxFade = clamp(fx * fy, 0.0, 1.0);

      float sheenFalloff = exp(-dist * dist * 14.0) * uHoverAmt * boxFade;
      float breathe = 0.92 + 0.08 * sin(uTime * 3.0);
      col += sheenFalloff * breathe * 0.08 * vec3(1.0, 0.95, 0.88);
    }

    gl_FragColor = vec4(col, 1.0);
  }
`;

// ── Sunbeam Floating Dust Particles ──────────────────────────────────────────
const DUST_VERT = `
  attribute float aSize;
  attribute float aSpeed;
  uniform float uTime, uImageAspect, uPixelRatio, uZoomScale;
  varying highp float vSeed;
  varying vec2 vUvAnchor;

  void main() {
    vec2 anchor = position.xy;
    float seed = position.z;
    float ph = seed * 6.2831;
    vec2 wob = 0.06 * vec2(sin(uTime * aSpeed + ph), cos(uTime * aSpeed * 0.8 + ph * 1.7));
    vec2 buv = anchor + wob;
    vUvAnchor = buv;
    vec3 wpos = vec3((buv.x - 0.5) * uImageAspect, buv.y - 0.5, 0.0);
    gl_Position = projectionMatrix * modelViewMatrix * vec4(wpos, 1.0);
    gl_PointSize = max(aSize, 2.0) * uPixelRatio * uZoomScale;
    vSeed = seed;
  }
`;

const DUST_FRAG = `
  precision highp float;
  varying highp float vSeed;
  varying vec2 vUvAnchor;
  uniform float uTime, uUseMask, uNightMix;
  uniform sampler2D uColor, uSunMask;

  void main() {
    float d = length(gl_PointCoord - 0.5) * 2.0;
    float a = smoothstep(1.0, 0.0, d);
    float tw = 0.6 + 0.4 * sin(uTime * 0.8 + vSeed * 30.0);
    float lum = dot(texture2D(uColor, vUvAnchor).rgb, vec3(0.299, 0.587, 0.114));
    float gate = mix(smoothstep(0.5, 0.78, lum), texture2D(uSunMask, vUvAnchor).r, uUseMask);
    gate *= 1.0 - 0.85 * uNightMix; // Motes dim at night
    gl_FragColor = vec4(vec3(1.0, 0.96, 0.86), a * tw * 0.85 * gate);
  }
`;

// ── Bioluminescent Nighttime Fireflies ───────────────────────────────────────
const FIREFLY_VERT = `
  attribute float aSize;
  attribute float aSpeed;
  attribute float aDepth;
  attribute float aTint;
  uniform float uTime, uImageAspect, uPixelRatio, uZoomScale, uDepthScale, uZoomGeo;
  varying float vPulse;
  varying float vTint;

  void main() {
    vec2 anchor = position.xy;
    float seed = position.z;
    float ph = seed * 6.283185;

    // Organic 3D drifting & wandering motion
    float t = uTime * (0.35 + aSpeed * 0.35);
    vec2 wander = vec2(
      sin(t + ph) * 0.09 + cos(t * 0.55 + ph * 1.7) * 0.045,
      cos(t * 0.85 + ph * 1.3) * 0.07 + sin(t * 0.42 + ph * 2.1) * 0.035
    );
    vec2 p2 = anchor + wander;

    float z = (aDepth - 0.5) * uDepthScale * uZoomGeo + sin(t * 0.7 + ph) * 0.035;
    vec3 wpos = vec3((p2.x - 0.5) * uImageAspect, p2.y - 0.5, z);

    gl_Position = projectionMatrix * modelViewMatrix * vec4(wpos, 1.0);
    gl_PointSize = max(aSize, 14.0) * uPixelRatio * uZoomScale;

    // Bioluminescent glow pulse with occasional bright flicker
    float pulse = pow(sin(uTime * (1.1 + aSpeed * 1.8) + ph * 3.0) * 0.5 + 0.5, 2.0);
    float flicker = sin(uTime * 18.0 + ph * 20.0) > 0.96 ? 1.3 : 1.0;
    vPulse = pulse * flicker;
    vTint = aTint;
  }
`;

const FIREFLY_FRAG = `
  precision highp float;
  varying float vPulse;
  varying float vTint;
  uniform float uNightMix;

  void main() {
    float d = length(gl_PointCoord - 0.5) * 2.0;
    if (d > 1.0) discard;

    // Core point + soft volumetric glowing aura
    float core = smoothstep(0.35, 0.0, d);
    float glow = exp(-d * 2.4) * (1.0 - d);
    float a = (core * 0.85 + glow * 0.75) * vPulse * uNightMix;

    // Color gradient: warm golden-lime to soft mint-cyan
    vec3 lime = vec3(0.85, 1.0, 0.32);
    vec3 cyan = vec3(0.35, 1.0, 0.85);
    vec3 col = mix(lime, cyan, vTint) * 1.25;

    gl_FragColor = vec4(col, a);
  }
`;

export function createParallax(container, opts) {
  const {
    colorURL, depthURL, maskURL, nightURL, fallbackColor, fallbackDepth,
    aspect = 16 / 9, strength = 0.024,
  } = opts;

  const makeRenderer = (params) => {
    const r = new THREE.WebGLRenderer(params);
    if (!r.getContext()) throw new Error('No WebGL context');
    return r;
  };

  let renderer;
  try {
    renderer = makeRenderer({ antialias: true, powerPreference: 'high-performance' });
  } catch (e) {
    try {
      renderer = makeRenderer({ antialias: false, powerPreference: 'default' });
    } catch (e2) {
      return { ok: false, error: e2 };
    }
  }

  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.outputColorSpace = THREE.LinearSRGBColorSpace;
  container.appendChild(renderer.domElement);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(FOV, 1, 0.01, 100);
  const canVTF = renderer.capabilities.vertexTextures;

  const uniforms = {
    uColor: { value: null },
    uColorNight: { value: null },
    uNightMix: { value: 0 },
    uDepth: { value: null },
    uImageAspect: { value: aspect },
    uViewAspect: { value: 1 },
    uDepthScale: { value: canVTF ? DEPTH_SCALE : 0.0 },
    uZoomGeo: { value: 0 },
    uStrength: { value: strength },
    uTime: { value: 0 },
    uPointer: { value: new THREE.Vector2(0, 0) },
    uParallaxScale: { value: 1 },
    uHoverAmt: { value: 0 },
    uHoverPos: { value: new THREE.Vector2(0.5, 0.5) },
    uHoverRect: { value: new THREE.Vector4(0, 0, 0, 0) },
  };

  const placeholderTex = new THREE.DataTexture(new Uint8Array([0, 0, 0, 255]), 1, 1);
  placeholderTex.needsUpdate = true;
  uniforms.uColorNight.value = placeholderTex;

  const grayDepth = new THREE.DataTexture(new Uint8Array([128, 128, 128, 255]), 1, 1);
  grayDepth.needsUpdate = true;
  uniforms.uDepth.value = grayDepth;

  const material = new THREE.ShaderMaterial({ uniforms, vertexShader: VERT, fragmentShader: FRAG });
  const geo = new THREE.PlaneGeometry(1, 1, SEG_X, SEG_Y);
  const mesh = new THREE.Mesh(geo, material);
  mesh.scale.set(aspect, 1, 1);
  scene.add(mesh);

  // ── Dust Particle Layer ──────────────────────────────────────────────────
  const DUST_N = 160;
  const dpos = new Float32Array(DUST_N * 3);
  const dsize = new Float32Array(DUST_N);
  const dspeed = new Float32Array(DUST_N);
  for (let i = 0; i < DUST_N; i++) {
    dpos[i * 3]     = Math.random();
    dpos[i * 3 + 1] = Math.random();
    dpos[i * 3 + 2] = Math.random();
    dsize[i]  = 3.0 + Math.random() * 2.5;
    dspeed[i] = (0.07 + Math.random() * 0.10) * 0.8;
  }
  const dgeo = new THREE.BufferGeometry();
  dgeo.setAttribute('position', new THREE.BufferAttribute(dpos, 3));
  dgeo.setAttribute('aSize', new THREE.BufferAttribute(dsize, 1));
  dgeo.setAttribute('aSpeed', new THREE.BufferAttribute(dspeed, 1));

  const whiteMask = new THREE.DataTexture(new Uint8Array([255, 255, 255, 255]), 1, 1);
  whiteMask.needsUpdate = true;
  const dustUniforms = {
    uTime: { value: 0 },
    uImageAspect: uniforms.uImageAspect,
    uPixelRatio: { value: Math.min(window.devicePixelRatio, 2) },
    uZoomScale: { value: 1 },
    uColor: uniforms.uColor,
    uSunMask: { value: whiteMask },
    uUseMask: { value: 0 },
    uNightMix: uniforms.uNightMix,
  };
  const dust = new THREE.Points(dgeo, new THREE.ShaderMaterial({
    uniforms: dustUniforms,
    vertexShader: DUST_VERT,
    fragmentShader: DUST_FRAG,
    transparent: true,
    depthTest: false,
    depthWrite: false,
    blending: THREE.NormalBlending,
  }));
  dust.frustumCulled = false;
  scene.add(dust);

  // ── Bioluminescent Nighttime Fireflies Layer ──────────────────────────────
  const FIREFLIES_N = 36;
  const fpos = new Float32Array(FIREFLIES_N * 3);
  const fsize = new Float32Array(FIREFLIES_N);
  const fspeed = new Float32Array(FIREFLIES_N);
  const fdepth = new Float32Array(FIREFLIES_N);
  const ftint = new Float32Array(FIREFLIES_N);

  for (let i = 0; i < FIREFLIES_N; i++) {
    fpos[i * 3]     = 0.08 + Math.random() * 0.84;
    fpos[i * 3 + 1] = 0.15 + Math.random() * 0.70;
    fpos[i * 3 + 2] = Math.random();
    fsize[i]  = 16.0 + Math.random() * 10.0;
    fspeed[i] = 0.35 + Math.random() * 0.65;
    fdepth[i] = 0.25 + Math.random() * 0.60;
    ftint[i]  = Math.random();
  }

  const fgeo = new THREE.BufferGeometry();
  fgeo.setAttribute('position', new THREE.BufferAttribute(fpos, 3));
  fgeo.setAttribute('aSize', new THREE.BufferAttribute(fsize, 1));
  fgeo.setAttribute('aSpeed', new THREE.BufferAttribute(fspeed, 1));
  fgeo.setAttribute('aDepth', new THREE.BufferAttribute(fdepth, 1));
  fgeo.setAttribute('aTint', new THREE.BufferAttribute(ftint, 1));

  const fireflyUniforms = {
    uTime: { value: 0 },
    uImageAspect: uniforms.uImageAspect,
    uPixelRatio: { value: Math.min(window.devicePixelRatio, 2) },
    uZoomScale: { value: 1 },
    uZoomGeo: { value: 0 },
    uDepthScale: { value: DEPTH_SCALE },
    uNightMix: uniforms.uNightMix,
  };

  const fireflies = new THREE.Points(fgeo, new THREE.ShaderMaterial({
    uniforms: fireflyUniforms,
    vertexShader: FIREFLY_VERT,
    fragmentShader: FIREFLY_FRAG,
    transparent: true,
    depthTest: false,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  }));
  fireflies.frustumCulled = false;
  scene.add(fireflies);

  // ── State Variables ──────────────────────────────────────────────────────
  const pt = new THREE.Vector2(), ptTarget = new THREE.Vector2();
  const focus = new THREE.Vector2(0, 0), focusTarget = new THREE.Vector2(0, 0);
  let zoom = 0, zoomTarget = 0;
  let dolly = ZOOM_IN, dollyTarget = ZOOM_IN;
  let zoomLerp = ZOOM_LERP;
  let hoverAmt = 0, hoverAmtTarget = 0;
  const hoverPos = new THREE.Vector2(0.5, 0.5), hoverPosTarget = new THREE.Vector2(0.5, 0.5);
  let restDist = 2;
  let panX = 0, panTarget = 0, panLerp = PAN_LERP;
  let night = 0, nightTarget = 0, nightLoaded = false;

  function frame() {
    const w = window.innerWidth, h = window.innerHeight;
    renderer.setSize(w, h);
    const va = w / h, ia = uniforms.uImageAspect.value;
    camera.aspect = va;
    camera.updateProjectionMatrix();
    uniforms.uViewAspect.value = va;
    const coverVh = (va > ia) ? ia / va : 1.0;
    const visVh = coverVh / OVERSCAN;
    restDist = visVh / (2 * Math.tan((FOV * Math.PI / 180) / 2));
    const m = panLimit();
    panTarget = Math.max(-m, Math.min(m, panTarget));
  }
  window.addEventListener('resize', frame);
  frame();

  // ── Texture Loading ──────────────────────────────────────────────────────
  const loader = new THREE.TextureLoader();
  let readyCb = null, isReady = false, colorDone = false, depthDone = false;
  const checkReady = () => { if (colorDone && !isReady) { isReady = true; readyCb && readyCb(); } };

  const setColor = (tex, isImage) => {
    tex.colorSpace = THREE.NoColorSpace;
    tex.minFilter = THREE.LinearFilter; tex.magFilter = THREE.LinearFilter;
    if (isImage && tex.image) {
      uniforms.uImageAspect.value = tex.image.width / tex.image.height;
      mesh.scale.x = uniforms.uImageAspect.value;
      frame();
    }
    uniforms.uColor.value = tex;
    colorDone = true;
    checkReady();
    if (!nightLoaded) uniforms.uColorNight.value = tex;
  };

  const setColorNight = (tex) => {
    tex.colorSpace = THREE.NoColorSpace;
    tex.minFilter = THREE.LinearFilter; tex.magFilter = THREE.LinearFilter;
    uniforms.uColorNight.value = tex;
    nightLoaded = true;
  };

  const setDepth = (tex) => {
    tex.colorSpace = THREE.NoColorSpace;
    tex.minFilter = THREE.LinearFilter; tex.magFilter = THREE.LinearFilter;
    uniforms.uDepth.value = tex;
    depthDone = true;
    checkReady();
  };

  loader.load(colorURL, (t) => setColor(t, true), undefined, () => setColor(new THREE.CanvasTexture(fallbackColor), false));
  loader.load(depthURL, (t) => setDepth(t), undefined, () => setDepth(new THREE.CanvasTexture(fallbackDepth)));

  let nightRequested = false;
  const loadNight = () => {
    if (nightRequested || !nightURL) return;
    nightRequested = true;
    loader.load(nightURL, setColorNight, undefined, () => {});
  };

  if (maskURL) {
    loader.load(maskURL, (t) => {
      t.colorSpace = THREE.NoColorSpace;
      t.minFilter = THREE.LinearFilter; t.magFilter = THREE.LinearFilter;
      dustUniforms.uSunMask.value = t;
      dustUniforms.uUseMask.value = 1;
    }, undefined, () => {});
  }

  // ── Public API ───────────────────────────────────────────────────────────
  const setPointer = (nx, ny) => ptTarget.set(nx, ny);

  const zoomTo = (fx, fy, depth = ZOOM_IN, lerp = ZOOM_LERP) => {
    focusTarget.set((fx - 0.5) * uniforms.uImageAspect.value, 0.5 - fy);
    zoomTarget = 1;
    dollyTarget = depth;
    zoomLerp = lerp;
  };

  const zoomOut = () => {
    zoomTarget = 0;
    focusTarget.set(0, 0);
    dollyTarget = ZOOM_IN;
  };

  const zoomValue = () => zoom;

  const setNight = (on) => { nightTarget = on ? 1 : 0; };
  const toggleNight = () => { nightTarget = nightTarget > 0.5 ? 0 : 1; return nightTarget > 0.5; };
  const isNight = () => nightTarget > 0.5;

  function panLimit() {
    const visHalfX = restDist * TAN_HALF_FOV * uniforms.uViewAspect.value;
    return Math.max(0, uniforms.uImageAspect.value / 2 - visHalfX);
  }
  const canPan = () => panLimit() > 0.002;
  const panMax = () => panLimit();
  const worldPerPx = () => (2 * restDist * TAN_HALF_FOV * uniforms.uViewAspect.value) / window.innerWidth;
  const getPan = () => panTarget;
  const setPan = (wx, lerp) => {
    const m = panLimit();
    panTarget = Math.max(-m, Math.min(m, wx));
    panLerp = (lerp == null) ? PAN_LERP : lerp;
  };
  const panShiftPx = () => -panX / worldPerPx();

  const setHover = (u, v, uMin, vMin, uMax, vMax) => {
    const rect = uniforms.uHoverRect.value;
    const changed = rect.x !== uMin || rect.y !== vMin || rect.z !== uMax || rect.w !== vMax;
    if (hoverAmt < 0.01 || changed) hoverPos.set(u, v);
    rect.set(uMin, vMin, uMax, vMax);
    hoverAmtTarget = 1;
    hoverPosTarget.set(u, v);
  };
  const clearHover = () => { hoverAmtTarget = 0; };

  function coverRect() {
    const W = window.innerWidth, H = window.innerHeight;
    const ia = uniforms.uImageAspect.value, va = W / H;
    let w, h;
    if (va > ia) { w = W; h = W / ia; } else { h = H; w = H * ia; }
    w *= OVERSCAN; h *= OVERSCAN;
    return { x: (W - w) / 2, y: (H - h) / 2, w, h };
  }

  const _pv = new THREE.Vector3();
  function projectImageRect(box) {
    const ia = uniforms.uImageAspect.value, W = window.innerWidth, H = window.innerHeight;
    const x0 = (box.x - 0.5) * ia;
    const x1 = (box.x + box.w - 0.5) * ia;
    const yTop = 0.5 - box.y;
    const yBot = 0.5 - box.y - box.h;
    camera.updateMatrixWorld();
    const toPx = (wx, wy) => {
      _pv.set(wx, wy, 0).project(camera);
      return { x: (_pv.x * 0.5 + 0.5) * W, y: (1 - (_pv.y * 0.5 + 0.5)) * H };
    };
    const tl = toPx(x0, yTop), br = toPx(x1, yBot);
    return { x: tl.x, y: tl.y, w: br.x - tl.x, h: br.y - tl.y };
  }

  const _tgt = new THREE.Vector3();
  function render(tSeconds) {
    pt.lerp(ptTarget, POINTER_LERP);
    focus.lerp(focusTarget, FOCUS_LERP);
    zoom += (zoomTarget - zoom) * zoomLerp;
    dolly += (dollyTarget - dolly) * zoomLerp;
    uniforms.uPointer.value.copy(pt);
    uniforms.uTime.value = tSeconds;
    uniforms.uZoomGeo.value = zoom;
    uniforms.uParallaxScale.value = 1.0 - 0.7 * zoom;

    hoverAmt += (hoverAmtTarget - hoverAmt) * 0.12;
    hoverPos.lerp(hoverPosTarget, 0.18);
    uniforms.uHoverAmt.value = hoverAmt;
    uniforms.uHoverPos.value.copy(hoverPos);

    const camDist = restDist * (1.0 - dolly * zoom);
    const visHalfY = camDist * TAN_HALF_FOV;
    const visHalfX = visHalfY * uniforms.uViewAspect.value;
    const maxX = Math.max(0, uniforms.uImageAspect.value / 2 - visHalfX);
    const maxY = Math.max(0, 0.5 - visHalfY);

    panX += (panTarget - panX) * panLerp;
    night += (nightTarget - night) * 0.05;
    uniforms.uNightMix.value = night;

    const fx = Math.max(-maxX, Math.min(maxX, focus.x + panX * (1 - zoom)));
    const fy = Math.max(-maxY, Math.min(maxY, focus.y));
    _tgt.set(fx, fy, 0);
    camera.position.set(fx, fy, camDist);
    camera.lookAt(_tgt);

    dustUniforms.uTime.value = tSeconds;
    dustUniforms.uZoomScale.value = restDist / camDist;

    fireflyUniforms.uTime.value = tSeconds;
    fireflyUniforms.uZoomScale.value = restDist / camDist;
    fireflyUniforms.uZoomGeo.value = zoom;

    renderer.render(scene, camera);
  }

  function onReady(cb) { readyCb = cb; if (isReady) cb(); }

  return {
    ok: true,
    renderer,
    camera,
    scene,
    depthScale: DEPTH_SCALE,
    setPointer,
    zoomTo,
    zoomOut,
    zoomValue,
    setHover,
    clearHover,
    coverRect,
    projectImageRect,
    render,
    onReady,
    uniforms,
    canPan,
    worldPerPx,
    getPan,
    setPan,
    panShiftPx,
    panMax,
    setNight,
    toggleNight,
    isNight,
    loadNight,
  };
}
