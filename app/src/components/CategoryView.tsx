import { useMemo, useState } from "react";
import { useExpenses } from "@/hooks/useExpenses";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  formatCurrency,
  getCategorySummary,
  getChartColor,
  filterByMonth,
} from "@/lib/expenseHelpers";
import { getTagClass } from "@/types/expense";
import { TimeFilter, type TimeFilterValue } from "./TimeFilter";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { Tags, TrendingUp, Calendar } from "lucide-react";
import { cn } from "@/lib/utils";

export function CategoryView() {
  const { expenses, labels } = useExpenses();
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [timeFilter, setTimeFilter] = useState<TimeFilterValue>({
    mode: "all",
    month: null,
    year: null,
  });

  const scopedExpenses = useMemo(() => {
    if (timeFilter.mode === "all") return expenses;
    if (timeFilter.mode === "month" && timeFilter.month)
      return filterByMonth(expenses, timeFilter.month);
    if (timeFilter.mode === "year" && timeFilter.year)
      return expenses.filter(
        (item) => item.date.slice(0, 4) === timeFilter.year
      );
    return expenses;
  }, [expenses, timeFilter]);

  const data = useMemo(() => {
    const grouped = labels.categories
      .map((tag) => {
        const amount = scopedExpenses
          .filter((item) => item.tags.includes(tag))
          .reduce((sum, item) => sum + item.amount, 0);
        return { tag, amount };
      })
      .filter((item) => item.amount > 0);
    return grouped.sort((a, b) => b.amount - a.amount);
  }, [scopedExpenses, labels.categories]);

  const total = useMemo(
    () => data.reduce((sum, item) => sum + item.amount, 0),
    [data]
  );

  const summary = useMemo(() => {
    if (!selectedTag) return null;
    return getCategorySummary(scopedExpenses, selectedTag);
  }, [scopedExpenses, selectedTag]);

  const timeLabel =
    timeFilter.mode === "all"
      ? "全部时间"
      : timeFilter.mode === "month" && timeFilter.month
        ? `${timeFilter.month.slice(0, 4)}年${parseInt(
            timeFilter.month.slice(5, 7),
            10
          )}月`
        : timeFilter.mode === "year" && timeFilter.year
          ? `${timeFilter.year}年`
          : "全部时间";

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <TimeFilter value={timeFilter} onChange={setTimeFilter} />
        <span className="text-sm text-muted-foreground">
          当前范围：{timeLabel}
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
        <Card className="bg-card/50">
          <CardHeader className="pb-2 p-4">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              分类总数
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="text-2xl font-bold">{data.length} 个</div>
          </CardContent>
        </Card>
        <Card className="bg-card/50">
          <CardHeader className="pb-2 p-4">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              分类总支出
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="text-2xl font-bold">{formatCurrency(total)}</div>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-card/50">
        <CardHeader className="p-4 md:p-6">
          <CardTitle className="flex items-center gap-2 text-base md:text-lg">
            <Tags className="h-5 w-5 text-primary" />
            支出分类占比
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4 md:p-6 pt-0">
          <div className="h-[300px] md:h-[400px]">
            {data.length === 0 ? (
              <div className="h-full flex items-center justify-center text-muted-foreground">
                所选时间范围内暂无数据
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={data}
                    dataKey="amount"
                    nameKey="tag"
                    cx="50%"
                    cy="50%"
                    outerRadius="80%"
                    label={(entry) =>
                      `${entry.tag}: ${formatCurrency(
                        entry.amount as number
                      )}`
                    }
                  >
                    {data.map((entry, index) => (
                      <Cell key={entry.tag} fill={getChartColor(index)} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value: number, name: string) => [
                      formatCurrency(value),
                      name,
                    ]}
                    contentStyle={{ borderRadius: "12px" }}
                  />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </CardContent>
      </Card>

      <div className="rounded-xl border bg-card/50 overflow-hidden">
        <div className="px-4 py-3 border-b font-medium">分类明细</div>
        <div className="divide-y">
          {data.length === 0 ? (
            <div className="px-4 py-8 text-center text-muted-foreground">
              所选时间范围内暂无数据
            </div>
          ) : (
            data.map((item, index) => (
              <button
                key={item.tag}
                onClick={() => setSelectedTag(item.tag)}
                className="w-full flex items-center justify-between px-4 py-3 hover:bg-muted/30 transition-colors text-left"
              >
                <div className="flex items-center gap-3">
                  <div
                    className="h-3 w-3 rounded-full"
                    style={{ backgroundColor: getChartColor(index) }}
                  />
                  <span
                    className={cn(
                      "px-2 py-0.5 rounded-full text-xs border",
                      getTagClass(item.tag)
                    )}
                  >
                    {item.tag}
                  </span>
                </div>
                <div className="text-right">
                  <div className="font-semibold tabular-nums">
                    {formatCurrency(item.amount)}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {total > 0
                      ? ((item.amount / total) * 100).toFixed(1)
                      : 0}
                    %
                  </div>
                </div>
              </button>
            ))
          )}
        </div>
      </div>

      <Dialog
        open={!!selectedTag}
        onOpenChange={() => setSelectedTag(null)}
      >
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              {selectedTag} 分析
              <span className="text-sm font-normal text-muted-foreground ml-2">
                （{timeLabel}）
              </span>
            </DialogTitle>
          </DialogHeader>
          {summary && (
            <div className="space-y-4 pt-2">
              <div className="grid grid-cols-2 gap-3">
                <Card className="bg-card/50">
                  <CardContent className="p-4">
                    <div className="text-sm text-muted-foreground">
                      总支出
                    </div>
                    <div className="text-xl font-bold">
                      {formatCurrency(summary.total)}
                    </div>
                  </CardContent>
                </Card>
                <Card className="bg-card/50">
                  <CardContent className="p-4">
                    <div className="text-sm text-muted-foreground">
                      记录数
                    </div>
                    <div className="text-xl font-bold">
                      {summary.filtered.length} 笔
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div>
                <h4 className="text-sm font-medium mb-2 flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  按月份分布
                </h4>
                <div className="rounded-lg border divide-y">
                  {summary.byMonth.length === 0 ? (
                    <div className="px-3 py-4 text-sm text-muted-foreground text-center">
                      暂无数据
                    </div>
                  ) : (
                    summary.byMonth.map((m) => (
                      <div
                        key={m.month}
                        className="flex justify-between px-3 py-2 text-sm"
                      >
                        <span>{m.label}</span>
                        <span className="font-medium">
                          {formatCurrency(m.amount)}
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </div>

              <div>
                <h4 className="text-sm font-medium mb-2">按收款方分布</h4>
                <div className="rounded-lg border divide-y">
                  {summary.byPayee.length === 0 ? (
                    <div className="px-3 py-4 text-sm text-muted-foreground text-center">
                      暂无数据
                    </div>
                  ) : (
                    summary.byPayee.slice(0, 10).map((p) => (
                      <div
                        key={p.payee}
                        className="flex justify-between px-3 py-2 text-sm"
                      >
                        <span>{p.payee}</span>
                        <span className="font-medium">
                          {formatCurrency(p.amount)}
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
