import { useState } from "react";
import { ExpensesProvider } from "@/hooks/useExpenses";
import { Layout } from "@/components/Layout";
import { StatCards } from "@/components/StatCards";
import { ExpenseTable } from "@/components/ExpenseTable";
import { MonthlyView } from "@/components/MonthlyView";
import { CategoryView } from "@/components/CategoryView";
import { PayeeView } from "@/components/PayeeView";
import { PaymentView } from "@/components/PaymentView";
import { ReceiptScanner } from "@/components/ReceiptScanner";
import { AIAssistant } from "@/components/AIAssistant";
import { SettingsView } from "@/components/SettingsView";
import type { ViewType } from "@/types/expense";

function ViewContent({ view }: { view: ViewType }) {
  switch (view) {
    case "table":
      return (
        <div className="space-y-4">
          <StatCards />
          <ExpenseTable />
        </div>
      );
    case "monthly":
      return <MonthlyView />;
    case "category":
      return <CategoryView />;
    case "payee":
      return <PayeeView />;
    case "payment":
      return <PaymentView />;
    case "receipt":
      return <ReceiptScanner />;
    case "ai":
      return <AIAssistant />;
    case "settings":
      return <SettingsView />;
    default:
      return null;
  }
}

function AppContent() {
  const [currentView, setCurrentView] = useState<ViewType>("table");

  return (
    <Layout currentView={currentView} onChangeView={setCurrentView}>
      <div className="mb-4">
        <h2 className="text-xl md:text-2xl font-bold">
          {currentView === "table" && "记账表格"}
          {currentView === "monthly" && "月度视图"}
          {currentView === "category" && "分类视图"}
          {currentView === "payee" && "收款方视图"}
          {currentView === "payment" && "支付方式"}
          {currentView === "receipt" && "小票识别"}
          {currentView === "ai" && "AI 理财助手"}
          {currentView === "settings" && "设置"}
        </h2>
        <p className="text-sm text-muted-foreground">
          {currentView === "table" && "查看和管理所有支出记录"}
          {currentView === "monthly" && "按月份查看支出趋势和明细"}
          {currentView === "category" && "按类别分析支出构成"}
          {currentView === "payee" && "按收款方查看支出排行"}
          {currentView === "payment" && "按支付方式分析支出分布"}
          {currentView === "receipt" && "拍照或上传小票自动识别"}
          {currentView === "ai" && "向 AI 询问开支情况和理财建议"}
          {currentView === "settings" && "管理主题和标签"}
        </p>
      </div>
      <ViewContent view={currentView} />
    </Layout>
  );
}

function App() {
  return (
    <ExpensesProvider>
      <AppContent />
    </ExpensesProvider>
  );
}

export default App;
