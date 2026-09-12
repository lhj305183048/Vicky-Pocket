import { useEffect, useRef, useState } from "react";
import { useExpenses } from "@/hooks/useExpenses";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Bot, Send, User, Sparkles, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  formatCurrency,
  getCategorySummary,
  groupByMonth,
  groupByTag,
} from "@/lib/expenseHelpers";

export function AIAssistant() {
  const { expenses, chatMessages, addChatMessage, clearChat } = useExpenses();
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [chatMessages, loading]);

  function generateAnalysis() {
    const total = expenses.reduce((sum, item) => sum + item.amount, 0);
    const monthly = groupByMonth(expenses);
    const tags = groupByTag(expenses);
    const carSummary = getCategorySummary(expenses, "车");
    const foodSummary = getCategorySummary(expenses, "食物");
    const housingSummary = getCategorySummary(expenses, "住房开销");

    const avgMonthly = monthly.length ? total / monthly.length : 0;
    const latestMonth = monthly[monthly.length - 1];
    const previousMonth = monthly[monthly.length - 2];
    const monthChange =
      latestMonth && previousMonth
        ? latestMonth.amount - previousMonth.amount
        : 0;

    return `根据你的记账数据，我为你做了以下分析：

**总体情况**
- 总记录：${expenses.length} 笔
- 累计支出：${formatCurrency(total)}
- 月均支出：${formatCurrency(avgMonthly)}

**主要支出类别**
${tags
  .slice(0, 5)
  .map((t, i) => `${i + 1}. ${t.tag}：${formatCurrency(t.amount)}`)
  .join("\n")}

**月度趋势**
${
  latestMonth
    ? `- 最近月份 ${latestMonth.label} 支出 ${formatCurrency(
        latestMonth.amount
      )}`
    : ""
}
${
  previousMonth
    ? `- 上月 ${previousMonth.label} 支出 ${formatCurrency(
        previousMonth.amount
      )}`
    : ""
}
${
  monthChange !== 0
    ? `- 环比变化：${monthChange > 0 ? "增加" : "减少"} ${formatCurrency(
        Math.abs(monthChange)
      )}`
    : ""
}

**专项分析**
- 汽车类总支出：${formatCurrency(carSummary.total)}，月均约 ${formatCurrency(
      carSummary.byMonth.length
        ? carSummary.total / carSummary.byMonth.length
        : 0
    )}
- 食物类总支出：${formatCurrency(foodSummary.total)}，月均约 ${formatCurrency(
      foodSummary.byMonth.length
        ? foodSummary.total / foodSummary.byMonth.length
        : 0
    )}
- 住房类总支出：${formatCurrency(
      housingSummary.total
    )}，月均约 ${formatCurrency(
      housingSummary.byMonth.length
        ? housingSummary.total / housingSummary.byMonth.length
        : 0
    )}

**理财建议**
1. 如果食物支出占比较高，可以尝试制定每周买菜预算，减少冲动消费。
2. 汽车支出包括加油、保险和保养，建议预留专门账户管理车辆相关费用。
3. 住房开销通常是固定支出，可考虑寻找更优惠的网络或话费套餐。
4. 坚持每天记账，月底复盘一次，找出可以削减的非必要支出。`;
  }

  function generateReply(question: string) {
    const q = question.toLowerCase();
    const total = expenses.reduce((sum, item) => sum + item.amount, 0);
    const monthly = groupByMonth(expenses);
    const tags = groupByTag(expenses);
    const car = getCategorySummary(expenses, "车");
    const food = getCategorySummary(expenses, "食物");

    if (/最近|本月|这个月|latest|recent/.test(q)) {
      const latest = monthly[monthly.length - 1];
      if (!latest) return "目前还没有足够的数据来分析最近的开支。";
      return `最近一个月（${latest.label}）你支出了 ${formatCurrency(
        latest.amount
      )}。主要花在 ${tags[0]?.tag || "—"} 上，金额为 ${formatCurrency(
        tags[0]?.amount || 0
      )}。`;
    }

    if (/车|汽车|加油|car|gas|auto/.test(q)) {
      return `你在汽车方面的总支出为 ${formatCurrency(
        car.total
      )}，共 ${car.filtered.length} 笔记录。按月份平均约为 ${formatCurrency(
        car.byMonth.length ? car.total / car.byMonth.length : 0
      )}。其中主要支出项目包括加油、保险和保养。`;
    }

    if (/食物|买菜|吃饭|grocery|food/.test(q)) {
      return `你在食物方面的总支出为 ${formatCurrency(
        food.total
      )}，共 ${food.filtered.length} 笔记录。按月份平均约为 ${formatCurrency(
        food.byMonth.length ? food.total / food.byMonth.length : 0
      )}。建议在超市购物前列好清单，避免购买不必要的商品。`;
    }

    if (/变化|趋势|compare|trend/.test(q)) {
      const latest = monthly[monthly.length - 1];
      const prev = monthly[monthly.length - 2];
      if (!latest || !prev)
        return "目前数据还不足以分析月度变化趋势，建议继续使用并记录更多数据。";
      const diff = latest.amount - prev.amount;
      return `${latest.label} 相比 ${prev.label} ${
        diff > 0 ? "增加了" : "减少了"
      } ${formatCurrency(Math.abs(diff))}，变化幅度约为 ${(
        (diff / prev.amount) *
        100
      ).toFixed(1)}%。`;
    }

    if (/建议|规划|理财|budget|advice|save/.test(q)) {
      return generateAnalysis();
    }

    return `我注意到你问的是「${question}」。目前我的数据中有 ${
      expenses.length
    } 笔支出，累计 ${formatCurrency(
      total
    )}。你可以问我最近开支、汽车支出、食物支出、月度变化或理财建议，我会基于你的记账数据给你答案。`;
  }

  function handleSend() {
    if (!input.trim()) return;
    const question = input.trim();
    addChatMessage({ role: "user", content: question });
    setInput("");
    setLoading(true);

    // Simulate API delay
    setTimeout(() => {
      const reply = generateReply(question);
      addChatMessage({ role: "assistant", content: reply });
      setLoading(false);
    }, 800);
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  return (
    <div className="max-w-3xl mx-auto h-[calc(100vh-180px)] md:h-[calc(100vh-140px)] flex flex-col">
      <Card className="bg-card/50 flex-1 flex flex-col overflow-hidden">
        <CardHeader className="p-4 md:p-6 border-b flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-base md:text-lg">
            <Bot className="h-5 w-5 text-primary" />
            Vicky AI 理财助手
          </CardTitle>
          {chatMessages.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearChat}
              className="gap-1 text-muted-foreground"
            >
              <Trash2 className="h-4 w-4" />
              清空
            </Button>
          )}
        </CardHeader>

        <ScrollArea className="flex-1 p-4" ref={scrollRef}>
          {chatMessages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center py-12 space-y-4">
              <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
                <Sparkles className="h-8 w-8 text-primary" />
              </div>
              <div>
                <p className="font-medium">我是你的 AI 记账助手</p>
                <p className="text-sm text-muted-foreground mt-1">
                  可以问我：最近开支如何？汽车类花了多少？<br className="hidden sm:block" />
                  本月变化大吗？有什么理财建议？
                </p>
              </div>
              <div className="flex flex-wrap justify-center gap-2">
                {[
                  "分析我的开支",
                  "最近汽车花了多少",
                  "本月支出变化",
                  "给我一些理财建议",
                ].map((q) => (
                  <Button
                    key={q}
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setInput(q);
                      setTimeout(() => handleSend(), 0);
                    }}
                  >
                    {q}
                  </Button>
                ))}
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {chatMessages.map((msg) => (
                <div
                  key={msg.id}
                  className={cn(
                    "flex gap-3",
                    msg.role === "user" ? "justify-end" : "justify-start"
                  )}
                >
                  {msg.role === "assistant" && (
                    <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                      <Bot className="h-4 w-4 text-primary" />
                    </div>
                  )}
                  <div
                    className={cn(
                      "rounded-2xl px-4 py-3 max-w-[85%] text-sm leading-relaxed whitespace-pre-line",
                      msg.role === "user"
                        ? "bg-primary text-primary-foreground rounded-br-none"
                        : "bg-muted rounded-bl-none"
                    )}
                  >
                    {msg.content}
                  </div>
                  {msg.role === "user" && (
                    <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center shrink-0">
                      <User className="h-4 w-4" />
                    </div>
                  )}
                </div>
              ))}
              {loading && (
                <div className="flex gap-3">
                  <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                    <Bot className="h-4 w-4 text-primary" />
                  </div>
                  <div className="bg-muted rounded-2xl rounded-bl-none px-4 py-3 flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-primary animate-bounce" />
                    <div className="h-2 w-2 rounded-full bg-primary animate-bounce [animation-delay:0.2s]" />
                    <div className="h-2 w-2 rounded-full bg-primary animate-bounce [animation-delay:0.4s]" />
                  </div>
                </div>
              )}
            </div>
          )}
        </ScrollArea>

        <div className="p-4 border-t bg-card/80">
          <div className="flex gap-2">
            <Input
              placeholder="输入问题，例如：最近开支如何？"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              className="flex-1"
            />
            <Button
              onClick={handleSend}
              disabled={!input.trim() || loading}
              className="gap-2"
            >
              <Send className="h-4 w-4" />
              发送
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
