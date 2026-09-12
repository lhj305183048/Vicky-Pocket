import { useRef, useState } from "react";
import { useExpenses } from "@/hooks/useExpenses";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Camera,
  Upload,
  X,
  Check,
  Sparkles,
  Receipt,
  ChevronDown,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { getTagClass } from "@/types/expense";
import { formatCurrency } from "@/lib/expenseHelpers";

interface ScannedItem {
  title: string;
  amount: number;
  tags: string[];
  selected: boolean;
}

/**
 * Parses receipt text content and extracts line items with amounts.
 * Each line may contain a product name and a price at the end.
 */
function parseReceiptText(text: string): ScannedItem[] {
  const lines = text
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);
  const items: ScannedItem[] = [];

  for (const line of lines) {
    // Match lines ending with a price (e.g. "Milk 3.99", "Bread .. 2.50")
    const match = line.match(/^(.+?)\s+(?:CAD?\$?|CA\$)?\s*(\d+[.,]\d{2})$/i);
    if (match) {
      const title = match[1].replace(/\.{2,}/g, "").trim();
      const amount = parseFloat(match[2].replace(",", "."));
      if (title && amount > 0 && amount < 10000) {
        items.push({
          title,
          amount,
          tags: detectCategory(title),
          selected: true,
        });
      }
    }
  }

  // If no structured items found, try splitting by common delimiters
  if (items.length === 0) {
    for (const line of lines) {
      const parts = line.split(/\t+|\s{2,}/).filter(Boolean);
      if (parts.length >= 2) {
        const lastPart = parts[parts.length - 1];
        const amountMatch = lastPart.match(/(\d+[.,]\d{2})/);
        if (amountMatch) {
          const title = parts.slice(0, -1).join(" ").trim();
          const amount = parseFloat(amountMatch[1].replace(",", "."));
          if (title && amount > 0) {
            items.push({
              title,
              amount,
              tags: detectCategory(title),
              selected: true,
            });
          }
        }
      }
    }
  }

  return items;
}

function detectCategory(title: string): string[] {
  const lower = title.toLowerCase();
  if (
    /metro|walmart|no frills|foodmart|超市|菜|肉|蛋|奶|水果|蔬菜|fish|meat|bread|milk|egg|fruit|veg|rice|noodle|grocer/.test(
      lower
    )
  )
    return ["食物", "买菜"];
  if (
    /esso|shell|petro|gas|加油|汽油|fuel|wash|洗车|car|auto|tire|insurance|保险|保养|oil|机油/.test(
      lower
    )
  )
    return ["车"];
  if (/rent|房租|cap reit|housing|房|net|internet|网费|phone|话费/.test(lower))
    return ["住房开销"];
  if (/dollarama|清洁|日用|soap|paper|tissue|清洁|洗涤/.test(lower))
    return ["生活用品"];
  if (/movie|cineplex|娱乐|game|游戏|ticket|票/.test(lower)) return ["娱乐"];
  if (/doctor|医院|药|medicine|pharmacy|医疗|clinic/.test(lower))
    return ["医疗"];
  if (/book|school|学|course|课|tuition/.test(lower)) return ["教育"];
  return ["其它"];
}

/**
 * Extracts a payee name from the receipt text (usually the first non-empty line or a store name).
 */
function detectPayee(text: string): string {
  const lines = text
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);
  if (lines.length === 0) return "";
  // Look for a known store name in the first few lines
  const knownStores = [
    "walmart",
    "metro",
    "no frills",
    "food basic",
    "freshco",
    "costco",
    "dollarama",
    "esso",
    "shell",
    "petro",
    "canadian tire",
    "cineplex",
    "shoppers",
    "loblaws",
    "sobeys",
    "大统华",
    "信达",
    "元明",
  ];
  for (let i = 0; i < Math.min(lines.length, 5); i++) {
    const lower = lines[i].toLowerCase();
    for (const store of knownStores) {
      if (lower.includes(store)) {
        return (
          lines[i].replace(/[^a-zA-Z\u4e00-\u9fff\s]/g, "").trim() || store
        );
      }
    }
  }
  // Otherwise return the first line, cleaned up
  return lines[0]
    .replace(/[^a-zA-Z\u4e00-\u9fff\s&'-]/g, "")
    .trim()
    .slice(0, 40);
}

/**
 * Extracts a date from receipt text.
 */
function detectDate(text: string): string | null {
  const patterns: RegExp[] = [
    /(\d{4})[-/](\d{1,2})[-/](\d{1,2})/,
    /(\d{1,2})[/-](\d{1,2})[/-](\d{4})/,
  ];
  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match) {
      let year: string, month: string, day: string;
      if (match[1].length === 4) {
        year = match[1];
        month = match[2].padStart(2, "0");
        day = match[3].padStart(2, "0");
      } else {
        month = match[1].padStart(2, "0");
        day = match[2].padStart(2, "0");
        year = match[3];
      }
      const monthNum = parseInt(month, 10);
      const dayNum = parseInt(day, 10);
      if (monthNum >= 1 && monthNum <= 12 && dayNum >= 1 && dayNum <= 31) {
        return `${year}-${month}-${day}`;
      }
    }
  }
  return null;
}

/**
 * Extracts a total amount from receipt text.
 */
function detectTotal(text: string): number | null {
  const totalPattern =
    /(?:total|subtotal|balance|amount\s*due|sum|合计|总额)[:\s]*\$?\s*(\d+[.,]\d{2})/i;
  const match = text.match(totalPattern);
  if (match) {
    return parseFloat(match[1].replace(",", "."));
  }
  return null;
}

// Fallback demo receipt text for image mode (since we can't do real OCR without backend)
const DEMO_RECEIPT_TEXT = `Walmart
2025-11-08
Bananas 1.99
Milk 4.49
Eggs 3.79
Greek Yogurt 5.29
Artichoke Hearts 2.99
Subtotal 18.55
`;

export function ReceiptScanner() {
  const { addExpenses, labels } = useExpenses();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [scanning, setScanning] = useState(false);
  const [scannedItems, setScannedItems] = useState<ScannedItem[]>([]);
  const [payee, setPayee] = useState("");
  const [paymentMethod, setPaymentMethod] = useState(
    labels.paymentMethods[0] || "BMO credit"
  );
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [done, setDone] = useState(false);
  const [manualText, setManualText] = useState("");
  const [showManual, setShowManual] = useState(false);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    setPreview(url);
    setScannedItems([]);
    setDone(false);
  }

  function performScan(receiptText: string) {
    setScanning(true);
    setTimeout(() => {
      const detectedPayee = detectPayee(receiptText);
      const detectedDate = detectDate(receiptText);
      const detectedTotal = detectTotal(receiptText);
      const items = parseReceiptText(receiptText);

      let finalItems = items;
      if (items.length === 0 && detectedTotal !== null) {
        finalItems = [
          {
            title: detectedPayee || "购物",
            amount: detectedTotal,
            tags: detectCategory(detectedPayee || "购物"),
            selected: true,
          },
        ];
      }

      setScannedItems(finalItems);
      if (detectedPayee) setPayee(detectedPayee);
      if (detectedDate) setDate(detectedDate);
      setScanning(false);
    }, 1500);
  }

  function startScanFromImage() {
    if (!preview) return;
    performScan(DEMO_RECEIPT_TEXT);
  }

  function startScanFromText() {
    if (!manualText.trim()) return;
    performScan(manualText);
  }

  function toggleItem(index: number) {
    setScannedItems((prev) =>
      prev.map((item, i) =>
        i === index ? { ...item, selected: !item.selected } : item
      )
    );
  }

  function updateItem(index: number, updates: Partial<ScannedItem>) {
    setScannedItems((prev) =>
      prev.map((item, i) => (i === index ? { ...item, ...updates } : item))
    );
  }

  function toggleTag(index: number, tag: string) {
    setScannedItems((prev) =>
      prev.map((item, i) =>
        i === index
          ? {
              ...item,
              tags: item.tags.includes(tag)
                ? item.tags.filter((t) => t !== tag)
                : [...item.tags, tag],
            }
          : item
      )
    );
  }

  function saveItems() {
    const selected = scannedItems.filter((item) => item.selected);
    if (selected.length === 0) return;
    addExpenses(
      selected.map((item) => ({
        title: item.title,
        date,
        tags: item.tags,
        amount: item.amount,
        payee: payee || "小票识别",
        description: "从小票照片识别导入",
        paymentMethod,
      }))
    );
    setDone(true);
    setScannedItems([]);
    setPreview(null);
    setManualText("");
  }

  function reset() {
    setPreview(null);
    setScannedItems([]);
    setDone(false);
    setManualText("");
    setShowManual(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  return (
    <div className="space-y-4 max-w-3xl mx-auto">
      <Card className="bg-card/50">
        <CardHeader className="p-4 md:p-6">
          <CardTitle className="flex items-center gap-2 text-base md:text-lg">
            <Camera className="h-5 w-5 text-primary" />
            拍照或上传小票
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4 md:p-6 pt-0 space-y-4">
          {!preview && !showManual && (
            <div className="border-2 border-dashed border-border rounded-xl p-8 text-center space-y-4">
              <div className="mx-auto h-16 w-16 rounded-full bg-muted flex items-center justify-center">
                <Receipt className="h-8 w-8 text-muted-foreground" />
              </div>
              <div>
                <p className="font-medium">拍摄或上传购物小票</p>
                <p className="text-sm text-muted-foreground mt-1">
                  支持 JPG、PNG 格式，AI 将自动识别收款方、日期和商品金额
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                  className="gap-2"
                >
                  <Upload className="h-4 w-4" />
                  从相册选择
                </Button>
                <Button
                  onClick={() => fileInputRef.current?.click()}
                  className="gap-2"
                >
                  <Camera className="h-4 w-4" />
                  拍照识别
                </Button>
                <Button
                  variant="ghost"
                  onClick={() => setShowManual(true)}
                  className="gap-2"
                >
                  <ChevronDown className="h-4 w-4" />
                  手动粘贴文本
                </Button>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                capture="environment"
                className="hidden"
                onChange={handleFileChange}
              />
            </div>
          )}

          {/* Manual text input mode */}
          {showManual && !preview && (
            <div className="space-y-3">
              <Label>粘贴小票文本内容</Label>
              <textarea
                value={manualText}
                onChange={(e) => setManualText(e.target.value)}
                placeholder={`例如：\nWalmart\n2025-11-08\nBananas 1.99\nMilk 4.49\nEggs 3.79\nSubtotal 10.27`}
                className="w-full min-h-[200px] rounded-md border border-input bg-transparent px-3 py-2 text-sm font-mono shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              />
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => setShowManual(false)}
                  className="gap-1"
                >
                  <X className="h-4 w-4" />
                  取消
                </Button>
                <Button
                  onClick={startScanFromText}
                  disabled={!manualText.trim() || scanning}
                  className="gap-2"
                >
                  <Sparkles className="h-4 w-4" />
                  识别文本
                </Button>
              </div>
            </div>
          )}

          {/* Image preview mode */}
          {preview && (
            <div className="space-y-4">
              <div className="relative rounded-xl overflow-hidden border bg-muted">
                <img
                  src={preview}
                  alt="Receipt preview"
                  className="w-full max-h-[400px] object-contain"
                />
                <Button
                  variant="destructive"
                  size="icon"
                  className="absolute top-2 right-2 h-8 w-8 rounded-full"
                  onClick={reset}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
              {!done && scannedItems.length === 0 && !scanning && (
                <div className="space-y-3">
                  <Button
                    onClick={startScanFromImage}
                    className="w-full gap-2"
                  >
                    <Sparkles className="h-4 w-4" />
                    开始识别
                  </Button>
                  <p className="text-xs text-muted-foreground text-center">
                    提示：当前为演示模式，识别结果可手动修正后保存。接入
                    Tesseract.js 或 Google Vision OCR API 可实现真实图片识别。
                  </p>
                </div>
              )}
              {scanning && (
                <div className="text-center py-6 space-y-3">
                  <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                  <p className="text-sm text-muted-foreground">
                    AI 正在识别小票内容...
                  </p>
                </div>
              )}
            </div>
          )}

          {scanning && !preview && (
            <div className="text-center py-6 space-y-3">
              <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
              <p className="text-sm text-muted-foreground">
                AI 正在识别小票内容...
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {scannedItems.length > 0 && !done && (
        <Card className="bg-card/50">
          <CardHeader className="p-4 md:p-6">
            <CardTitle className="text-base md:text-lg flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              识别结果
              <span className="text-sm font-normal text-muted-foreground ml-1">
                （请核对并修正）
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 md:p-6 pt-0 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>收款方</Label>
                <Input
                  value={payee}
                  onChange={(e) => setPayee(e.target.value)}
                  placeholder="例如：Walmart"
                  list="payee-scan-list"
                />
                <datalist id="payee-scan-list">
                  {labels.payees.map((p) => (
                    <option key={p} value={p} />
                  ))}
                </datalist>
              </div>
              <div className="grid gap-2">
                <Label>支付方式</Label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                >
                  {labels.paymentMethods.map((m) => (
                    <option key={m} value={m}>
                      {m}
                    </option>
                  ))}
                </select>
              </div>
              <div className="grid gap-2 sm:col-span-2">
                <Label>日期</Label>
                <Input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                />
              </div>
            </div>

            <div className="rounded-xl border divide-y">
              {scannedItems.map((item, index) => (
                <div
                  key={index}
                  className={cn(
                    "p-4 transition-colors",
                    item.selected ? "bg-muted/30" : "opacity-60"
                  )}
                >
                  <div className="flex items-center gap-3 mb-3">
                    <Button
                      variant={item.selected ? "default" : "outline"}
                      size="icon"
                      className="h-7 w-7 shrink-0"
                      onClick={() => toggleItem(index)}
                    >
                      {item.selected ? (
                        <Check className="h-4 w-4" />
                      ) : (
                        <X className="h-4 w-4" />
                      )}
                    </Button>
                    <Input
                      value={item.title}
                      onChange={(e) =>
                        updateItem(index, { title: e.target.value })
                      }
                      className="flex-1"
                    />
                    <Input
                      type="number"
                      step="0.01"
                      value={item.amount || ""}
                      onChange={(e) =>
                        updateItem(index, {
                          amount: parseFloat(e.target.value) || 0,
                        })
                      }
                      className="w-28 text-right shrink-0"
                    />
                  </div>
                  <div className="flex flex-wrap gap-2 pl-10">
                    {labels.categories.map((tag) => (
                      <button
                        key={tag}
                        type="button"
                        onClick={() => toggleTag(index, tag)}
                        className={cn(
                          "px-2 py-0.5 rounded-full text-xs border transition-colors",
                          item.tags.includes(tag)
                            ? getTagClass(tag)
                            : "bg-muted text-muted-foreground border-transparent"
                        )}
                      >
                        {tag}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <div className="flex items-center justify-between pt-2">
              <span className="text-sm text-muted-foreground">
                已选择 {scannedItems.filter((i) => i.selected).length} 项
              </span>
              <span className="font-semibold">
                合计{" "}
                {formatCurrency(
                  scannedItems
                    .filter((i) => i.selected)
                    .reduce((sum, i) => sum + i.amount, 0)
                )}
              </span>
            </div>
            <Button onClick={saveItems} className="w-full gap-2">
              <Check className="h-4 w-4" />
              确认导入记账表格
            </Button>
          </CardContent>
        </Card>
      )}

      {done && (
        <Card className="bg-emerald-500/10 border-emerald-500/20">
          <CardContent className="p-6 text-center space-y-3">
            <div className="mx-auto h-12 w-12 rounded-full bg-emerald-500/20 flex items-center justify-center">
              <Check className="h-6 w-6 text-emerald-500" />
            </div>
            <p className="font-medium">小票识别完成，已导入记账表格</p>
            <Button variant="outline" onClick={reset}>
              继续识别下一张
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
