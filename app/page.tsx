import { prisma } from "@/lib/db";
import { SEVEN_ASSET_TARGET, ACCOUNT_TYPES } from "@/lib/constants";
import { checkRebalanceNeeded, recommendContributionOrder } from "@/lib/recommend";
import AllocationChart from "./components/AllocationChart";
import RebalanceAlertBanner from "./components/RebalanceAlert";
import ProjectionPanel from "./components/ProjectionPanel";
import SelfEmploymentTaxPanel from "./components/SelfEmploymentTaxPanel";
import StaleConfigBanner from "./components/StaleConfigBanner";

export const dynamic = "force-dynamic"; // 항상 최신 DB 상태로 렌더링

async function getDashboardData() {
  const accounts = await prisma.account.findMany({
    include: { holdings: true, deposits: true },
  });

  const accountSummaries = accounts.map((acc) => {
    const principal = acc.deposits.reduce((sum, d) => sum + d.amount, 0);
    // 실시간 시세 대신 보유종목의 평단가 기준 평가액 (실시간 갱신은 /api/price 또는 cron 스냅샷으로)
    const balance = acc.holdings.reduce((sum, h) => sum + h.quantity * h.avgCost, 0);
    const profit = balance - principal;
    const returnRate = principal === 0 ? 0 : profit / principal;
    return {
      id: acc.id,
      name: acc.name,
      type: acc.type,
      principal,
      balance,
      profit,
      returnRate,
    };
  });

  const valueByAssetClass: Record<string, number> = {};
  for (const acc of accounts) {
    for (const h of acc.holdings) {
      valueByAssetClass[h.assetClass] = (valueByAssetClass[h.assetClass] ?? 0) + h.quantity * h.avgCost;
    }
  }
  const totalValue = Object.values(valueByAssetClass).reduce((a, b) => a + b, 0);

  const allocationData = Object.entries(SEVEN_ASSET_TARGET).map(([name, target]) => ({
    name,
    target,
    current: totalValue === 0 ? 0 : (valueByAssetClass[name] ?? 0) / totalValue,
  }));

  const rebalanceAlerts = checkRebalanceNeeded(valueByAssetClass);

  const ytdByType = (type: keyof typeof ACCOUNT_TYPES) =>
    accounts
      .filter((a) => a.type === type)
      .flatMap((a) => a.deposits)
      .filter((d) => d.date.getFullYear() === new Date().getFullYear())
      .reduce((sum, d) => sum + d.amount, 0);

  const recommendations = recommendContributionOrder({
    ytdPensionSavings: ytdByType("PENSION_SAVINGS"),
    ytdIRP: ytdByType("IRP"),
    ytdISA: ytdByType("ISA"),
    isLowIncome: process.env.IS_LOW_INCOME_BRACKET === "true",
  });

  const totalPrincipal = accountSummaries.reduce((s, a) => s + a.principal, 0);
  const totalBalance = accountSummaries.reduce((s, a) => s + a.balance, 0);

  return { accountSummaries, allocationData, rebalanceAlerts, recommendations, totalPrincipal, totalBalance };
}

export default async function DashboardPage() {
  const { accountSummaries, allocationData, rebalanceAlerts, recommendations, totalPrincipal, totalBalance } =
    await getDashboardData();

  return (
    <main className="max-w-5xl mx-auto px-4 py-8 space-y-8">
      <header className="flex items-start justify-between">
        <div>
          <h1 className="text-xl font-medium">연금 포트폴리오 대시보드</h1>
          <p className="text-sm text-gray-500">
            누적원금 {totalPrincipal.toLocaleString()}원 · 평가액 {totalBalance.toLocaleString()}원 · 수익금{" "}
            {(totalBalance - totalPrincipal).toLocaleString()}원
          </p>
        </div>
        <a href="/manage" className="text-sm text-brand-600 hover:underline whitespace-nowrap">
          데이터 입력 →
        </a>
      </header>

      <StaleConfigBanner />

      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {accountSummaries.length === 0 && (
          <p className="text-sm text-gray-400 col-span-full">
            아직 등록된 계좌가 없습니다. /api/deposits, /api/holdings로 데이터를 먼저 입력하세요.
          </p>
        )}
        {accountSummaries.map((acc) => (
          <div key={acc.id} className="rounded-xl bg-white border border-gray-200 px-4 py-3">
            <p className="text-xs text-gray-500">{ACCOUNT_TYPES[acc.type as keyof typeof ACCOUNT_TYPES] ?? acc.type}</p>
            <p className="text-sm font-medium">{acc.name}</p>
            <p className="text-lg font-semibold mt-1">{acc.balance.toLocaleString()}원</p>
            <p className={`text-xs ${acc.profit >= 0 ? "text-red-600" : "text-blue-600"}`}>
              {acc.profit >= 0 ? "+" : ""}
              {acc.profit.toLocaleString()}원 ({(acc.returnRate * 100).toFixed(1)}%)
            </p>
          </div>
        ))}
      </section>

      <section className="rounded-xl bg-white border border-gray-200 p-5">
        <h2 className="text-sm font-medium mb-3">7분법 목표 비중 대비 현황</h2>
        <AllocationChart data={allocationData} />
      </section>

      <RebalanceAlertBanner alerts={rebalanceAlerts} />

      {recommendations.length > 0 && (
        <section className="rounded-xl bg-white border border-gray-200 p-5 space-y-2">
          <h2 className="text-sm font-medium mb-1">다음 납입 추천</h2>
          {recommendations.map((r) => (
            <p key={r.account} className="text-sm text-gray-700">
              {r.priority}. <span className="font-medium">{r.account}</span> — {r.message}
            </p>
          ))}
        </section>
      )}

      <section className="rounded-xl bg-white border border-gray-200 p-5">
        <h2 className="text-sm font-medium mb-3">은퇴 후 예상 수령액 시뮬레이터</h2>
        <ProjectionPanel currentValue={totalBalance} />
      </section>

      <section className="rounded-xl bg-white border border-gray-200 p-5">
        <h2 className="text-sm font-medium mb-1">사업자로서 실제 내는 돈 (종합소득세·건보료·국민연금)</h2>
        <p className="text-xs text-gray-500 mb-3">
          위 섹션들과는 별개 영역입니다 — 투자계좌 세금이 아니라 학원 운영자(지역가입자)로서의 세금/보험료입니다.
        </p>
        <SelfEmploymentTaxPanel />
      </section>
    </main>
  );
}
