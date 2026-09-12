import { useMemo, useState } from "react";
import { useExpenses } from "@/hooks/useExpenses";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
  DropdownMenuCheckboxItem,
} from "@/components/ui/dropdown-menu";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Checkbox } from "@/components/ui/checkbox";
import { formatCurrency, formatDate } from "@/lib/expenseHelpers";
import type { Expense } from "@/types/expense";
import { getTagClass } from "@/types/expense";
import {
  ArrowDown,
  ArrowUp,
  CheckSquare,
  Copy,
  MoreHorizontal,
  Pencil,
  Plus,
  Search,
  Trash2,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";

type SortField = "date" | "amount" | "title" | "payee" | "paymentMethod";
type SortDir = "asc" | "desc";

const sortOptions: { field: SortField; label: string }[] = [
  { field: "date", label: "日期" },
  { field: "amount", label: "金额" },
  { field: "title", label: "名称" },
  { field: "payee", label: "收款方" },
  { field: "paymentMethod", label: "支付方式" },
];

function emptyExpense(
  defaultPayment: string
): Omit<Expense, "id" | "createdAt"> {
  return {
    title: "",
    date: new Date().toISOString().slice(0, 10),
    tags: [],
    amount: 0,
    payee: "",
    description: "",
    paymentMethod: defaultPayment,
  };
}

export function ExpenseTable() {
  const {
    expenses,
    addExpense,
    updateExpense,
    deleteExpense,
    deleteExpenses,
    duplicateExpense,
    labels,
  } = useExpenses();
  const [search, setSearch] = useState("");
  const [sortField, setSortField] = useState<SortField>("date");
  const [sortDir, setSortDir] = useState<SortDir>("desc");
  const [filterPayee, setFilterPayee] = useState<string | null>(null);
  const [filterPayment, setFilterPayment] = useState<string | null>(null);
  const [filterTag, setFilterTag] = useState<string | null>(null);
  const [editing, setEditing] = useState<Expense | null>(null);
  const [form, setForm] = useState<Omit<Expense, "id" | "createdAt">>(
    emptyExpense(labels.paymentMethods[0] || "现金")
  );
  const [dialogOpen, setDialogOpen] = useState(false);

  // Inline editing state
  const [inlineEditId, setInlineEditId] = useState<string | null>(null);
  const [inlineField, setInlineField] = useState<string | null>(null);
  const [inlineValue, setInlineValue] = useState("");

  // Multi-select state
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const filtered = useMemo(() => {
    let result = [...expenses];
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (item) =>
          item.title.toLowerCase().includes(q) ||
          item.payee.toLowerCase().includes(q) ||
          item.description.toLowerCase().includes(q) ||
          item.tags.some((tag) => tag.toLowerCase().includes(q))
      );
    }
    if (filterPayee)
      result = result.filter((item) => item.payee === filterPayee);
    if (filterPayment)
      result = result.filter(
        (item) => item.paymentMethod === filterPayment
      );
    if (filterTag)
      result = result.filter((item) => item.tags.includes(filterTag as string));

    result.sort((a, b) => {
      let cmp = 0;
      if (sortField === "date") cmp = a.date.localeCompare(b.date);
      else if (sortField === "amount") cmp = a.amount - b.amount;
      else if (sortField === "title")
        cmp = a.title.localeCompare(b.title, "zh");
      else if (sortField === "payee")
        cmp = a.payee.localeCompare(b.payee, "zh");
      else if (sortField === "paymentMethod")
        cmp = a.paymentMethod.localeCompare(b.paymentMethod, "zh");
      return sortDir === "asc" ? cmp : -cmp;
    });
    return result;
  }, [
    expenses,
    search,
    sortField,
    sortDir,
    filterPayee,
    filterPayment,
    filterTag,
  ]);

  const total = useMemo(
    () => filtered.reduce((sum, item) => sum + item.amount, 0),
    [filtered]
  );

  function openAdd() {
    setEditing(null);
    setForm(emptyExpense(labels.paymentMethods[0] || "现金"));
    setDialogOpen(true);
  }

  function openEdit(item: Expense) {
    setEditing(item);
    setForm({ ...item });
    setDialogOpen(true);
  }

  function toggleTag(tag: string) {
    setForm((prev) => ({
      ...prev,
      tags: prev.tags.includes(tag)
        ? prev.tags.filter((t) => t !== tag)
        : [...prev.tags, tag],
    }));
  }

  function handleSave() {
    if (!form.title || form.amount <= 0) return;
    if (editing) {
      updateExpense(editing.id, form);
    } else {
      addExpense(form);
    }
    setDialogOpen(false);
  }

  function startInlineEdit(
    id: string,
    field: string,
    currentValue: string | number
  ) {
    setInlineEditId(id);
    setInlineField(field);
    setInlineValue(String(currentValue));
  }

  function saveInlineEdit() {
    if (inlineEditId && inlineField) {
      const updates: Partial<Expense> = {};
      if (inlineField === "amount") {
        updates.amount = parseFloat(inlineValue) || 0;
      } else if (inlineField === "title") {
        updates.title = inlineValue;
      } else if (inlineField === "payee") {
        updates.payee = inlineValue;
      } else if (inlineField === "description") {
        updates.description = inlineValue;
      } else if (inlineField === "date") {
        updates.date = inlineValue;
      } else if (inlineField === "paymentMethod") {
        updates.paymentMethod = inlineValue;
      }
      updateExpense(inlineEditId, updates);
    }
    setInlineEditId(null);
    setInlineField(null);
    setInlineValue("");
  }

  function cancelInlineEdit() {
    setInlineEditId(null);
    setInlineField(null);
    setInlineValue("");
  }

  function toggleSort(field: SortField) {
    if (sortField === field) {
      setSortDir(sortDir === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDir("desc");
    }
  }

  const activeFilters = !!filterPayee || !!filterPayment || !!filterTag;

  function clearFilters() {
    setFilterPayee(null);
    setFilterPayment(null);
    setFilterTag(null);
  }

  function renderSortIcon(field: SortField) {
    if (sortField !== field) return null;
    return sortDir === "asc" ? (
      <ArrowUp className="inline h-3 w-3 ml-1" />
    ) : (
      <ArrowDown className="inline h-3 w-3 ml-1" />
    );
  }

  // Multi-select helpers
  function toggleSelect(id: string) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function toggleSelectAll() {
    setSelectedIds((prev) => {
      if (prev.size === filtered.length) return new Set();
      return new Set(filtered.map((item) => item.id));
    });
  }

  function handleBulkDelete() {
    deleteExpenses([...selectedIds]);
    setSelectedIds(new Set());
  }

  function handleBulkCopy() {
    selectedIds.forEach((id) => duplicateExpense(id));
    setSelectedIds(new Set());
  }

  const allSelected =
    filtered.length > 0 && selectedIds.size === filtered.length;
  const someSelected = selectedIds.size > 0;

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="搜索名称、收款方、标签或详情..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <div className="flex items-center gap-2">
          {/* Sort dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="gap-1">
                排序
                <ArrowDown className="h-3 w-3" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>排序字段</DropdownMenuLabel>
              {sortOptions.map((opt) => (
                <DropdownMenuItem
                  key={opt.field}
                  onClick={() => toggleSort(opt.field)}
                >
                  <span className="flex items-center justify-between w-full">
                    {opt.label}
                    {renderSortIcon(opt.field)}
                  </span>
                </DropdownMenuItem>
              ))}
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() =>
                  setSortDir(sortDir === "asc" ? "desc" : "asc")
                }
              >
                方向：{sortDir === "asc" ? "升序" : "降序"}
                {sortDir === "asc" ? (
                  <ArrowUp className="h-3 w-3 ml-auto" />
                ) : (
                  <ArrowDown className="h-3 w-3 ml-auto" />
                )}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Filter dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant={activeFilters ? "default" : "outline"}
                size="sm"
                className="gap-1"
              >
                筛选
                {activeFilters && (
                  <span className="ml-1 rounded-full bg-primary-foreground/20 px-1.5 text-[10px]">
                    {
                      [filterPayee, filterPayment, filterTag].filter(Boolean)
                        .length
                    }
                  </span>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>按收款方筛选</DropdownMenuLabel>
              <DropdownMenuCheckboxItem
                checked={!filterPayee}
                onCheckedChange={() => setFilterPayee(null)}
              >
                全部
              </DropdownMenuCheckboxItem>
              {labels.payees.map((p) => (
                <DropdownMenuCheckboxItem
                  key={p}
                  checked={filterPayee === p}
                  onCheckedChange={() =>
                    setFilterPayee(filterPayee === p ? null : p)
                  }
                >
                  {p}
                </DropdownMenuCheckboxItem>
              ))}
              <DropdownMenuSeparator />
              <DropdownMenuLabel>按支付方式筛选</DropdownMenuLabel>
              <DropdownMenuCheckboxItem
                checked={!filterPayment}
                onCheckedChange={() => setFilterPayment(null)}
              >
                全部
              </DropdownMenuCheckboxItem>
              {labels.paymentMethods.map((m) => (
                <DropdownMenuCheckboxItem
                  key={m}
                  checked={filterPayment === m}
                  onCheckedChange={() =>
                    setFilterPayment(filterPayment === m ? null : m)
                  }
                >
                  {m}
                </DropdownMenuCheckboxItem>
              ))}
              <DropdownMenuSeparator />
              <DropdownMenuLabel>按分类筛选</DropdownMenuLabel>
              <DropdownMenuCheckboxItem
                checked={!filterTag}
                onCheckedChange={() => setFilterTag(null)}
              >
                全部
              </DropdownMenuCheckboxItem>
              {labels.categories.map((t) => (
                <DropdownMenuCheckboxItem
                  key={t}
                  checked={filterTag === t}
                  onCheckedChange={() =>
                    setFilterTag(filterTag === t ? null : t)
                  }
                >
                  {t}
                </DropdownMenuCheckboxItem>
              ))}
              {activeFilters && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={clearFilters}>
                    <X className="mr-2 h-4 w-4" />
                    清除筛选
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>

          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={openAdd} className="gap-2">
                <Plus className="h-4 w-4" />
                记一笔
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>
                  {editing ? "编辑记账" : "新增记账"}
                </DialogTitle>
                <DialogDescription>
                  {editing
                    ? "修改这条记账记录的详细信息。"
                    : "添加一笔新的支出记录。"}
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="title">名称</Label>
                  <Input
                    id="title"
                    value={form.title}
                    onChange={(e) =>
                      setForm((prev) => ({ ...prev, title: e.target.value }))
                    }
                    placeholder="例如：买菜"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="date">日期</Label>
                    <Input
                      id="date"
                      type="date"
                      value={form.date}
                      onChange={(e) =>
                        setForm((prev) => ({ ...prev, date: e.target.value }))
                      }
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="amount">金额 (CA$)</Label>
                    <Input
                      id="amount"
                      type="number"
                      step="0.01"
                      min="0"
                      value={form.amount || ""}
                      onChange={(e) =>
                        setForm((prev) => ({
                          ...prev,
                          amount: parseFloat(e.target.value) || 0,
                        }))
                      }
                    />
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label>分类标签</Label>
                  <div className="flex flex-wrap gap-2">
                    {labels.categories.map((tag) => (
                      <button
                        key={tag}
                        type="button"
                        onClick={() => toggleTag(tag)}
                        className={cn(
                          "px-2.5 py-1 rounded-full text-xs border transition-colors",
                          form.tags.includes(tag)
                            ? getTagClass(tag)
                            : "bg-muted text-muted-foreground border-transparent hover:border-border"
                        )}
                      >
                        {tag}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="payee">收款方</Label>
                    <Input
                      id="payee"
                      value={form.payee}
                      onChange={(e) =>
                        setForm((prev) => ({ ...prev, payee: e.target.value }))
                      }
                      placeholder="例如：Walmart"
                      list="payee-list"
                    />
                    <datalist id="payee-list">
                      {labels.payees.map((p) => (
                        <option key={p} value={p} />
                      ))}
                    </datalist>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="payment">支付方式</Label>
                    <select
                      id="payment"
                      value={form.paymentMethod}
                      onChange={(e) =>
                        setForm((prev) => ({
                          ...prev,
                          paymentMethod: e.target.value,
                        }))
                      }
                      className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                    >
                      {labels.paymentMethods.map((method) => (
                        <option key={method} value={method}>
                          {method}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="description">详情</Label>
                  <Input
                    id="description"
                    value={form.description}
                    onChange={(e) =>
                      setForm((prev) => ({
                        ...prev,
                        description: e.target.value,
                      }))
                    }
                    placeholder="补充说明..."
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setDialogOpen(false)}>
                  取消
                </Button>
                <Button onClick={handleSave}>保存</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Active filter chips */}
      {activeFilters && (
        <div className="flex flex-wrap gap-2 items-center">
          <span className="text-sm text-muted-foreground">当前筛选：</span>
          {filterPayee && (
            <Badge variant="secondary" className="gap-1">
              收款方：{filterPayee}
              <button onClick={() => setFilterPayee(null)}>
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}
          {filterPayment && (
            <Badge variant="secondary" className="gap-1">
              支付：{filterPayment}
              <button onClick={() => setFilterPayment(null)}>
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}
          {filterTag && (
            <Badge variant="secondary" className="gap-1">
              分类：{filterTag}
              <button onClick={() => setFilterTag(null)}>
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={clearFilters}
            className="h-7 text-xs"
          >
            清除全部
          </Button>
        </div>
      )}

      {/* Bulk actions toolbar */}
      {someSelected && (
        <div className="flex items-center gap-3 rounded-xl border bg-primary/5 px-4 py-2.5">
          <span className="text-sm font-medium">
            已选 {selectedIds.size} 项
          </span>
          <div className="flex-1" />
          <Button
            variant="outline"
            size="sm"
            onClick={handleBulkCopy}
            className="gap-1.5"
          >
            <Copy className="h-4 w-4" />
            复制
          </Button>
          <Button
            variant="destructive"
            size="sm"
            onClick={handleBulkDelete}
            className="gap-1.5"
          >
            <Trash2 className="h-4 w-4" />
            删除选中
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSelectedIds(new Set())}
            className="gap-1"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      )}

      {/* Table */}
      <div className="rounded-xl border bg-card overflow-hidden">
        <ScrollArea className="w-full whitespace-nowrap">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="w-[40px]">
                  <Checkbox
                    checked={
                      allSelected
                        ? true
                        : someSelected
                          ? "indeterminate"
                          : false
                    }
                    onCheckedChange={toggleSelectAll}
                  />
                </TableHead>
                <TableHead
                  className="w-[140px] cursor-pointer select-none"
                  onClick={() => toggleSort("title")}
                >
                  名称{renderSortIcon("title")}
                </TableHead>
                <TableHead
                  className="w-[120px] cursor-pointer select-none"
                  onClick={() => toggleSort("date")}
                >
                  日期{renderSortIcon("date")}
                </TableHead>
                <TableHead className="w-[160px]">标签</TableHead>
                <TableHead
                  className="w-[100px] text-right cursor-pointer select-none"
                  onClick={() => toggleSort("amount")}
                >
                  金额{renderSortIcon("amount")}
                </TableHead>
                <TableHead
                  className="w-[140px] cursor-pointer select-none"
                  onClick={() => toggleSort("payee")}
                >
                  收款方{renderSortIcon("payee")}
                </TableHead>
                <TableHead className="min-w-[180px]">详情</TableHead>
                <TableHead
                  className="w-[120px] cursor-pointer select-none"
                  onClick={() => toggleSort("paymentMethod")}
                >
                  支付方式{renderSortIcon("paymentMethod")}
                </TableHead>
                <TableHead className="w-[60px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={9}
                    className="text-center py-12 text-muted-foreground"
                  >
                    没有找到匹配的记录
                  </TableCell>
                </TableRow>
              ) : (
                filtered.map((item) => {
                  const isEditing = inlineEditId === item.id;
                  const isSelected = selectedIds.has(item.id);
                  return (
                    <TableRow
                      key={item.id}
                      className={cn(
                      "group",
                      isSelected && "bg-primary/5"
                      )}
                    >
                      <TableCell>
                        <Checkbox
                          checked={isSelected}
                          onCheckedChange={() => toggleSelect(item.id)}
                        />
                      </TableCell>
                      <TableCell className="font-medium">
                        {isEditing && inlineField === "title" ? (
                          <input
                            autoFocus
                            value={inlineValue}
                            onChange={(e) => setInlineValue(e.target.value)}
                            onBlur={saveInlineEdit}
                            onKeyDown={(e) => {
                              if (e.key === "Enter") saveInlineEdit();
                              if (e.key === "Escape") cancelInlineEdit();
                            }}
                            className="w-full bg-transparent outline-none border-b border-primary"
                          />
                        ) : (
                          <span
                            onClick={() =>
                              startInlineEdit(item.id, "title", item.title)
                            }
                            className="cursor-text"
                          >
                            {item.title}
                          </span>
                        )}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {isEditing && inlineField === "date" ? (
                          <input
                            autoFocus
                            type="date"
                            value={inlineValue}
                            onChange={(e) => setInlineValue(e.target.value)}
                            onBlur={saveInlineEdit}
                            onKeyDown={(e) => {
                              if (e.key === "Enter") saveInlineEdit();
                              if (e.key === "Escape") cancelInlineEdit();
                            }}
                            className="bg-transparent outline-none border-b border-primary"
                          />
                        ) : (
                          <span
                            onClick={() =>
                              startInlineEdit(item.id, "date", item.date)
                            }
                            className="cursor-text"
                          >
                            {formatDate(item.date)}
                          </span>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {item.tags.map((tag) => (
                            <Badge
                              key={tag}
                              variant="outline"
                              className={cn(
                                "text-[10px] px-1.5 py-0 font-medium",
                                getTagClass(tag)
                              )}
                            >
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      </TableCell>
                      <TableCell className="text-right font-semibold tabular-nums">
                        {isEditing && inlineField === "amount" ? (
                          <input
                            autoFocus
                            type="number"
                            step="0.01"
                            value={inlineValue}
                            onChange={(e) => setInlineValue(e.target.value)}
                            onBlur={saveInlineEdit}
                            onKeyDown={(e) => {
                              if (e.key === "Enter") saveInlineEdit();
                              if (e.key === "Escape") cancelInlineEdit();
                            }}
                            className="w-20 bg-transparent outline-none border-b border-primary text-right"
                          />
                        ) : (
                          <span
                            onClick={() =>
                              startInlineEdit(item.id, "amount", item.amount)
                            }
                            className="cursor-text"
                          >
                            {formatCurrency(item.amount)}
                          </span>
                        )}
                      </TableCell>
                      <TableCell>
                        {isEditing && inlineField === "payee" ? (
                          <input
                            autoFocus
                            value={inlineValue}
                            onChange={(e) => setInlineValue(e.target.value)}
                            onBlur={saveInlineEdit}
                            onKeyDown={(e) => {
                              if (e.key === "Enter") saveInlineEdit();
                              if (e.key === "Escape") cancelInlineEdit();
                            }}
                            className="w-full bg-transparent outline-none border-b border-primary"
                          />
                        ) : (
                          <span
                            onClick={() =>
                              startInlineEdit(item.id, "payee", item.payee)
                            }
                            className="cursor-text"
                          >
                            {item.payee}
                          </span>
                        )}
                      </TableCell>
                      <TableCell className="text-muted-foreground max-w-[240px] truncate">
                        {isEditing && inlineField === "description" ? (
                          <input
                            autoFocus
                            value={inlineValue}
                            onChange={(e) => setInlineValue(e.target.value)}
                            onBlur={saveInlineEdit}
                            onKeyDown={(e) => {
                              if (e.key === "Enter") saveInlineEdit();
                              if (e.key === "Escape") cancelInlineEdit();
                            }}
                            className="w-full bg-transparent outline-none border-b border-primary"
                          />
                        ) : (
                          <span
                            onClick={() =>
                              startInlineEdit(
                                item.id,
                                "description",
                                item.description
                              )
                            }
                            className="cursor-text"
                          >
                            {item.description || "—"}
                          </span>
                        )}
                      </TableCell>
                      <TableCell>
                        <select
                          value={item.paymentMethod}
                          onChange={(e) =>
                            updateExpense(item.id, {
                              paymentMethod: e.target.value,
                            })
                          }
                          className="bg-transparent border border-transparent hover:border-border rounded px-1 py-0.5 text-sm cursor-pointer outline-none focus:border-primary"
                        >
                          {labels.paymentMethods.map((m) => (
                            <option key={m} value={m}>
                              {m}
                            </option>
                          ))}
                        </select>
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => openEdit(item)}>
                              <Pencil className="mr-2 h-4 w-4" />
                              编辑
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => duplicateExpense(item.id)}
                            >
                              <Copy className="mr-2 h-4 w-4" />
                              复制
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => {
                                toggleSelect(item.id);
                              }}
                            >
                              <CheckSquare className="mr-2 h-4 w-4" />
                              {isSelected ? "取消选中" : "选中"}
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => deleteExpense(item.id)}
                              className="text-destructive focus:text-destructive"
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              删除
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>
        <div className="flex items-center justify-between border-t px-4 py-3 text-sm">
          <span className="text-muted-foreground">
            COUNT {filtered.length}
          </span>
          <span className="font-semibold tabular-nums">
            SUM {formatCurrency(total)}
          </span>
        </div>
      </div>
    </div>
  );
}
