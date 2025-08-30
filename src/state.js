import { renderMediaTable, renderCompositionView, renderError } from './views.js';

const state = {
  media: [],
  composition: {},
  solutions: [],
  canonMap: new Map(),
};

async function loadData() {
  try {
    const [mediaRes, compositionRes, solutionsRes] = await Promise.all([
      fetch('../public/data/mediaList.json'),
      fetch('../public/data/medium-Composition.json'),
      fetch('../public/data/solutions.json'),
    ]);

    if (!mediaRes.ok || !compositionRes.ok || !solutionsRes.ok) {
      throw new Error('Failed to load data');
    }

    state.media = await mediaRes.json();
    state.composition = await compositionRes.json();
    state.solutions = await solutionsRes.json();

    buildCanonMap();
  } catch (error) {
    renderError(error.message);
  }
}

function buildCanonMap() {
  const descMap = new Map();
  for (const medium of state.media) {
    if (medium.description) {
      const normalizedDesc = medium.description.trim().toLowerCase();
      if (!descMap.has(normalizedDesc)) {
        descMap.set(normalizedDesc, medium.id);
      }
      state.canonMap.set(medium.id, descMap.get(normalizedDesc));
    }
  }
}

export function getMedia() {
  return state.media.map(m => ({
    ...m,
    canonId: state.canonMap.get(m.id) || m.id,
  }));
}

export function getMedium(id) {
  return state.media.find(m => String(m.id) === String(id));
}

export function getComposition(id) {
  return state.composition[id];
}

export { loadData };