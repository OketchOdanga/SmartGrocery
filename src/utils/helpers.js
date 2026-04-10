import { toJsDate } from './date';

export const isExpired = (expirationDate) => {
  const expDate = toJsDate(expirationDate);
  if (!expDate) return false;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const normalized = new Date(expDate);
  normalized.setHours(0, 0, 0, 0);

  return normalized < today;
};

export const isExpiringSoon = (expirationDate, daysThreshold = 3) => {
  const expDate = toJsDate(expirationDate);
  if (!expDate) return false;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const normalized = new Date(expDate);
  normalized.setHours(0, 0, 0, 0);

  const diffTime = normalized - today;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  return diffDays >= 0 && diffDays <= daysThreshold;
};

export const isLowStock = (quantity, threshold = 3) => quantity <= threshold;

export const getRecipeSuggestions = (pantryItems, recipes) => {
  const pantryNames = pantryItems.map(item => item.name.toLowerCase());
  const expiringNames = pantryItems
    .filter(item => isExpiringSoon(item.expirationDate))
    .map(item => item.name.toLowerCase());

  const suggestions = recipes
    .map(recipe => {
      const matched = recipe.ingredients.filter(ing =>
        pantryNames.some(pantryItem => pantryItem.includes(ing) || ing.includes(pantryItem))
      );

      const usesExpiring = recipe.ingredients.some(ing =>
        expiringNames.some(exp => exp.includes(ing) || ing.includes(exp))
      );

      return {
        ...recipe,
        matchedCount: matched.length,
        total: recipe.ingredients.length,
        usesExpiring,
        matchedIngredients: matched,
      };
    })
    .filter(r => r.matchedCount > 0);

  suggestions.sort((a, b) => {
    if (a.usesExpiring && !b.usesExpiring) return -1;
    if (!a.usesExpiring && b.usesExpiring) return 1;
    return b.matchedCount / b.total - a.matchedCount / a.total;
  });

  return suggestions;
};