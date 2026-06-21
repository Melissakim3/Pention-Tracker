import type { TaxConfigYear } from "./types";

export const TAX_CONFIG_2026: TaxConfigYear = {
  year: 2026,
  effectiveFrom: "2026-01-01",
  verifiedAt: "2026-06-21",
  sources: [
    "국세청 종합소득세 세율 안내 (nts.go.kr)",
    "국민연금공단 2026년 보험료율 안내 (nps.or.kr)",
    "찾기쉬운 생활법령정보 - 지역가입자 건강보험료 산정 (easylaw.go.kr)",
    "중소기업중앙회 노란우산공제 소득공제 안내 (kbiz.or.kr)",
  ],

  pensionTaxCredit: {
    pensionSavingsCap: 6_000_000,
    combinedCap: 9_000_000,
    rateLowIncome: 0.165,
    rateHighIncome: 0.132,
  },
  pensionIncomeTaxRate: { "55-69": 0.055, "70-79": 0.044, "80+": 0.033 },
  otherIncomeTaxRate: 0.165,
  annualPensionSeparateTaxLimit: 15_000_000,

  isaTax: {
    freeLimitGeneral: 2_000_000,
    freeLimitLowIncome: 4_000_000,
    separateRate: 0.099,
    conversionCreditRate: 0.1,
    conversionCreditCap: 3_000_000,
  },

  generalAccountDividendTaxRate: 0.154,
  irpRiskAssetCap: 0.7,
  rebalanceThreshold: 0.05,

  // 2023년 개정 8단계 구간 — 2026년 귀속분까지 구간 금액 동일, 세율 변경 여부만 매년 확인
  incomeTaxBrackets: [
    { max: 14_000_000, rate: 0.06, deduction: 0 },
    { max: 50_000_000, rate: 0.15, deduction: 1_260_000 },
    { max: 88_000_000, rate: 0.24, deduction: 5_760_000 },
    { max: 150_000_000, rate: 0.35, deduction: 15_440_000 },
    { max: 300_000_000, rate: 0.38, deduction: 19_940_000 },
    { max: 500_000_000, rate: 0.4, deduction: 25_940_000 },
    { max: 1_000_000_000, rate: 0.42, deduction: 35_940_000 },
    { max: Infinity, rate: 0.45, deduction: 65_940_000 },
  ],
  localIncomeTaxRate: 0.1,

  // 2026년부터 매년 0.5%p씩 인상되어 2033년 13% 도달 — 매년 1월 반드시 재확인
  nationalPension: { rate: 0.095, floor: 38_000, ceiling: 605_150 },

  // 2026년 요율 7.19% — 재산보험료 부분은 별도 모델링 안 함(README 참고)
  healthInsurance: { incomeRate: 0.0719, floor: 20_160, ceiling: 4_591_740 },

  // 사업소득금액 구간별 한도 — 최근 상향 추세이니 가입 시점에 노란우산 홈페이지로 재확인 권장
  yellowUmbrellaBrackets: [
    { max: 40_000_000, cap: 5_000_000 },
    { max: 100_000_000, cap: 3_000_000 },
    { max: Infinity, cap: 2_000_000 },
  ],

  financialIncomeThreshold: 20_000_000,
};
