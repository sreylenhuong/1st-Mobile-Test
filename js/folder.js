/*
  Folder state is kept separate from card navigation.
  Safari/iPhone stability refactor:
  - Keep one physical action at a time.
  - Avoid relying only on stacked setTimeout calls.
  - Reveal the card stack after the folder cover transition has finished.
*/
function initFolder({ stage, openButton }) {
  const OPEN_PRESS_DELAY = 220;
  const CARD_REVEAL_DELAY = 80;
  const CLOSING_REPAINT_DELAY = 40;

  function nextFrame() {
    return new Promise((resolve) => window.requestAnimationFrame(() => resolve()));
  }

  async function twoPaints() {
    await nextFrame();
    await nextFrame();
  }

  function waitForTransition(element, propertyName, fallbackMs) {
    return new Promise((resolve) => {
      let done = false;

      const finish = () => {
        if (done) return;
        done = true;
        element.removeEventListener('transitionend', onEnd);
        window.clearTimeout(timer);
        resolve();
      };

      const onEnd = (event) => {
        if (event.target !== element) return;
        if (propertyName && event.propertyName !== propertyName) return;
        finish();
      };

      const timer = window.setTimeout(finish, fallbackMs);
      element.addEventListener('transitionend', onEnd);
    });
  }

  async function openInvitation() {
    if (
      stage.classList.contains('is-closing') ||
      stage.classList.contains('is-opening') ||
      stage.classList.contains('is-open')
    ) return;

    const leftCover = stage.querySelector('.left-cover');
    const rightCover = stage.querySelector('.right-cover');

    stage.classList.add('is-opening');
    stage.classList.remove('is-revealed', 'is-ready');

    // Small pressure pause so the seal feels touched before the cover moves.
    window.setTimeout(async () => {
      stage.classList.add('is-open');
      openButton.setAttribute('aria-expanded', 'true');

      await Promise.all([
        leftCover ? waitForTransition(leftCover, 'transform', 1350) : Promise.resolve(),
        rightCover ? waitForTransition(rightCover, 'transform', 1350) : Promise.resolve()
      ]);

      // iPhone/Safari needs a clean paint after the covers finish moving.
      // The cards are revealed only after that paint, so they cannot appear
      // before the folder visually opens or inherit the cover's 3D layer.
      await twoPaints();
      stage.classList.add('is-revealed');

      window.setTimeout(() => {
        stage.classList.add('is-ready');
        stage.classList.remove('is-opening');
      }, CARD_REVEAL_DELAY);
    }, OPEN_PRESS_DELAY);
  }

  function closeInvitation() {
    if (!stage.classList.contains('is-open') || stage.classList.contains('is-closing')) return;

    const leftCover = stage.querySelector('.left-cover');
    const rightCover = stage.querySelector('.right-cover');

    openButton.setAttribute('aria-expanded', 'false');

    // iPhone Safari fix:
    // after opening, the covers are hidden with .is-ready to prevent Card 1
    // compositing glitches. Before closing, remove .is-ready first and allow
    // Safari one paint with the covers visible in their open position. Then
    // add .is-closing so both covers animate back together instead of the
    // right cover appearing late or snapping.
    // Bring the hidden open covers back first, but do not close them yet.
    // iPhone Safari needs two paints here; otherwise the right cover can
    // reappear late, snap, or close after the cards have already changed.
    stage.classList.remove('is-ready');
    stage.classList.add('is-preparing-close');
    stage.offsetHeight;

    window.setTimeout(async () => {
      await twoPaints();
      stage.classList.add('is-closing');
      stage.classList.remove('is-preparing-close');

      // is-open stays on purpose while the covers fold shut (see the
      // .stage.is-closing cover overrides in folder.css / responsive.css).
      // That keeps every card pinned to its already-open resting transform,
      // so nothing on the card layer animates while the cover's 3D rotation
      // is still resolving.
      await Promise.all([
        leftCover ? waitForTransition(leftCover, 'transform', 900) : Promise.resolve(),
        rightCover ? waitForTransition(rightCover, 'transform', 900) : Promise.resolve()
      ]);

      // Covers are physically closed now. Fade the cards away and drop
      // is-open together; the cover is no longer moving at this point, so
      // this opacity-only fade doesn't overlap any 3D transform animation.
      stage.classList.remove('is-revealed');
      stage.classList.remove('is-open');

      window.setTimeout(() => {
        stage.classList.remove('is-closing');
      }, 320);
    }, CLOSING_REPAINT_DELAY);
  }

  openButton.addEventListener('click', openInvitation);

  return { openInvitation, closeInvitation };
}
