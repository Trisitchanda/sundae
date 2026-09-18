export const calculateBudgetPlan = ({ income, savingsGoalRate = 0.5, categoriesData }) => {
  // Income and amounts should be in standard units (e.g., rupees), not paise.
  const requiredSavings = income * savingsGoalRate;
  let availableSpending = income - requiredSavings;
  
  if (availableSpending < 0) {
    availableSpending = 0;
  }

  // Identify hard limits and flexible categories
  let totalHardLimits = 0;
  const hardLimitedCategories = [];
  const flexibleCategories = [];

  for (const cat of categoriesData) {
    if (cat.budgetLimit !== null && cat.budgetLimit !== undefined) {
      totalHardLimits += cat.budgetLimit;
      hardLimitedCategories.push(cat);
    } else {
      flexibleCategories.push(cat);
    }
  }

  let status = "ok";
  if (totalHardLimits > availableSpending) {
    status = "constraint_conflict";
  }

  // Calculate recommended budgets
  // If there's a conflict, the recommended budgets for hard limits might exceed available spending,
  // but we still cap them at their hard limits. Flexible categories get 0.
  let remainingForFlexible = availableSpending - totalHardLimits;
  if (remainingForFlexible < 0) {
    remainingForFlexible = 0;
  }

  // For flexible categories, we distribute the remaining based on their current spending proportion,
  // or equally if there's no spending data.
  const totalFlexibleSpending = flexibleCategories.reduce((sum, cat) => sum + cat.amount, 0);

  const finalCategories = categoriesData.map(cat => {
    let recommendedBudget = 0;
    const isHardLimit = cat.budgetLimit !== null && cat.budgetLimit !== undefined;

    if (isHardLimit) {
      recommendedBudget = cat.budgetLimit;
    } else {
      if (totalFlexibleSpending > 0) {
        recommendedBudget = Math.round((cat.amount / totalFlexibleSpending) * remainingForFlexible);
      } else {
        recommendedBudget = flexibleCategories.length > 0 ? Math.round(remainingForFlexible / flexibleCategories.length) : 0;
      }
    }

    return {
      categoryId: cat.categoryId,
      name: cat.name,
      spent: cat.amount,
      changePercent: cat.changePercent,
      budgetLimit: cat.budgetLimit !== undefined ? cat.budgetLimit : null,
      recommendedBudget,
      isHardLimit
    };
  });

  return {
    status,
    income,
    savingsGoal: requiredSavings,
    availableForSpending: availableSpending,
    minimumRequiredSpending: totalHardLimits,
    categories: finalCategories
  };
};
