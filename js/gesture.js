/*
  Gesture handling is isolated because swipe behaviour is easy to improve later
  without touching the card state or folder animation code.
*/
function initGestureNavigation({ stage, goNext, goPrevious }) {
  let startX = 0;
  let startY = 0;
  let startedOnInteractiveElement = false;

  function isInteractiveElement(target) {
    return Boolean(target.closest('a, button, input, textarea, select, [data-no-swipe]'));
  }

  stage.addEventListener('touchstart', (event) => {
    startX = event.touches[0].clientX;
    startY = event.touches[0].clientY;
    startedOnInteractiveElement = isInteractiveElement(event.target);
  }, { passive: true });

  stage.addEventListener('touchend', (event) => {
    if (!stage.classList.contains('is-open')) return;
    if (startedOnInteractiveElement) return;

    const endX = event.changedTouches[0].clientX;
    const endY = event.changedTouches[0].clientY;
    const distanceX = endX - startX;
    const distanceY = endY - startY;

    if (Math.abs(distanceX) < 48) return;
    if (Math.abs(distanceY) > Math.abs(distanceX) * 0.75) return;

    distanceX < 0 ? goNext() : goPrevious();
  }, { passive: true });
}
