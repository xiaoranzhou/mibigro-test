import { loadData, getMedia, getMedium, getComposition, getSolutions, getIngredients, getIngredientDetails, getStrainsForMedium } from './state.js';
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
    const ingredientDetails = getIngredientDetails(ingredient.id);

    const modalTitle = ingredientModal.querySelector('.modal-title');
    const modalBody = ingredientModal.querySelector('.modal-body');
    modalTitle.textContent = ingredient.name;

    let tableHtml = '<table class="table">';
    const details = ingredientDetails || ingredient;
    for (const key in details) {
        let value = details[key];
        if (key === 'ChEBI' && value) {
            value = `<a href="https://www.ebi.ac.uk/chebi/searchId.do?chebiId=CHEBI:${value}" target="_blank">${value}</a>`;
        } else if (key === 'PubChem' && value) {
            value = `<a href="https://pubchem.ncbi.nlm.nih.gov/compound/${value}" target="_blank">${value}</a>`;
        } else if (Array.isArray(value)) {
            value = value.join(', ');
        }
        tableHtml += `<tr><th scope="row">${key}</th><td>${value !== null ? value : ''}</td></tr>`;
    }
    tableHtml += '</table>';

    modalBody.innerHTML = tableHtml;
  });

  const strainModal = document.getElementById('strainModal');
  strainModal.addEventListener('show.bs.modal', function (event) {
    const button = event.relatedTarget;
    const strains = JSON.parse(button.getAttribute('data-strains'));
    const modalTitle = strainModal.querySelector('.modal-title');
    const modalBody = strainModal.querySelector('.modal-body');
    modalTitle.textContent = 'Strains';

    let tableHtml = '<table class="table">';
    tableHtml += '<thead><tr><th>ID</th><th>Species</th><th>CCNO</th><th>Growth</th><th>BacDive ID</th><th>Domain</th></tr></thead>';
    tableHtml += '<tbody>';
    for (const strain of strains) {
        tableHtml += `<tr>
            <td>${strain.id}</td>
            <td>${strain.species}</td>
            <td>${strain.ccno}</td>
            <td>${strain.growth}</td>
            <td><a href="https://bacdive.dsmz.de/strain/${strain.bacdive_id}" target="_blank">${strain.bacdive_id}</a></td>
            <td>${strain.domain}</td>
        </tr>`;
    }
    tableHtml += '</tbody></table>';

    modalBody.innerHTML = tableHtml;
  });
}

init();