# 연금 포트폴리오 대시보드

엑셀로 관리하던 계좌별(연금저축·IRP·ISA·일반계좌) 자산 배분을 자동 계산 웹앱으로 옮긴 버전입니다.
지난 대화에서 검토했던 프롬프트 중 **반영한 것 / 고친 것**을 먼저 정리합니다.

## 무엇을 반영했고, 무엇을 고쳤나

| 원래 제안 | 처리 |
|---|---|
| Ticker 자동조회: FinanceDataReader / Yahoo Finance | **고침.** 둘 다 스택과 안 맞아서 `lib/kis.ts`로 교체 — 한국투자증권 Open API(REST). Node에서 바로 호출 가능, 국내 ETF 커버리지가 정확함 |
| 7분법 공식 상수화 + 계좌별 리밸런싱 리포트 | **반영.** `lib/constants.ts`(목표비중) + `lib/recommend.ts`(드리프트 계산) |
| 비중 5%p 이상 틀어지면 알림 | **반영.** `checkRebalanceNeeded()` → `app/components/RebalanceAlert.tsx` |
| Next.js + Tailwind + Recharts + Vercel | **반영.** 그대로 사용. 다만 원래 제안엔 **DB가 빠져 있어서** Prisma + Postgres 추가함 (이게 없으면 입금 로그·월별 비교 자체가 불가능) |
| Google Apps Script로 매월 자동 기록 | **고침.** 웹앱 스택과 안 맞는 제안이라 **Vercel Cron Jobs**(`vercel.json` + `app/api/cron/snapshot/route.ts`)로 교체 |
| IRP/ISA 종목 제한 유효성 검사 | **고침.** "IRP·ISA 둘 다 제약 있다"는 설명이 부정확했음. 실제로는 **연금계좌(연금저축·IRP)만** 레버리지/인버스/파생형 금지 + IRP는 위험자산 70% 상한. ISA는 자산군 제약이 없고 대신 해외주식 직접매수만 불가 → `lib/validation.ts` |

추가로 요청하신 세 가지(저장·예측·추천)는 이렇게 구현했습니다.
- **저장**: Prisma 스키마 4개 테이블(Account/Deposit/Holding/SnapshotMonthly) — 입금 로그와 평가액을 분리 저장하므로 원금·수익금이 항상 정확히 갈립니다.
- **예측**: `lib/projection.ts`의 월복리 미래가치 계산 + `lib/tax.ts`의 연금수령한도·세율 → `ProjectionPanel`에서 즉시 시뮬레이션
- **추천**: `lib/recommend.ts`의 `recommendContributionOrder()` — 올해 누적 납입액을 보고 "연금저축 600 → IRP 300 → ISA" 순서로 다음 입금처를 추천

## 설치

```bash
npm install
cp .env.example .env   # DB, KIS API 키 입력
npx prisma migrate dev --name init
npx tsx prisma/seed.ts  # 선택: 샘플 데이터로 먼저 테스트
npm run dev
```

## 꼭 채워야 하는 것

1. **`DATABASE_URL`** — Vercel Postgres(Storage 탭에서 생성) 또는 Supabase 무료 플랜 연결 문자열
2. **`KIS_APP_KEY` / `KIS_APP_SECRET`** — https://apiportal.koreainvestment.com 에서 계좌 연동 후 발급. 처음엔 `KIS_ENV=virtual`(모의투자)로 충분히 테스트한 뒤 `real`로 전환하세요.
3. **`CRON_SECRET`** — 아무 긴 랜덤 문자열. Vercel 프로젝트 환경변수에도 동일하게 등록
4. **`prisma/seed.ts`** 의 종목/금액을 실제 보유 내역으로 교체

## 매년 세율 업데이트하는 법

모든 세율·한도는 `lib/taxConfig/`에 연도별 파일로 모여 있습니다(`2026.ts`). 다른 코드는 전부 `getTaxConfig()`를 통해 간접적으로 이 값을 읽기 때문에, 새 연도가 와도 `lib/tax.ts`나 `lib/selfEmploymentTax.ts`를 손댈 필요가 없습니다.

**매년 1월 (세법 개정·요율 고시가 나온 뒤) 할 일**
1. 저에게 "pension-tracker 2027년 세율로 업데이트해줘"라고 요청하세요. 종합소득세 구간, 국민연금 요율(2033년까지 매년 0.5%p 인상 예정이라 거의 매년 바뀜), 건강보험료율, 세액공제 한도, 노란우산공제 한도를 검색해서 `lib/taxConfig/2027.ts`를 새로 만들어드릴게요.
2. `lib/taxConfig/index.ts`의 `ALL_CONFIGS` 배열에 새 파일을 등록 (한 줄 추가)
3. 만약 그해 1월에 아직 새 파일을 못 만들었다면, 대시보드 상단에 빨간 경고 배너(`StaleConfigBanner`)가 자동으로 떠서 "작년 숫자로 계산 중"이라고 알려줍니다 — 조용히 틀린 숫자가 나가는 일은 없습니다.

이 숫자들은 공개 API가 없어서(KIS 시세처럼 자동 동기화 불가) 완전 자동화는 못 했습니다. 다만 한곳에 모아뒀기 때문에 업데이트 자체는 파일 하나 추가하는 일로 줄어듭니다.

## Vercel 배포

기존 ExamForge와 동일한 흐름입니다 — GitHub 레포 연결 → Vercel 환경변수에 위 4개 등록 → 배포.
`vercel.json`의 cron은 매일 자정(KST) 호출되지만, 핸들러 내부에서 "오늘이 월말인지"를 검사해서 월말에만 실제로 스냅샷을 저장합니다(Vercel Hobby 플랜은 cron이 하루 1회 제한이라 이렇게 우회했습니다).

## 추가됨: 사업자(지역가입자)로서 실제 내는 돈

투자계좌 세금(`lib/tax.ts`)과 학원 운영자로서의 세금/보험료(`lib/selfEmploymentTax.ts`)는 완전히 다른 영역이라 분리했습니다.

| 항목 | 처리 |
|---|---|
| 종합소득세(누진세율 6~45%) + 지방소득세(10%) | `calcComprehensiveIncomeTax()` — 2023년 개정 8단계 구간표, 2026년 귀속분까지 동일 |
| 국민연금(지역가입자) | `calcNationalPensionRegional()` — 2026년 요율 9.5%(2033년까지 매년 0.5%p 인상 예정), 전액 본인부담 |
| 건강보험료(지역가입자) | `calcHealthInsuranceIncomePortionEstimate()` — **소득분만** 반영, 요율 7.19% |
| 노란우산공제 | `yellowUmbrellaDeductionCap()` — 사업소득 구간별 소득공제 한도 |
| 금융소득종합과세 | 이자+배당이 연 2,000만원 넘으면 초과분이 종합소득에 자동 합산됨 (`SelfEmploymentTaxPanel`에서 처리) |

**정직하게 밝히는 한계**: 건강보험료의 "재산분"(부동산·전월세보증금 기준)은 계산식이 복잡하고 매년 점수당 금액이 바뀌어서 뺐습니다. 소득분만 나온 값이라 실제 고지액보다 적게 나올 수 있습니다. 정확한 합산 금액은 국민건강보험공단 모의계산(nhis.or.kr)에서, 정확한 세액은 홈택스 모의계산이나 세무사 상담으로 한 번 더 검증하세요. 이 앱은 세무사·재무설계사의 조언을 대체하지 않습니다.

## 한계 / 다음에 보강할 부분 (정직하게 적습니다)

- 가격은 기본적으로 **보유종목의 평단가**로 평가됩니다. 실시간 평가액을 쓰려면 대시보드에서 `/api/price`를 호출해 매수단가 대신 최신가를 곱하는 로직을 추가해야 합니다.
- KIS 토큰 캐시는 서버리스 콜드스타트마다 초기화되는 인메모리 캐시라 운영 단계에선 DB나 Vercel KV에 저장하는 걸 권장합니다.
- `tr_id`(API 거래ID) 등 KIS 스펙은 종종 바뀌므로, 처음 연동할 때 최신 API 문서로 한 번 더 대조해보세요.
- 로그인/인증이 없습니다. 개인 1인용으로 가정했고, 여러 명이 쓰려면 Account에 userId를 추가해야 합니다.
- 세율·한도는 `lib/taxConfig/2026.ts`에 모여 있고 연도별로 새 파일을 추가하는 구조입니다(위 "매년 세율 업데이트하는 법" 참고) — 이 앱은 세무 전문가의 조언을 대체하지 않으니 실제 인출 전엔 세무사나 금융사 상담을 함께 받으시길 권합니다.
