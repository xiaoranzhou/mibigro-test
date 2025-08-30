import { loadData, getMedia, getMedium, getComposition } from './state.js';
import { renderMediaTable, renderCompositionView, renderError } from './views.js';

const appRoot = document.getElementById('app-root');

async function router() {
  const hash = window.location.hash || '#/media';
  const [path, id] = hash.substring(2).split('/');

  appRoot.innerHTML = ''; // Clear previous content

  switch (path) {
    case 'media':
      if (id) {
        const medium = getMedium(id);
        if (medium) {
          const composition = getComposition(id);
          renderCompositionView(appRoot, medium, composition);
        } else {
          renderError('Medium not found');
        }
      } else {
        renderMediaTable(appRoot, getMedia());
      }
      break;
    default:
      window.location.hash = '#/media';
  }
}

async function init() {
  await loadData();
  router();
  window.addEventListener('hashchange', router);
}

init();