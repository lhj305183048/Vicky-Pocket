import { useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import type { ViewType } from "@/types/expense";
import {
  Bot,
  Camera,
  CalendarDays,
  CreditCard,
  LayoutDashboard,
  Menu,
  Settings,
  Store,
  Table2,
  Tags,
  Wallet,
} from "lucide-react";

interface LayoutProps {
  currentView: ViewType;
  onChangeView: (view: ViewType) => void;
  children: React.ReactNode;
}

const navItems: { view: ViewType; label: string; icon: React.ElementType }[] = [
  { view: "table", label: "记账表格", icon: Table2 },
  { view: "monthly", label: "月度视图", icon: CalendarDays },
  { view: "category", label: "分类视图", icon: Tags },
  { view: "payee", label: "收款方", icon: Store },
  { view: "payment", label: "支付方式", icon: CreditCard },
  { view: "receipt", label: "小票识别", icon: Camera },
  { view: "ai", label: "AI 助手", icon: Bot },
  { view: "settings", label: "设置", icon: Settings },
];

export function Layout({ currentView, onChangeView, children }: LayoutProps) {
  const [mobileOpen, setMobileOpen] = useState(false);

  const NavButton = ({
    item,
    isMobile = false,
  }: {
    item: (typeof navItems)[number];
    isMobile?: boolean;
  }) => {
    const active = currentView === item.view;
    const Icon = item.icon;
    return (
      <Button
        variant={active ? "default" : "ghost"}
        size={isMobile ? "icon" : "default"}
        onClick={() => {
          onChangeView(item.view);
          setMobileOpen(false);
        }}
        className={cn(
          isMobile
            ? "h-12 w-12 rounded-xl flex-col gap-0.5"
            : "w-full justify-start gap-3 px-3 h-11",
          active && "bg-primary text-primary-foreground shadow-sm"
        )}
      >
        <Icon className={cn("shrink-0", isMobile ? "h-5 w-5" : "h-5 w-5")} />
        {!isMobile && <span className="text-sm font-medium">{item.label}</span>}
        {isMobile && (
          <span className="text-[10px] font-medium leading-none">
            {item.label.slice(0, 2)}
          </span>
        )}
      </Button>
    );
  };

  return (
    <div className="flex min-h-screen bg-background">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex w-64 flex-col border-r bg-card/50 backdrop-blur-sm fixed left-0 top-0 bottom-0 z-30">
        <div className="flex h-16 items-center gap-2 px-4 border-b">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-primary-foreground">
            <Wallet className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-lg font-bold leading-tight">Vicky Pocket</h1>
            <p className="text-xs text-muted-foreground">智能记账助手</p>
          </div>
        </div>
        <nav className="flex-1 overflow-auto p-3 space-y-1">
          {navItems.map((item) => (
            <NavButton key={item.view} item={item} />
          ))}
        </nav>
        <div className="border-t p-3">
          <div className="rounded-xl bg-muted/50 p-3">
            <p className="text-xs text-muted-foreground">
              数据自动保存在浏览器本地
            </p>
          </div>
        </div>
      </aside>

      {/* Mobile Header */}
      <header className="md:hidden fixed top-0 left-0 right-0 h-14 z-30 flex items-center justify-between border-b bg-card/80 backdrop-blur-md px-4">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Wallet className="h-4 w-4" />
          </div>
          <span className="font-bold">Vicky Pocket</span>
        </div>
        <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="h-9 w-9">
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-64 p-0">
            <SheetHeader className="p-4 border-b">
              <SheetTitle className="flex items-center gap-2">
                <Wallet className="h-5 w-5" />
                Vicky Pocket
              </SheetTitle>
            </SheetHeader>
            <nav className="p-3 space-y-1">
              {navItems.map((item) => (
                <NavButton key={item.view} item={item} />
              ))}
            </nav>
          </SheetContent>
        </Sheet>
      </header>

      {/* Main Content */}
      <main className="flex-1 md:ml-64 pb-20 md:pb-0 pt-14 md:pt-0">
        <div className="p-4 md:p-6 max-w-7xl mx-auto">{children}</div>
      </main>

      {/* Mobile Bottom Nav */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-card/90 backdrop-blur-lg border-t z-30 flex items-center justify-around px-2">
        {navItems.slice(0, 5).map((item) => (
          <NavButton key={item.view} item={item} isMobile />
        ))}
        <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
          <SheetTrigger asChild>
            <Button
              variant={
                ["receipt", "ai", "settings"].includes(currentView)
                  ? "default"
                  : "ghost"
              }
              size="icon"
              className="h-12 w-12 rounded-xl flex-col gap-0.5"
            >
              <LayoutDashboard className="h-5 w-5" />
              <span className="text-[10px] font-medium leading-none">更多</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-64 p-0">
            <SheetHeader className="p-4 border-b">
              <SheetTitle className="flex items-center gap-2">
                <Wallet className="h-5 w-5" />
                Vicky Pocket
              </SheetTitle>
            </SheetHeader>
            <nav className="p-3 space-y-1">
              {navItems.map((item) => (
                <NavButton key={item.view} item={item} />
              ))}
            </nav>
          </SheetContent>
        </Sheet>
      </nav>
    </div>
  );
}
