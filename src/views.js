import { createTable, applyFilter } from './ui.js';
import { getIngredientByName, getStrainsForMedium, getMediaForStrain, getMedium, getSolutions, getIngredients, getSolutionComposition } from './state.js';

let filters = {};

export function renderMediaTable(element, media) {
  const headers = [
    { key: 'id', label: 'ID', searchable: true },
    { key: 'name', label: 'Name', searchable: true },
    { key: 'source', label: 'Source', searchable: true },
    { key: 'ph', label: 'pH', searchable: false },
    { key: 'complex', label: 'Complex', searchable: false },
  ];

  const rows = media.map(m => ({
    id: m.id,
    name: `<a href="#/media/${m.canonId}">${m.name}</a>`,
    source: m.source,
    ph: formatPh(m.min_pH, m.max_pH),
    complex: m.complex_medium ? 'Yes' : 'No',
  }));

  const table = createTable(headers, rows, (key, value) => {
    filters[key] = value;
    applyFilter(table, filters, headers);
  });

  element.appendChild(table);
}

export function renderCompositionView(element, medium, composition) {
  const { name, id, source, min_pH, max_pH, link } = medium;
  const strains = getStrainsForMedium(id);

  let html = `
    <div class="d-flex justify-content-between flex-wrap flex-md-nowrap align-items-center pt-3 pb-2 mb-3 border-bottom">
        <h1 class="h2">${name}</h1>
    </div>
    <table class="table table-sm table-bordered">
      <tbody>
        <tr><th scope="row">ID</th><td>${id}</td></tr>
        <tr><th scope="row">Source</th><td>${source}</td></tr>
        <tr><th scope="row">pH</th><td>${formatPh(min_pH, max_pH)}</td></tr>
  `;

  if (link) {
    html += `<tr><th scope="row">External Link</th><td><a href="${link}" target="_blank" rel="noopener noreferrer">${link}</a></td></tr>`;
  }

  html += `</tbody></table>`;
  element.innerHTML = html;

  if (composition) {
    const headers = [
      { key: 'name', label: 'Ingredient' },
      { key: 'g_l', label: 'g/L' },
      { key: 'mmol_l', label: 'mmol/L' },
      { key: 'optional', label: 'Optional' },
    ];
    const rows = composition.map(c => {
        const ingredient = getIngredientByName(c.name);
        const ingredientName = ingredient ?
            `<a href="#/ingredients/${ingredient.id}">${c.name}</a>` :
            c.name;
        return {
            ...c,
            name: ingredientName,
            optional: c.optional ? 'Yes' : 'No',
        }
    });
    const table = createTable(headers, rows);
    element.appendChild(table);

  } else {
    element.insertAdjacentHTML('beforeend', '<div class="alert alert-warning">No composition data found for this medium.</div>');
  }

  if (strains && strains.length > 0) {
    element.insertAdjacentHTML('beforeend', '<h3 class="mt-4">Related Strains</h3>');
    const strainHeaders = [
      { key: 'species', label: 'Species' },
      { key: 'ccno', label: 'CCNO' },
      { key: 'growth', label: 'Growth' },
      { key: 'bacdive_id', label: 'BacDive ID' },
      { key: 'domain', label: 'Domain' },
    ];
    const strainRows = strains.map(s => ({
      ...s,
      species: `<a href="#/strains/${encodeURIComponent(s.species)}">${s.species}</a>`,
      bacdive_id: `<a href="https://bacdive.dsmz.de/strain/${s.bacdive_id}" target="_blank">${s.bacdive_id}</a>`,
    }));
    const strainTable = createTable(strainHeaders, strainRows);
    element.appendChild(strainTable);
  }
}

export function renderSolutionsTable(element, solutions) {
  const headers = [
    { key: 'id', label: 'ID', searchable: true },
    { key: 'name', label: 'Name', searchable: true },
    { key: 'volume', label: 'Volume', searchable: false },
  ];

  const rows = solutions.map(s => ({
    id: s.id,
    name: `<a href="#/solutions/${s.id}">${s.name}</a>`,
    volume: s.volume,
  }));

  const table = createTable(headers, rows, (key, value) => {
    filters[key] = value;
    applyFilter(table, filters, headers);
  });

  element.appendChild(table);
}

export function renderIngredientsTable(element, ingredients) {
  const headers = [
    { key: 'id', label: 'ID', searchable: true },
    { key: 'name', label: 'Name', searchable: true },
    { key: 'CAS-RN', label: 'CAS-RN', searchable: true },
    { key: 'formula', label: 'Formula', searchable: true },
    { key: 'mass', label: 'Mass', searchable: false },
  ];

  const rows = ingredients.map(i => ({
    id: i.id,
    name: `<a href="#/ingredients/${i.id}">${i.name}</a>`,
    'CAS-RN': i['CAS-RN'],
    formula: i.formula,
    mass: i.mass,
  }));

  const table = createTable(headers, rows, (key, value) => {
    filters[key] = value;
    applyFilter(table, filters, headers);
  });

  element.appendChild(table);
}

export function renderIngredientDetailView(element, ingredient, ingredientDetails) {
  const { id, name, 'CAS-RN': casRn, formula, mass } = ingredient;

  let html = `
    <div class="d-flex justify-content-between flex-wrap flex-md-nowrap align-items-center pt-3 pb-2 mb-3 border-bottom">
        <h1 class="h2">${name}</h1>
    </div>
    <p><strong>ID:</strong> ${id}</p>
    <p><strong>CAS-RN:</strong> ${casRn || 'N/A'}</p>
    <p><strong>Formula:</strong> ${formula || 'N/A'}</p>
    <p><strong>Mass:</strong> ${mass || 'N/A'}</p>
  `;

  if (ingredientDetails) {
    html += '<h3>Additional Details</h3>';
    html += '<table class="table">';
    for (const key in ingredientDetails) {
        let value = ingredientDetails[key];
        if (key === 'ChEBI' && value) {
            value = `<a href="https://www.ebi.ac.uk/chebi/searchId.do?chebiId=CHEBI:${value}" target="_blank">${value}</a>`;
        } else if (key === 'PubChem' && value) {
            value = `<a href="https://pubchem.ncbi.nlm.nih.gov/compound/${value}" target="_blank">${value}</a>`;
        } else if (Array.isArray(value)) {
            value = value.join(', ');
        }
        html += `<tr><th scope="row">${key}</th><td>${value !== null ? value : ''}</td></tr>`;
    }
    html += '</table>';
  } else {
    html += '<div class="alert alert-warning">No additional details found for this ingredient.</div>';
  }

  element.innerHTML = html;
}

export function renderStrainsTable(element, strains) {
  const headers = [
    { key: 'name', label: 'Strain Name', searchable: true },
  ];

  const rows = strains.map(s => ({
    name: `<a href="#/strains/${encodeURIComponent(s)}">${s}</a>`,
  }));

  const table = createTable(headers, rows, (key, value) => {
    filters[key] = value;
    applyFilter(table, filters, headers);
  });

  element.appendChild(table);
}

export function renderStrainDetailView(element, strainName, mediaForStrain) {
  let html = `
    <div class="d-flex justify-content-between flex-wrap flex-md-nowrap align-items-center pt-3 pb-2 mb-3 border-bottom">
        <h1 class="h2">Media for ${strainName}</h1>
    </div>
  `;

  if (mediaForStrain && mediaForStrain.length > 0) {
    const headers = [
      { key: 'id', label: 'ID' },
      { key: 'name', label: 'Name' },
      { key: 'source', label: 'Source' },
    ];
    const rows = mediaForStrain.map(m => ({
      id: m.id,
      name: `<a href="#/media/${m.id}">${m.name}</a>`,
      source: m.source,
    }));
    const table = createTable(headers, rows);
    element.innerHTML = html;
    element.appendChild(table);
  } else {
    html += '<div class="alert alert-warning">No media found for this strain.</div>';
    element.innerHTML = html;
  }
}

export function renderError(message) {
  const element = document.getElementById('app-root');
  element.innerHTML = `<div class="alert alert-danger">${message}</div>`;
}

export function renderAbout(element) {
    const content = `
        <h2>About MibiGro (Prototype)</h2>
        <p>This application is a single-page prototype designed to explore, search, and view compositions of various microbiological media.</p>
        <p>It is built with vanilla JavaScript and Bootstrap 5.3, following the specifications outlined in the project's build document.</p>
        
        <h3>Features:</h3>
        <ul>
            <li>View and search lists of media, solutions, ingredients, and strains.</li>
            <li>See detailed composition for each medium.</li>
            <li>Client-side search and sort functionalities.</li>
        </ul>

        <h3>Data Sources:</h3>
        <p>The application uses local JSON files for all its data, including media, compositions, ingredients, and strains.</p>

        <h3>Contributors:</h3>
        <ul>
            <li>Xiaoran Zhou</li>
            <li>Sabrina Zander</li>
        </ul>
    `;
    element.innerHTML = content;
}

export function renderLinks(element) {
    element.innerHTML = '<h2>Links</h2><ul><li><a href="https://www.dsmz.de/">DSMZ</a></li></ul>';
}

function formatPh(min, max) {
  if (min === null && max === null) return '';
  if (min === max) return min;
  return `${min}–${max}`;
}

export function renderSolutionCompositionView(element, solution, composition) {
  const { name, id, volume } = solution;

  let html = `
    <div class="d-flex justify-content-between flex-wrap flex-md-nowrap align-items-center pt-3 pb-2 mb-3 border-bottom">
        <h1 class="h2">${name}</h1>
        <div class="btn-toolbar mb-2 mb-md-0">
            <a href="#/solutions/${id}/json" class="btn btn-sm btn-outline-secondary">Show JSON</a>
        </div>
    </div>
    <p><strong>ID:</strong> ${id}</p>
    <p><strong>Volume:</strong> ${volume}</p>
  `;

  if (composition && composition.recipe) {
    const headers = [
      { key: 'name', label: 'Ingredient' },
      { key: 'g_l', label: 'g/L' },
      { key: 'mmol_l', label: 'mmol/L' },
      { key: 'optional', label: 'Optional' },
    ];
    const rows = composition.recipe.map(c => {
        const ingredient = getIngredientByName(c.compound);
        const ingredientName = ingredient ?
            `<a href="#/ingredients/${ingredient.id}">${c.compound}</a>` :
            c.compound;
        return {
            name: ingredientName,
            g_l: c.g_l,
            mmol_l: c.mmol_l,
            optional: c.optional ? 'Yes' : 'No',
        }
    });
    const table = createTable(headers, rows);
    element.innerHTML = html;
    element.appendChild(table);

  } else {
    html += '<div class="alert alert-warning">No composition data found for this solution.</div>';
    element.innerHTML = html;
  }
}

export function renderAddMediaView(element) {
  const solutions = getSolutions();
  const ingredients = getIngredients();

  const html = `
    <div class="d-flex justify-content-between flex-wrap flex-md-nowrap align-items-center pt-3 pb-2 mb-3 border-bottom">
      <h1 class="h2">Add New Medium</h1>
    </div>

    <form>
      <div class="row">
        <div class="col-md-6 mb-3">
          <label for="mediumName" class="form-label">Medium Name</label>
          <input type="text" class="form-control" id="mediumName" required>
        </div>
        <div class="col-md-6 mb-3">
          <label for="mediumSource" class="form-label">Source</label>
          <input type="text" class="form-control" id="mediumSource">
        </div>
      </div>
      <div class="row">
        <div class="col-md-6 mb-3">
          <label for="mediumMinPh" class="form-label">Min pH</label>
          <input type="number" step="0.1" class="form-control" id="mediumMinPh">
        </div>
        <div class="col-md-6 mb-3">
          <label for="mediumMaxPh" class="form-label">Max pH</label>
          <input type="number" step="0.1" class="form-control" id="mediumMaxPh">
        </div>
      </div>

      <hr>

      <h3 class="h3">Composition</h3>

      <div class="mb-3">
        <label for="solutionSelect" class="form-label">Use a Recipe/Solution</label>
        <input class="form-control" list="solutionOptions" id="solutionSelect" placeholder="Type to search for a solution...">
        <datalist id="solutionOptions">
          ${solutions.map(s => `<option value="${s.name}">`).join('')}
        </datalist>
      </div>

      <table class="table" id="composition-table">
        <thead>
          <tr>
            <th scope="col">Ingredient</th>
            <th scope="col">g/L</th>
            <th scope="col">mmol/L</th>
            <th scope="col">Optional</th>
            <th scope="col"></th>
          </tr>
        </thead>
        <tbody>
          <!-- Ingredient rows will be added here dynamically -->
        </tbody>
      </table>

      <button type="button" class="btn btn-outline-primary" id="add-ingredient-btn">Add Ingredient</button>

      <hr>

      <button type="submit" class="btn btn-primary">Save Medium</button>
    </form>

    <datalist id="ingredientOptions">
      ${ingredients.map(i => `<option value="${i.name}">`).join('')}
    </datalist>
  `;

  element.innerHTML = html;

  const addIngredientBtn = document.getElementById('add-ingredient-btn');
  const compositionTableBody = document.querySelector('#composition-table tbody');
  const solutionSelect = document.getElementById('solutionSelect');

  const addIngredientRow = (ingredient = {}) => {
    const row = document.createElement('tr');
    row.innerHTML = `
      <td><input class="form-control" list="ingredientOptions" placeholder="Type to search..." value="${ingredient.name || ''}"></td>
      <td><input type="number" step="any" class="form-control" value="${ingredient.g_l || ''}"></td>
      <td><input type="number" step="any" class="form-control" value="${ingredient.mmol_l || ''}"></td>
      <td><input type="checkbox" class="form-check-input" ${ingredient.optional ? 'checked' : ''}></td>
      <td><button type="button" class="btn btn-sm btn-outline-danger remove-ingredient-btn">Remove</button></td>
    `;
    compositionTableBody.appendChild(row);
  };

  addIngredientBtn.addEventListener('click', () => addIngredientRow());

  compositionTableBody.addEventListener('click', (event) => {
    if (event.target.classList.contains('remove-ingredient-btn')) {
      event.target.closest('tr').remove();
    }
  });

  solutionSelect.addEventListener('change', (event) => {
    const solutionName = event.target.value;
    const solution = solutions.find(s => s.name === solutionName);
    if (solution) {
      const solutionComposition = getSolutionComposition(solution.id);
      if (solutionComposition && solutionComposition.recipe) {
        solutionComposition.recipe.forEach(ingredient => {
          addIngredientRow({
            name: ingredient.compound,
            g_l: ingredient.g_l,
            mmol_l: ingredient.mmol_l,
            optional: ingredient.optional,
          });
        });
      }
      event.target.value = '';
    }
  });
}