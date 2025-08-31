import { loadData, getMedia, getMedium, getComposition, getSolutions, getIngredients } from './state.js';
import { renderMediaTable, renderCompositionView, renderError, renderAbout, renderLinks, renderSolutionsTable, renderIngredientsTable } from './views.js';

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
    case 'solutions':
        renderSolutionsTable(appRoot, getSolutions());
        break;
    case 'ingredients':
        renderIngredientsTable(appRoot, getIngredients());
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

  const ingredientModal = document.getElementById('ingredientModal');
  ingredientModal.addEventListener('show.bs.modal', function (event) {
    const button = event.relatedTarget;
    const ingredient = JSON.parse(button.getAttribute('data-ingredient'));
    const modalTitle = ingredientModal.querySelector('.modal-title');
    const modalBody = ingredientModal.querySelector('.modal-body');
    modalTitle.textContent = ingredient.name;

    let tableHtml = '<table class="table">';
    for (const key in ingredient) {
        let value = ingredient[key];
        if (key === 'ChEBI' && value) {
            value = `<a href="https://www.ebi.ac.uk/chebi/searchId.do?chebiId=CHEBI:${value}" target="_blank">${value}</a>`;
        } else if (key === 'PubChem' && value) {
            value = `<a href="https://pubchem.ncbi.nlm.nih.gov/compound/${value}" target="_blank">${value}</a>`;
        }
        tableHtml += `<tr><th scope="row">${key}</th><td>${value !== null ? value : ''}</td></tr>`;
    }
    tableHtml += '</table>';

    modalBody.innerHTML = tableHtml;
  });
}

init();