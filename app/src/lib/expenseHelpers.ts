import type { Expense, TimeScope } from "@/types/expense";

export function formatCurrency(amount: number) {
  return new Intl.NumberFormat("en-CA", {
    style: "currency",
    currency: "CAD",
  }).format(amount);
}

export function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString("zh-CN", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export function formatDateShort(dateString: string) {
  return new Date(dateString).toLocaleDateString("zh-CN", {
    month: "2-digit",
    day: "2-digit",
  });
}

export function getMonthKey(dateString: string) {
  return dateString.slice(0, 7); // YYYY-MM
}

export function getMonthLabel(monthKey: string) {
  const [year, month] = monthKey.split("-");
  return `${year}年${parseInt(month, 10)}月`;
}

export function getYearLabel(year: string) {
  return `${year}年`;
}

export function getCurrentMonthKey() {
  return new Date().toISOString().slice(0, 7);
}

export function getCurrentYear() {
  return new Date().getFullYear().toString();
}

export function getPreviousMonthKey() {
  const d = new Date();
  d.setMonth(d.getMonth() - 1);
  return d.toISOString().slice(0, 7);
}

/**
 * Filters expenses by the given time scope.
 */
export function filterByTimeScope(
  expenses: Expense[],
  scope: TimeScope,
  options?: { month?: string; year?: string }
): Expense[] {
  if (scope === "all") return expenses;
  if (scope === "currentMonth") {
    const mk = getCurrentMonthKey();
    return expenses.filter((item) => getMonthKey(item.date) === mk);
  }
  if (scope === "lastMonth") {
    const mk = getPreviousMonthKey();
    return expenses.filter((item) => getMonthKey(item.date) === mk);
  }
  if (scope === "year") {
    const y = options?.year || getCurrentYear();
    return expenses.filter((item) => item.date.slice(0, 4) === y);
  }
  if (scope === "currentMonth" && options?.month) {
    return expenses.filter((item) => getMonthKey(item.date) === options.month);
  }
  return expenses;
}

/**
 * If a specific month is selected (month is not null), filter by that month.
 * Otherwise return all.
 */
export function filterByMonth(
  expenses: Expense[],
  month: string | null
): Expense[] {
  if (!month) return expenses;
  return expenses.filter((item) => getMonthKey(item.date) === month);
}

export function groupByMonth(expenses: Expense[]) {
  const groups: Record<string, number> = {};
  expenses.forEach((item) => {
    const key = getMonthKey(item.date);
    groups[key] = (groups[key] || 0) + item.amount;
  });
  return Object.entries(groups)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, amount]) => ({
      month: key,
      label: getMonthLabel(key),
      amount,
    }));
}

export function groupByYear(expenses: Expense[]) {
  const groups: Record<string, number> = {};
  expenses.forEach((item) => {
    const key = item.date.slice(0, 4);
    groups[key] = (groups[key] || 0) + item.amount;
  });
  return Object.entries(groups)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, amount]) => ({
      year: key,
      label: getYearLabel(key),
      amount,
    }));
}

export function groupByTag(expenses: Expense[]) {
  const groups: Record<string, number> = {};
  expenses.forEach((item) => {
    item.tags.forEach((tag) => {
      groups[tag] = (groups[tag] || 0) + item.amount;
    });
  });
  return Object.entries(groups)
    .sort(([, a], [, b]) => b - a)
    .map(([tag, amount]) => ({ tag, amount }));
}

export function groupByPayee(expenses: Expense[]) {
  const groups: Record<string, number> = {};
  expenses.forEach((item) => {
    groups[item.payee] = (groups[item.payee] || 0) + item.amount;
  });
  return Object.entries(groups)
    .sort(([, a], [, b]) => b - a)
    .map(([payee, amount]) => ({ payee, amount }));
}

export function groupByPaymentMethod(expenses: Expense[]) {
  const groups: Record<string, number> = {};
  expenses.forEach((item) => {
    groups[item.paymentMethod] =
      (groups[item.paymentMethod] || 0) + item.amount;
  });
  return Object.entries(groups)
    .sort(([, a], [, b]) => b - a)
    .map(([method, amount]) => ({ method, amount }));
}

export function getCategorySummary(expenses: Expense[], category: string) {
  const filtered = expenses.filter((item) => item.tags.includes(category));
  const total = filtered.reduce((sum, item) => sum + item.amount, 0);
  const byMonth = groupByMonth(filtered);
  const byPayee = groupByPayee(filtered);
  return { filtered, total, byMonth, byPayee };
}

export function getYearRange(expenses: Expense[]) {
  if (expenses.length === 0) {
    const y = getCurrentYear();
    return { min: parseInt(y, 10), max: parseInt(y, 10) };
  }
  const years = expenses.map((item) =>
    parseInt(item.date.slice(0, 4), 10)
  );
  return { min: Math.min(...years), max: Math.max(...years) };
}

/**
 * Returns all unique month keys (YYYY-MM) from the expenses, sorted descending.
 */
export function getAvailableMonths(expenses: Expense[]): {
  value: string;
  label: string;
}[] {
  const set = new Set<string>();
  expenses.forEach((item) => set.add(getMonthKey(item.date)));
  return Array.from(set)
    .sort((a, b) => b.localeCompare(a))
    .map((key) => ({ value: key, label: getMonthLabel(key) }));
}

/**
 * Returns all unique years from the expenses, sorted descending.
 */
export function getAvailableYears(expenses: Expense[]): {
  value: string;
  label: string;
}[] {
  const set = new Set<string>();
  expenses.forEach((item) => set.add(item.date.slice(0, 4)));
  return Array.from(set)
    .sort((a, b) => b.localeCompare(a))
    .map((key) => ({ value: key, label: getYearLabel(key) }));
}

const COLORS = [
  "#22C55E",
  "#3B82F6",
  "#F59E0B",
  "#EF4444",
  "#8B5CF6",
  "#EC4899",
  "#14B8A6",
  "#F97316",
  "#6366F1",
  "#84CC16",
  "#06B6D4",
  "#D946EF",
];

export function getChartColor(index: number) {
  return COLORS[index % COLORS.length];
}
