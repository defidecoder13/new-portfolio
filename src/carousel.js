// ──────────────────────────────────────────────────────────────────────────
// CAROUSEL & MEDIA PLAYER UTILITIES
// ──────────────────────────────────────────────────────────────────────────

export function enhanceCarousels(container) {
  if (!container) return;
  const carousels = container.querySelectorAll('.carousel');
  carousels.forEach((car) => {
    const slides = car.querySelectorAll('.slide');
    if (slides.length <= 1) return;
    let idx = 0;
    const update = () => {
      slides.forEach((s, i) => {
        s.classList.toggle('active', i === idx);
        const vid = s.querySelector('video');
        if (vid) {
          if (i === idx) vid.play().catch(() => {});
          else vid.pause();
        }
      });
    };
    const nextBtn = car.querySelector('.carousel-next');
    const prevBtn = car.querySelector('.carousel-prev');
    if (nextBtn) nextBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      idx = (idx + 1) % slides.length;
      update();
    });
    if (prevBtn) prevBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      idx = (idx - 1 + slides.length) % slides.length;
      update();
    });
    update();
  });
}

export function pauseCarousels(container) {
  if (!container) return;
  const vids = container.querySelectorAll('video');
  vids.forEach((v) => v.pause());
}
