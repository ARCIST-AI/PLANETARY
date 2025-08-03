/**
 * Test setup file for Vitest
 */

import { vi } from 'vitest';
import { beforeEach, afterEach } from 'vitest';

// Mock Three.js
vi.mock('three', () => ({
  // Core
  Scene: vi.fn().mockImplementation(() => ({
    add: vi.fn(),
    remove: vi.fn(),
    children: [],
    traverse: vi.fn(),
  })),
  Camera: vi.fn().mockImplementation(() => ({
    position: { x: 0, y: 0, z: 0 },
    rotation: { x: 0, y: 0, z: 0 },
    updateMatrixWorld: vi.fn(),
  })),
  PerspectiveCamera: vi.fn().mockImplementation(() => ({
    position: { x: 0, y: 0, z: 0 },
    rotation: { x: 0, y: 0, z: 0 },
    updateMatrixWorld: vi.fn(),
    aspect: 1,
    updateProjectionMatrix: vi.fn(),
  })),
  WebGLRenderer: vi.fn().mockImplementation(() => ({
    domElement: document.createElement('canvas'),
    setSize: vi.fn(),
    render: vi.fn(),
    setPixelRatio: vi.fn(),
    getPixelRatio: vi.fn(() => 1),
    dispose: vi.fn(),
  })),
  
  // Objects
  Object3D: vi.fn().mockImplementation(() => ({
    position: { x: 0, y: 0, z: 0 },
    rotation: { x: 0, y: 0, z: 0 },
    scale: { x: 1, y: 1, z: 1 },
    add: vi.fn(),
    remove: vi.fn(),
    traverse: vi.fn(),
    updateMatrix: vi.fn(),
    updateMatrixWorld: vi.fn(),
  })),
  Mesh: vi.fn().mockImplementation(() => ({
    position: { x: 0, y: 0, z: 0 },
    rotation: { x: 0, y: 0, z: 0 },
    scale: { x: 1, y: 1, z: 1 },
    add: vi.fn(),
    remove: vi.fn(),
    traverse: vi.fn(),
    updateMatrix: vi.fn(),
    updateMatrixWorld: vi.fn(),
  })),
  Points: vi.fn().mockImplementation(() => ({
    position: { x: 0, y: 0, z: 0 },
    rotation: { x: 0, y: 0, z: 0 },
    scale: { x: 1, y: 1, z: 1 },
    add: vi.fn(),
    remove: vi.fn(),
    traverse: vi.fn(),
    updateMatrix: vi.fn(),
    updateMatrixWorld: vi.fn(),
  })),
  Line: vi.fn().mockImplementation(() => ({
    position: { x: 0, y: 0, z: 0 },
    rotation: { x: 0, y: 0, z: 0 },
    scale: { x: 1, y: 1, z: 1 },
    add: vi.fn(),
    remove: vi.fn(),
    traverse: vi.fn(),
    updateMatrix: vi.fn(),
    updateMatrixWorld: vi.fn(),
  })),
  
  // Materials
  Material: vi.fn().mockImplementation(() => ({
    dispose: vi.fn(),
  })),
  MeshBasicMaterial: vi.fn().mockImplementation(() => ({
    dispose: vi.fn(),
  })),
  MeshPhongMaterial: vi.fn().mockImplementation(() => ({
    dispose: vi.fn(),
  })),
  MeshStandardMaterial: vi.fn().mockImplementation(() => ({
    dispose: vi.fn(),
  })),
  PointsMaterial: vi.fn().mockImplementation(() => ({
    dispose: vi.fn(),
  })),
  LineBasicMaterial: vi.fn().mockImplementation(() => ({
    dispose: vi.fn(),
  })),
  
  // Geometries
  BufferGeometry: vi.fn().mockImplementation(() => ({
    dispose: vi.fn(),
    setFromPoints: vi.fn(),
    computeBoundingSphere: vi.fn(),
    computeBoundingBox: vi.fn(),
    attributes: {},
  })),
  SphereGeometry: vi.fn().mockImplementation(() => ({
    dispose: vi.fn(),
    setFromPoints: vi.fn(),
    computeBoundingSphere: vi.fn(),
    computeBoundingBox: vi.fn(),
    attributes: {},
  })),
  BoxGeometry: vi.fn().mockImplementation(() => ({
    dispose: vi.fn(),
    setFromPoints: vi.fn(),
    computeBoundingSphere: vi.fn(),
    computeBoundingBox: vi.fn(),
    attributes: {},
  })),
  
  // Lights
  Light: vi.fn().mockImplementation(() => ({
    position: { x: 0, y: 0, z: 0 },
    intensity: 1,
  })),
  AmbientLight: vi.fn().mockImplementation(() => ({
    position: { x: 0, y: 0, z: 0 },
    intensity: 1,
  })),
  DirectionalLight: vi.fn().mockImplementation(() => ({
    position: { x: 0, y: 0, z: 0 },
    intensity: 1,
    target: { position: { x: 0, y: 0, z: 0 } },
  })),
  PointLight: vi.fn().mockImplementation(() => ({
    position: { x: 0, y: 0, z: 0 },
    intensity: 1,
    distance: 0,
    decay: 1,
  })),
  
  // Controls
  OrbitControls: vi.fn().mockImplementation(() => ({
    update: vi.fn(),
    dispose: vi.fn(),
    enabled: true,
    enableZoom: true,
    enableRotate: true,
    enablePan: true,
    minDistance: 0,
    maxDistance: Infinity,
    minPolarAngle: 0,
    maxPolarAngle: Math.PI,
    minAzimuthAngle: -Infinity,
    maxAzimuthAngle: Infinity,
    enableDamping: false,
    dampingFactor: 0.05,
    target: { x: 0, y: 0, z: 0 },
  })),
  
  // Math
  Vector3: vi.fn().mockImplementation((x = 0, y = 0, z = 0) => ({
    x, y, z,
    set: vi.fn(function(x, y, z) {
      this.x = x;
      this.y = y;
      this.z = z;
      return this;
    }),
    clone: vi.fn(function() {
      return new this.constructor(this.x, this.y, this.z);
    }),
    copy: vi.fn(function(v) {
      this.x = v.x;
      this.y = v.y;
      this.z = v.z;
      return this;
    }),
    add: vi.fn(function(v) {
      this.x += v.x;
      this.y += v.y;
      this.z += v.z;
      return this;
    }),
    sub: vi.fn(function(v) {
      this.x -= v.x;
      this.y -= v.y;
      this.z -= v.z;
      return this;
    }),
    multiply: vi.fn(function(s) {
      this.x *= s;
      this.y *= s;
      this.z *= s;
      return this;
    }),
    divide: vi.fn(function(s) {
      this.x /= s;
      this.y /= s;
      this.z /= s;
      return this;
    }),
    length: vi.fn(function() {
      return Math.sqrt(this.x * this.x + this.y * this.y + this.z * this.z);
    }),
    lengthSq: vi.fn(function() {
      return this.x * this.x + this.y * this.y + this.z * this.z;
    }),
    normalize: vi.fn(function() {
      const length = this.length();
      if (length > 0) {
        this.x /= length;
        this.y /= length;
        this.z /= length;
      }
      return this;
    }),
    dot: vi.fn(function(v) {
      return this.x * v.x + this.y * v.y + this.z * v.z;
    }),
    cross: vi.fn(function(v) {
      const x = this.y * v.z - this.z * v.y;
      const y = this.z * v.x - this.x * v.z;
      const z = this.x * v.y - this.y * v.x;
      return new this.constructor(x, y, z);
    }),
    distanceTo: vi.fn(function(v) {
      const dx = this.x - v.x;
      const dy = this.y - v.y;
      const dz = this.z - v.z;
      return Math.sqrt(dx * dx + dy * dy + dz * dz);
    }),
    distanceToSquared: vi.fn(function(v) {
      const dx = this.x - v.x;
      const dy = this.y - v.y;
      const dz = this.z - v.z;
      return dx * dx + dy * dy + dz * dz;
    }),
    applyMatrix4: vi.fn(function(m) {
      return this;
    }),
    equals: vi.fn(function(v) {
      return this.x === v.x && this.y === v.y && this.z === v.z;
    }),
  })),
  
  Vector2: vi.fn().mockImplementation((x = 0, y = 0) => ({
    x, y,
    set: vi.fn(function(x, y) {
      this.x = x;
      this.y = y;
      return this;
    }),
    clone: vi.fn(function() {
      return new this.constructor(this.x, this.y);
    }),
    copy: vi.fn(function(v) {
      this.x = v.x;
      this.y = v.y;
      return this;
    }),
    add: vi.fn(function(v) {
      this.x += v.x;
      this.y += v.y;
      return this;
    }),
    sub: vi.fn(function(v) {
      this.x -= v.x;
      this.y -= v.y;
      return this;
    }),
    multiply: vi.fn(function(s) {
      this.x *= s;
      this.y *= s;
      return this;
    }),
    divide: vi.fn(function(s) {
      this.x /= s;
      this.y /= s;
      return this;
    }),
    length: vi.fn(function() {
      return Math.sqrt(this.x * this.x + this.y * this.y);
    }),
    lengthSq: vi.fn(function() {
      return this.x * this.x + this.y * this.y;
    }),
    normalize: vi.fn(function() {
      const length = this.length();
      if (length > 0) {
        this.x /= length;
        this.y /= length;
      }
      return this;
    }),
    dot: vi.fn(function(v) {
      return this.x * v.x + this.y * v.y;
    }),
    distanceTo: vi.fn(function(v) {
      const dx = this.x - v.x;
      const dy = this.y - v.y;
      return Math.sqrt(dx * dx + dy * dy);
    }),
    distanceToSquared: vi.fn(function(v) {
      const dx = this.x - v.x;
      const dy = this.y - v.y;
      return dx * dx + dy * dy;
    }),
    equals: vi.fn(function(v) {
      return this.x === v.x && this.y === v.y;
    }),
  })),
  
  Matrix4: vi.fn().mockImplementation(() => ({
    elements: new Array(16).fill(0),
    set: vi.fn(function() {
      return this;
    }),
    identity: vi.fn(function() {
      this.elements.fill(0);
      this.elements[0] = 1;
      this.elements[5] = 1;
      this.elements[10] = 1;
      this.elements[15] = 1;
      return this;
    }),
    copy: vi.fn(function(m) {
      for (let i = 0; i < 16; i++) {
        this.elements[i] = m.elements[i];
      }
      return this;
    }),
    multiply: vi.fn(function(m) {
      return this;
    }),
    multiplyScalar: vi.fn(function(s) {
      for (let i = 0; i < 16; i++) {
        this.elements[i] *= s;
      }
      return this;
    }),
    determinant: vi.fn(function() {
      return 1;
    }),
    invert: vi.fn(function() {
      return this;
    }),
    transpose: vi.fn(function() {
      return this;
    }),
    clone: vi.fn(function() {
      const m = new this.constructor();
      return m.copy(this);
    }),
    makeTranslation: vi.fn(function(x, y, z) {
      this.identity();
      this.elements[12] = x;
      this.elements[13] = y;
      this.elements[14] = z;
      return this;
    }),
    makeRotationX: vi.fn(function(theta) {
      this.identity();
      const c = Math.cos(theta);
      const s = Math.sin(theta);
      this.elements[5] = c;
      this.elements[6] = s;
      this.elements[9] = -s;
      this.elements[10] = c;
      return this;
    }),
    makeRotationY: vi.fn(function(theta) {
      this.identity();
      const c = Math.cos(theta);
      const s = Math.sin(theta);
      this.elements[0] = c;
      this.elements[2] = -s;
      this.elements[8] = s;
      this.elements[10] = c;
      return this;
    }),
    makeRotationZ: vi.fn(function(theta) {
      this.identity();
      const c = Math.cos(theta);
      const s = Math.sin(theta);
      this.elements[0] = c;
      this.elements[1] = s;
      this.elements[4] = -s;
      this.elements[5] = c;
      return this;
    }),
    makeScale: vi.fn(function(x, y, z) {
      this.identity();
      this.elements[0] = x;
      this.elements[5] = y;
      this.elements[10] = z;
      return this;
    }),
    compose: vi.fn(function(position, quaternion, scale) {
      return this;
    }),
    decompose: vi.fn(function(position, quaternion, scale) {
      return this;
    }),
  })),
  
  Quaternion: vi.fn().mockImplementation((x = 0, y = 0, z = 0, w = 1) => ({
    x, y, z, w,
    set: vi.fn(function(x, y, z, w) {
      this.x = x;
      this.y = y;
      this.z = z;
      this.w = w;
      return this;
    }),
    clone: vi.fn(function() {
      return new this.constructor(this.x, this.y, this.z, this.w);
    }),
    copy: vi.fn(function(q) {
      this.x = q.x;
      this.y = q.y;
      this.z = q.z;
      this.w = q.w;
      return this;
    }),
    multiply: vi.fn(function(q) {
      return this;
    }),
    multiplyQuaternions: vi.fn(function(a, b) {
      return this;
    }),
    slerp: vi.fn(function(q, t) {
      return this;
    }),
    normalize: vi.fn(function() {
      const length = Math.sqrt(this.x * this.x + this.y * this.y + this.z * this.z + this.w * this.w);
      if (length > 0) {
        this.x /= length;
        this.y /= length;
        this.z /= length;
        this.w /= length;
      }
      return this;
    }),
    setFromUnitVectors: vi.fn(function(vFrom, vTo) {
      return this;
    }),
    setFromEuler: vi.fn(function(euler) {
      return this;
    }),
    setFromAxisAngle: vi.fn(function(axis, angle) {
      return this;
    }),
    equals: vi.fn(function(q) {
      return this.x === q.x && this.y === q.y && this.z === q.z && this.w === q.w;
    }),
  })),
  
  Euler: vi.fn().mockImplementation((x = 0, y = 0, z = 0, order = 'XYZ') => ({
    x, y, z, order,
    set: vi.fn(function(x, y, z, order) {
      this.x = x;
      this.y = y;
      this.z = z;
      this.order = order || this.order;
      return this;
    }),
    clone: vi.fn(function() {
      return new this.constructor(this.x, this.y, this.z, this.order);
    }),
    copy: vi.fn(function(euler) {
      this.x = euler.x;
      this.y = euler.y;
      this.z = euler.z;
      this.order = euler.order;
      return this;
    }),
    reorder: vi.fn(function(newOrder) {
      this.order = newOrder;
      return this;
    }),
    equals: vi.fn(function(euler) {
      return this.x === euler.x && this.y === euler.y && this.z === euler.z && this.order === euler.order;
    }),
  })),
  
  // Utils
  Clock: vi.fn().mockImplementation(() => ({
    start: vi.fn(),
    stop: vi.fn(),
    getElapsedTime: vi.fn(() => 0),
    getDelta: vi.fn(() => 0),
  })),
  
  // Loaders
  TextureLoader: vi.fn().mockImplementation(() => ({
    load: vi.fn((url, onLoad, onProgress, onError) => {
      if (onLoad) onLoad({});
    }),
  })),
  
  // Constants
  DoubleSide: 2,
  FrontSide: 0,
  BackSide: 1,
}));

// Mock mathjs
vi.mock('mathjs', () => ({
  add: vi.fn((a, b) => a + b),
  subtract: vi.fn((a, b) => a - b),
  multiply: vi.fn((a, b) => a * b),
  divide: vi.fn((a, b) => a / b),
  pow: vi.fn((a, b) => Math.pow(a, b)),
  sqrt: vi.fn((a) => Math.sqrt(a)),
  sin: vi.fn((a) => Math.sin(a)),
  cos: vi.fn((a) => Math.cos(a)),
  tan: vi.fn((a) => Math.tan(a)),
  asin: vi.fn((a) => Math.asin(a)),
  acos: vi.fn((a) => Math.acos(a)),
  atan: vi.fn((a) => Math.atan(a)),
  atan2: vi.fn((a, b) => Math.atan2(a, b)),
  abs: vi.fn((a) => Math.abs(a)),
  round: vi.fn((a) => Math.round(a)),
  ceil: vi.fn((a) => Math.ceil(a)),
  floor: vi.fn((a) => Math.floor(a)),
  PI: Math.PI,
  E: Math.E,
}));

// Mock ml-matrix
vi.mock('ml-matrix', () => ({
  Matrix: vi.fn().mockImplementation((rows, cols) => ({
    rows,
    cols,
    data: Array(rows).fill().map(() => Array(cols).fill(0)),
    set: vi.fn(function(i, j, value) {
      this.data[i][j] = value;
    }),
    get: vi.fn(function(i, j) {
      return this.data[i][j];
    }),
    add: vi.fn(function(m) {
      return this;
    }),
    sub: vi.fn(function(m) {
      return this;
    }),
    mul: vi.fn(function(m) {
      return this;
    }),
    mmul: vi.fn(function(m) {
      return this;
    }),
    transpose: vi.fn(function() {
      return this;
    }),
    inverse: vi.fn(function() {
      return this;
    }),
    determinant: vi.fn(function() {
      return 1;
    }),
    clone: vi.fn(function() {
      return new this.constructor(this.rows, this.cols);
    }),
  })),
}));

// Mock lil-gui
vi.mock('lil-gui', () => ({
  default: vi.fn().mockImplementation(() => ({
    add: vi.fn(),
    addFolder: vi.fn().mockReturnValue({
      add: vi.fn(),
      addFolder: vi.fn().mockReturnValue({
        add: vi.fn(),
        addFolder: vi.fn(),
      }),
    }),
    destroy: vi.fn(),
    show: vi.fn(),
    hide: vi.fn(),
  })),
}));

// Mock Web Workers
global.Worker = vi.fn().mockImplementation(() => ({
  postMessage: vi.fn(),
  onmessage: null,
  onerror: null,
  terminate: vi.fn(),
}));

// Mock performance API
global.performance = {
  ...global.performance,
  now: vi.fn(() => Date.now()),
  mark: vi.fn(),
  measure: vi.fn(),
  getEntriesByName: vi.fn(() => []),
  getEntriesByType: vi.fn(() => []),
  clearMarks: vi.fn(),
  clearMeasures: vi.fn(),
  setResourceTimingBufferSize: vi.fn(),
  toJSON: vi.fn(() => ({})),
};

// Mock requestAnimationFrame
global.requestAnimationFrame = vi.fn((callback) => {
  return setTimeout(callback, 16);
});

// Mock cancelAnimationFrame
global.cancelAnimationFrame = vi.fn((id) => {
  clearTimeout(id);
});

// Setup global test utilities
global.describe = describe;
global.it = it;
global.test = test;
global.expect = expect;
global.vi = vi;

// Setup DOM for tests
beforeEach(() => {
  // Create a basic DOM structure
  document.body.innerHTML = `
    <div id="app">
      <div id="canvas-container">
        <canvas id="solar-system-canvas"></canvas>
      </div>
      <div id="ui-container" class="ui-container">
        <div id="tooltip-container" class="tooltip-container"></div>
        <div id="loading-screen" class="loading-screen">
          <div class="loading-content">
            <div class="loading-spinner"></div>
            <div class="loading-text">Loading...</div>
            <div class="loading-progress-bar">
              <div class="loading-progress"></div>
            </div>
          </div>
        </div>
        <div id="controls" class="control-panel"></div>
        <div id="info" class="info-panel"></div>
        <div id="performance" class="performance-monitor"></div>
      </div>
    </div>
  `;
});

afterEach(() => {
  // Clean up DOM
  document.body.innerHTML = '';
  
  // Clear all mocks
  vi.clearAllMocks();
});