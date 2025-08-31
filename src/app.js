import { loadData, getMedia, getMedium, getComposition, getSolutions, getSolution, getSolutionComposition, getIngredients, getIngredient, getIngredientDetails, getStrainsForMedium, getAllStrains, getMediaForStrain } from './state.js';
import { renderMediaTable, renderCompositionView, renderError, renderAbout, renderLinks, renderSolutionsTable, renderIngredientsTable, renderSolutionCompositionView, renderSolutionJsonView, renderIngredientDetailView, renderStrainsTable, renderStrainDetailView } from './views.js';

const appRoot = document.getElementById('app-root');
const loadingOverlay = document.getElementById('loading-overlay');

function showLoading() {
  loadingOverlay.style.display = 'flex';
}

function hideLoading() {
  loadingOverlay.style.display = 'none';
}

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
  showLoading();
  const hash = window.location.hash || '#/media';
  const parts = hash.substring(2).split('/');
  const [path, id, extra] = parts;

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
    case 'solutions':
      if (id) {
        if (extra === 'json') {
            const solution = getSolution(id);
            if (solution) {
                const composition = getSolutionComposition(id);
                renderSolutionJsonView(appRoot, solution, composition);
            } else {
                renderError('Solution not found');
            }
        } else {
            const solution = getSolution(id);
            if (solution) {
              const composition = getSolutionComposition(id);
              renderSolutionCompositionView(appRoot, solution, composition);
            } else {
              renderError('Solution not found');
            }
        }
      } else {
        renderSolutionsTable(appRoot, getSolutions());
      }
      break;
    case 'ingredients':
      if (id) {
        const ingredient = getIngredient(id);
        if (ingredient) {
          const ingredientDetails = getIngredientDetails(id);
          renderIngredientDetailView(appRoot, ingredient, ingredientDetails);
        } else {
          renderError('Ingredient not found');
        }
      } else {
        renderIngredientsTable(appRoot, getIngredients());
      }
      break;
    case 'strains':
      if (id) {
        const strainName = decodeURIComponent(id);
        const mediaForStrain = getMediaForStrain(strainName);
        renderStrainDetailView(appRoot, strainName, mediaForStrain);
      } else {
        renderStrainsTable(appRoot, getAllStrains());
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
  hideLoading();
}

async function init() {
  showLoading();
  await loadData();
  router();
  window.addEventListener('hashchange', router);
  hideLoading();
}


init();