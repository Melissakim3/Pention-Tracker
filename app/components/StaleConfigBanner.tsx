import { getTaxConfig } from "@/lib/taxConfig";

export default function StaleConfigBanner() {
  const { config, isStale } = getTaxConfig();
  if (!isStale) return null;

  return (
    <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
      {new Date().getFullYear()}년 세율 설정이 아직 등록되지 않아 {config.year}년 숫자로 계산 중입니다.
      <code className="mx-1 px-1 rounded bg-red-100">lib/taxConfig/{new Date().getFullYear()}.ts</code>
      를 추가하기 전까지는 세금·보험료 추정치가 부정확할 수 있습니다.
    </div>
  );
}
