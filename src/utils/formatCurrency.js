export function formatCurrency(amount) {
  if (typeof amount !== 'number' || isNaN(amount)) return '$0.00'
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount)
}

export function formatNumber(num) {
  if (typeof num !== 'number' || isNaN(num)) return '0'
  return new Intl.NumberFormat('en-US').format(num)
}

export function formatCompact(num) {
  if (typeof num !== 'number' || isNaN(num)) return '0'
  return new Intl.NumberFormat('en-US', {
    notation: 'compact',
    compactDisplay: 'short',
  }).format(num)
}
