import { ACCOUNT_TYPES, PENSION_ACCOUNT_FORBIDDEN_KEYWORDS, IRP_RISK_ASSET_CAP } from "./constants";

export interface HoldingInput {
  ticker: string;
  name: string;
  riskType: "RISK" | "SAFE";
  marketValue: number; // 매수 후 평가될 금액
}

export interface ValidationResult {
  valid: boolean;
  reason?: string;
}

// 종목 추가/매수 시점에 호출. accountType은 ACCOUNT_TYPES의 키("PENSION_SAVINGS" | "IRP" | "ISA" | "GENERAL")
export function validateHoldingForAccount(
  accountType: keyof typeof ACCOUNT_TYPES,
  candidate: HoldingInput,
  existingHoldings: { riskType: "RISK" | "SAFE"; marketValue: number }[]
): ValidationResult {
  // 연금저축·IRP(연금계좌) 공통 규제: 레버리지/인버스/파생형 ETF 매수 금지
  if (accountType === "PENSION_SAVINGS" || accountType === "IRP") {
    const isForbidden = PENSION_ACCOUNT_FORBIDDEN_KEYWORDS.some((kw) => candidate.name.includes(kw));
    if (isForbidden) {
      return {
        valid: false,
        reason: `연금계좌(${ACCOUNT_TYPES[accountType]})는 레버리지·인버스·파생형 ETF를 매수할 수 없습니다.`,
      };
    }
  }

  // IRP 전용: 위험자산(주식형 등) 비중 최대 70%, 최소 30%는 안전자산이어야 함
  if (accountType === "IRP" && candidate.riskType === "RISK") {
    const existingTotal = existingHoldings.reduce((sum, h) => sum + h.marketValue, 0);
    const existingRisk = existingHoldings
      .filter((h) => h.riskType === "RISK")
      .reduce((sum, h) => sum + h.marketValue, 0);

    const newTotal = existingTotal + candidate.marketValue;
    const newRisk = existingRisk + candidate.marketValue;
    const riskRatio = newTotal === 0 ? 0 : newRisk / newTotal;

    if (riskRatio > IRP_RISK_ASSET_CAP) {
      return {
        valid: false,
        reason: `IRP 위험자산 비중이 ${(riskRatio * 100).toFixed(1)}%로 한도(70%)를 초과합니다. 안전자산(원리금보장·채권형)을 함께 담아야 합니다.`,
      };
    }
  }

  // ISA(중개형): 자산군 제약은 없으나 해외주식 "직접" 매수는 불가 (국내상장 해외지수 ETF는 허용)
  if (accountType === "ISA" && candidate.ticker.length !== 6) {
    // 국내 종목코드는 6자리 숫자. 해외 티커(예: AAPL)가 들어오면 차단.
    return {
      valid: false,
      reason: "ISA(중개형)는 해외주식 직접 매수가 불가합니다. 국내 상장 ETF로 대체하세요.",
    };
  }

  return { valid: true };
}
