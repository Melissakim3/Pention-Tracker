import { RebalanceAlert as Alert } from "@/lib/recommend";

export default function RebalanceAlertBanner({ alerts }: { alerts: Alert[] }) {
  if (alerts.length === 0) {
    return (
      <div className="rounded-lg bg-green-50 text-green-700 text-sm px-4 py-3 border border-green-200">
        모든 자산군이 목표 비중 ±5%p 이내입니다. 리밸런싱이 필요하지 않습니다.
      </div>
    );
  }

  return (
    <div className="rounded-lg bg-amber-50 border border-amber-200 px-4 py-3 space-y-1">
      <p className="text-sm font-medium text-amber-800">리밸런싱 권장 ({alerts.length}건)</p>
      {alerts.map((a) => (
        <p key={a.assetClass} className="text-sm text-amber-700">
          {a.assetClass}: 목표 {(a.targetWeight * 100).toFixed(0)}% 대비 현재{" "}
          {(a.currentWeight * 100).toFixed(1)}% ({a.driftPct > 0 ? "+" : ""}
          {(a.driftPct * 100).toFixed(1)}%p) → {a.action === "SELL" ? "비중 축소 검토" : "추가 매수 검토"}
        </p>
      ))}
    </div>
  );
}
