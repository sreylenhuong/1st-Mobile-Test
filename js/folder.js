/*
  Folder state is kept separate from card navigation.
  Safari/iPhone stability refactor:
  - Keep one physical action at a time.
  - Avoid relying only on stacked setTimeout calls.
  - Reveal the card stack after the folder cover transition has finished.
*/
function initFolder({ stage, openButton }) {
  const OPEN_PRESS_DELAY = 220;
  const CARD_REVEAL_DELAY = 720;

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

    stage.classList.add('is-opening');
    stage.classList.remove('is-revealed', 'is-ready');

    // Small pressure pause so the seal feels touched before the cover moves.
    window.setTimeout(async () => {
      stage.classList.add('is-open');
      openButton.setAttribute('aria-expanded', 'true');

      if (leftCover) {
        await waitForTransition(leftCover, 'transform', 1350);
      }

      // Reveal cards only after the folder has physically opened.
      // iPhone Safari fix: keep the first card frozen for the first paint,
      // then mark the invitation ready on the next frame. This prevents the
      // first card from inheriting an unfinished opening transition.
      stage.classList.add('is-revealed');

      // Let the card stack complete its gentle reveal before hiding the
      // transparent cover layers from iPhone Safari's compositor.
      window.setTimeout(() => {
        stage.classList.add('is-ready');
        stage.classList.remove('is-opening');
      }, CARD_REVEAL_DELAY);
    }, OPEN_PRESS_DELAY);
  }

  function closeInvitation() {
    if (!stage.classList.contains('is-open') || stage.classList.contains('is-closing')) return;

    const leftCover = stage.querySelector('.left-cover');

    stage.classList.add('is-closing');
    stage.classList.remove('is-ready');
    openButton.setAttribute('aria-expanded', 'false');

    // is-open stays on purpose while the covers fold shut (see the
    // .stage.is-closing cover overrides in folder.css / responsive.css).
    // That keeps every card pinned to its already-open resting transform,
    // so nothing on the card layer animates while the cover's 3D rotation
    // is still resolving.
    (async () => {
      if (leftCover) {
        await waitForTransition(leftCover, 'transform', 900);
      }

      // Covers are physically closed now. Fade the cards away and drop
      // is-open together; the cover is no longer moving at this point, so
      // this opacity-only fade doesn't overlap any 3D transform animation.
      stage.classList.remove('is-revealed');
      stage.classList.remove('is-open');

      window.setTimeout(() => {
        stage.classList.remove('is-closing');
      }, 320);
    })();
  }

  openButton.addEventListener('click', openInvitation);

  return { openInvitation, closeInvitation };
}
