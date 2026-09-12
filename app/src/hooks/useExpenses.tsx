import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import type {
  ChatMessage,
  Expense,
  LabelGroup,
  ThemeMode,
} from "@/types/expense";
import { DEFAULT_LABELS } from "@/types/expense";
import { sampleExpenses } from "@/data/sampleData";

interface ExpensesContextValue {
  expenses: Expense[];
  addExpense: (expense: Omit<Expense, "id" | "createdAt">) => void;
  updateExpense: (id: string, updates: Partial<Expense>) => void;
  deleteExpense: (id: string) => void;
  deleteExpenses: (ids: string[]) => void;
  duplicateExpense: (id: string) => void;
  addExpenses: (expenses: Omit<Expense, "id" | "createdAt">[]) => void;
  chatMessages: ChatMessage[];
  addChatMessage: (message: Omit<ChatMessage, "id" | "timestamp">) => void;
  clearChat: () => void;
  isLoaded: boolean;
  labels: LabelGroup;
  addLabel: (group: keyof LabelGroup, value: string) => void;
  removeLabel: (group: keyof LabelGroup, value: string) => void;
  updateLabel: (
    group: keyof LabelGroup,
    oldValue: string,
    newValue: string
  ) => void;
  theme: ThemeMode;
  toggleTheme: () => void;
  setTheme: (mode: ThemeMode) => void;
}

const ExpensesContext = createContext<ExpensesContextValue | null>(null);

function generateId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

const STORAGE_KEYS = {
  expenses: "vicky-pocket-expenses",
  chat: "vicky-pocket-chat",
  labels: "vicky-pocket-labels",
  theme: "vicky-pocket-theme",
};

export function ExpensesProvider({ children }: { children: React.ReactNode }) {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [labels, setLabels] = useState<LabelGroup>(DEFAULT_LABELS);
  const [theme, setThemeState] = useState<ThemeMode>("dark");
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.expenses);
      const savedChat = localStorage.getItem(STORAGE_KEYS.chat);
      const savedLabels = localStorage.getItem(STORAGE_KEYS.labels);
      const savedTheme = localStorage.getItem(
        STORAGE_KEYS.theme
      ) as ThemeMode | null;

      if (saved) {
        setExpenses(JSON.parse(saved));
      } else {
        setExpenses(sampleExpenses);
      }
      if (savedChat) {
        setChatMessages(JSON.parse(savedChat));
      }
      if (savedLabels) {
        setLabels(JSON.parse(savedLabels));
      }
      if (savedTheme === "dark" || savedTheme === "light") {
        setThemeState(savedTheme);
      }
    } catch {
      setExpenses(sampleExpenses);
    } finally {
      setIsLoaded(true);
    }
  }, []);

  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem(
        STORAGE_KEYS.expenses,
        JSON.stringify(expenses)
      );
    }
  }, [expenses, isLoaded]);

  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem(STORAGE_KEYS.chat, JSON.stringify(chatMessages));
    }
  }, [chatMessages, isLoaded]);

  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem(STORAGE_KEYS.labels, JSON.stringify(labels));
    }
  }, [labels, isLoaded]);

  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem(STORAGE_KEYS.theme, theme);
      const root = document.documentElement;
      if (theme === "dark") {
        root.classList.add("dark");
      } else {
        root.classList.remove("dark");
      }
    }
  }, [theme, isLoaded]);

  const addExpense = useCallback(
    (expense: Omit<Expense, "id" | "createdAt">) => {
      const newExpense: Expense = {
        ...expense,
        id: generateId(),
        createdAt: new Date().toISOString(),
      };
      setExpenses((prev) => [newExpense, ...prev]);
    },
    []
  );

  const addExpenses = useCallback(
    (items: Omit<Expense, "id" | "createdAt">[]) => {
      const newItems: Expense[] = items.map((item) => ({
        ...item,
        id: generateId(),
        createdAt: new Date().toISOString(),
      }));
      setExpenses((prev) => [...newItems, ...prev]);
    },
    []
  );

  const updateExpense = useCallback((id: string, updates: Partial<Expense>) => {
    setExpenses((prev) =>
      prev.map((item) => (item.id === id ? { ...item, ...updates } : item))
    );
  }, []);

  const deleteExpense = useCallback((id: string) => {
    setExpenses((prev) => prev.filter((item) => item.id !== id));
  }, []);

  const deleteExpenses = useCallback((ids: string[]) => {
    const idSet = new Set(ids);
    setExpenses((prev) => prev.filter((item) => !idSet.has(item.id)));
  }, []);

  const duplicateExpense = useCallback((id: string) => {
    setExpenses((prev) => {
      const original = prev.find((item) => item.id === id);
      if (!original) return prev;
      const copy: Expense = {
        ...original,
        id: generateId(),
        createdAt: new Date().toISOString(),
      };
      // Insert the copy right after the original
      const index = prev.findIndex((item) => item.id === id);
      const next = [...prev];
      next.splice(index, 0, copy);
      return next;
    });
  }, []);

  const addChatMessage = useCallback(
    (message: Omit<ChatMessage, "id" | "timestamp">) => {
      const newMessage: ChatMessage = {
        ...message,
        id: generateId(),
        timestamp: new Date().toISOString(),
      };
      setChatMessages((prev) => [...prev, newMessage]);
    },
    []
  );

  const clearChat = useCallback(() => {
    setChatMessages([]);
  }, []);

  const addLabel = useCallback((group: keyof LabelGroup, value: string) => {
    const trimmed = value.trim();
    if (!trimmed) return;
    setLabels((prev) => {
      if (prev[group].includes(trimmed)) return prev;
      return { ...prev, [group]: [...prev[group], trimmed] };
    });
  }, []);

  const removeLabel = useCallback(
    (group: keyof LabelGroup, value: string) => {
      setLabels((prev) => ({
        ...prev,
        [group]: prev[group].filter((v) => v !== value),
      }));
    },
    []
  );

  const updateLabel = useCallback(
    (group: keyof LabelGroup, oldValue: string, newValue: string) => {
      const trimmed = newValue.trim();
      if (!trimmed || trimmed === oldValue) return;
      setLabels((prev) => ({
        ...prev,
        [group]: prev[group].map((v) => (v === oldValue ? trimmed : v)),
      }));
      // Also update expenses that used the old value
      setExpenses((prev) =>
        prev.map((item) => {
          const updated = { ...item };
          if (group === "payees" && item.payee === oldValue) {
            updated.payee = trimmed;
          }
          if (group === "paymentMethods" && item.paymentMethod === oldValue) {
            updated.paymentMethod = trimmed;
          }
          if (group === "categories") {
            updated.tags = item.tags.map((t) => (t === oldValue ? trimmed : t));
          }
          return updated;
        })
      );
    },
    []
  );

  const setTheme = useCallback((mode: ThemeMode) => {
    setThemeState(mode);
  }, []);

  const toggleTheme = useCallback(() => {
    setThemeState((prev) => (prev === "dark" ? "light" : "dark"));
  }, []);

  const value = useMemo(
    () => ({
      expenses,
      addExpense,
      updateExpense,
      deleteExpense,
      deleteExpenses,
      duplicateExpense,
      addExpenses,
      chatMessages,
      addChatMessage,
      clearChat,
      isLoaded,
      labels,
      addLabel,
      removeLabel,
      updateLabel,
      theme,
      toggleTheme,
      setTheme,
    }),
    [
      expenses,
      addExpense,
      updateExpense,
      deleteExpense,
      deleteExpenses,
      duplicateExpense,
      addExpenses,
      chatMessages,
      addChatMessage,
      clearChat,
      isLoaded,
      labels,
      addLabel,
      removeLabel,
      updateLabel,
      theme,
      toggleTheme,
      setTheme,
    ]
  );

  return (
    <ExpensesContext.Provider value={value}>
      {children}
    </ExpensesContext.Provider>
  );
}

export function useExpenses() {
  const context = useContext(ExpensesContext);
  if (!context) {
    throw new Error("useExpenses must be used within an ExpensesProvider");
  }
  return context;
}
