// Check if item is expired
export const isExpired = (expirationDate) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const expDate = new Date(expirationDate);
  expDate.setHours(0, 0, 0, 0);
  return expDate < today;
};

// Check if item expires within given days (default 3)
export const isExpiringSoon = (expirationDate, daysThreshold = 3) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const expDate = new Date(expirationDate);
  expDate.setHours(0, 0, 0, 0);
  const diffTime = expDate - today;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays >= 0 && diffDays <= daysThreshold;
};

// Check if quantity is low (default threshold 3)
export const isLowStock = (quantity, threshold = 3) => {
  return quantity <= threshold;
};

// Get recipe suggestions based on pantry items
export const getRecipeSuggestions = (pantryItems, recipes) => {
  const pantryNames = pantryItems.map(item => item.name.toLowerCase());
  const expiringNames = pantryItems
    .filter(item => isExpiringSoon(item.expirationDate))
    .map(item => item.name.toLowerCase());

  const suggestions = recipes.map(recipe => {
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
      matchedIngredients: matched
    };
  }).filter(r => r.matchedCount > 0);

  // Sort: usesExpiring first, then highest match %
  suggestions.sort((a, b) => {
    if (a.usesExpiring && !b.usesExpiring) return -1;
    if (!a.usesExpiring && b.usesExpiring) return 1;
    return (b.matchedCount / b.total) - (a.matchedCount / a.total);
  });
  return suggestions;
};