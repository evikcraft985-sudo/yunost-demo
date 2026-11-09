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

const COURSES = {
  piano: 'Фортепиано — фундамент музыкальной грамотности: постановка рук, чтение нот, классика и современный репертуар.',
  vocal: 'Вокал — дыхание, слух и уверенное владение голосом: от песен под гитару до концертных выступлений.',
  guitar: 'Гитара — самый быстрый старт в музыку: аккорды, бой и перебор, любимые песни уже через месяц.',
  drums: 'Ударные — ритм, координация и энергия. Ученики собирают свои первые биты уже на пятом занятии.',
};

const easeOut = (x) => 1 - Math.pow(1 - x, 3);

const wood = () => new THREE.MeshStandardMaterial({ color: '#23293b', roughness: 0.45, metalness: 0.12 });
const dark = () => new THREE.MeshStandardMaterial({ color: '#1c2a3a', roughness: 0.5 });
const cream = () => new THREE.MeshStandardMaterial({ color: '#f2efe6', roughness: 0.4 });
const metal = () => new THREE.MeshStandardMaterial({ color: '#b08d3f', roughness: 0.25, metalness: 0.9 });
const accent = () => new THREE.MeshStandardMaterial({ color: '#a14b2c', roughness: 0.5 });
const skin = () => new THREE.MeshStandardMaterial({ color: '#5a4632', roughness: 0.75 });

function buildPiano() {
  const g = new THREE.Group();
  const bodyW = 0.94;
  const cabinet = makeBox(bodyW, 0.72, 0.34, wood(), 0.03);
  cabinet.position.set(0, 0.36 + 0.12, 0);
  g.add(cabinet);
  const lidTop = makeBox(bodyW, 0.07, 0.4, wood(), 0.02);
  lidTop.position.set(0, 0.78, 0.02);
  lidTop.rotation.x = -0.28;
  g.add(lidTop);
  const shelf = makeBox(bodyW, 0.1, 0.4, wood(), 0.02);
  shelf.position.set(0, 0.52, 0.32);
  g.add(shelf);
  const keybed = makeBox(bodyW - 0.08, 0.045, 0.3, cream(), 0.008);
  keybed.position.set(0, 0.585, 0.32);
  g.add(keybed);
  for (let i = 0; i < 9; i += 1) {
    const black = makeBox(0.028, 0.02, 0.14, dark(), 0.004);
    black.position.set(-0.36 + i * 0.045 * 2, 0.607, 0.26);
    g.add(black);
  }
  const logoStrip = makeBox(0.5, 0.02, 0.01, metal(), 0.004);
  logoStrip.position.set(0, 0.64, 0.26);
  g.add(logoStrip);
  for (const x of [-0.38, 0.38]) {
    const leg = makeCylinder(0.018, 0.022, 0.16, dark(), 12);
    leg.position.set(x, 0.06, 0.05);
    g.add(leg);
  }
  g.userData.spin = 0.16;
  return g;
}

function buildVocal() {
  const g = new THREE.Group();
  const base = makeCylinder(0.22, 0.26, 0.05, dark(), 24);
  base.position.y = 0.03;
  g.add(base);
  const pole = makeCylinder(0.014, 0.014, 1.3, metal(), 14);
  pole.position.y = 0.68;
  g.add(pole);
  const arm = makeCylinder(0.011, 0.011, 0.3, metal(), 12);
  arm.rotation.x = Math.PI / 2.4;
  arm.position.set(0, 1.33, 0.12);
  g.add(arm);
  const mic = new THREE.Group();
  mic.position.set(0, 1.28, 0.26);
  mic.rotation.x = 0.55;
  const capsule = new THREE.Mesh(new THREE.SphereGeometry(0.055, 20, 16), metal());
  capsule.scale.set(1, 1.15, 1);
  mic.add(capsule);
  const grille = new THREE.Mesh(new THREE.SphereGeometry(0.05, 20, 14), new THREE.MeshStandardMaterial({ color: '#8f9aa8', roughness: 0.6 }));
  grille.position.y = 0.02;
  mic.add(grille);
  g.add(mic);
  g.userData.mic = mic;
  g.userData.sway = 0.05;
  return g;
}

function buildGuitar() {
  const g = new THREE.Group();
  const bodyGroup = new THREE.Group();
  const lowerBout = new THREE.Mesh(new THREE.SphereGeometry(0.27, 32, 24), accent());
  lowerBout.scale.set(1, 1.12, 0.4);
  lowerBout.position.set(0, -0.05, 0);
  bodyGroup.add(lowerBout);
  const upperBout = new THREE.Mesh(new THREE.SphereGeometry(0.225, 32, 24), accent());
  upperBout.scale.set(1, 1.05, 0.37);
  upperBout.position.set(0, 0.19, 0.01);
  bodyGroup.add(upperBout);
  const hole = new THREE.Mesh(new THREE.CircleGeometry(0.085, 24), new THREE.MeshStandardMaterial({ color: '#241a12', roughness: 0.9 }));
  hole.position.set(0, 0.06, 0.115);
  bodyGroup.add(hole);
  bodyGroup.position.y = 0.52;
  g.add(bodyGroup);
  const neck = makeBox(0.075, 0.72, 0.05, skin(), 0.01);
  neck.position.set(0, 1.02, 0.008);
  g.add(neck);
  const head = makeBox(0.11, 0.16, 0.05, dark(), 0.008);
  head.position.set(0, 1.42, 0.008);
  g.add(head);
  for (const x of [-0.02, -0.007, 0.007, 0.02]) {
    const string = makeCylinder(0.0022, 0.0022, 1.02, metal(), 6);
    string.position.set(x, 0.76, 0.06);
    g.add(string);
  }
  const bridge = makeBox(0.14, 0.035, 0.02, dark(), 0.005);
  bridge.position.set(0, 0.3, 0.12);
  g.add(bridge);
  g.userData.spin = -0.14;
  return g;
}

function buildDrums() {
  const g = new THREE.Group();
  const bass = new THREE.Mesh(new THREE.CylinderGeometry(0.34, 0.34, 0.24, 32, 1), accent());
  bass.rotation.x = Math.PI / 2 - 0.12;
  bass.position.set(-0.14, 0.44, 0.05);
  bass.castShadow = true;
  bass.receiveShadow = true;
  g.add(bass);
  const bassHead = new THREE.Mesh(new THREE.CircleGeometry(0.32, 32), cream());
  bassHead.position.set(-0.14, 0.39, 0.24);
  g.add(bassHead);
  for (const x of [-0.36, 0.08]) {
    const leg = makeCylinder(0.008, 0.008, 0.24, metal(), 8);
    leg.rotation.z = Math.PI / 2.6;
    leg.position.set(x, 0.16, 0.05);
    g.add(leg);
  }
  const snare = makeCylinder(0.17, 0.17, 0.12, metal(), 24);
  snare.position.set(0.28, 0.46, 0.3);
  g.add(snare);
  const tom1 = makeCylinder(0.11, 0.11, 0.16, metal(), 20);
  tom1.position.set(0.02, 0.72, 0.24);
  g.add(tom1);
  const floorTom = makeCylinder(0.15, 0.15, 0.34, metal(), 24);
  floorTom.position.set(0.52, 0.5, 0.05);
  g.add(floorTom);
  const cymbal = makeCylinder(0.16, 0.02, 0.012, new THREE.MeshStandardMaterial({ color: '#c7a44c', roughness: 0.3, metalness: 0.85 }), 24);
  cymbal.position.set(-0.36, 0.86, 0);
  cymbal.rotation.z = 0.14;
  g.add(cymbal);
  const cymbalStand = makeCylinder(0.009, 0.009, 0.95, metal(), 8);
  cymbalStand.position.set(-0.36, 0.46, 0.01);
  g.add(cymbalStand);
  g.userData.cymbal = cymbal;
  g.userData.sway = 0.03;
  return g;
}

export async function init(viewport) {
  const stage = createStage(viewport, {
    background: '#ece7dd',
    cameraPosition: [4.3, 2.7, 5.7],
    target: [0, 0.95, 0],
    fov: 36,
    environmentIntensity: 0.7,
    minDistance: 4,
    maxDistance: 12,
  });
  const { scene } = stage;
  scene.fog = new THREE.Fog('#ece7dd', 14, 28);
  stage.renderer.toneMappingExposure = 1.0;

  const floorMaterial = new THREE.MeshStandardMaterial({ color: '#e2dbcd', roughness: 0.9 });
  const platformMaterial = new THREE.MeshStandardMaterial({ color: '#f6f1e6', roughness: 0.55 });
  const rimMaterial = new THREE.MeshStandardMaterial({ color: '#b08d3f', roughness: 0.3, metalness: 0.85 });

  const root = new THREE.Group();
  scene.add(root);

  const floor = new THREE.Mesh(new THREE.CircleGeometry(10, 64), floorMaterial);
  floor.rotation.x = -Math.PI / 2;
  floor.receiveShadow = true;
  root.add(floor);

  const platform = makeCylinder(2.25, 2.32, 0.16, platformMaterial, 72);
  platform.position.set(0, 0.08, 0);
  platform.receiveShadow = true;
  root.add(platform);
  const rimRing = new THREE.Mesh(new THREE.TorusGeometry(2.28, 0.018, 10, 96), rimMaterial);
  rimRing.rotation.x = -Math.PI / 2;
  rimRing.position.y = 0.16;
  root.add(rimRing);

  const SPOTS = [
    { key: 'piano', label: 'Фортепиано', pos: [-1.35, -0.35] },
    { key: 'vocal', label: 'Вокал', pos: [0.15, -1.15] },
    { key: 'guitar', label: 'Гитара', pos: [1.5, -0.3] },
    { key: 'drums', label: 'Ударные', pos: [0.1, 0.95] },
  ];
  for (const spot of SPOTS) spot.pos = new THREE.Vector3(spot.pos[0], 0.16, spot.pos[1]);

  const groups = {};
  const builders = { piano: buildPiano, vocal: buildVocal, guitar: buildGuitar, drums: buildDrums };
  const YAW = { piano: 0.35, vocal: 0.3, guitar: -0.75, drums: -0.5 };
  for (const spot of SPOTS) {
    const group = builders[spot.key]();
    group.position.copy(spot.pos);
    group.rotation.y = Math.atan2(-spot.pos.x, -spot.pos.z) + YAW[spot.key];
    root.add(group);
    groups[spot.key] = group;
  }

  // Spotlight rig: cone of light + glowing ring under the active instrument.
  const lightCone = new THREE.Mesh(
    new THREE.ConeGeometry(1.35, 3.4, 40, 1, true),
    new THREE.MeshBasicMaterial({ color: '#ffd98f', transparent: true, opacity: 0, depthWrite: false, side: THREE.DoubleSide }),
  );
  lightCone.rotation.x = Math.PI;
  root.add(lightCone);
  const spotRing = new THREE.Mesh(
    new THREE.TorusGeometry(0.78, 0.02, 10, 72),
    new THREE.MeshStandardMaterial({ color: '#f4c56a', emissive: '#e0a83c', emissiveIntensity: 1.4, roughness: 0.4 }),
  );
  spotRing.rotation.x = -Math.PI / 2;
  root.add(spotRing);
  const spotLight = new THREE.SpotLight('#ffe2b0', 60, 8, Math.PI * 0.24, 0.55, 1.6);
  spotLight.castShadow = true;
  root.add(spotLight);
  const spotTarget = new THREE.Object3D();
  root.add(spotTarget);
  spotLight.target = spotTarget;

  addShadow(stage, { intensity: 1.6, position: [3, 7, 5] });
  const fill = new THREE.DirectionalLight('#dfe8f6', 0.7);
  fill.position.set(-4, 4, 3);
  scene.add(fill);
  const warmAmbient = new THREE.PointLight('#f4c56a', 8, 10, 2);
  warmAmbient.position.set(0.5, 3, 2);
  scene.add(warmAmbient);

  let current = null;
  let tourTimer = 0;
  let touring = false;
  const shell = viewport.closest('[data-scene]');
  const status = shell.querySelector('[data-scene-status]');

  const setDim = (key, dim) => {
    groups[key].traverse((object) => {
      if (object.material && 'opacity' in object.material) {
        object.material.transparent = true;
        object.material.userData.dimTarget = dim ? 0.5 : 1;
      }
    });
  };

  const applySelection = (key, silent = false) => {
    if (current === key) return;
    if (current) setDim(current, false);
    current = key;
    setDim(key, false);
    for (const other of Object.keys(groups)) {
      if (other !== key) setDim(other, true);
    }
    const spot = SPOTS.find((s) => s.key === key);
    const group = groups[key];
    lightCone.userData.target = spot.pos.clone().setY(1.9);
    lightCone.userData.active = key;
    spotRing.userData.target = spot.pos.clone().setY(0.17);
    spotTarget.position.copy(spot.pos.clone().setY(0.9));
    shell.querySelectorAll('[data-direction]').forEach((b) =>
      b.setAttribute('aria-pressed', String(b.dataset.direction === key)));
    if (!silent) {
      status.textContent = `${spot.label.toUpperCase()}. ${COURSES[key]}`;
    }
    loop.request();
  };

  const loop = createRenderLoop(stage, (delta, time) => {
    let active = false;
    const influence = 1 - Math.exp(-delta * 5);

    // Spotlight cone and ring glide to the active instrument
    if (current) {
      const tc = lightCone.userData.target;
      if (tc) {
        lightCone.position.lerp(tc, influence);
        const near = lightCone.position.distanceTo(tc) < 0.02;
        lightCone.material.opacity = THREE.MathUtils.damp(
          lightCone.material.opacity, near ? 0.22 : 0.04, 4, delta);
        lightCone.scale.setScalar(THREE.MathUtils.damp(lightCone.scale.x, near ? 1 : 0.2, 4, delta));
        active = true;
      }
      const tr = spotRing.userData.target;
      if (tr) {
        spotRing.position.lerp(tr, influence);
        spotRing.material.emissiveIntensity = 1.1 + Math.sin(time * 2.4) * 0.35;
        active = true;
      }
      const group = groups[current];
      group.position.y = Math.sin(time * 1.4) * 0.02;
      if (group.userData.spin) group.rotation.y += delta * group.userData.spin * 0.25;
      if (group.userData.mic) {
        group.userData.mic.rotation.z = Math.sin(time * 0.9) * group.userData.sway;
      }
      if (group.userData.cymbal) {
        group.userData.cymbal.rotation.y += delta * 0.5;
      }
      active = true;
    }

    // Gentle idle life for every instrument
    const idleOn = idleEnabled;
    if (idleOn) {
      for (const key of Object.keys(groups)) {
        if (key === current) continue;
        const group = groups[key];
        group.rotation.y = group.userData.baseRotY + Math.sin(time * 0.5 + spotSeed(key)) * 0.03;
        group.position.y = Math.sin(time * 0.9 + spotSeed(key) * 2) * 0.006;
      }
      lightCone.rotation.z = Math.sin(time * 0.6) * 0.04;
    }

    // Dim/brighten transitions
    for (const key of Object.keys(groups)) {
      groups[key].traverse((object) => {
        if (object.material && object.material.userData.dimTarget !== undefined) {
          const target = object.material.userData.dimTarget;
          if (Math.abs(object.material.opacity - target) > 0.01) {
            object.material.opacity = THREE.MathUtils.damp(object.material.opacity, target, 5, delta);
            active = true;
          }
        }
      });
    }

    // Guided tour: spotlight hops around the stage
    if (touring) {
      tourTimer -= delta;
      if (tourTimer <= 0) {
        tourTimer = 2.6;
        const order = SPOTS.map((s) => s.key);
        const nextKey = order[(order.indexOf(current) + 1) % order.length];
        applySelection(nextKey, true);
        status.textContent = `Экскурсия по сцене: ${SPOTS.find((s) => s.key === nextKey).label}. ${COURSES[nextKey]}`;
      }
      active = true;
    }

    return active;
  });

  SPOTS.forEach((spot, i) => {
    groups[spot.key].userData.baseRotY = groups[spot.key].rotation.y;
  });
  const spotSeed = (key) => SPOTS.findIndex((s) => s.key === key) * 1.7;
  let idleEnabled = true;

  shell.querySelectorAll('[data-direction]').forEach((button) => {
    button.addEventListener('click', () => {
      touring = false;
      idleEnabled = true;
      const tourButton = shell.querySelector('[data-tour]');
      if (tourButton) tourButton.textContent = 'Пройти по сцене';
      applySelection(button.dataset.direction);
    });
  });

  shell.querySelector('[data-tour]')?.addEventListener('click', (event) => {
    touring = !touring;
    event.currentTarget.textContent = touring ? 'Остановить экскурсию' : 'Пройти по сцене';
    if (touring) {
      tourTimer = 0;
      status.textContent = 'Экскурсия по сцене началась: прожектор переключается между направлениями.';
    } else if (current) {
      status.textContent = `${SPOTS.find((s) => s.key === current).label.toUpperCase()}. ${COURSES[current]}`;
    }
  });

  shell.querySelector('[data-reset-camera]')?.addEventListener('click', () => {
    stage.camera.position.set(4.3, 2.7, 5.7);
    stage.controls.target.set(0, 0.95, 0);
    stage.controls.update();
    status.textContent = 'Камера возвращена к общему виду сцены.';
    loop.request();
  });

  const motionButton = shell.querySelector('[data-motion]');
  const syncMotionButton = () => {
    motionButton?.setAttribute('aria-pressed', String(loop.motion));
    if (motionButton) motionButton.textContent = loop.motion ? 'Пауза' : 'Включить вращение';
  };
  motionButton?.addEventListener('click', () => {
    loop.setMotion(!loop.motion);
    idleEnabled = loop.motion;
    syncMotionButton();
    status.textContent = loop.motion
      ? 'Живая сцена: инструменты «дышат», экскурсия доступна.'
      : 'Вращение остановлено. Сцену можно поворачивать вручную.';
  });
  syncMotionButton();

  viewport.addEventListener('scenecontextlost', () => {
    setFallback(viewport, '3D-контекст потерян. Показана статичная версия концепта.');
  });
  window.addEventListener('pagehide', () => loop.dispose(), { once: true });

  stage.renderer.render(scene, stage.camera);
  setReady(viewport, 'Выберите направление на сцене — прожектор покажет инструмент.');
}
