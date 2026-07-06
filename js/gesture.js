/*
  Gesture handling is isolated because swipe behaviour is easy to improve later
  without touching the card state or folder animation code.
*/
function initGestureNavigation({ stage, goNext, goPrevious }) {
  let startX = 0;
  let startY = 0;
  let startedOnInteractive = false;

  function isInteractiveElement(element) {
    return Boolean(element.closest('a, button, input, textarea, select, [data-no-swipe]'));
  }

  stage.addEventListener('touchstart', (event) => {
    const touch = event.touches[0];
    startX = touch.clientX;
    startY = touch.clientY;
    startedOnInteractive = isInteractiveElement(event.target);
  }, { passive: true });

  stage.addEventListener('touchend', (event) => {
    if (!stage.classList.contains('is-open') || startedOnInteractive) return;

    const touch = event.changedTouches[0];
    const distanceX = touch.clientX - startX;
    const distanceY = touch.clientY - startY;

    if (Math.abs(distanceX) < 48) return;
    if (Math.abs(distanceY) > Math.abs(distanceX) * .8) return;

    distanceX < 0 ? goNext() : goPrevious();
  }, { passive: true });
}
