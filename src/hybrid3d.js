// ──────────────────────────────────────────────────────────────────────────
// HYBRID 3D OBJECTS ENGINE: REAL 3D MESHES IN 2.5D SPACE
// ──────────────────────────────────────────────────────────────────────────

import * as THREE from 'three';
import { playRobotChime, playHoverTick } from './audio.js';

export function mountHybrid3D(px, ui, isEditMode = false) {
  if (!px || !px.scene) return null;

  const scene = px.scene;

  // ── 1. 3D Scene Lighting ──────────────────────────────────────────────────
  const ambientLight = new THREE.AmbientLight(0xfff6ea, 1.3);
  scene.add(ambientLight);

  const sunLight = new THREE.DirectionalLight(0xffe2b2, 1.4);
  sunLight.position.set(-2, 3, 2);
  scene.add(sunLight);

  const lampLight = new THREE.PointLight(0xffaa44, 0.8, 3.5);
  lampLight.position.set(-0.2, 0.1, 0.4);
  scene.add(lampLight);

  // ── 2. The Interactive 3D Low-Poly Robot Figurine ─────────────────────────
  // Coordinates in image space matching the top shelf of the bookshelf
  const ROBOT_LOC = { x: 0.272, y: 0.055, depth: 0.72 };

  const robotRoot = new THREE.Group();
  robotRoot.scale.set(0.062, 0.062, 0.062);

  // Materials
  const bodyMat = new THREE.MeshStandardMaterial({
    color: 0x4d7c9e,
    roughness: 0.35,
    metalness: 0.25,
    flatShading: true,
  });

  const darkMat = new THREE.MeshStandardMaterial({
    color: 0x223344,
    roughness: 0.5,
    flatShading: true,
  });

  const eyeMat = new THREE.MeshStandardMaterial({
    color: 0x00ffcc,
    emissive: 0x00ddbb,
    emissiveIntensity: 0.9,
    roughness: 0.2,
  });

  const accentMat = new THREE.MeshStandardMaterial({
    color: 0xe59a38,
    roughness: 0.4,
    flatShading: true,
  });

  // Torso
  const bodyGeo = new THREE.BoxGeometry(0.9, 1.0, 0.6);
  const bodyMesh = new THREE.Mesh(bodyGeo, bodyMat);
  bodyMesh.position.y = 0.5;
  robotRoot.add(bodyMesh);

  // Chest Dial / Screen
  const chestGeo = new THREE.BoxGeometry(0.55, 0.4, 0.1);
  const chestMesh = new THREE.Mesh(chestGeo, darkMat);
  chestMesh.position.set(0, 0.55, 0.32);
  robotRoot.add(chestMesh);

  // Core Light
  const coreGeo = new THREE.SphereGeometry(0.08, 8, 8);
  const coreMesh = new THREE.Mesh(coreGeo, eyeMat);
  coreMesh.position.set(0, 0.55, 0.38);
  robotRoot.add(coreMesh);

  // Head Group (Rotates with cursor)
  const headGroup = new THREE.Group();
  headGroup.position.set(0, 1.05, 0);

  const headGeo = new THREE.BoxGeometry(0.75, 0.65, 0.65);
  const headMesh = new THREE.Mesh(headGeo, bodyMat);
  headMesh.position.y = 0.325;
  headGroup.add(headMesh);

  // Visor / Eyes
  const eyeL = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.12, 0.08), eyeMat);
  eyeL.position.set(-0.16, 0.35, 0.34);
  headGroup.add(eyeL);

  const eyeR = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.12, 0.08), eyeMat);
  eyeR.position.set(0.16, 0.35, 0.34);
  headGroup.add(eyeR);

  // Antenna
  const antPole = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.35), darkMat);
  antPole.position.set(0, 0.8, 0);
  headGroup.add(antPole);

  const antTip = new THREE.Mesh(new THREE.SphereGeometry(0.08, 8, 8), accentMat);
  antTip.position.set(0, 0.98, 0);
  headGroup.add(antTip);

  robotRoot.add(headGroup);

  // Right Arm (Waving Arm)
  const rightArmGroup = new THREE.Group();
  rightArmGroup.position.set(0.52, 0.85, 0);
  const rArmMesh = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.65, 0.2), bodyMat);
  rArmMesh.position.set(0.05, -0.28, 0);
  rightArmGroup.add(rArmMesh);
  robotRoot.add(rightArmGroup);

  // Left Arm
  const leftArmGroup = new THREE.Group();
  leftArmGroup.position.set(-0.52, 0.85, 0);
  const lArmMesh = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.65, 0.2), bodyMat);
  lArmMesh.position.set(-0.05, -0.28, 0);
  leftArmGroup.add(lArmMesh);
  robotRoot.add(leftArmGroup);

  // Legs
  const legL = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.35, 0.3), darkMat);
  legL.position.set(-0.24, -0.15, 0);
  robotRoot.add(legL);

  const legR = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.35, 0.3), darkMat);
  legR.position.set(0.24, -0.15, 0);
  robotRoot.add(legR);

  scene.add(robotRoot);

  // ── 3. Coffee Mug 3D Steam Particles ──────────────────────────────────────
  const STEAM_N = 35;
  const steamGeo = new THREE.BufferGeometry();
  const steamPos = new Float32Array(STEAM_N * 3);
  const steamSizes = new Float32Array(STEAM_N);
  const steamLifes = new Float32Array(STEAM_N);

  for (let i = 0; i < STEAM_N; i++) {
    steamPos[i * 3] = (Math.random() - 0.5) * 0.04;
    steamPos[i * 3 + 1] = Math.random() * 0.12;
    steamPos[i * 3 + 2] = (Math.random() - 0.5) * 0.04;
    steamSizes[i] = 4.0 + Math.random() * 6.0;
    steamLifes[i] = Math.random();
  }

  steamGeo.setAttribute('position', new THREE.BufferAttribute(steamPos, 3));
  steamGeo.setAttribute('size', new THREE.BufferAttribute(steamSizes, 1));

  const steamMat = new THREE.PointsMaterial({
    color: 0xfff0e2,
    size: 6,
    transparent: true,
    opacity: 0.32,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  });

  const steamPoints = new THREE.Points(steamGeo, steamMat);
  scene.add(steamPoints);
  const COFFEE_LOC = { x: 0.680, y: 0.542, depth: 0.48 };

  // ── 4. Interaction State & Animations ─────────────────────────────────────
  let isHovered = false;
  let flipProgress = 0;
  let isFlipping = false;
  let eyeBlinkTimer = 0;
  let waveTimer = 0;

  // Speech Bubble Notification element
  const bubble = document.createElement('div');
  bubble.id = 'robot-bubble';
  bubble.textContent = 'Beep boop! 🤖 Welcome to the studio!';
  bubble.style.cssText = `
    position: fixed; z-index: 42; pointer-events: none; opacity: 0;
    background: rgba(36, 30, 26, 0.95); backdrop-filter: blur(8px);
    color: #00ffcc; border: 1px solid rgba(0, 255, 204, 0.4);
    font-size: 0.8rem; font-weight: 600; padding: 0.4rem 0.8rem;
    border-radius: 8px; box-shadow: 0 4px 20px rgba(0,0,0,0.5);
    transition: opacity 0.3s ease, transform 0.3s ease;
    transform: translate(-50%, -100%) scale(0.9);
  `;
  document.body.appendChild(bubble);

  let bubbleTimeout = null;
  function showBubble(text, duration = 3200) {
    if (bubbleTimeout) clearTimeout(bubbleTimeout);
    bubble.textContent = text;
    bubble.style.opacity = '1';
    bubble.style.transform = 'translate(-50%, -120%) scale(1)';
    bubbleTimeout = setTimeout(() => {
      bubble.style.opacity = '0';
      bubble.style.transform = 'translate(-50%, -100%) scale(0.9)';
    }, duration);
  }

  // Click Trigger on 3D Robot
  function triggerRobotClick() {
    if (isFlipping) return;
    isFlipping = true;
    flipProgress = 0;
    playRobotChime();
    const greetings = [
      'Beep boop! 🤖 Welcome to the studio!',
      'All systems operational! ⚡ Ready to build.',
      'Click the desk lamp to turn on night mode! 💡',
      'Did you check out the monitor screen? 🖥️',
      'Enjoying the lo-fi beats? 🎧',
    ];
    const pick = greetings[Math.floor(Math.random() * greetings.length)];
    showBubble(pick);
  }

  // Raycaster for 3D clicks & hovers
  const raycaster = new THREE.Raycaster();
  const mouseVec = new THREE.Vector2();

  window.addEventListener('pointermove', (e) => {
    mouseVec.x = (e.clientX / window.innerWidth) * 2 - 1;
    mouseVec.y = -((e.clientY / window.innerHeight) * 2 - 1);
  });

  window.addEventListener('click', (e) => {
    if (isEditMode || (ui && ui.isOpen()) || !px.camera) return;
    raycaster.setFromCamera(mouseVec, px.camera);
    
    // Check intersection with robot group meshes
    const hits = raycaster.intersectObjects(robotRoot.children, true);
    if (hits.length > 0) {
      triggerRobotClick();
    }
  });

  // ── 5. Render & Animation Update Loop ─────────────────────────────────────
  return {
    update(t) {
      const u = px.uniforms;
      if (!u) return;

      const ia = u.uImageAspect.value;
      const zoom = u.uZoomGeo.value;
      const depthScale = px.depthScale || 0.20;
      const nightMix = u.uNightMix ? u.uNightMix.value : 0;

      // Sync Lamp light with day/night switch
      lampLight.intensity = (1.0 - nightMix) * 0.4 + nightMix * 2.2;
      ambientLight.intensity = (1.0 - nightMix) * 1.3 + nightMix * 0.4;
      sunLight.intensity = (1.0 - nightMix) * 1.4 + nightMix * 0.05;

      // ── Position 3D Robot in World Space ──
      const rx = (ROBOT_LOC.x - 0.5) * ia;
      const ry = 0.5 - ROBOT_LOC.y;
      const rz = (ROBOT_LOC.depth - 0.5) * depthScale * zoom;

      robotRoot.position.set(rx, ry, rz);

      // Position speech bubble above robot
      const screenRect = px.projectImageRect({
        x: ROBOT_LOC.x - 0.02,
        y: ROBOT_LOC.y - 0.04,
        w: 0.04,
        h: 0.04,
      });
      bubble.style.left = (screenRect.x + screenRect.w / 2) + 'px';
      bubble.style.top = screenRect.y + 'px';

      // ── Robot Head Tracking Cursor ──
      const ptr = u.uPointer ? u.uPointer.value : { x: 0, y: 0 };
      const targetHeadYaw = ptr.x * 0.65;
      const targetHeadPitch = -ptr.y * 0.4;
      headGroup.rotation.y += (targetHeadYaw - headGroup.rotation.y) * 0.08;
      headGroup.rotation.x += (targetHeadPitch - headGroup.rotation.x) * 0.08;

      // Eye blink animation
      eyeBlinkTimer += 0.016;
      if (eyeBlinkTimer > 3.5) {
        eyeMat.emissiveIntensity = Math.sin(eyeBlinkTimer * 25) > 0 ? 0.9 : 0.1;
        if (eyeBlinkTimer > 3.8) {
          eyeBlinkTimer = 0;
          eyeMat.emissiveIntensity = 0.9;
        }
      }

      // Idle Arm Wave
      waveTimer += 0.025;
      if (!isFlipping) {
        rightArmGroup.rotation.z = Math.sin(waveTimer * 1.8) * 0.25 + 0.1;
        leftArmGroup.rotation.z = -Math.sin(waveTimer * 1.8) * 0.1 - 0.05;
      }

      // Flip Jump Animation on Click
      if (isFlipping) {
        flipProgress += 0.035;
        const jumpY = Math.sin(flipProgress * Math.PI) * 0.12;
        robotRoot.position.y = ry + jumpY;
        robotRoot.rotation.x = flipProgress * Math.PI * 2;
        rightArmGroup.rotation.z = 2.4;
        leftArmGroup.rotation.z = -2.4;

        if (flipProgress >= 1) {
          isFlipping = false;
          flipProgress = 0;
          robotRoot.rotation.x = 0;
          robotRoot.position.y = ry;
        }
      }

      // ── Position Coffee Mug Steam ──
      const cx = (COFFEE_LOC.x - 0.5) * ia;
      const cy = 0.5 - COFFEE_LOC.y;
      const cz = (COFFEE_LOC.depth - 0.5) * depthScale * zoom;
      steamPoints.position.set(cx, cy, cz);

      // Animate Steam Motes
      const posAttr = steamGeo.attributes.position;
      const pArr = posAttr.array;
      for (let i = 0; i < STEAM_N; i++) {
        pArr[i * 3 + 1] += 0.0018; // Rise upward
        pArr[i * 3] += Math.sin(t * 2.0 + i) * 0.0004; // Swirl X
        pArr[i * 3 + 2] += Math.cos(t * 1.8 + i) * 0.0004; // Swirl Z

        // Reset particle loop
        if (pArr[i * 3 + 1] > 0.18) {
          pArr[i * 3 + 1] = 0;
          pArr[i * 3] = (Math.random() - 0.5) * 0.03;
          pArr[i * 3 + 2] = (Math.random() - 0.5) * 0.03;
        }
      }
      posAttr.needsUpdate = true;
    },
  };
}
