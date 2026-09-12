import { useState } from "react";
import { useExpenses } from "@/hooks/useExpenses";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sun,
  Moon,
  Plus,
  Trash2,
  Pencil,
  Check,
  X,
  Tags,
  Store,
  CreditCard,
  Settings,
} from "lucide-react";
import type { LabelGroup } from "@/types/expense";
import { cn } from "@/lib/utils";

type LabelGroupKey = keyof LabelGroup;

const groupConfig: {
  key: LabelGroupKey;
  title: string;
  icon: React.ElementType;
  placeholder: string;
}[] = [
  {
    key: "categories",
    title: "分类标签",
    icon: Tags,
    placeholder: "例如：旅行",
  },
  {
    key: "payees",
    title: "收款方",
    icon: Store,
    placeholder: "例如：Costco",
  },
  {
    key: "paymentMethods",
    title: "支付方式",
    icon: CreditCard,
    placeholder: "例如：Visa debit",
  },
];

export function SettingsView() {
  const {
    theme,
    setTheme,
    labels,
    addLabel,
    removeLabel,
    updateLabel,
  } = useExpenses();
  const [newValues, setNewValues] = useState<Record<LabelGroupKey, string>>({
    categories: "",
    payees: "",
    paymentMethods: "",
  });
  const [editingGroup, setEditingGroup] = useState<LabelGroupKey | null>(null);
  const [editingValue, setEditingValue] = useState("");
  const [editingOriginal, setEditingOriginal] = useState("");

  function handleAdd(group: LabelGroupKey) {
    const value = newValues[group];
    if (!value.trim()) return;
    addLabel(group, value);
    setNewValues((prev) => ({ ...prev, [group]: "" }));
  }

  function startEdit(group: LabelGroupKey, value: string) {
    setEditingGroup(group);
    setEditingOriginal(value);
    setEditingValue(value);
  }

  function saveEdit() {
    if (editingGroup && editingValue.trim()) {
      updateLabel(editingGroup, editingOriginal, editingValue);
    }
    setEditingGroup(null);
    setEditingValue("");
    setEditingOriginal("");
  }

  function cancelEdit() {
    setEditingGroup(null);
    setEditingValue("");
    setEditingOriginal("");
  }

  return (
    <div className="space-y-4 max-w-3xl">
      {/* Theme Settings */}
      <Card className="bg-card/50">
        <CardHeader className="p-4 md:p-6">
          <CardTitle className="flex items-center gap-2 text-base md:text-lg">
            <Settings className="h-5 w-5 text-primary" />
            外观设置
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4 md:p-6 pt-0 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {theme === "dark" ? (
                <Moon className="h-5 w-5 text-primary" />
              ) : (
                <Sun className="h-5 w-5 text-primary" />
              )}
              <div>
                <div className="font-medium">主题模式</div>
                <div className="text-sm text-muted-foreground">
                  切换深色或浅色模式
                </div>
              </div>
            </div>
            <Select
              value={theme}
              onValueChange={(v) => setTheme(v as "dark" | "light")}
            >
              <SelectTrigger className="w-[120px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="dark">深色模式</SelectItem>
                <SelectItem value="light">浅色模式</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Label Management */}
      {groupConfig.map((config) => {
        const Icon = config.icon;
        const groupLabels = labels[config.key];
        return (
          <Card key={config.key} className="bg-card/50">
            <CardHeader className="p-4 md:p-6">
              <CardTitle className="flex items-center gap-2 text-base md:text-lg">
                <Icon className="h-5 w-5 text-primary" />
                {config.title}
                <span className="text-sm font-normal text-muted-foreground">
                  （{groupLabels.length}）
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 md:p-6 pt-0 space-y-3">
              <div className="flex gap-2">
                <Input
                  placeholder={config.placeholder}
                  value={newValues[config.key]}
                  onChange={(e) =>
                    setNewValues((prev) => ({
                      ...prev,
                      [config.key]: e.target.value,
                    }))
                  }
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleAdd(config.key);
                  }}
                />
                <Button
                  onClick={() => handleAdd(config.key)}
                  className="gap-1 shrink-0"
                >
                  <Plus className="h-4 w-4" />
                  添加
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {groupLabels.length === 0 ? (
                  <p className="text-sm text-muted-foreground py-2">
                    暂无标签，请添加
                  </p>
                ) : (
                  groupLabels.map((label) => (
                    <div
                      key={label}
                      className={cn(
                        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs",
                        editingGroup === config.key &&
                          editingOriginal === label
                          ? "border-primary bg-primary/10"
                          : "bg-muted/50 border-transparent"
                      )}
                    >
                      {editingGroup === config.key &&
                      editingOriginal === label ? (
                        <>
                          <input
                            autoFocus
                            value={editingValue}
                            onChange={(e) =>
                              setEditingValue(e.target.value)
                            }
                            onKeyDown={(e) => {
                              if (e.key === "Enter") saveEdit();
                              if (e.key === "Escape") cancelEdit();
                            }}
                            className="bg-transparent outline-none text-xs min-w-[60px] w-full"
                          />
                          <button
                            onClick={saveEdit}
                            className="text-emerald-500 hover:text-emerald-400"
                          >
                            <Check className="h-3 w-3" />
                          </button>
                          <button
                            onClick={cancelEdit}
                            className="text-muted-foreground hover:text-foreground"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </>
                      ) : (
                        <>
                          <span>{label}</span>
                          <button
                            onClick={() => startEdit(config.key, label)}
                            className="text-muted-foreground hover:text-primary"
                          >
                            <Pencil className="h-3 w-3" />
                          </button>
                          <button
                            onClick={() => removeLabel(config.key, label)}
                            className="text-muted-foreground hover:text-destructive"
                          >
                            <Trash2 className="h-3 w-3" />
                          </button>
                        </>
                      )}
                    </div>
                  ))
                )}
              </div>
              {config.key !== "categories" && (
                <p className="text-xs text-muted-foreground">
                  修改或删除标签时，使用该标签的记账记录也会同步更新。
                </p>
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
