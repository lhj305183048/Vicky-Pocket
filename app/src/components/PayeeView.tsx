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
  groupByPayee,
  filterByMonth,
} from "@/lib/expenseHelpers";
import { TimeFilter, type TimeFilterValue } from "./TimeFilter";
import { Store, Receipt } from "lucide-react";

export function PayeeView() {
  const { expenses } = useExpenses();
  const [selectedPayee, setSelectedPayee] = useState<string | null>(null);
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

  const data = useMemo(() => groupByPayee(scopedExpenses), [scopedExpenses]);
  const total = useMemo(
    () => data.reduce((sum, item) => sum + item.amount, 0),
    [data]
  );

  const selectedTransactions = useMemo(() => {
    if (!selectedPayee) return [];
    return scopedExpenses
      .filter((item) => item.payee === selectedPayee)
      .sort((a, b) => b.date.localeCompare(a.date));
  }, [scopedExpenses, selectedPayee]);

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
              收款方数量
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="text-2xl font-bold">{data.length} 个</div>
          </CardContent>
        </Card>
        <Card className="bg-card/50">
          <CardHeader className="pb-2 p-4">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              涉及总金额
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="text-2xl font-bold">
              {formatCurrency(total)}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-card/50">
        <CardHeader className="p-4 md:p-6">
          <CardTitle className="flex items-center gap-2 text-base md:text-lg">
            <Store className="h-5 w-5 text-primary" />
            收款方支出排行
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4 md:p-6 pt-0">
          <div className="space-y-3">
            {data.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">
                所选时间范围内暂无数据
              </p>
            ) : (
              data.map((item, index) => (
                <button
                  key={item.payee}
                  onClick={() => setSelectedPayee(item.payee)}
                  className="w-full group"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-muted font-bold text-sm">
                      {index + 1}
                    </div>
                    <div className="flex-1 min-w-0 text-left">
                      <div className="flex items-center justify-between">
                        <span className="font-medium truncate">
                          {item.payee}
                        </span>
                        <span className="font-semibold tabular-nums">
                          {formatCurrency(item.amount)}
                        </span>
                      </div>
                      <div className="h-2 w-full rounded-full bg-muted mt-2 overflow-hidden">
                        <div
                          className="h-full rounded-full bg-primary transition-all"
                          style={{
                            width: `${
                              total > 0
                                ? (item.amount / total) * 100
                                : 0
                            }%`,
                          }}
                        />
                      </div>
                    </div>
                  </div>
                </button>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      <Dialog
        open={!!selectedPayee}
        onOpenChange={() => setSelectedPayee(null)}
      >
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Receipt className="h-5 w-5" />
              {selectedPayee} 的交易记录
              <span className="text-sm font-normal text-muted-foreground ml-2">
                （{timeLabel}）
              </span>
            </DialogTitle>
          </DialogHeader>
          <div className="rounded-xl border divide-y mt-2">
            {selectedTransactions.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between px-4 py-3"
              >
                <div>
                  <div className="font-medium">{item.title}</div>
                  <div className="text-xs text-muted-foreground">
                    {item.date} · {item.paymentMethod}
                  </div>
                </div>
                <span className="font-semibold tabular-nums">
                  {formatCurrency(item.amount)}
                </span>
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
