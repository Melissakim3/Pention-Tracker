import { TAX_CREDIT, ISA_TAX, SEVEN_ASSET_TARGET, REBALANCE_THRESHOLD } from "./constants";

export interface ContributionRecommendation {
  priority: number;
  account: string;
  message: string;
  amount: number;
}

// 올해 누적 납입액을 기준으로 "다음 입금은 어디로" 추천 (세액공제 한도 우선순위)
export function recommendContributionOrder(params: {
  ytdPensionSavings: number;
  ytdIRP: number;
  ytdISA: number;
  isLowIncome: boolean;
}): ContributionRecommendation[] {
  const { ytdPensionSavings, ytdIRP, ytdISA, isLowIncome } = params;
  const recs: ContributionRecommendation[] = [];

  const pensionSavingsRoom = Math.max(0, TAX_CREDIT.PENSION_SAVINGS_CAP - ytdPensionSavings);
  if (pensionSavingsRoom > 0) {
    recs.push({
      priority: 1,
      account: "연금저축",
      amount: pensionSavingsRoom,
      message: `연금저축 세액공제 한도(600만원)까지 ${pensionSavingsRoom.toLocaleString()}원 남았습니다. 중도인출이 IRP보다 자유로우니 먼저 채우세요.`,
    });
  }

  const combinedRoom = Math.max(0, TAX_CREDIT.COMBINED_CAP - ytdPensionSavings - ytdIRP);
  if (pensionSavingsRoom === 0 && combinedRoom > 0) {
    recs.push({
      priority: 2,
      account: "IRP",
      amount: combinedRoom,
      message: `연금저축 한도를 채우셨습니다. IRP에 ${combinedRoom.toLocaleString()}원을 추가하면 합산 900만원 세액공제를 모두 받습니다.`,
    });
  }

  if (combinedRoom === 0) {
    const isaFreeLimit = isLowIncome ? ISA_TAX.FREE_LIMIT_LOW_INCOME : ISA_TAX.FREE_LIMIT_GENERAL;
    const isaRoom = Math.max(0, isaFreeLimit - ytdISA);
    recs.push({
      priority: 3,
      account: "ISA",
      amount: isaRoom,
      message: `세액공제 한도(900만원)를 모두 채우셨습니다. ISA 비과세 한도(${isaFreeLimit.toLocaleString()}원) 활용을 권장합니다.`,
    });
  }

  return recs.sort((a, b) => a.priority - b.priority);
}

export interface RebalanceAlert {
  assetClass: string;
  targetWeight: number;
  currentWeight: number;
  driftPct: number;
  action: "BUY" | "SELL";
}

// 자산군별 현재 평가액 맵을 받아 7분법 대비 드리프트 계산, 5%p 이상이면 알림
export function checkRebalanceNeeded(currentValueByAssetClass: Record<string, number>): RebalanceAlert[] {
  const total = Object.values(currentValueByAssetClass).reduce((a, b) => a + b, 0);
  if (total === 0) return [];

  const alerts: RebalanceAlert[] = [];
  for (const [assetClass, targetWeight] of Object.entries(SEVEN_ASSET_TARGET)) {
    const currentWeight = (currentValueByAssetClass[assetClass] ?? 0) / total;
    const drift = currentWeight - targetWeight;
    if (Math.abs(drift) >= REBALANCE_THRESHOLD) {
      alerts.push({
        assetClass,
        targetWeight,
        currentWeight,
        driftPct: drift,
        action: drift > 0 ? "SELL" : "BUY",
      });
    }
  }
  return alerts;
}
