export interface Expense {
  id: string;
  title: string;
  date: string; // ISO date YYYY-MM-DD
  tags: string[];
  amount: number;
  payee: string; // 收款方
  description: string;
  paymentMethod: string;
  createdAt: string;
}

export type ViewType =
  | "table"
  | "monthly"
  | "category"
  | "payee"
  | "payment"
  | "receipt"
  | "ai"
  | "settings";

export type ThemeMode = "dark" | "light";

export interface LabelGroup {
  categories: string[];
  payees: string[];
  paymentMethods: string[];
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
}

export const DEFAULT_LABELS: LabelGroup = {
  categories: [
    "食物",
    "买菜",
    "车",
    "加油",
    "住房开销",
    "房租",
    "生活用品",
    "交通",
    "娱乐",
    "医疗",
    "教育",
    "其它",
  ],
  payees: [
    "Metro",
    "Walmart",
    "No Frills",
    "esso",
    "Shell",
    "Dollarama",
    "CAP REIT",
    "Fido",
    "Rogers",
    "TD Insurance",
    "Cineplex",
    "Boston Pizza",
    "Canadian Tire",
    "大统华",
    "其它",
  ],
  paymentMethods: [
    "BMO credit",
    "微信支付",
    "TD debit",
    "现金",
    "支付宝",
    "CIBC credit",
  ],
};

export const CATEGORY_COLORS: Record<string, string> = {
  食物: "bg-orange-500/15 text-orange-500 border-orange-500/20",
  买菜: "bg-rose-500/15 text-rose-500 border-rose-500/20",
  车: "bg-blue-500/15 text-blue-500 border-blue-500/20",
  加油: "bg-emerald-500/15 text-emerald-500 border-emerald-500/20",
  住房开销: "bg-amber-500/15 text-amber-500 border-amber-500/20",
  房租: "bg-red-500/15 text-red-500 border-red-500/20",
  生活用品: "bg-violet-500/15 text-violet-500 border-violet-500/20",
  交通: "bg-cyan-500/15 text-cyan-500 border-cyan-500/20",
  娱乐: "bg-pink-500/15 text-pink-500 border-pink-500/20",
  医疗: "bg-red-600/15 text-red-600 border-red-600/20",
  教育: "bg-indigo-500/15 text-indigo-500 border-indigo-500/20",
  其它: "bg-slate-500/15 text-slate-500 border-slate-500/20",
};

export function getTagClass(tag: string) {
  return (
    CATEGORY_COLORS[tag] ||
    "bg-primary/10 text-primary border-primary/20"
  );
}

export type TimeScope = "currentMonth" | "lastMonth" | "year" | "all";
