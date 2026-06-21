export interface IncomeTaxBracket {
  max: number;
  rate: number;
  deduction: number;
}

export interface YellowUmbrellaBracket {
  max: number;
  cap: number;
}

// 매년 바뀔 수 있는 모든 세율·한도 숫자를 한곳에 모은 설정.
// 새 연도가 발표되면 이 인터페이스를 그대로 채운 새 파일(예: 2027.ts)을 만들고
// lib/taxConfig/index.ts의 ALL_CONFIGS 배열에 등록하면 끝.
export interface TaxConfigYear {
  year: number;
  effectiveFrom: string; // 이 설정이 적용되기 시작하는 날짜 (ISO, 보통 그 해 1월 1일)
  verifiedAt: string; // 이 숫자들을 마지막으로 확인(검색/대조)한 날짜
  sources: string[]; // 근거 출처 — 다음 검증 때 다시 확인할 페이지

  // 연금계좌(연금저축/IRP) 세액공제
  pensionTaxCredit: {
    pensionSavingsCap: number;
    combinedCap: number;
    rateLowIncome: number;
    rateHighIncome: number;
  };
  pensionIncomeTaxRate: { "55-69": number; "70-79": number; "80+": number };
  otherIncomeTaxRate: number;
  annualPensionSeparateTaxLimit: number;

  isaTax: {
    freeLimitGeneral: number;
    freeLimitLowIncome: number;
    separateRate: number;
    conversionCreditRate: number;
    conversionCreditCap: number;
  };

  generalAccountDividendTaxRate: number;
  irpRiskAssetCap: number;
  rebalanceThreshold: number;

  // 사업자(지역가입자) 세금/보험료
  incomeTaxBrackets: IncomeTaxBracket[];
  localIncomeTaxRate: number;
  nationalPension: { rate: number; floor: number; ceiling: number };
  healthInsurance: { incomeRate: number; floor: number; ceiling: number };
  yellowUmbrellaBrackets: YellowUmbrellaBracket[];
  financialIncomeThreshold: number;
}
