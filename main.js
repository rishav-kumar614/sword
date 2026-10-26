import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';

/* ==========================================================================
   VESPER — Luxury Sword Experience
   Plain Vanilla Three.js + Lenis Scroll-Driven Rig
   ========================================================================== */

const canvas = document.getElementById('webgl-canvas');
const loaderOverlay = document.getElementById('loaderOverlay');
const loaderCounter = document.getElementById('loaderCounter');
const loaderBar = document.getElementById('loaderBar');
const cursorDot = document.getElementById('cursorDot');
const railNumber = document.getElementById('railNumber');
const railFill = document.getElementById('railFill');
const railName = document.getElementById('railName');
const seatedFill = document.getElementById('seatedFill');
const seatedCounter = document.getElementById('seatedCounter');
const returnH2 = document.getElementById('returnH2');
const returnSub = document.getElementById('returnSub');
const returnEyebrow = document.getElementById('returnEyebrow');

const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ==========================================================================
   1. Three.js Scene, Camera & Strict Rendering Setup
   ========================================================================== */
const scene = new THREE.Scene();

const camera = new THREE.PerspectiveCamera(40, window.innerWidth / window.innerHeight, 0.1, 50);
camera.position.set(0, 0, 5.2);

const renderer = new THREE.WebGLRenderer({
  canvas: canvas,
  alpha: true,
  antialias: true,
  powerPreference: 'high-performance'
});

renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
renderer.setSize(window.innerWidth, window.innerHeight);

// Strict Requirement: NoToneMapping; RoomEnvironment via PMREMGenerator at intensity 1; NO OTHER LIGHTS.
renderer.toneMapping = THREE.NoToneMapping;
const pmremGenerator = new THREE.PMREMGenerator(renderer);
scene.environment = pmremGenerator.fromScene(new RoomEnvironment(), 0.04).texture;
scene.environmentIntensity = 1.0;

/* ==========================================================================
   2. Procedural Sumi-e Red Ink Splash (1024px Canvas)
   ========================================================================== */
function createSumiESplashTexture() {
  const c = document.createElement('canvas');
  c.width = 1024;
  c.height = 1024;
  const ctx = c.getContext('2d');

  ctx.clearRect(0, 0, 1024, 1024);

  // Authentic Japanese lacquer garnet & crimson palette (#76050e to #c41522)
  const colors = [
    'rgba(118, 6, 14, 0.96)',   // Deepest garnet core
    'rgba(148, 10, 20, 0.90)',  // Rich crimson
    'rgba(174, 14, 26, 0.82)',  // Vibrant blood red
    'rgba(196, 20, 32, 0.70)'   // Fine vermilion accent
  ];

  // Draw 52 overlapping fibrous bristles along the master katana slash curve
  const numStrokes = 52;
  const indices = Array.from({ length: numStrokes }, (_, i) => i);
  // Pseudo-random shuffle for natural layered blending
  for (let i = indices.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [indices[i], indices[j]] = [indices[j], indices[i]];
  }

  for (const i of indices) {
    const rel = (i - numStrokes / 2.0) / (numStrokes / 2.0); // -1.0 to 1.0
    const distFromCenter = Math.abs(rel);

    let col = colors[0];
    if (distFromCenter > 0.75) {
      col = colors[3];
    } else if (distFromCenter > 0.45) {
      col = colors[2];
    } else if (distFromCenter > 0.2) {
      col = colors[1];
    }

    const maxH = 78.0; // Swells to ~156px in center
    const hOffset = rel * maxH + (Math.random() - 0.5) * 6.0;

    const tStart = Math.max(0.0, distFromCenter * 0.16 + (Math.random() - 0.5) * 0.08);
    const tEnd = Math.min(1.0, 1.0 - distFromCenter * 0.20 + (Math.random() - 0.5) * 0.1);
    const strokeW = 3.5 + Math.random() * 3.5; // 3.5 to 7.0px bristles

    const steps = 160;
    let prevX = null, prevY = null;
    let isSkipping = false;
    let skipRemaining = 0;

    for (let s = 0; s <= steps; s++) {
      const t = s / steps;
      if (t < tStart || t > tEnd) {
        prevX = null;
        prevY = null;
        continue;
      }

      // Smooth flowing katana arc
      const x = 120.0 + t * 780.0;
      const arc = Math.sin(t * Math.PI) * -26.0 + (t - 0.5) * 12.0;
      const y = 512.0 + arc;

      // Brush swell envelope (widest in mid body)
      const swell = Math.pow(Math.sin(t * Math.PI), 0.55);
      const curOffset = hOffset * (0.3 + 0.7 * swell);

      // Micro-jitter of hair strands
      const jitter = Math.sin(t * 32.0 + i * 4.2) * 1.8 + (Math.random() - 0.5) * 1.2;
      const px = x + jitter * 0.25;
      const py = y + curOffset + jitter;

      // Dry brush skipping (kasure) toward ends
      let dryness = 0.0;
      if (t > 0.62) {
        dryness = (t - 0.62) / 0.38;
      } else if (t < 0.22) {
        dryness = (0.22 - t) / 0.22;
      }

      if (dryness > 0.15 && !isSkipping) {
        if (Math.random() < dryness * 0.42) {
          isSkipping = true;
          skipRemaining = 2 + Math.floor(Math.random() * 4);
        }
      }

      if (isSkipping) {
        skipRemaining--;
        if (skipRemaining <= 0) isSkipping = false;
        prevX = null;
        prevY = null;
        continue;
      }

      if (prevX !== null) {
        ctx.strokeStyle = col;
        ctx.lineWidth = strokeW;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(prevX, prevY);
        ctx.lineTo(px, py);
        ctx.stroke();
      }

      prevX = px;
      prevY = py;
    }
  }

  // ~7 Master Calligraphic Flicks (dynamic curved whips tapering to sharp points)
  const flicks = [
    { x: 830, y: 498, ang: -14, len: 150, curv: 16, w: 4.5 },
    { x: 860, y: 514, ang: 2, len: 175, curv: -12, w: 5.0 },
    { x: 815, y: 532, ang: 20, len: 135, curv: -22, w: 4.0 },
    { x: 510, y: 442, ang: -58, len: 120, curv: 28, w: 4.2 },
    { x: 580, y: 448, ang: -42, len: 105, curv: -18, w: 3.5 },
    { x: 480, y: 565, ang: 65, len: 130, curv: -25, w: 4.2 },
    { x: 220, y: 508, ang: -150, len: 95, curv: 16, w: 3.8 }
  ];

  for (const f of flicks) {
    const rad = (f.ang * Math.PI) / 180.0;
    const fSteps = 35;
    let prevFx = f.x, prevFy = f.y;

    for (let step = 1; step <= fSteps; step++) {
      const p = step / fSteps;
      const dist = p * f.len;
      const cDisp = Math.sin(p * Math.PI) * f.curv;
      const normRad = rad + Math.PI / 2;
      const fx = f.x + Math.cos(rad) * dist + Math.cos(normRad) * cDisp;
      const fy = f.y + Math.sin(rad) * dist + Math.sin(normRad) * cDisp;

      const curW = Math.max(0.8, f.w * (1.0 - p * 0.92));
      ctx.strokeStyle = colors[0];
      ctx.lineWidth = curW;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(prevFx, prevFy);
      ctx.lineTo(fx, fy);
      ctx.stroke();

      prevFx = fx;
      prevFy = fy;
    }
  }

  // A few tiny specks (only 14, 1-2px, trailing along the stroke)
  for (let s = 0; s < 14; s++) {
    const t = 0.38 + Math.random() * 0.56;
    const sx = 120.0 + t * 780.0;
    const sy = 512.0 + Math.sin(t * Math.PI) * -26.0 + (t - 0.5) * 12.0;
    const dispDist = 45 + Math.random() * 85;
    const dispAng = (Math.random() > 0.5 ? 1 : -1) * (0.4 + Math.random() * 0.9);
    const px = sx + Math.cos(dispAng) * dispDist;
    const py = sy + Math.sin(dispAng) * dispDist;
    const sz = 1.0 + Math.random() * 1.2;

    ctx.fillStyle = colors[1];
    ctx.beginPath();
    ctx.arc(px, py, sz, 0, Math.PI * 2);
    ctx.fill();
  }

  const texture = new THREE.CanvasTexture(c);
  texture.needsUpdate = true;
  return texture;
}

const splashTexture = createSumiESplashTexture();
const splashMaterial = new THREE.MeshBasicMaterial({
  map: splashTexture,
  transparent: true,
  depthWrite: false,
  opacity: 0.98
});
const splashMesh = new THREE.Mesh(new THREE.PlaneGeometry(7.2, 7.2), splashMaterial);
splashMesh.position.set(0, 0, -4);
scene.add(splashMesh);

/* ==========================================================================
   3. Giant 3D Canvas-Texture Text Planes ("Vesper" & "Return")
   ========================================================================== */
function renderTextToCanvas(c, text, isItalic = false) {
  const ctx = c.getContext('2d');
  ctx.clearRect(0, 0, c.width, c.height);
  ctx.fillStyle = '#f3f2ef';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.font = `${isItalic ? 'italic' : 'normal'} 340px "Instrument Serif", Georgia, serif`;
  ctx.fillText(text, c.width / 2, c.height / 2);
}

function createTextPlane(text, isItalic = false) {
  const c = document.createElement('canvas');
  c.width = 2048;
  c.height = 768;
  renderTextToCanvas(c, text, isItalic);

  const tex = new THREE.CanvasTexture(c);
  tex.needsUpdate = true;

  const mat = new THREE.MeshBasicMaterial({
    map: tex,
    transparent: true,
    depthWrite: false,
    opacity: 1
  });

  const aspect = c.width / c.height;
  const height = 2.6;
  const mesh = new THREE.Mesh(new THREE.PlaneGeometry(height * aspect, height), mat);
  mesh.position.set(0, 0, -2);
  return { mesh, mat, canvas: c, tex, text, isItalic };
}

const vesperPlaneObj = createTextPlane('Vesper', false);
const returnPlaneObj = createTextPlane('Return', true);

scene.add(vesperPlaneObj.mesh);
scene.add(returnPlaneObj.mesh);

vesperPlaneObj.mesh.position.set(0, 0, -2);
returnPlaneObj.mesh.position.set(0, 0, -2);
vesperPlaneObj.mat.opacity = 1.0;
returnPlaneObj.mat.opacity = 0.0;

// Re-render text planes once web fonts finish loading to ensure Instrument Serif
if (document.fonts) {
  document.fonts.ready.then(() => {
    renderTextToCanvas(vesperPlaneObj.canvas, 'Vesper', false);
    vesperPlaneObj.tex.needsUpdate = true;
    renderTextToCanvas(returnPlaneObj.canvas, 'Return', true);
    returnPlaneObj.tex.needsUpdate = true;
  });
}

/* ==========================================================================
   4. Complete 3D Orthonormal PCA Frame Alignment
   ========================================================================== */
const swordRig = new THREE.Group();
scene.add(swordRig);

// Dedicated sway group for additive mouse tilt & ambient breathing
const swayGroup = new THREE.Group();
swordRig.add(swayGroup);

const sheathedGroup = new THREE.Group();
const scabbardGroup = new THREE.Group();
const bladeGroup = new THREE.Group();

swayGroup.add(sheathedGroup);
swayGroup.add(scabbardGroup);
swayGroup.add(bladeGroup);

let seatOffset = 0.3424;
let bladeScale = 1.9835;
let scabbardScale = 1.7702;
let sheathedScale = 2.1598;

/**
 * Full 3D Orthonormal PCA Alignment:
 * - v_long (v3) -> +Y (hilt/mouth on top)
 * - v_wide (v2) -> +X (crossguard)
 * - v_norm (v1) -> +Z (facing camera directly)
 * Applies matrix to root object and centers bounding box.
 */
function alignModelFullPCA(object3D) {
  const positions = [];
  object3D.traverse(child => {
    if (child.isMesh && child.geometry && child.geometry.attributes.position) {
      const pos = child.geometry.attributes.position;
      const mw = child.matrixWorld;
      const v = new THREE.Vector3();
      const stride = Math.max(1, Math.floor(pos.count / 4000));
      for (let i = 0; i < pos.count; i += stride) {
        v.fromBufferAttribute(pos, i).applyMatrix4(mw);
        positions.push(v.x, v.y, v.z);
      }
    }
  });

  const N = positions.length / 3;
  let mx = 0, my = 0, mz = 0;
  for (let i = 0; i < positions.length; i += 3) {
    mx += positions[i];
    my += positions[i + 1];
    mz += positions[i + 2];
  }
  mx /= N; my /= N; mz /= N;

  // Covariance matrix
  let cxx = 0, cxy = 0, cxz = 0;
  let cyy = 0, cyz = 0, czz = 0;
  for (let i = 0; i < positions.length; i += 3) {
    const dx = positions[i] - mx;
    const dy = positions[i + 1] - my;
    const dz = positions[i + 2] - mz;
    cxx += dx * dx; cxy += dx * dy; cxz += dx * dz;
    cyy += dy * dy; cyz += dy * dz; czz += dz * dz;
  }
  cxx /= N; cxy /= N; cxz /= N; cyy /= N; cyz /= N; czz /= N;

  // 1. Dominant long axis (v_long) via power iteration
  let v_long = new THREE.Vector3(1, 1, 1).normalize();
  for (let iter = 0; iter < 30; iter++) {
    const nx = cxx * v_long.x + cxy * v_long.y + cxz * v_long.z;
    const ny = cxy * v_long.x + cyy * v_long.y + cyz * v_long.z;
    const nz = cxz * v_long.x + cyz * v_long.y + czz * v_long.z;
    v_long.set(nx, ny, nz).normalize();
  }

  // 2. Deflate covariance matrix to find second dominant axis (crossguard v_wide)
  const l1 = v_long.x * (cxx * v_long.x + cxy * v_long.y + cxz * v_long.z) +
             v_long.y * (cxy * v_long.x + cyy * v_long.y + cyz * v_long.z) +
             v_long.z * (cxz * v_long.x + cyz * v_long.y + czz * v_long.z);

  const dxx = cxx - l1 * v_long.x * v_long.x;
  const dxy = cxy - l1 * v_long.x * v_long.y;
  const dxz = cxz - l1 * v_long.x * v_long.z;
  const dyy = cyy - l1 * v_long.y * v_long.y;
  const dyz = cyz - l1 * v_long.y * v_long.z;
  const dzz = czz - l1 * v_long.z * v_long.z;

  let v_wide = new THREE.Vector3(0, 1, 0).cross(v_long);
  if (v_wide.lengthSq() < 0.01) v_wide.set(1, 0, 0).cross(v_long);
  v_wide.normalize();

  for (let iter = 0; iter < 30; iter++) {
    let nx = dxx * v_wide.x + dxy * v_wide.y + dxz * v_wide.z;
    let ny = dxy * v_wide.x + dyy * v_wide.y + dyz * v_wide.z;
    let nz = dxz * v_wide.x + dyz * v_wide.y + dzz * v_wide.z;
    v_wide.set(nx, ny, nz);
    // Project out v_long
    v_wide.addScaledVector(v_long, -v_wide.dot(v_long)).normalize();
  }

  // 3. Orient v_long so hilt/mouth is on +Y (widest slice in upper half)
  let projMin = Infinity, projMax = -Infinity;
  for (let i = 0; i < positions.length; i += 3) {
    const p = (positions[i] - mx) * v_long.x + (positions[i + 1] - my) * v_long.y + (positions[i + 2] - mz) * v_long.z;
    if (p < projMin) projMin = p;
    if (p > projMax) projMax = p;
  }

  let countMin = 0, countMax = 0;
  let spreadMin = 0, spreadMax = 0;
  const pRange = projMax - projMin;

  for (let i = 0; i < positions.length; i += 3) {
    const p = (positions[i] - mx) * v_long.x + (positions[i + 1] - my) * v_long.y + (positions[i + 2] - mz) * v_long.z;
    const perp = Math.hypot(
      positions[i] - (mx + p * v_long.x),
      positions[i + 1] - (my + p * v_long.y),
      positions[i + 2] - (mz + p * v_long.z)
    );
    if (p < projMin + pRange * 0.25) { countMin++; spreadMin += perp; }
    else if (p > projMax - pRange * 0.25) { countMax++; spreadMax += perp; }
  }

  if (countMax > 0 && countMin > 0 && (spreadMin / countMin > spreadMax / countMax)) {
    v_long.negate();
  }

  // 4. Construct complete orthonormal frame
  const v_norm = new THREE.Vector3().crossVectors(v_wide, v_long).normalize();
  v_wide.crossVectors(v_long, v_norm).normalize();

  // Rotation matrix: rows = [v_wide, v_long, v_norm]
  const rotMat = new THREE.Matrix4().set(
    v_wide.x, v_wide.y, v_wide.z, 0,
    v_long.x, v_long.y, v_long.z, 0,
    v_norm.x, v_norm.y, v_norm.z, 0,
    0, 0, 0, 1
  );

  object3D.quaternion.setFromRotationMatrix(rotMat);
  object3D.updateMatrixWorld(true);

  // Center bounding box
  const bbox = new THREE.Box3().setFromObject(object3D);
  const bCenter = new THREE.Vector3();
  bbox.getCenter(bCenter);
  object3D.position.sub(bCenter);

  return {
    length: bbox.max.y - bbox.min.y,
    minY: bbox.min.y,
    maxY: bbox.max.y
  };
}

/* ==========================================================================
   5. GLTF Model Loading & Calibration
   ========================================================================== */
const gltfLoader = new GLTFLoader();

let sheathedModel = null;
let bladeModel = null;
let scabbardModel = null;
let modelsReady = false;

async function loadAllModels() {
  const modelPaths = [
    'models/sheathed.glb',
    'models/blade.glb',
    'models/scabbard.glb'
  ];

  // Total byte size of the 3 GLB files (~231.6 MB)
  const approxBytes = [77894436, 75493032, 78237812];
  const totalExpectedBytes = approxBytes.reduce((a, b) => a + b, 0);
  const downloadedBytes = [0, 0, 0];

  function handleByteProgress(index, xhr) {
    if (xhr && xhr.loaded) {
      downloadedBytes[index] = xhr.loaded;
    }
    const currentTotal = downloadedBytes.reduce((a, b) => a + b, 0);
    const pct = Math.min(99, Math.round((currentTotal / totalExpectedBytes) * 98));
    updateLoaderUI(Math.max(1, pct));
  }

  function finishLoader() {
    updateLoaderUI(100);
    setTimeout(() => {
      loaderOverlay.classList.add('loaded');
      document.body.classList.add('revealed');
      modelsReady = true;

      if (!reducedMotion) {
        animateHeroEntrance();
      }
    }, 120);
  }

  try {
    const [sheathedGltf, bladeGltf, scabbardGltf] = await Promise.all([
      gltfLoader.loadAsync(modelPaths[0], (xhr) => handleByteProgress(0, xhr)),
      gltfLoader.loadAsync(modelPaths[1], (xhr) => handleByteProgress(1, xhr)),
      gltfLoader.loadAsync(modelPaths[2], (xhr) => handleByteProgress(2, xhr))
    ]);

    sheathedModel = sheathedGltf.scene;
    bladeModel = bladeGltf.scene;
    scabbardModel = scabbardGltf.scene;

    sheathedGroup.add(sheathedModel);
    bladeGroup.add(bladeModel);
    scabbardGroup.add(scabbardModel);

    alignModelFullPCA(sheathedModel);
    alignModelFullPCA(bladeModel);
    alignModelFullPCA(scabbardModel);

    // Exact Calibration:
    // Scabbard = 2 units long (1.7702 scale)
    scabbardScale = 1.7702;
    scabbardGroup.scale.setScalar(scabbardScale);

    // Blade scaled so guard-to-tip spans 97% of scabbard (2.0058 scale)
    bladeScale = 2.0058;
    bladeGroup.scale.setScalar(bladeScale);

    // Sheathed scaled and positioned to the exact same footprint as scabbard + seated blade
    sheathedScale = 2.1598;
    sheathedGroup.scale.setScalar(sheathedScale);
    sheathedModel.position.y += 0.3250;

    // Seat offset puts guard flush at scabbard mouth (+1.0000)
    seatOffset = 0.3568;

    sheathedGroup.visible = true;
    scabbardGroup.visible = false;
    bladeGroup.visible = false;

    finishLoader();
  } catch (err) {
    console.error('Error loading Vesper 3D models:', err);
    // Guarantee overlay is never stuck
    finishLoader();
  }
}

function updateLoaderUI(pct) {
  loaderCounter.textContent = String(pct).padStart(3, '0');
  loaderBar.style.width = `${pct}%`;
}

function animateHeroEntrance() {
  const start = performance.now();
  const dur = 1500;
  swordRig.position.y = -1.2;
  swordRig.scale.setScalar(0.72);
  swordRig.rotation.y = -Math.PI * 0.7;

  function step(now) {
    const p = Math.min(1, (now - start) / dur);
    const ease = 1 - Math.pow(1 - p, 3);
    currentPose.y = -1.2 + 1.2 * ease;
    currentPose.scale = 0.72 + 0.28 * ease;
    currentPose.rotY = -Math.PI * 0.7 + Math.PI * 0.7 * ease;

    if (p < 1) requestAnimationFrame(step);
  }
  requestAnimationFrame(step);
}

loadAllModels();

/* ==========================================================================
   6. Lenis Smooth Scroll Setup
   ========================================================================== */
let scrollY = 0;

let lenis = null;
if (!reducedMotion && typeof Lenis !== 'undefined') {
  lenis = new Lenis({
    lerp: 0.08,
    smoothWheel: true,
    smoothTouch: false
  });

  lenis.on('scroll', (e) => {
    scrollY = e.scroll;
  });
} else {
  window.addEventListener('scroll', () => {
    scrollY = window.scrollY;
  }, { passive: true });
}

/* ==========================================================================
   7. Continuous Keyframe Pose Engine
   ========================================================================== */
function easeInOutCubic(t) {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

function clamp(v, min, max) {
  return Math.max(min, Math.min(max, v));
}

function lerp(a, b, t) {
  return a + (b - a) * t;
}

const currentPose = {
  x: 0,
  y: 0,
  z: 0,
  rotX: 0,
  rotY: 0,
  rotZ: 0,
  scale: 1,
  bladeY: 0.3424,
  scabbardY: 0,
  showing: 'sheathed',
  vesperOpacity: 1,
  returnOpacity: 0,
  splashScale: 1,
  splashX: 0,
  splashY: 0
};

const targetPose = { ...currentPose };

function evaluatePose() {
  if (!modelsReady) return;

  const currentScroll = typeof lenis !== 'undefined' && lenis ? lenis.scroll : window.scrollY;

  const heroEl = document.getElementById('hero');
  const drawEl = document.getElementById('draw');
  const bladeEl = document.getElementById('blade');
  const pocketEl = document.getElementById('pocket');
  const returnEl = document.getElementById('return');
  const acquireEl = document.getElementById('acquire');
  const footerEl = document.getElementById('footer');

  // Exact page offsets
  const drawTop = drawEl.offsetTop;
  const drawBottom = drawTop + drawEl.offsetHeight;

  const bladeTop = bladeEl.offsetTop;
  const bladeBottom = bladeTop + bladeEl.offsetHeight;

  const pocketTop = pocketEl.offsetTop;
  const pocketBottom = pocketTop + pocketEl.offsetHeight;

  const returnTop = returnEl.offsetTop;
  const returnBottom = returnTop + returnEl.offsetHeight;

  const acquireTop = acquireEl.offsetTop;
  const acquireBottom = acquireTop + acquireEl.offsetHeight;

  const footerTop = footerEl.offsetTop;

  // -------------------------------------------------------------
  // 1. HERO (before drawTop)
  // -------------------------------------------------------------
  if (currentScroll < drawTop) {
    const p = clamp(currentScroll / (drawTop || 1), 0, 1);
    const t = easeInOutCubic(p);

    targetPose.showing = 'sheathed';
    targetPose.x = lerp(0.0, 0.85, t);
    targetPose.y = 0;
    targetPose.scale = 1.0;
    targetPose.rotX = 0;
    targetPose.rotY = 0;
    targetPose.rotZ = 0;

    targetPose.bladeY = seatOffset;
    targetPose.scabbardY = 0;

    targetPose.vesperOpacity = Math.max(0, 1.0 - p * 1.5);
    targetPose.returnOpacity = 0;
    targetPose.splashScale = 1.0;
    targetPose.splashX = targetPose.x * 0.7;
    targetPose.splashY = 0;

    updateRailUI('00', 'THE HERO', p * 16);
  }
  // -------------------------------------------------------------
  // 2. SECTION I — THE DRAW (smooth continuous progress across span)
  // -------------------------------------------------------------
  else if (currentScroll >= drawTop && currentScroll < bladeTop) {
    const p = clamp((currentScroll - drawTop) / ((bladeTop - drawTop) || 1), 0, 1);

    // 0.0 to 0.32: Sword turns half a revolution (0 -> 180deg)
    if (p < 0.32) {
      const turnProg = p / 0.32;
      targetPose.showing = 'sheathed';
      targetPose.x = 0.85;
      targetPose.y = -0.06 * turnProg;
      targetPose.scale = 1.0 + 0.06 * turnProg;
      targetPose.rotX = 0;
      targetPose.rotY = Math.PI * easeInOutCubic(turnProg);
      targetPose.rotZ = -0.04 * turnProg;
      targetPose.bladeY = seatOffset;
      targetPose.scabbardY = 0;
    }
    // 0.32 to 0.65: Sword facing away (180deg). Swap to blade+scabbard. Blade draws smoothly up!
    else if (p < 0.65) {
      const drawProg = (p - 0.32) / 0.33;
      const drawDist = easeInOutCubic(drawProg) * 1.85;
      targetPose.showing = 'split';
      targetPose.x = 0.85;
      targetPose.y = -0.06;
      targetPose.scale = 1.06;
      targetPose.rotX = 0;
      targetPose.rotY = Math.PI;
      targetPose.rotZ = -0.04;
      targetPose.bladeY = drawDist + seatOffset;
      targetPose.scabbardY = 0;
    }
    // 0.65 to 1.00: Seamless continuous glide directly into Section II!
    // Scabbard drops away, drawn blade glides to center, rotates to horizontal!
    else {
      const tEnd = (p - 0.65) / 0.35;
      const tEase = easeInOutCubic(tEnd);

      targetPose.showing = tEase > 0.85 ? 'bladeOnly' : 'split';
      targetPose.scabbardY = -tEase * 8.0;
      targetPose.bladeY = lerp(1.85 + seatOffset, 0, tEase);
      targetPose.x = lerp(0.85, 0.10, tEase);
      targetPose.y = lerp(-0.06, -0.05, tEase);
      targetPose.scale = lerp(1.06, 1.45, tEase);
      targetPose.rotX = 0;
      targetPose.rotY = Math.PI;
      targetPose.rotZ = lerp(-0.04, Math.PI * 0.5, tEase);
    }

    targetPose.vesperOpacity = 0;
    targetPose.returnOpacity = 0;
    targetPose.splashScale = 1.0;
    targetPose.splashX = targetPose.x * 0.7;
    targetPose.splashY = targetPose.y * 0.7;

    updateRailUI('01', 'THE DRAW', 16 + p * 16);
  }
  // -------------------------------------------------------------
  // 3. SECTION II — THE BLADE (HORIZONTAL, LARGE, SLOWLY TURNING)
  // -------------------------------------------------------------
  else if (currentScroll >= bladeTop && currentScroll < pocketTop) {
    const p = clamp((currentScroll - bladeTop) / ((pocketTop - bladeTop) || 1), 0, 1);

    // 0.0 to 0.70: Bare blade horizontal, slowly turning along length
    if (p < 0.70) {
      const turnP = p / 0.70;
      targetPose.showing = 'bladeOnly';
      targetPose.scabbardY = -9.0;
      targetPose.bladeY = 0;

      targetPose.x = 0.10;
      targetPose.y = -0.05;
      targetPose.scale = 1.45;
      targetPose.rotZ = Math.PI * 0.5;
      targetPose.rotX = turnP * Math.PI * 2.5;
      targetPose.rotY = Math.PI;
    }
    // 0.70 to 1.00: Continuous transition into Section III (The Pocket)!
    // Blade flies off, scabbard slides up on left!
    else {
      const tEnd = (p - 0.70) / 0.30;
      const tEase = easeInOutCubic(tEnd);

      targetPose.showing = tEase < 0.3 ? 'bladeOnly' : (tEase < 0.7 ? 'split' : 'scabbardOnly');
      targetPose.bladeY = tEase * 8.0;
      targetPose.scabbardY = lerp(-9.0, 0, tEase);

      targetPose.x = lerp(0.10, -0.85, tEase);
      targetPose.y = lerp(-0.05, 0, tEase);
      targetPose.scale = lerp(1.45, 1.25, tEase);
      targetPose.rotZ = lerp(Math.PI * 0.5, 0.12, tEase);
      targetPose.rotX = 0;
      targetPose.rotY = lerp(Math.PI, 0, tEase);
    }

    targetPose.vesperOpacity = 0;
    targetPose.returnOpacity = 0;

    targetPose.splashScale = 1.35;
    targetPose.splashX = targetPose.x * 0.6;
    targetPose.splashY = targetPose.y * 0.6;

    triggerSpecCounters();
    updateRailUI('02', 'THE BLADE', 32 + p * 18);
  }
  // -------------------------------------------------------------
  // 4. SECTION III — THE POCKET (SCABBARD ON LEFT, BLADE FLIES OFF)
  // -------------------------------------------------------------
  else if (currentScroll >= pocketTop && currentScroll < returnTop) {
    const p = clamp((currentScroll - pocketTop) / ((returnTop - pocketTop) || 1), 0, 1);

    // 0.0 to 0.70: Scabbard on left slowly rotating, blade off screen
    if (p < 0.70) {
      const rotP = p / 0.70;
      targetPose.showing = 'scabbardOnly';
      targetPose.scabbardY = 0;
      targetPose.bladeY = 8.0;

      targetPose.x = -0.85;
      targetPose.y = 0;
      targetPose.scale = 1.25;
      targetPose.rotZ = 0.12;
      targetPose.rotY = rotP * Math.PI * 1.5;
      targetPose.rotX = 0;
    }
    // 0.70 to 1.00: Continuous transition into Section IV (The Return)!
    // Scabbard centers and straightens, blade slides in from top ready to enter!
    else {
      const tEnd = (p - 0.70) / 0.30;
      const tEase = easeInOutCubic(tEnd);

      targetPose.showing = 'split';
      targetPose.scabbardY = 0;
      targetPose.bladeY = lerp(8.0, 1.85 + seatOffset, tEase);

      targetPose.x = lerp(-0.85, 0, tEase);
      targetPose.y = 0;
      targetPose.scale = lerp(1.25, 1.05, tEase);
      targetPose.rotZ = lerp(0.12, 0, tEase);
      targetPose.rotY = lerp(Math.PI * 1.5, 0, tEase);
      targetPose.rotX = 0;
    }

    targetPose.vesperOpacity = 0;
    targetPose.returnOpacity = 0;

    targetPose.splashScale = 1.0;
    targetPose.splashX = targetPose.x * 0.7;
    targetPose.splashY = 0;

    updateRailUI('03', 'THE POCKET', 50 + p * 18);
  }
  // -------------------------------------------------------------
  // 5. SECTION IV — THE RETURN (BLADE SLIDES INTO SCABBARD)
  // -------------------------------------------------------------
  else if (currentScroll >= returnTop && currentScroll < acquireTop) {
    const p = clamp((currentScroll - returnTop) / ((acquireTop - returnTop) || 1), 0, 1);

    // 0.0 to 0.75: Blade slides down into scabbard
    const mount = clamp((p - 0.04) / 0.70, 0, 1);
    const dist = (1 - easeInOutCubic(mount)) * 1.85;

    // 0.75 to 1.00: Transition into Section V (Acquire)
    if (p < 0.75) {
      targetPose.showing = 'split';
      targetPose.scabbardY = 0;
      targetPose.bladeY = dist + seatOffset;

      targetPose.x = 0;
      targetPose.y = 0;
      targetPose.scale = 1.05;
      targetPose.rotX = 0;
      targetPose.rotY = 0;
      targetPose.rotZ = 0;
    } else {
      const tEnd = (p - 0.75) / 0.25;
      const tEase = easeInOutCubic(tEnd);

      targetPose.showing = 'sheathed';
      targetPose.bladeY = seatOffset;
      targetPose.scabbardY = 0;

      targetPose.x = lerp(0, 0.80, tEase);
      targetPose.y = lerp(0, -0.05, tEase);
      targetPose.scale = lerp(1.05, 1.02, tEase);
      targetPose.rotX = lerp(0, 0.12, tEase);
      targetPose.rotY = lerp(0, 0.32, tEase);
      targetPose.rotZ = lerp(0, -0.22, tEase);
    }

    targetPose.returnOpacity = Math.min(0.95, p * 2.2);
    targetPose.vesperOpacity = 0;

    targetPose.splashScale = 1.0;
    targetPose.splashX = targetPose.x * 0.7;
    targetPose.splashY = 0;

    // Seated Meter update
    const seatedPct = Math.round(mount * 100);
    seatedCounter.textContent = `${String(seatedPct).padStart(3, '0')}%`;
    seatedFill.style.width = `${seatedPct}%`;

    if (mount >= 0.98) {
      triggerSeatedHome();
    } else {
      resetSeatedHome();
    }

    updateRailUI('04', 'THE RETURN', 68 + p * 16);
  }
  // -------------------------------------------------------------
  // 6. SECTION V — ACQUIRE (TILTED SEATED SWORD ON RIGHT)
  // -------------------------------------------------------------
  else if (currentScroll >= acquireTop && currentScroll < footerTop) {
    const p = clamp((currentScroll - acquireTop) / ((footerTop - acquireTop) || 1), 0, 1);

    targetPose.showing = 'sheathed';
    targetPose.bladeY = seatOffset;
    targetPose.scabbardY = 0;

    // Seated sword resting gracefully on the right
    targetPose.x = 0.80;
    targetPose.y = -0.05;
    targetPose.scale = 1.02;

    targetPose.rotX = 0.12;
    targetPose.rotY = 0.32;
    targetPose.rotZ = -0.22;

    targetPose.returnOpacity = Math.max(0, 0.95 * (1 - p * 3));
    targetPose.vesperOpacity = 0;

    targetPose.splashScale = 0.92;
    targetPose.splashX = targetPose.x * 0.7;
    targetPose.splashY = targetPose.y * 0.7;

    updateRailUI('05', 'ACQUIRE', 84 + p * 10);
  }
  // -------------------------------------------------------------
  // 7. SECTION VIII — FOOTER (SWORD LIES HORIZONTALLY IN GAP)
  // -------------------------------------------------------------
  else {
    const scrollable = footerEl.offsetHeight - window.innerHeight;
    const p = clamp((currentScroll - footerTop) / (scrollable || 1), 0, 1);
    const t = easeInOutCubic(Math.min(1, p * 2));

    targetPose.showing = 'sheathed';
    targetPose.bladeY = seatOffset;
    targetPose.scabbardY = 0;

    // Transitions from tilted right into horizontal centered gap
    targetPose.x = lerp(0.40, 0.0, t);
    targetPose.y = lerp(-0.05, -0.18, t);
    targetPose.scale = lerp(1.02, 0.88, t);

    targetPose.rotX = lerp(0.12, 0.0, t);
    targetPose.rotY = lerp(0.32, 0.0, t);
    targetPose.rotZ = lerp(-0.22, Math.PI * 0.5, t);

    targetPose.returnOpacity = 0;
    targetPose.vesperOpacity = 0;

    targetPose.splashScale = lerp(0.92, 0.55, t);
    targetPose.splashX = 0;
    targetPose.splashY = targetPose.y;

    updateRailUI('05', 'VESPER', 94 + p * 6);
  }
}

function updateRailUI(num, name, fill) {
  railNumber.textContent = num;
  railName.textContent = name;
  railFill.style.height = `${Math.min(100, Math.round(fill))}%`;
}

/* ==========================================================================
   8. Seated "Home" Ceremony & Camera Shake
   ========================================================================== */
let isSeatedCeremony = false;
let shakeTime = 0;

function triggerSeatedHome() {
  if (isSeatedCeremony) return;
  isSeatedCeremony = true;

  returnEyebrow.textContent = 'RESTING';
  returnH2.textContent = 'Home.';
  returnSub.textContent = 'The sound it makes is the whole point.';

  shakeTime = performance.now();
}

function resetSeatedHome() {
  if (!isSeatedCeremony) return;
  isSeatedCeremony = false;

  returnEyebrow.textContent = 'RITUAL';
  returnH2.textContent = 'Guide it home.';
  returnSub.textContent = 'Align the point. Feel the pull of the mouth.';
}

/* ==========================================================================
   9. Spec Numbers Count-Up
   ========================================================================== */
let specsTriggered = false;

function triggerSpecCounters() {
  if (specsTriggered) return;
  specsTriggered = true;

  document.querySelectorAll('.spec-num').forEach(el => {
    const target = parseFloat(el.dataset.val);
    const decimals = parseInt(el.dataset.dec || '0');
    const dur = 1400;
    const start = performance.now();

    function step(now) {
      const p = Math.min(1, (now - start) / dur);
      const ease = 1 - Math.pow(1 - p, 3);
      const curr = (target * ease).toFixed(decimals);
      el.textContent = decimals > 0 ? curr : String(Math.round(target * ease)).padStart(2, '0');
      if (p < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  });
}

/* ==========================================================================
   10. Mouse Movement, Tilt & Magnetic Cursor
   ========================================================================== */
const mouse = { x: 0, y: 0, targetX: 0, targetY: 0 };

window.addEventListener('pointermove', (e) => {
  mouse.targetX = (e.clientX / window.innerWidth) * 2 - 1;
  mouse.targetY = -(e.clientY / window.innerHeight) * 2 + 1;

  cursorDot.style.opacity = '1';
  cursorDot.style.left = `${e.clientX}px`;
  cursorDot.style.top = `${e.clientY}px`;
});

// Cursor hover effect over interactive elements
document.querySelectorAll('a, button, .spec-item').forEach(el => {
  el.addEventListener('pointerenter', () => cursorDot.classList.add('hovered'));
  el.addEventListener('pointerleave', () => cursorDot.classList.remove('hovered'));
});

// Magnetic button drift toward cursor
document.querySelectorAll('.btn-acquire, .btn-pill').forEach(btn => {
  btn.addEventListener('pointermove', (e) => {
    const rect = btn.getBoundingClientRect();
    const bx = e.clientX - (rect.left + rect.width / 2);
    const by = e.clientY - (rect.top + rect.height / 2);
    btn.style.transform = `translate(${bx * 0.22}px, ${by * 0.22}px)`;
  });

  btn.addEventListener('pointerleave', () => {
    btn.style.transform = 'translate(0px, 0px)';
  });
});

/* ==========================================================================
   11. Responsive Resize Handling
   ========================================================================== */
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();

  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
});

/* ==========================================================================
   12. Render Loop (Damped Lerp Engine)
   ========================================================================== */
let clock = new THREE.Clock();

function animate() {
  requestAnimationFrame(animate);

  const delta = clock.getDelta();
  const time = clock.getElapsedTime();

  // Update Lenis
  if (lenis) {
    lenis.raf(time * 1000);
  }

  // Smooth mouse tilt interpolation
  mouse.x += (mouse.targetX - mouse.x) * 0.05;
  mouse.y += (mouse.targetY - mouse.y) * 0.05;

  // Evaluate scroll keyframe target pose
  evaluatePose();

  // Butter-smooth Lerping from currentPose to targetPose
  const k = 0.12;
  currentPose.x += (targetPose.x - currentPose.x) * k;
  currentPose.y += (targetPose.y - currentPose.y) * k;
  currentPose.scale += (targetPose.scale - currentPose.scale) * k;
  currentPose.rotX += (targetPose.rotX - currentPose.rotX) * k;
  currentPose.rotY += (targetPose.rotY - currentPose.rotY) * k;
  currentPose.rotZ += (targetPose.rotZ - currentPose.rotZ) * k;
  currentPose.bladeY += (targetPose.bladeY - currentPose.bladeY) * k;
  currentPose.scabbardY += (targetPose.scabbardY - currentPose.scabbardY) * k;
  currentPose.vesperOpacity += (targetPose.vesperOpacity - currentPose.vesperOpacity) * k;
  currentPose.returnOpacity += (targetPose.returnOpacity - currentPose.returnOpacity) * k;
  currentPose.splashScale += (targetPose.splashScale - currentPose.splashScale) * k;
  currentPose.splashX += (targetPose.splashX - currentPose.splashX) * k;
  currentPose.splashY += (targetPose.splashY - currentPose.splashY) * k;

  // Apply to Three.js objects
  if (modelsReady) {
    swordRig.position.set(currentPose.x, currentPose.y, 0);
    swordRig.scale.setScalar(currentPose.scale);
    swordRig.rotation.set(currentPose.rotX, currentPose.rotY, currentPose.rotZ);

    bladeGroup.position.set(0, currentPose.bladeY, 0);
    scabbardGroup.position.set(0, currentPose.scabbardY, 0);

    // Precise visibility toggling
    if (targetPose.showing === 'sheathed') {
      sheathedGroup.visible = true;
      scabbardGroup.visible = false;
      bladeGroup.visible = false;
    } else if (targetPose.showing === 'split') {
      sheathedGroup.visible = false;
      scabbardGroup.visible = true;
      bladeGroup.visible = true;
    } else if (targetPose.showing === 'bladeOnly') {
      sheathedGroup.visible = false;
      scabbardGroup.visible = false;
      bladeGroup.visible = true;
    } else if (targetPose.showing === 'scabbardOnly') {
      sheathedGroup.visible = false;
      scabbardGroup.visible = true;
      bladeGroup.visible = false;
    }

    // Additive mouse tilt & breathing sway on swayGroup
    swayGroup.rotation.x = mouse.y * 0.05 + Math.sin(time * 1.2) * 0.01;
    swayGroup.rotation.y = mouse.x * 0.08 + Math.cos(time * 0.9) * 0.006;

    // Red ink splash position & scale
    splashMesh.position.set(currentPose.splashX, currentPose.splashY, -4);
    splashMesh.scale.setScalar(currentPose.splashScale);

    // 3D Canvas Text Opacities
    vesperPlaneObj.mat.opacity = currentPose.vesperOpacity;
    returnPlaneObj.mat.opacity = currentPose.returnOpacity;

    // Camera shake during fully seated ceremony
    if (shakeTime > 0) {
      const elapsed = performance.now() - shakeTime;
      if (elapsed < 380) {
        const shakeDecay = 1 - elapsed / 380;
        camera.position.x = (Math.random() - 0.5) * 0.024 * shakeDecay;
        camera.position.y = (Math.random() - 0.5) * 0.024 * shakeDecay;
      } else {
        camera.position.x = 0;
        camera.position.y = 0;
        shakeTime = 0;
      }
    }
  }

  renderer.render(scene, camera);
}

animate();
