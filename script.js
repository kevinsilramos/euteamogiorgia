const pages = Array.from(document.querySelectorAll('[data-page]'));
const pageIds = pages.map((page) => page.dataset.page);
const pageAliases = {
  felicidades: 'parabens',
};
let activePage = 'capa';
let touchStartX = 0;
let touchStartY = 0;

function normalizePageId(pageId) {
  return pageAliases[pageId] || pageId || 'capa';
}

function showPage(pageId, pushHash = true) {
  const normalizedPageId = normalizePageId(pageId);
  if (!pageIds.includes(normalizedPageId)) return;

  activePage = normalizedPageId;

  pages.forEach((page) => {
    const isActive = page.dataset.page === normalizedPageId;
    page.classList.toggle('is-active', isActive);
    page.setAttribute('aria-hidden', String(!isActive));

    if (isActive) {
      const scrollable = page.querySelector('.chapter-body');
      if (scrollable) scrollable.scrollTop = 0;
    }
  });

  if (pushHash) {
    const newHash = normalizedPageId === 'capa' ? '#' : `#${normalizedPageId}`;
    if (window.location.hash !== newHash) {
      history.pushState(null, '', newHash);
    }
  }
}

function goToRelativePage(direction) {
  const currentIndex = pageIds.indexOf(activePage);
  const nextIndex = currentIndex + direction;

  if (nextIndex >= 0 && nextIndex < pageIds.length) {
    showPage(pageIds[nextIndex]);
  }
}

document.addEventListener('click', (event) => {
  const target = event.target.closest('[data-page-target]');
  if (!target) return;

  event.preventDefault();
  showPage(target.dataset.pageTarget);
});

window.addEventListener('popstate', () => {
  const pageFromHash = window.location.hash.replace('#', '') || 'capa';
  showPage(pageFromHash, false);
});

window.addEventListener('load', () => {
  const pageFromHash = window.location.hash.replace('#', '') || 'capa';
  showPage(pageFromHash, false);
});

document.addEventListener('keydown', (event) => {
  if (event.key === 'ArrowRight') goToRelativePage(1);
  if (event.key === 'ArrowLeft') goToRelativePage(-1);
});

document.querySelector('.book').addEventListener('touchstart', (event) => {
  const touch = event.changedTouches[0];
  touchStartX = touch.clientX;
  touchStartY = touch.clientY;
}, { passive: true });

document.querySelector('.book').addEventListener('touchend', (event) => {
  const touch = event.changedTouches[0];
  const deltaX = touch.clientX - touchStartX;
  const deltaY = touch.clientY - touchStartY;

  if (Math.abs(deltaX) < 70 || Math.abs(deltaX) < Math.abs(deltaY)) return;

  if (deltaX < 0) goToRelativePage(1);
  if (deltaX > 0) goToRelativePage(-1);
}, { passive: true });
