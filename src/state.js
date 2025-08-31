import { renderError } from './views.js';

const state = {
  media: [],
  composition: {},
  solutions: [],
  solutionsComposition: {},
  ingredients: [],
  ingredientsDetail: {},
  mediumStrains: {},
  canonMap: new Map(),
  ingredientsByName: new Map(),
};

async function loadData() {
  try {
    const [mediaRes, compositionRes, solutionsRes, ingredientsRes, solutionsCompositionRes, ingredientsDetailRes, mediumStrainsRes] = await Promise.all([
      fetch('../public/data/mediaList.json'),
      fetch('../public/data/medium-Composition.json'),
      fetch('../public/data/solutions.json'),
      fetch('../public/data/ingredients.json'),
      fetch('../public/data/solutions-Composition.json'),
      fetch('../public/data/ingredients_detail.json'),
      fetch('../public/data/mediumStrain.json'),
    ]);

    if (!mediaRes.ok || !compositionRes.ok || !solutionsRes.ok || !ingredientsRes.ok || !solutionsCompositionRes.ok || !ingredientsDetailRes.ok || !mediumStrainsRes.ok) {
      throw new Error('Failed to load data');
    }

    state.media = await mediaRes.json();
    state.composition = await compositionRes.json();
    state.solutions = await solutionsRes.json();
    state.ingredients = await ingredientsRes.json();
    state.solutionsComposition = await solutionsCompositionRes.json();
    state.ingredientsDetail = await ingredientsDetailRes.json();
    state.mediumStrains = await mediumStrainsRes.json();

    buildCanonMap();
    buildIngredientsMap();
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

function buildIngredientsMap() {
    for (const ingredient of state.ingredients) {
        state.ingredientsByName.set(ingredient.name.toLowerCase(), ingredient);
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

export function getIngredientByName(name) {
    return state.ingredientsByName.get(name.toLowerCase());
}

export function getIngredientDetails(id) {
    return state.ingredientsDetail[id];
}

export function getStrainsForMedium(mediumId) {
    return state.mediumStrains[mediumId];
}

export function getSolutions() {
    return state.solutions;
}

export function getIngredients() {
    return state.ingredients;
}

export { loadData };