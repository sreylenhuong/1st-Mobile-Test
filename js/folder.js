/*
  Folder state is kept separate from card navigation.
  Safari/iPhone stability refactor:
  - Keep one physical action at a time.
  - Avoid relying only on stacked setTimeout calls.
  - Reveal the card stack after the folder cover transition has finished.
*/
function initFolder({ stage, openButton }) {
  const OPEN_PRESS_DELAY = 220;
  const CLOSE_STACK_DELAY = 280;

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
    stage.classList.remove('is-revealed');

    // Small pressure pause so the seal feels touched before the cover moves.
    window.setTimeout(async () => {
      stage.classList.add('is-open');
      openButton.setAttribute('aria-expanded', 'true');

      if (leftCover) {
        await waitForTransition(leftCover, 'transform', 1350);
      }

      // Reveal cards only after the folder has physically opened.
      stage.classList.add('is-revealed');
      stage.classList.remove('is-opening');
    }, OPEN_PRESS_DELAY);
  }

  function closeInvitation() {
    if (!stage.classList.contains('is-open') || stage.classList.contains('is-closing')) return;

    stage.classList.add('is-closing');
    stage.classList.remove('is-revealed');

    // Let the cards settle first, then close the folder covers over the stack.
    window.setTimeout(() => {
      stage.classList.remove('is-open');
      openButton.setAttribute('aria-expanded', 'false');
    }, CLOSE_STACK_DELAY);

    window.setTimeout(() => {
      stage.classList.remove('is-closing');
    }, 1120);
  }

  openButton.addEventListener('click', openInvitation);

  return { openInvitation, closeInvitation };
}
