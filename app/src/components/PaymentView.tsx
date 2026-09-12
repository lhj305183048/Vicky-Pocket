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
  groupByPaymentMethod,
  filterByMonth,
} from "@/lib/expenseHelpers";
import { TimeFilter, type TimeFilterValue } from "./TimeFilter";
import { CreditCard, Receipt } from "lucide-react";

function getMethodInitials(method: string) {
  return method
    .split(/\s+/)
    .map((word) => word[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export function PaymentView() {
  const { expenses } = useExpenses();
  const [selectedMethod, setSelectedMethod] = useState<string | null>(null);
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

  const data = useMemo(
    () => groupByPaymentMethod(scopedExpenses),
    [scopedExpenses]
  );
  const total = useMemo(
    () => data.reduce((sum, item) => sum + item.amount, 0),
    [data]
  );

  const selectedTransactions = useMemo(() => {
    if (!selectedMethod) return [];
    return scopedExpenses
      .filter((item) => item.paymentMethod === selectedMethod)
      .sort((a, b) => b.date.localeCompare(a.date));
  }, [scopedExpenses, selectedMethod]);

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
              支付方式数量
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="text-2xl font-bold">{data.length} 种</div>
          </CardContent>
        </Card>
        <Card className="bg-card/50">
          <CardHeader className="pb-2 p-4">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              支付总额
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="text-2xl font-bold">{formatCurrency(total)}</div>
          </CardContent>
        </Card>
      </div>

      {data.length === 0 ? (
        <Card className="bg-card/50">
          <CardContent className="p-8 text-center text-muted-foreground">
            所选时间范围内暂无数据
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
            {data.map((item) => (
              <Card
                key={item.method}
                className="bg-card/50 cursor-pointer hover:border-primary/50 transition-colors"
                onClick={() => setSelectedMethod(item.method)}
              >
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary font-bold text-sm">
                        {getMethodInitials(item.method)}
                      </div>
                      <div className="font-medium">{item.method}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold tabular-nums">
                        {formatCurrency(item.amount)}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {total > 0
                          ? ((item.amount / total) * 100).toFixed(1)
                          : 0}
                        %
                      </div>
                    </div>
                  </div>
                  <div className="h-1.5 w-full rounded-full bg-muted mt-4 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-primary"
                      style={{
                        width: `${
                          total > 0 ? (item.amount / total) * 100 : 0
                        }%`,
                      }}
                    />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <Card className="bg-card/50">
            <CardHeader className="p-4 md:p-6">
              <CardTitle className="flex items-center gap-2 text-base md:text-lg">
                <CreditCard className="h-5 w-5 text-primary" />
                支付方式分布
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 md:p-6 pt-0">
              <div className="space-y-3">
                {data.map((item) => (
                  <button
                    key={item.method}
                    onClick={() => setSelectedMethod(item.method)}
                    className="w-full"
                  >
                    <div className="flex items-center justify-between text-sm mb-1">
                      <span className="font-medium">{item.method}</span>
                      <span className="tabular-nums">
                        {formatCurrency(item.amount)}
                      </span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
                      <div
                        className="h-full rounded-full bg-primary transition-all"
                        style={{
                          width: `${
                            total > 0 ? (item.amount / total) * 100 : 0
                          }%`,
                        }}
                      />
                    </div>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>
        </>
      )}

      <Dialog
        open={!!selectedMethod}
        onOpenChange={() => setSelectedMethod(null)}
      >
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Receipt className="h-5 w-5" />
              {selectedMethod} 的交易记录
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
                    {item.date} · {item.payee}
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
