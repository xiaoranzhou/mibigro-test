import { renderError } from './views.js';

const state = {
  media: [],
  composition: {},
  solutions: [],
  solutionsComposition: {},
  ingredients: [],
  ingredientsDetail: {},
  mediumStrains: {},
  microbeToMedia: {},
  mediumRecipe: {},
  canonMap: new Map(),
  ingredientsByName: new Map(),
};

async function loadData() {
  try {
    const [mediaRes, compositionRes, solutionsRes, ingredientsRes, solutionsCompositionRes, ingredientsDetailRes, mediumStrainsRes, microbeToMediaRes, mediumRecipeRes] = await Promise.all([
      fetch('https://raw.githubusercontent.com/xiaoranzhou/mibigro-test/refs/heads/main/public/data/mediaList.json'),
      fetch('https://raw.githubusercontent.com/xiaoranzhou/mibigro-test/refs/heads/main/public/data/medium-Composition.json'),
      fetch('https://raw.githubusercontent.com/xiaoranzhou/mibigro-test/refs/heads/main/public/data/solutions.json'),
      fetch('https://raw.githubusercontent.com/xiaoranzhou/mibigro-test/refs/heads/main/public/data/ingredients.json'),
      fetch('https://raw.githubusercontent.com/xiaoranzhou/mibigro-test/refs/heads/main/public/data/solutions-Composition.json'),
      fetch('https://raw.githubusercontent.com/xiaoranzhou/mibigro-test/refs/heads/main/public/data/ingredients_detail.json'),
      fetch('https://raw.githubusercontent.com/xiaoranzhou/mibigro-test/refs/heads/main/public/data/mediumStrain.json'),
      fetch('https://raw.githubusercontent.com/xiaoranzhou/mibigro-test/refs/heads/main/public/data/microbe_to_media.json'),
      fetch('https://raw.githubusercontent.com/xiaoranzhou/mibigro-test/refs/heads/main/public/data/mediumRecipe.json'),
    ]);

    if (!mediaRes.ok || !compositionRes.ok || !solutionsRes.ok || !ingredientsRes.ok || !solutionsCompositionRes.ok || !ingredientsDetailRes.ok || !mediumStrainsRes.ok || !microbeToMediaRes.ok || !mediumRecipeRes.ok) {
      throw new Error('Failed to load data');
    }

    state.media = await mediaRes.json();
    state.composition = await compositionRes.json();
    state.solutions = await solutionsRes.json();
    state.ingredients = await ingredientsRes.json();
    state.solutionsComposition = await solutionsCompositionRes.json();
    state.ingredientsDetail = await ingredientsDetailRes.json();
    state.mediumStrains = await mediumStrainsRes.json();
    state.microbeToMedia = await microbeToMediaRes.json();
    state.mediumRecipe = await mediumRecipeRes.json();

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

export function getMediumRecipe(id) {
  return state.mediumRecipe[id];
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

export function getSolution(id) {
  return state.solutions.find(s => String(s.id) === String(id));
}

export function getSolutionComposition(id) {
  return state.solutionsComposition[id];
}

export function getSolutions() {
    return state.solutions;
}

export function getIngredient(id) {
  return state.ingredients.find(i => String(i.id) === String(id));
}

export function getIngredients() {
    return state.ingredients;
}

export function getMicrobeToMedia() {
    return state.microbeToMedia;
}

export function getAllStrains() {
    return Object.keys(state.microbeToMedia);
}

export function getMediaForStrain(strainName) {
    const mediaIds = state.microbeToMedia[strainName] || [];
    // Filter out duplicate media IDs and map them to actual media objects
    const uniqueMediaIds = [...new Set(mediaIds)];
    return uniqueMediaIds.map(id => getMedium(id)).filter(Boolean);
}

export { loadData };