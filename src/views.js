import { createTable, applyFilter } from './ui.js';
import { getIngredientByName } from './state.js';

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

  let html = `
    <h2>${name}</h2>
    <p><strong>ID:</strong> ${id}</p>
    <p><strong>Source:</strong> ${source}</p>
    <p><strong>pH:</strong> ${formatPh(min_pH, max_pH)}</p>
  `;

  if (link) {
    html += `<p><a href="${link}" target="_blank" rel="noopener noreferrer">External Link</a></p>`;
  }

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
            `<a href="#" data-bs-toggle="modal" data-bs-target="#ingredientModal" data-ingredient='${JSON.stringify(ingredient)}'>${c.name}</a>` :
            c.name;
        return {
            ...c,
            name: ingredientName,
            optional: c.optional ? 'Yes' : 'No',
        }
    });
    const table = createTable(headers, rows);
    element.innerHTML = html;
    element.appendChild(table);

  } else {
    html += '<div class="alert alert-warning">No composition data found for this medium.</div>';
    element.innerHTML = html;
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
    name: s.name,
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
    name: i.name,
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

export function renderError(message) {
  const element = document.getElementById('app-root');
  element.innerHTML = `<div class="alert alert-danger">${message}</div>`;
}

export function renderAbout(element) {
    element.innerHTML = '<h2>About</h2><p>This is a prototype of the Mediadive application.</p>';
}

export function renderLinks(element) {
    element.innerHTML = '<h2>Links</h2><ul><li><a href="https://www.dsmz.de/">DSMZ</a></li></ul>';
}

function formatPh(min, max) {
  if (min === null && max === null) return '';
  if (min === max) return min;
  return `${min}–${max}`;
}