import { getTaxConfig } from "./taxConfig";

// 오늘 날짜 기준으로 맞는 연도 설정을 한 번 로드. 연도가 바뀌면(매년 1월) lib/taxConfig에
// 새 파일만 추가하면 여기는 코드 변경 없이 자동으로 새 숫자를 쓰게 됨.
const { config } = getTaxConfig();

// 7분법 목표 비중 — 이건 세법이 아니라 원장님의 투자 철학이라 연도별 버전 대상이 아님
export const SEVEN_ASSET_TARGET: Record<string, number> = {
  국내주식: 0.3,
  해외주식: 0.25,
  채권: 0.2,
  배당주: 0.1,
  리츠: 0.05,
  금: 0.05,
  달러: 0.05,
};

export const REBALANCE_THRESHOLD = config.rebalanceThreshold;

export const ACCOUNT_TYPES = {
  PENSION_SAVINGS: "연금저축",
  IRP: "IRP",
  ISA: "ISA",
  GENERAL: "일반계좌",
} as const;

export type AccountType = keyof typeof ACCOUNT_TYPES;

export const TAX_CREDIT = {
  PENSION_SAVINGS_CAP: config.pensionTaxCredit.pensionSavingsCap,
  COMBINED_CAP: config.pensionTaxCredit.combinedCap,
  RATE_LOW_INCOME: config.pensionTaxCredit.rateLowIncome,
  RATE_HIGH_INCOME: config.pensionTaxCredit.rateHighIncome,
};
export const PENSION_INCOME_TAX_RATE = config.pensionIncomeTaxRate;
export const OTHER_INCOME_TAX_RATE = config.otherIncomeTaxRate;
export const ANNUAL_PENSION_SEPARATE_TAX_LIMIT = config.annualPensionSeparateTaxLimit;
export const ISA_TAX = {
  FREE_LIMIT_GENERAL: config.isaTax.freeLimitGeneral,
  FREE_LIMIT_LOW_INCOME: config.isaTax.freeLimitLowIncome,
  SEPARATE_RATE: config.isaTax.separateRate,
  CONVERSION_CREDIT_RATE: config.isaTax.conversionCreditRate,
  CONVERSION_CREDIT_CAP: config.isaTax.conversionCreditCap,
};
export const GENERAL_ACCOUNT_DIVIDEND_TAX_RATE = config.generalAccountDividendTaxRate;
export const IRP_RISK_ASSET_CAP = config.irpRiskAssetCap;

// 연금계좌(연금저축·IRP) 매수 자체가 금지되는 상품 키워드 — 법 개정 빈도가 낮은 구조적 규제라 별도 보관
export const PENSION_ACCOUNT_FORBIDDEN_KEYWORDS = ["레버리지", "인버스", "2X", "3X", "곱버스"];
