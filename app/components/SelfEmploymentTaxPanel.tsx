"use client";

import { useState, useMemo } from "react";
import { summarizeSelfEmploymentTax, yellowUmbrellaDeductionCap } from "@/lib/selfEmploymentTax";

export default function SelfEmploymentTaxPanel() {
  const [businessIncome, setBusinessIncome] = useState(60_000_000); // 매출 - 필요경비
  const [financialIncome, setFinancialIncome] = useState(0); // 이자+배당 합계(세전)
  const [yellowUmbrella, setYellowUmbrella] = useState(6_000_000);

  const summary = useMemo(
    () =>
      summarizeSelfEmploymentTax({
        businessIncome,
        financialIncome,
        yellowUmbrellaContribution: yellowUmbrella,
      }),
    [businessIncome, financialIncome, yellowUmbrella]
  );

  const cap = yellowUmbrellaDeductionCap(businessIncome);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm">
        <label className="flex flex-col gap-1">
          연간 사업소득 (매출 − 필요경비)
          <input
            type="number"
            value={businessIncome}
            onChange={(e) => setBusinessIncome(Number(e.target.value))}
            className="rounded border border-gray-300 px-2 py-1"
          />
        </label>
        <label className="flex flex-col gap-1">
          연간 금융소득 (이자+배당, 세전)
          <input
            type="number"
            value={financialIncome}
            onChange={(e) => setFinancialIncome(Number(e.target.value))}
            className="rounded border border-gray-300 px-2 py-1"
          />
        </label>
        <label className="flex flex-col gap-1">
          노란우산공제 연납입액 (한도 {cap.toLocaleString()}원)
          <input
            type="number"
            value={yellowUmbrella}
            onChange={(e) => setYellowUmbrella(Number(e.target.value))}
            className="rounded border border-gray-300 px-2 py-1"
          />
        </label>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
        <div className="rounded-lg bg-gray-100 px-4 py-3">
          <p className="text-xs text-gray-500">종합소득세</p>
          <p className="text-base font-medium">{summary.incomeTax.toLocaleString()}원</p>
        </div>
        <div className="rounded-lg bg-gray-100 px-4 py-3">
          <p className="text-xs text-gray-500">지방소득세</p>
          <p className="text-base font-medium">{summary.localIncomeTax.toLocaleString()}원</p>
        </div>
        <div className="rounded-lg bg-gray-100 px-4 py-3">
          <p className="text-xs text-gray-500">국민연금 (연)</p>
          <p className="text-base font-medium">{summary.nationalPensionAnnual.toLocaleString()}원</p>
        </div>
        <div className="rounded-lg bg-gray-100 px-4 py-3">
          <p className="text-xs text-gray-500">건강보험료 소득분 (연)</p>
          <p className="text-base font-medium">{summary.healthInsuranceAnnual.toLocaleString()}원</p>
        </div>
      </div>

      <div className="rounded-lg bg-brand-50 px-4 py-3">
        <p className="text-xs text-gray-500">연간 합계 추정 부담액</p>
        <p className="text-lg font-semibold text-brand-700">{summary.totalAnnualBurden.toLocaleString()}원</p>
      </div>

      {summary.financialIncomeOverThreshold > 0 && (
        <p className="text-xs text-amber-700">
          금융소득이 2,000만원을 초과해 {summary.financialIncomeOverThreshold.toLocaleString()}원이 종합소득에
          합산되었습니다(금융소득종합과세).
        </p>
      )}

      <p className="text-xs text-gray-400">
        건강보험료는 소득분만 반영한 추정치이며 재산(부동산·전월세보증금 등) 보험료는 빠져 있습니다. 정확한 합산액은
        국민건강보험공단 모의계산에서, 정확한 세액은 홈택스 또는 세무사 상담으로 한 번 더 확인하세요.
      </p>
    </div>
  );
}
