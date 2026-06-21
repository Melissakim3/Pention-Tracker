import type { TaxConfigYear } from "./types";
import { TAX_CONFIG_2026 } from "./2026";

// 매년 1월, 새 연도 파일(예: 2027.ts)을 만들어서 import 추가하고 아래 배열에 넣으면 됨.
// 그 외 코드는 한 줄도 안 건드려도 됨 — getTaxConfig()가 자동으로 최신 걸 골라줌.
const ALL_CONFIGS: TaxConfigYear[] = [TAX_CONFIG_2026];

export interface ResolvedTaxConfig {
  config: TaxConfigYear;
  isStale: boolean; // true면 "현재 연도 설정이 아직 없어서 이전 연도 숫자를 쓰는 중"이라는 뜻
}

export function getTaxConfig(asOf: Date = new Date()): ResolvedTaxConfig {
  const sorted = [...ALL_CONFIGS].sort((a, b) => b.year - a.year);
  const match = sorted.find((c) => asOf >= new Date(c.effectiveFrom));

  if (!match) {
    // 가장 오래된 설정보다도 이전 날짜 — 정상적으로는 일어나지 않음
    const oldest = sorted[sorted.length - 1];
    return { config: oldest, isStale: true };
  }

  const isStale = asOf.getFullYear() > match.year;
  return { config: match, isStale };
}
