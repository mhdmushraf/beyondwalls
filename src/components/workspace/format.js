export function formatAED(n) {
  return 'AED ' + (n || 0).toLocaleString(undefined, { maximumFractionDigits: 0 });
}

export function formatNumber(n) {
  return (n || 0).toLocaleString();
}