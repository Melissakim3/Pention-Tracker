// 학원 운영자(개인사업자, 지역가입자) 기준 - 투자계좌 세금(lib/tax.ts)과는 완전히 별개 영역.
// 모든 세율·한도는 lib/taxConfig에서 가져옴 — 연도가 바뀌면 그쪽에 새 파일만 추가하면 됨.
//
// 정확도에 대한 솔직한 한계:
// - 건강보험료의 "재산보험료" 부분(소유 부동산·전월세 보증금 등 기준)은 모델링하지 않음.
// - 종합소득세 과세표준은 "매출 - 필요경비 - 소득공제"로 계산되는데, 이 모듈은 사업소득금액을
//   입력받아 단순화된 공제만 적용함. 실제 신고는 세무사 또는 홈택스 모의계산으로 검증할 것.

import { getTaxConfig } from "./taxConfig";

export function calcComprehensiveIncomeTax(taxBase: number, asOf: Date = new Date()): number {
  if (taxBase <= 0) return 0;
  const { config } = getTaxConfig(asOf);
  const bracket = config.incomeTaxBrackets.find((b) => taxBase <= b.max)!;
  return Math.round(taxBase * bracket.rate - bracket.deduction);
}

export function calcLocalIncomeTax(incomeTax: number, asOf: Date = new Date()): number {
  const { config } = getTaxConfig(asOf);
  return Math.round(incomeTax * config.localIncomeTaxRate);
}

// 국민연금 지역가입자 — 본인 전액 부담
export function calcNationalPensionRegional(monthlyIncome: number, asOf: Date = new Date()): number {
  const { config } = getTaxConfig(asOf);
  const { rate, floor, ceiling } = config.nationalPension;
  return Math.round(Math.min(ceiling, Math.max(floor, monthlyIncome * rate)));
}

// 건강보험료 "소득분"만 계산 (재산분 제외 — 위 주석 참고)
export function calcHealthInsuranceIncomePortionEstimate(monthlyIncome: number, asOf: Date = new Date()): number {
  const { config } = getTaxConfig(asOf);
  const { incomeRate, floor, ceiling } = config.healthInsurance;
  return Math.round(Math.min(ceiling, Math.max(floor, monthlyIncome * incomeRate)));
}

export function yellowUmbrellaDeductionCap(businessIncome: number, asOf: Date = new Date()): number {
  const { config } = getTaxConfig(asOf);
  const bracket = config.yellowUmbrellaBrackets.find((b) => businessIncome <= b.max)!;
  return bracket.cap;
}

export interface SelfEmploymentTaxSummary {
  businessIncome: number;
  financialIncomeOverThreshold: number;
  yellowUmbrellaContribution: number;
  taxBase: number;
  incomeTax: number;
  localIncomeTax: number;
  nationalPensionAnnual: number;
  healthInsuranceAnnual: number;
  totalAnnualBurden: number;
}

export function summarizeSelfEmploymentTax(
  params: {
    businessIncome: number;
    financialIncome: number;
    yellowUmbrellaContribution: number;
  },
  asOf: Date = new Date()
): SelfEmploymentTaxSummary {
  const { config } = getTaxConfig(asOf);
  const financialIncomeOverThreshold = Math.max(0, params.financialIncome - config.financialIncomeThreshold);

  const deduction = Math.min(
    params.yellowUmbrellaContribution,
    yellowUmbrellaDeductionCap(params.businessIncome, asOf)
  );

  const taxBase = Math.max(0, params.businessIncome + financialIncomeOverThreshold - deduction);
  const incomeTax = calcComprehensiveIncomeTax(taxBase, asOf);
  const localIncomeTax = calcLocalIncomeTax(incomeTax, asOf);

  const monthlyIncome = params.businessIncome / 12;
  const nationalPensionAnnual = calcNationalPensionRegional(monthlyIncome, asOf) * 12;
  const healthInsuranceAnnual = calcHealthInsuranceIncomePortionEstimate(monthlyIncome, asOf) * 12;

  return {
    businessIncome: params.businessIncome,
    financialIncomeOverThreshold,
    yellowUmbrellaContribution: params.yellowUmbrellaContribution,
    taxBase,
    incomeTax,
    localIncomeTax,
    nationalPensionAnnual,
    healthInsuranceAnnual,
    totalAnnualBurden: incomeTax + localIncomeTax + nationalPensionAnnual + healthInsuranceAnnual,
  };
}
