import {
  THREE,
  addShadow,
  createRenderLoop,
  createStage,
  makeBox,
  makeCylinder,
  setFallback,
  setReady,
} from '../core/stage.js';

const FINISHES = {
  black: { color: '#15161c', label: 'Чёрный лак' },
  white: { color: '#e9e4da', label: 'Белый' },
  walnut: { color: '#6b4426', label: 'Орех' },
};

const NOTE_NAMES = ['До', 'До#', 'Ре', 'Ре#', 'Ми', 'Фа', 'Фа#', 'Соль', 'Соль#', 'Ля', 'Ля#', 'Си'];
const SCALE = [60, 62, 64, 65, 67, 69, 71, 72, 74, 76, 77, 79, 81, 83, 84];

export async function init(viewport) {
  const stage = createStage(viewport, {
    background: '#0b0d14',
    cameraPosition: [4.6, 3.4, 5.6],
    target: [0, 1.1, 0],
    fov: 34,
    environmentIntensity: 0.55,
    minDistance: 3.6,
    maxDistance: 13,
  });
  const { scene } = stage;
  scene.fog = new THREE.Fog('#0b0d14', 13, 26);

  const bodyMaterial = new THREE.MeshStandardMaterial({ color: FINISHES.black.color, roughness: 0.22, metalness: 0.35 });
  const whiteKeyMaterial = new THREE.MeshStandardMaterial({ color: '#f2f0e6', roughness: 0.32 });
  const blackKeyMaterial = new THREE.MeshStandardMaterial({ color: '#0b0d14', roughness: 0.24, metalness: 0.2 });
  const goldMaterial = new THREE.MeshStandardMaterial({ color: '#f4c56a', roughness: 0.3, metalness: 0.75 });
  const feltMaterial = new THREE.MeshStandardMaterial({ color: '#8a2432', roughness: 0.9 });
  const floorMaterial = new THREE.MeshStandardMaterial({ color: '#141926', roughness: 0.85 });
  const benchMaterial = new THREE.MeshStandardMaterial({ color: '#20263a', roughness: 0.6 });

  const root = new THREE.Group();
  scene.add(root);

  const floor = new THREE.Mesh(new THREE.CircleGeometry(10, 64), floorMaterial);
  floor.rotation.x = -Math.PI / 2;
  floor.receiveShadow = true;
  root.add(floor);

  // Piano body
  const body = makeBox(2.3, 1.06, 0.62, bodyMaterial, 0.04);
  body.position.set(0, 1.24, -0.12);
  root.add(body);

  const frontPanel = makeBox(2.3, 0.5, 0.06, bodyMaterial, 0.02);
  frontPanel.position.set(0, 1.5, 0.22);
  root.add(frontPanel);

  const goldLine = makeBox(2.3, 0.025, 0.02, goldMaterial, 0.005);
  goldLine.position.set(0, 1.73, 0.26);
  root.add(goldLine);

  const keyBed = makeBox(2.3, 0.08, 0.78, bodyMaterial, 0.02);
  keyBed.position.set(0, 0.98, 0.28);
  root.add(keyBed);

  const felt = makeBox(2.05, 0.015, 0.03, feltMaterial, 0.004);
  felt.position.set(0, 1.028, 0.62);
  root.add(felt);

  const lidPivot = new THREE.Group();
  lidPivot.position.set(0, 1.79, -0.42);
  root.add(lidPivot);
  const lid = makeBox(2.34, 0.055, 0.68, bodyMaterial, 0.02);
  lid.position.set(0, 0, 0.34);
  lidPivot.add(lid);

  // Music stand
  const stand = makeBox(0.72, 0.42, 0.025, bodyMaterial, 0.02);
  stand.position.set(0, 1.44, 0.3);
  stand.rotation.x = -0.22;
  root.add(stand);
  const sheet = makeBox(0.6, 0.34, 0.006, new THREE.MeshStandardMaterial({ color: '#eef0f6', roughness: 0.9 }), 0);
  sheet.position.set(0, 1.45, 0.32);
  sheet.rotation.x = -0.22;
  root.add(sheet);

  for (const x of [-1.02, 1.02]) {
    const leg = makeBox(0.09, 0.96, 0.5, bodyMaterial, 0.02);
    leg.position.set(x, 0.5, 0.12);
    root.add(leg);
  }
  for (const x of [-0.22, 0, 0.22]) {
    const pedal = makeBox(0.1, 0.035, 0.26, goldMaterial, 0.012);
    pedal.position.set(x, 0.16, 0.32);
    root.add(pedal);
  }

  // Bench
  const bench = makeBox(1.05, 0.12, 0.44, benchMaterial, 0.03);
  bench.position.set(0, 0.62, 1.5);
  root.add(bench);
  for (const x of [-0.42, 0.42]) {
    const leg = makeBox(0.06, 0.56, 0.34, bodyMaterial, 0.01);
    leg.position.set(x, 0.28, 1.5);
    root.add(leg);
  }

  // Keys: 15 white keys (C4..C6) and 10 black keys
  const keys = [];
  const keyByMidi = new Map();
  const whiteWidth = 2.1 / 15;
  const whiteStart = -2.1 / 2 + whiteWidth / 2;
  const blackAfter = [0, 1, 3, 4, 5];

  const registerKey = (mesh, midi) => {
    mesh.userData.midi = midi;
    mesh.userData.baseY = mesh.position.y;
    mesh.userData.press = 0;
    mesh.userData.baseColor = mesh.material.color.clone();
    keys.push(mesh);
    keyByMidi.set(midi, mesh);
    root.add(mesh);
  };

  for (let i = 0; i < 15; i += 1) {
    const key = makeBox(whiteWidth - 0.008, 0.05, 0.6, whiteKeyMaterial.clone(), 0.006);
    key.position.set(whiteStart + i * whiteWidth, 1.05, 0.32);
    registerKey(key, 60 + [0, 2, 4, 5, 7, 9, 11][i % 7] + 12 * Math.floor(i / 7));
  }
  for (let octave = 0; octave < 2; octave += 1) {
    for (const idx of blackAfter) {
      const i = octave * 7 + idx;
      const key = makeBox(whiteWidth * 0.62, 0.06, 0.36, blackKeyMaterial.clone(), 0.005);
      key.position.set(whiteStart + (i + 0.5) * whiteWidth, 1.085, 0.2);
      const midi = 60 + [0, 2, 4, 5, 7, 9, 11][idx] + 1 + 12 * octave;
      registerKey(key, midi);
    }
  }

  addShadow(stage, { intensity: 2.0, position: [3, 8, 5], color: '#f2e6d0' });
  const rim = new THREE.DirectionalLight('#8fa4ff', 0.8);
  rim.position.set(-5, 3, -3);
  scene.add(rim);
  const warm = new THREE.PointLight('#f4c56a', 16, 10, 2);
  warm.position.set(1.2, 3, 2.4);
  scene.add(warm);

  // Audio
  let audioContext = null;
  const playTone = (midi) => {
    try {
      audioContext = audioContext || new (window.AudioContext || window.webkitAudioContext)();
      if (audioContext.state === 'suspended') audioContext.resume();
      const now = audioContext.currentTime;
      const frequency = 440 * Math.pow(2, (midi - 69) / 12);
      const gain = audioContext.createGain();
      gain.gain.setValueAtTime(0, now);
      gain.gain.linearRampToValueAtTime(0.22, now + 0.015);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 1.4);
      gain.connect(audioContext.destination);
      for (const [type, detune] of [['triangle', 0], ['sine', 4]]) {
        const osc = audioContext.createOscillator();
        osc.type = type;
        osc.frequency.value = frequency;
        osc.detune.value = detune;
        osc.connect(gain);
        osc.start(now);
        osc.stop(now + 1.45);
      }
    } catch (error) {
      console.warn('Audio unavailable:', error);
    }
  };

  let lidOpen = false;
  let playingScale = false;
  const shell = viewport.closest('[data-scene]');
  const status = shell.querySelector('[data-scene-status]');

  const pressKey = (mesh, withSound = true) => {
    mesh.userData.press = 1;
    const midi = mesh.userData.midi;
    if (withSound) playTone(midi);
    const name = NOTE_NAMES[midi % 12];
    const octave = Math.floor(midi / 12) - 1;
    status.textContent = `Нота ${name}${octave}. Клавиши можно нажимать мышью — звук синтезируется прямо в браузере.`;
    loop.request();
  };

  const loop = createRenderLoop(stage, (delta) => {
    let active = false;
    for (const key of keys) {
      if (key.userData.press > 0) {
        key.userData.press = Math.max(0, key.userData.press - delta * 3.2);
        const dip = key.userData.press * 0.03;
        key.position.y = key.userData.baseY - dip;
        const glow = key.userData.press * 0.55;
        key.material.emissive.setRGB(glow * 0.95, glow * 0.72, glow * 0.32);
        active = true;
      }
    }
    const target = lidOpen ? 0.72 : 0;
    if (Math.abs(lidPivot.rotation.x - target) > 0.001) {
      lidPivot.rotation.x += (target - lidPivot.rotation.x) * Math.min(1, delta * 6);
      active = true;
    }
    return active;
  });

  // Pointer interaction
  const raycaster = new THREE.Raycaster();
  const pointer = new THREE.Vector2();
  const onPointerDown = (event) => {
    const rect = stage.renderer.domElement.getBoundingClientRect();
    pointer.set(
      ((event.clientX - rect.left) / rect.width) * 2 - 1,
      -((event.clientY - rect.top) / rect.height) * 2 + 1,
    );
    raycaster.setFromCamera(pointer, stage.camera);
    const hit = raycaster.intersectObjects(keys, false)[0];
    if (hit) pressKey(hit.object);
  };
  stage.renderer.domElement.addEventListener('pointerdown', onPointerDown);

  shell.querySelector('[data-play-scale]')?.addEventListener('click', () => {
    if (playingScale) return;
    playingScale = true;
    status.textContent = 'Играем гамму До мажор в две октавы…';
    SCALE.forEach((midi, index) => {
      window.setTimeout(() => {
        const key = keyByMidi.get(midi);
        if (key) pressKey(key);
        if (index === SCALE.length - 1) {
          playingScale = false;
          status.textContent = 'Гамма сыграна. Попробуйте нажать клавиши самостоятельно или откройте крышку рояля.';
        }
      }, index * 320);
    });
  });

  const lidButton = shell.querySelector('[data-lid]');
  lidButton?.addEventListener('click', () => {
    lidOpen = !lidOpen;
    lidButton.setAttribute('aria-pressed', String(lidOpen));
    lidButton.textContent = lidOpen ? 'Закрыть крышку' : 'Открыть крышку';
    status.textContent = lidOpen ? 'Крышка открыта: виден верх корпуса и нотный стан.' : 'Крышка закрыта.';
    loop.request();
  });

  shell.querySelectorAll('[data-finish]').forEach((button) => {
    button.addEventListener('click', () => {
      const key = button.dataset.finish;
      bodyMaterial.color.set(FINISHES[key].color);
      shell.querySelectorAll('[data-finish]').forEach((b) => b.setAttribute('aria-pressed', String(b === button)));
      status.textContent = `Корпус: ${FINISHES[key].label}.`;
      loop.request();
    });
  });

  shell.querySelector('[data-reset-camera]')?.addEventListener('click', () => {
    stage.camera.position.set(4.6, 3.4, 5.6);
    stage.controls.target.set(0, 1.1, 0);
    stage.controls.update();
    status.textContent = 'Камера возвращена к общему виду пианино.';
    loop.request();
  });

  const motionButton = shell.querySelector('[data-motion]');
  const syncMotionButton = () => {
    motionButton?.setAttribute('aria-pressed', String(loop.motion));
    if (motionButton) motionButton.textContent = loop.motion ? 'Пауза' : 'Включить вращение';
  };
  motionButton?.addEventListener('click', () => {
    loop.setMotion(!loop.motion);
    syncMotionButton();
    status.textContent = loop.motion ? 'Медленное вращение включено.' : 'Вращение остановлено. Модель можно поворачивать вручную.';
  });
  syncMotionButton();

  viewport.addEventListener('scenecontextlost', () => {
    setFallback(viewport, '3D-контекст потерян. Показана статичная версия концепта.');
  });
  window.addEventListener('pagehide', () => loop.dispose(), { once: true });

  stage.renderer.render(scene, stage.camera);
  setReady(viewport, 'Нажимайте на клавиши мышью или запустите гамму.');
}
