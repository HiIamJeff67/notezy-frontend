import { UserPlan } from "@shared/api/interfaces/enums";
import { type PlanLimitation, PlanLimitations } from "@shared/constants";
import {
  CheckIcon,
  Clock3Icon,
  DatabaseIcon,
  FactoryIcon,
  GaugeIcon,
  LeafIcon,
  ShieldCheckIcon,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { useUser } from "@/hooks";

type BillingCycle = "MONTH" | "YEAR";

type PlanOption = {
  plan: UserPlan;
  label: string;
  billingName: {
    month: string;
    year?: string;
  };
  tone: string;
  note: string;
  bestFor: string;
  monthlyPrice: number;
  yearlyPrice?: number;
  limitations: PlanLimitation;
  highlights: string[];
};

const planOptions: PlanOption[] = [
  {
    plan: UserPlan.Free,
    label: "Free",
    billingName: {
      month: "Notezy Monthly Free Plan",
    },
    tone: "border-border bg-background/35",
    note: "基礎採集",
    bestFor: "個人試用與小型資料庫",
    monthlyPrice: 0,
    limitations: PlanLimitations[UserPlan.Free],
    highlights: ["10 個 Root Shelves", "1,000 Blocks", "5 MB Material"],
  },
  {
    plan: UserPlan.Pro,
    label: "Pro",
    billingName: {
      month: "Notezy Monthly Pro Plan",
      year: "Notezy Yearly Pro Plan",
    },
    tone: "border-emerald-900/55 bg-emerald-950/10",
    note: "穩定擴建",
    bestFor: "日常筆記、工作流與中量資料",
    monthlyPrice: 4.99,
    yearlyPrice: 49.99,
    limitations: PlanLimitations[UserPlan.Pro],
    highlights: ["50 個 Root Shelves", "5,000 Blocks", "20 MB Material"],
  },
  {
    plan: UserPlan.Premium,
    label: "Premium",
    billingName: {
      month: "Notezy Monthly Premium Plan",
      year: "Notezy Yearly Premium Plan",
    },
    tone: "border-lime-900/55 bg-lime-950/10",
    note: "重載工作台",
    bestFor: "多專案知識庫與進階任務管理",
    monthlyPrice: 9.99,
    yearlyPrice: 99.99,
    limitations: PlanLimitations[UserPlan.Premium],
    highlights: ["150 個 Root Shelves", "15,000 Blocks", "50 MB Material"],
  },
  {
    plan: UserPlan.Ultimate,
    label: "Ultimate",
    billingName: {
      month: "Notezy Monthly Ultimate Plan",
      year: "Notezy Yearly Ultimate Plan",
    },
    tone: "border-amber-900/55 bg-amber-950/10",
    note: "深層礦脈",
    bestFor: "大型研究、密集同步與長期資料沉積",
    monthlyPrice: 19.99,
    yearlyPrice: 199.99,
    limitations: PlanLimitations[UserPlan.Ultimate],
    highlights: ["300 個 Root Shelves", "30,000 Blocks", "200 MB Material"],
  },
  {
    plan: UserPlan.Enterprise,
    label: "Enterprise",
    billingName: {
      month: "Notezy Monthly Enterprise Plan",
      year: "Notezy Yearly Enterprise Plan",
    },
    tone: "border-stone-500/45 bg-stone-900/20",
    note: "企業級鑄造",
    bestFor: "團隊型長期資料庫與高容量操作",
    monthlyPrice: 49.99,
    yearlyPrice: 499.99,
    limitations: PlanLimitations[UserPlan.Enterprise],
    highlights: ["1,000 個 Root Shelves", "100,000 Blocks", "500 MB Material"],
  },
];

const limitRows: {
  label: string;
  key: keyof PlanLimitation;
  unit?: "bytes";
}[] = [
  { label: "Root Shelves", key: "maxRootShelfCount" },
  { label: "Blocks", key: "maxBlockCount" },
  { label: "Materials", key: "maxMaterialCount" },
  { label: "Material Size", key: "maxMaterialSize", unit: "bytes" },
  { label: "Workflows", key: "maxWorkflowCount" },
  { label: "Stations", key: "maxStationCount" },
  { label: "Routine Task CostUnits", key: "maxRoutineTaskCostUnitCount" },
];

const formatCurrency = (price: number) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: price === 0 ? 0 : 2,
  }).format(price);

const formatBytes = (bytes: number) => {
  if (bytes >= 1024 * 1024 * 1024) {
    return `${Math.round(bytes / 1024 / 1024 / 1024)} GB`;
  }
  return `${Math.round(bytes / 1024 / 1024)} MB`;
};

const formatLimit = (value: number, unit?: "bytes") =>
  unit === "bytes" ? formatBytes(value) : value.toLocaleString("en-US");

const getPlanRank = (plan: UserPlan) =>
  planOptions.findIndex(option => option.plan === plan);

const UpgradeTab = () => {
  const userManager = useUser();
  const currentPlan = userManager.userData?.plan ?? UserPlan.Free;
  const [selectedPlan, setSelectedPlan] = useState<UserPlan>(currentPlan);
  const [billingCycle, setBillingCycle] = useState<BillingCycle>("MONTH");

  useEffect(() => {
    setSelectedPlan(currentPlan);
  }, [currentPlan]);

  const selectedOption = useMemo(
    () =>
      planOptions.find(option => option.plan === selectedPlan) ??
      planOptions[0],
    [selectedPlan]
  );

  const price = useMemo(() => {
    if (billingCycle === "YEAR" && selectedOption.yearlyPrice !== undefined) {
      return selectedOption.yearlyPrice;
    }
    return selectedOption.monthlyPrice;
  }, [billingCycle, selectedOption]);

  const currentOption = useMemo(
    () =>
      planOptions.find(option => option.plan === currentPlan) ?? planOptions[0],
    [currentPlan]
  );

  const isCurrentPlan = selectedPlan === currentPlan;
  const isDowngrade = getPlanRank(selectedPlan) < getPlanRank(currentPlan);
  const selectedBillingName =
    billingCycle === "YEAR" && selectedOption.billingName.year
      ? selectedOption.billingName.year
      : selectedOption.billingName.month;

  return (
    <div className="h-full overflow-y-auto bg-muted px-8 pt-10 pb-8 [scrollbar-color:var(--muted-foreground)_var(--secondary)]!">
      <div className="flex flex-col gap-5">
        <section className="grid gap-4 lg:grid-cols-[1.15fr_0.85fr]">
          <div className="relative overflow-hidden rounded-md border border-border bg-background/45 p-5 shadow-inner">
            <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-emerald-700/60 to-transparent" />
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 text-xs font-medium uppercase text-muted-foreground">
                  <FactoryIcon className="size-4 text-emerald-700" />
                  Account Plan
                </div>
                <h3 className="mt-2 text-2xl font-semibold text-foreground">
                  {currentOption.label}
                </h3>
                <p className="mt-1 max-w-md text-sm text-muted-foreground">
                  {currentOption.bestFor}
                </p>
              </div>
              <div className="rounded-sm border border-emerald-900/50 bg-emerald-950/20 px-3 py-2 text-right">
                <div className="text-[11px] uppercase text-muted-foreground">
                  Status
                </div>
                <div className="mt-1 text-sm font-semibold text-emerald-500">
                  ACTIVE
                </div>
              </div>
            </div>

            <div className="mt-5 grid grid-cols-3 gap-2">
              {[
                {
                  icon: DatabaseIcon,
                  label: "Blocks",
                  value: currentOption.limitations.maxBlockCount,
                },
                {
                  icon: GaugeIcon,
                  label: "Workflows",
                  value: currentOption.limitations.maxWorkflowCount,
                },
                {
                  icon: ShieldCheckIcon,
                  label: "Task CostUnits",
                  value: currentOption.limitations.maxRoutineTaskCostUnitCount,
                },
              ].map(item => {
                const Icon = item.icon;
                return (
                  <div
                    key={item.label}
                    className="rounded-sm border border-border bg-muted/40 p-3"
                  >
                    <Icon className="size-4 text-muted-foreground" />
                    <div className="mt-2 text-lg font-semibold">
                      {item.value.toLocaleString("en-US")}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {item.label}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="rounded-md border border-border bg-background/45 p-5">
            <div className="flex items-center justify-between gap-3">
              <div>
                <div className="text-sm font-semibold">付款週期</div>
                <div className="mt-1 text-xs text-muted-foreground">
                  年付方案已套用年度價格
                </div>
              </div>
              <div className="flex rounded-md border border-border bg-muted p-1">
                {[
                  { value: "MONTH" as const, label: "月付" },
                  { value: "YEAR" as const, label: "年付" },
                ].map(cycle => (
                  <button
                    key={cycle.value}
                    type="button"
                    onClick={() => setBillingCycle(cycle.value)}
                    className={`h-8 rounded-sm px-3 text-sm transition ${
                      billingCycle === cycle.value
                        ? "bg-primary text-primary-foreground"
                        : "text-muted-foreground hover:bg-background hover:text-foreground"
                    }`}
                  >
                    {cycle.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-5 rounded-sm border border-border bg-muted/35 p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="text-xs text-muted-foreground">
                    Selected Billing Plan
                  </div>
                  <div className="mt-1 text-sm font-semibold">
                    {selectedBillingName}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-semibold">
                    {formatCurrency(price)}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    / {billingCycle === "YEAR" ? "year" : "month"}
                  </div>
                </div>
              </div>
              <Button className="mt-4 w-full" disabled>
                {isCurrentPlan
                  ? "目前方案"
                  : isDowngrade
                    ? "降級流程部署後開放"
                    : "付款流程部署後開放"}
              </Button>
            </div>
          </div>
        </section>

        <section className="grid gap-3 xl:grid-cols-5">
          {planOptions.map(option => {
            const selected = selectedPlan === option.plan;
            const active = currentPlan === option.plan;
            const optionPrice =
              billingCycle === "YEAR" && option.yearlyPrice !== undefined
                ? option.yearlyPrice
                : option.monthlyPrice;

            return (
              <button
                key={option.plan}
                type="button"
                onClick={() => setSelectedPlan(option.plan)}
                className={`flex min-h-[210px] flex-col justify-between rounded-md border p-4 text-left transition hover:border-primary/70 hover:bg-background/70 ${
                  option.tone
                } ${
                  selected
                    ? "ring-2 ring-primary/70"
                    : "ring-1 ring-transparent"
                }`}
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="text-lg font-semibold">
                        {option.label}
                      </div>
                      <div className="mt-1 text-xs text-muted-foreground">
                        {option.note}
                      </div>
                    </div>
                    {active && (
                      <span className="rounded-sm border border-emerald-900/50 bg-emerald-950/30 px-2 py-1 text-[10px] font-semibold text-emerald-500">
                        ACTIVE
                      </span>
                    )}
                  </div>
                  <div className="mt-4 flex items-end gap-1">
                    <span className="text-2xl font-semibold">
                      {formatCurrency(optionPrice)}
                    </span>
                    <span className="pb-1 text-xs text-muted-foreground">
                      / {billingCycle === "YEAR" ? "yr" : "mo"}
                    </span>
                  </div>
                  <p className="mt-2 min-h-10 text-xs text-muted-foreground">
                    {option.bestFor}
                  </p>
                </div>

                <div className="mt-4 space-y-2">
                  {option.highlights.map(highlight => (
                    <div
                      key={highlight}
                      className="flex items-center gap-2 text-xs text-muted-foreground"
                    >
                      <CheckIcon className="size-3.5 text-emerald-700" />
                      <span>{highlight}</span>
                    </div>
                  ))}
                </div>
              </button>
            );
          })}
        </section>

        <section className="grid gap-4 lg:grid-cols-[1fr_300px]">
          <div className="rounded-md border border-border bg-background/45">
            <div className="flex items-center justify-between border-b border-border px-4 py-3">
              <div>
                <div className="text-sm font-semibold">限額比較</div>
                <div className="mt-1 text-xs text-muted-foreground">
                  目前方案 / 選取方案
                </div>
              </div>
              <LeafIcon className="size-4 text-emerald-700" />
            </div>
            <div className="divide-y divide-border">
              {limitRows.map(row => (
                <div
                  key={row.key}
                  className="grid grid-cols-[1fr_auto_auto] items-center gap-4 px-4 py-3 text-sm"
                >
                  <span className="text-muted-foreground">{row.label}</span>
                  <span className="font-medium">
                    {formatLimit(currentOption.limitations[row.key], row.unit)}
                  </span>
                  <span className="min-w-20 rounded-sm border border-border bg-muted/40 px-2 py-1 text-right font-semibold">
                    {formatLimit(selectedOption.limitations[row.key], row.unit)}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-md border border-border bg-background/45 p-4">
            <div className="flex items-center gap-2 text-sm font-semibold">
              <Clock3Icon className="size-4 text-muted-foreground" />
              付款狀態
            </div>
            <div className="mt-4 space-y-3">
              {[
                ["方案狀態", "ACTIVE"],
                ["訂閱紀錄", "APPROVAL_PENDING"],
                ["付款幣別", "USD"],
                ["付款通道", "待部署"],
              ].map(([label, value]) => (
                <div
                  key={label}
                  className="flex items-center justify-between gap-3 border-b border-border/60 pb-3 last:border-b-0 last:pb-0"
                >
                  <span className="text-xs text-muted-foreground">{label}</span>
                  <span className="text-right text-xs font-semibold">
                    {value}
                  </span>
                </div>
              ))}
            </div>
            <div className="mt-5 rounded-sm border border-amber-900/45 bg-amber-950/10 p-3 text-xs leading-5 text-muted-foreground">
              目前僅完成介面與後端資料模型對齊；付款、訂閱建立與方案變更 API
              會在外部付款流程部署後接上。
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default UpgradeTab;
