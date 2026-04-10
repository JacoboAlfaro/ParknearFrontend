export function formatCopCompact(amount: number): string {
  const n = Math.round(amount);
  return `$${n.toLocaleString('es-CO')}`;
}
