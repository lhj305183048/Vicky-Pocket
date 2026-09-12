import { useMemo } from "react";
import { useExpenses } from "@/hooks/useExpenses";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency, groupByMonth } from "@/lib/expenseHelpers";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import { Calendar } from "lucide-react";

export function MonthlyView() {
  const { expenses } = useExpenses();
  const data = useMemo(() => groupByMonth(expenses), [expenses]);

  const total = useMemo(
    () => data.reduce((sum, item) => sum + item.amount, 0),
    [data]
  );

  const average = data.length ? total / data.length : 0;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
        <Card className="bg-card/50">
          <CardHeader className="pb-2 p-4">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              记录月份数
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="text-2xl font-bold">{data.length} 个月</div>
          </CardContent>
        </Card>
        <Card className="bg-card/50">
          <CardHeader className="pb-2 p-4">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              总支出
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="text-2xl font-bold">{formatCurrency(total)}</div>
          </CardContent>
        </Card>
        <Card className="bg-card/50">
          <CardHeader className="pb-2 p-4">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              月均支出
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="text-2xl font-bold">
              {formatCurrency(average)}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-card/50">
        <CardHeader className="p-4 md:p-6">
          <CardTitle className="flex items-center gap-2 text-base md:text-lg">
            <Calendar className="h-5 w-5 text-primary" />
            月度支出趋势
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4 md:p-6 pt-0">
          <div className="h-[300px] md:h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                <XAxis
                  dataKey="label"
                  angle={-30}
                  textAnchor="end"
                  height={60}
                  tick={{ fontSize: 12 }}
                />
                <YAxis
                  tickFormatter={(value) => `$${value}`}
                  tick={{ fontSize: 12 }}
                />
                <Tooltip
                  formatter={(value: number) => formatCurrency(value)}
                  contentStyle={{ borderRadius: "12px" }}
                />
                <Bar
                  dataKey="amount"
                  fill="hsl(var(--primary))"
                  radius={[6, 6, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <div className="rounded-xl border bg-card/50 overflow-hidden">
        <div className="px-4 py-3 border-b font-medium">月度明细</div>
        <div className="divide-y">
          {[...data].reverse().map((item) => (
            <div
              key={item.month}
              className="flex items-center justify-between px-4 py-3 hover:bg-muted/30 transition-colors"
            >
              <span className="font-medium">{item.label}</span>
              <span className="font-semibold tabular-nums">
                {formatCurrency(item.amount)}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
