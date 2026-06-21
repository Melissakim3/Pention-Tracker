// 월복리 미래가치: 현재 평가액 + 매월 정기납입액을 연 환산 수익률로 N개월 굴렸을 때
export function futureValue(params: {
  currentValue: number;
  monthlyContribution: number;
  annualReturnRate: number; // 0.06 = 연 6%
  months: number;
}): number {
  const { currentValue, monthlyContribution, annualReturnRate, months } = params;
  const r = annualReturnRate / 12;

  const fvCurrent = currentValue * Math.pow(1 + r, months);
  const fvContributions =
    r === 0
      ? monthlyContribution * months
      : monthlyContribution * ((Math.pow(1 + r, months) - 1) / r) * (1 + r);

  return Math.round(fvCurrent + fvContributions);
}

// 은퇴 시점부터 매년 정액으로 N년에 걸쳐 인출한다고 가정했을 때 연간 인출 가능액
// (연금수령한도와는 별개로, "몇 년에 걸쳐 다 쓸 것인가"를 가정한 단순 분할 모델)
export function annualWithdrawalOverPeriod(totalAtRetirement: number, years: number): number {
  if (years <= 0) return totalAtRetirement;
  return Math.round(totalAtRetirement / years);
}

// 목표: 은퇴 후 월 X만원을 N년간 받으려면 은퇴 시점에 필요한 총액 (세전, 단순 분할 기준)
export function requiredCapitalForTargetIncome(monthlyTargetIncome: number, years: number): number {
  return Math.round(monthlyTargetIncome * 12 * years);
}
