/*
  Folder state is kept separate from card navigation.
  This makes the physical opening/closing sequence easier to tune later.
*/
function initFolder({ stage, openButton }) {
  function openInvitation() {
    if (
      stage.classList.contains('is-closing') ||
      stage.classList.contains('is-opening') ||
      stage.classList.contains('is-open')
    ) return;

    // A short pressure pause makes the seal feel touched before the folder opens.
    stage.classList.add('is-opening');

    window.setTimeout(() => {
      stage.classList.add('is-open');
      openButton.setAttribute('aria-expanded', 'true');
    }, 260);

    window.setTimeout(() => {
      stage.classList.remove('is-opening');
    }, 2260);
  }

  function closeInvitation() {
    if (!stage.classList.contains('is-open') || stage.classList.contains('is-closing')) return;

    stage.classList.add('is-closing');

    // Let the cards compress into a flat stack first.
    // Then close the folder covers over the stacked cards.
    window.setTimeout(() => {
      stage.classList.remove('is-open');
      openButton.setAttribute('aria-expanded', 'false');
    }, 260);

    window.setTimeout(() => {
      stage.classList.remove('is-closing');
    }, 920);
  }

  openButton.addEventListener('click', openInvitation);

  return { openInvitation, closeInvitation };
}
