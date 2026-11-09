export function formatAed(value: number): string {
  return new Intl.NumberFormat('en-AE', { style: 'currency', currency: 'AED' }).format(value).replace(/\u00a0/g, ' ');
}
