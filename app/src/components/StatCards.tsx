import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useExpenses } from "@/hooks/useExpenses";
import { formatCurrency, groupByMonth, groupByTag } from "@/lib/expenseHelpers";
import { Receipt, TrendingUp, Wallet, Calendar } from "lucide-react";

export function StatCards() {
  const { expenses } = useExpenses();

  const totalAmount = expenses.reduce((sum, item) => sum + item.amount, 0);
  const count = expenses.length;
  const monthlyData = groupByMonth(expenses);
  const currentMonth = new Date().toISOString().slice(0, 7);
  const currentMonthTotal =
    monthlyData.find((m) => m.month === currentMonth)?.amount || 0;
  const topCategory = groupByTag(expenses)[0];

  const stats = [
    {
      title: "总支出",
      value: formatCurrency(totalAmount),
      icon: Wallet,
      description: `共 ${count} 笔记录`,
    },
    {
      title: "本月支出",
      value: formatCurrency(currentMonthTotal),
      icon: Calendar,
      description: currentMonth
        ? `${currentMonth.replace("-", "年")}月`
        : "",
    },
    {
      title: "最大支出类别",
      value: topCategory?.tag || "无",
      icon: TrendingUp,
      description: topCategory
        ? formatCurrency(topCategory.amount)
        : "",
    },
    {
      title: "月均支出",
      value: formatCurrency(
        monthlyData.length ? totalAmount / monthlyData.length : 0
      ),
      icon: Receipt,
      description: `基于 ${monthlyData.length} 个月`,
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
      {stats.map((stat) => {
        const Icon = stat.icon;
        return (
          <Card key={stat.title} className="bg-card/50 border-border/60">
            <CardHeader className="flex flex-row items-center justify-between pb-2 p-4">
              <CardTitle className="text-xs md:text-sm font-medium text-muted-foreground">
                {stat.title}
              </CardTitle>
              <Icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent className="p-4 pt-0">
              <div className="text-lg md:text-2xl font-bold truncate">
                {stat.value}
              </div>
              <p className="text-xs text-muted-foreground truncate">
                {stat.description}
              </p>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
