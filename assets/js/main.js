import { reducedMotionQuery, setFallback } from './core/stage.js';

const page = document.querySelector('[data-scene="piano"]');
const viewport = page?.querySelector('[data-scene-viewport]');

if (page && viewport) {
  try {
    const module = await import('./pages/piano.js');
    await module.init(viewport, { reducedMotion: reducedMotionQuery.matches });
  } catch (error) {
    console.error('Piano scene initialization failed:', error);
    setFallback(viewport, 'Показана статичная версия — 3D на этом устройстве недоступно.');
  }
}

for (const button of document.querySelectorAll('[data-scroll-to]')) {
  button.addEventListener('click', () => {
    document.querySelector(button.dataset.scrollTo)?.scrollIntoView({
      behavior: reducedMotionQuery.matches ? 'auto' : 'smooth',
    });
  });
}
