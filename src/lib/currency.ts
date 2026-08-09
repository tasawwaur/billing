export { formatDate, formatTime } from "./utils";

export function formatCurrency(amount: number, symbol = "₹"): string {
  if (isNaN(amount) || amount === null || amount === undefined) return `${symbol}0`;
  const formatted = new Intl.NumberFormat("en-IN", {
    maximumFractionDigits: 2,
    minimumFractionDigits: 0,
  }).format(amount);
  return `${symbol}${formatted}`;
}
