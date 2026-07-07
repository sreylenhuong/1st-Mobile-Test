/*
  Folder state is kept separate from card navigation.
  Safari/iPhone stability refactor:
  - Keep one physical action at a time.
  - Avoid relying only on stacked setTimeout calls.
  - Cards remain physically inside the folder at all times.
  - Covers conceal/reveal the existing card stack instead of creating a card reveal.
*/
function initFolder({ stage, openButton }) {
  const OPEN_PRESS_DELAY = 220;
  const CLOSE_COVER_DELAY = 60;

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
    stage.classList.remove('is-ready');

    // Small pressure pause so the seal feels touched before the cover moves.
    window.setTimeout(async () => {
      stage.classList.add('is-open');
      openButton.setAttribute('aria-expanded', 'true');

      if (leftCover) {
        await waitForTransition(leftCover, 'transform', 1350);
      }

      // The cards were already inside the folder. Once the covers finish
      // opening, hide the now-invisible cover layers from iPhone Safari's
      // compositor. This keeps Card 1 stable without adding a fake card reveal.
      window.requestAnimationFrame(() => {
        stage.classList.add('is-ready');
        stage.classList.remove('is-opening');
      });
    }, OPEN_PRESS_DELAY);
  }

  function closeInvitation() {
    if (!stage.classList.contains('is-open') || stage.classList.contains('is-closing')) return;

    stage.classList.add('is-closing');

    // Bring the covers back into the render tree first. The cards stay in
    // place on the base, then the covers close over them like a real folder.
    stage.classList.remove('is-ready');

    window.setTimeout(() => {
      stage.classList.remove('is-open');
      openButton.setAttribute('aria-expanded', 'false');
    }, CLOSE_COVER_DELAY);

    window.setTimeout(() => {
      stage.classList.remove('is-closing');
    }, 1240);
  }

  openButton.addEventListener('click', openInvitation);

  return { openInvitation, closeInvitation };
}
