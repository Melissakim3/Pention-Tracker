import {
  PENSION_INCOME_TAX_RATE,
  OTHER_INCOME_TAX_RATE,
  ISA_TAX,
  GENERAL_ACCOUNT_DIVIDEND_TAX_RATE,
} from "./constants";

function pensionRateByAge(age: number): number {
  if (age >= 80) return PENSION_INCOME_TAX_RATE["80+"];
  if (age >= 70) return PENSION_INCOME_TAX_RATE["70-79"];
  return PENSION_INCOME_TAX_RATE["55-69"]; // 55세 미만 인출은 별도 처리(중도해지) 필요
}

// 연금저축/IRP의 "한도 내 정상 연금 수령" 세금
export function calcPensionWithdrawalTax(amount: number, age: number): number {
  return Math.round(amount * pensionRateByAge(age));
}

// 연금수령한도 (소득세법 시행령 기준, 연금수령연차 1~10년차에만 적용 / 11년차부터 한도 없음)
export function calcPensionWithdrawalLimit(evaluationAmount: number, withdrawalYear: number): number {
  if (withdrawalYear >= 11) return evaluationAmount;
  return Math.round((evaluationAmount / (11 - withdrawalYear)) * 1.2);
}

// 한도 초과분 또는 중도해지 시 기타소득세 (세액공제 받은 원금 + 운용수익에만 적용)
export function calcOtherIncomeTax(amount: number): number {
  return Math.round(amount * OTHER_INCOME_TAX_RATE);
}

// ISA 만기 시 분리과세 — 계좌 내 손익통산 후 순이익 기준
export function calcISATax(netProfit: number, isLowIncome: boolean): number {
  const freeLimit = isLowIncome ? ISA_TAX.FREE_LIMIT_LOW_INCOME : ISA_TAX.FREE_LIMIT_GENERAL;
  const taxable = Math.max(0, netProfit - freeLimit);
  return Math.round(taxable * ISA_TAX.SEPARATE_RATE);
}

// 일반계좌: 국내상장 국내주식형 ETF는 매매차익 비과세, 분배금만 과세.
// 해외/채권/파생형(보유기간과세 대상)은 매매차익+분배금 모두 과세.
export function calcGeneralAccountTax(params: {
  isDomesticEquityType: boolean; // 국내상장 "국내주식형" ETF 여부
  capitalGain: number;
  dividendIncome: number;
}): number {
  const { isDomesticEquityType, capitalGain, dividendIncome } = params;
  const taxableCapitalGain = isDomesticEquityType ? 0 : Math.max(0, capitalGain);
  return Math.round((taxableCapitalGain + Math.max(0, dividendIncome)) * GENERAL_ACCOUNT_DIVIDEND_TAX_RATE);
}
