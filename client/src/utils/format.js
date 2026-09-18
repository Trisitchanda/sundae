export const formatCurrency = (amountInMinorUnits, currency = 'INR') => {
  const formatter = new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0, // Drop decimals for whole amounts to look cleaner
    maximumFractionDigits: 2,
  });
  return formatter.format(amountInMinorUnits / 100);
};
