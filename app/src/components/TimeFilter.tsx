import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useExpenses } from "@/hooks/useExpenses";
import {
  getAvailableMonths,
  getAvailableYears,
  getCurrentMonthKey,
  getCurrentYear,
} from "@/lib/expenseHelpers";

export type TimeFilterValue = {
  mode: "all" | "month" | "year";
  month: string | null;
  year: string | null;
};

interface TimeFilterProps {
  value: TimeFilterValue;
  onChange: (value: TimeFilterValue) => void;
}

export function TimeFilter({ value, onChange }: TimeFilterProps) {
  const { expenses } = useExpenses();
  const months = getAvailableMonths(expenses);
  const years = getAvailableYears(expenses);

  const currentMonth = getCurrentMonthKey();
  const currentYear = getCurrentYear();

  return (
    <div className="flex items-center gap-2 flex-wrap">
      <Select
        value={value.mode}
        onValueChange={(v) => {
          if (v === "all") {
            onChange({ mode: "all", month: null, year: null });
          } else if (v === "month") {
            onChange({
              mode: "month",
              month: value.month || currentMonth,
              year: null,
            });
          } else if (v === "year") {
            onChange({
              mode: "year",
              month: null,
              year: value.year || currentYear,
            });
          }
        }}
      >
        <SelectTrigger className="w-[120px] h-9">
          <SelectValue placeholder="时间维度" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">全部时间</SelectItem>
          <SelectItem value="month">按月份</SelectItem>
          <SelectItem value="year">按年度</SelectItem>
        </SelectContent>
      </Select>

      {value.mode === "month" && (
        <Select
          value={value.month || currentMonth}
          onValueChange={(v) =>
            onChange({ mode: "month", month: v, year: null })
          }
        >
          <SelectTrigger className="w-[150px] h-9">
            <SelectValue placeholder="选择月份" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectLabel>月份</SelectLabel>
              {months.length > 0 ? (
                months.map((m) => (
                  <SelectItem key={m.value} value={m.value}>
                    {m.label}
                  </SelectItem>
                ))
              ) : (
                <SelectItem value={currentMonth}>
                  {currentMonth}
                </SelectItem>
              )}
            </SelectGroup>
          </SelectContent>
        </Select>
      )}

      {value.mode === "year" && (
        <Select
          value={value.year || currentYear}
          onValueChange={(v) =>
            onChange({ mode: "year", month: null, year: v })
          }
        >
          <SelectTrigger className="w-[120px] h-9">
            <SelectValue placeholder="选择年份" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectLabel>年份</SelectLabel>
              {years.length > 0 ? (
                years.map((y) => (
                  <SelectItem key={y.value} value={y.value}>
                    {y.label}
                  </SelectItem>
                ))
              ) : (
                <SelectItem value={currentYear}>
                  {currentYear}年
                </SelectItem>
              )}
            </SelectGroup>
          </SelectContent>
        </Select>
      )}
    </div>
  );
}
