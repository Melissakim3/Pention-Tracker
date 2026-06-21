"use client";

import { useState, useMemo } from "react";
import { futureValue, annualWithdrawalOverPeriod } from "@/lib/projection";
import { calcPensionWithdrawalTax } from "@/lib/tax";

export default function ProjectionPanel({ currentValue }: { currentValue: number }) {
  const [monthly, setMonthly] = useState(750000); // 연 900만원 세액공제 한도 채우는 월 환산액
  const [returnRate, setReturnRate] = useState(0.06);
  const [years, setYears] = useState(15);
  const [withdrawalYears, setWithdrawalYears] = useState(20);
  const [retirementAge, setRetirementAge] = useState(55);

  const fv = useMemo(
    () => futureValue({ currentValue, monthlyContribution: monthly, annualReturnRate: returnRate, months: years * 12 }),
    [currentValue, monthly, returnRate, years]
  );

  const annualWithdrawal = annualWithdrawalOverPeriod(fv, withdrawalYears);
  const annualTax = calcPensionWithdrawalTax(annualWithdrawal, retirementAge);
  const monthlyNet = Math.round((annualWithdrawal - annualTax) / 12);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-sm">
        <label className="flex flex-col gap-1">
          월 납입액
          <input
            type="number"
            value={monthly}
            onChange={(e) => setMonthly(Number(e.target.value))}
            className="rounded border border-gray-300 px-2 py-1"
          />
        </label>
        <label className="flex flex-col gap-1">
          예상 연수익률
          <input
            type="number"
            step="0.01"
            value={returnRate}
            onChange={(e) => setReturnRate(Number(e.target.value))}
            className="rounded border border-gray-300 px-2 py-1"
          />
        </label>
        <label className="flex flex-col gap-1">
          납입 기간(년)
          <input
            type="number"
            value={years}
            onChange={(e) => setYears(Number(e.target.value))}
            className="rounded border border-gray-300 px-2 py-1"
          />
        </label>
        <label className="flex flex-col gap-1">
          인출 기간(년)
          <input
            type="number"
            value={withdrawalYears}
            onChange={(e) => setWithdrawalYears(Number(e.target.value))}
            className="rounded border border-gray-300 px-2 py-1"
          />
        </label>
        <label className="flex flex-col gap-1">
          수령 시작 나이
          <input
            type="number"
            value={retirementAge}
            onChange={(e) => setRetirementAge(Number(e.target.value))}
            className="rounded border border-gray-300 px-2 py-1"
          />
        </label>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="rounded-lg bg-brand-50 px-4 py-3">
          <p className="text-xs text-gray-500">은퇴 시점 예상 평가액</p>
          <p className="text-lg font-medium text-brand-700">{fv.toLocaleString()}원</p>
        </div>
        <div className="rounded-lg bg-gray-100 px-4 py-3">
          <p className="text-xs text-gray-500">연간 인출액(세전)</p>
          <p className="text-lg font-medium">{annualWithdrawal.toLocaleString()}원</p>
        </div>
        <div className="rounded-lg bg-gray-100 px-4 py-3">
          <p className="text-xs text-gray-500">월 순수령액(세후 추정)</p>
          <p className="text-lg font-medium">{monthlyNet.toLocaleString()}원</p>
        </div>
      </div>
      <p className="text-xs text-gray-400">
        세후 추정치는 연금수령한도 내에서 {retirementAge}세 기준 연금소득세율을 적용한 단순 모델입니다.
        한도 초과분, 종합과세 전환(연 1,500만원 초과) 여부는 반영되지 않으니 참고용으로만 사용하세요.
      </p>
    </div>
  );
}
