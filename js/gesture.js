/*
  Gesture handling is isolated because swipe behaviour is easy to improve later
  without touching the card state or folder animation code.
*/
function initGestureNavigation({ stage, goNext, goPrevious }) {
  let startX = 0;

  stage.addEventListener('touchstart', (event) => {
    if (event.target.closest('a, button, input, textarea, select')) return;
    startX = event.touches[0].clientX;
  }, { passive: true });

  stage.addEventListener('touchend', (event) => {
    if (event.target.closest('a, button, input, textarea, select')) return;
    if (!stage.classList.contains('is-open')) return;

    const endX = event.changedTouches[0].clientX;
    const distance = endX - startX;

    if (Math.abs(distance) < 48) return;

    distance < 0 ? goNext() : goPrevious();
  }, { passive: true });
}
