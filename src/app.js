
import { loadData, getMedia, getMedium, getComposition } from './state.js';
import { renderMediaTable, renderCompositionView, renderError, renderAbout, renderLinks } from './views.js';

const appRoot = document.getElementById('app-root');

function updateSidenav() {
    const hash = window.location.hash || '#/media';
    const links = document.querySelectorAll('#sidebarMenu .nav-link');
    links.forEach(link => {
        if (link.getAttribute('href') === hash) {
            link.classList.add('active');
        } else {
            link.classList.remove('active');
        }
    });
}

async function router() {
  const hash = window.location.hash || '#/media';
  const [path, id] = hash.substring(2).split('/');

  appRoot.innerHTML = ''; // Clear previous content
  updateSidenav();

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
    case 'about':
        renderAbout(appRoot);
        break;
    case 'links':
        renderLinks(appRoot);
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
