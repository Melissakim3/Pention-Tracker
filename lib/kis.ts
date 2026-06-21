// 한국투자증권 Open API (KIS Developers) 클라이언트
//
// 왜 Yahoo Finance / FinanceDataReader가 아니라 이걸 쓰는가:
// - FinanceDataReader는 Python 전용이라 Next.js(Node) 서버리스 함수에 못 들어감
// - Yahoo Finance는 국내 ETF(TIGER/KODEX/SOL/ACE 등) 커버리지·배당데이터가 부정확함
// - KIS Open API는 REST/JSON이라 fetch()로 바로 호출 가능, 무료, 실전/모의 계좌 모두 지원
//
// 발급: https://apiportal.koreainvestment.com 에서 계좌 연동 후 appkey/appsecret 발급
// 주의: tr_id 등 세부 스펙은 KIS가 종종 업데이트하므로, 배포 전 최신 API 문서로 한 번 더 확인할 것.

const KIS_DOMAIN =
  process.env.KIS_ENV === "real"
    ? "https://openapi.koreainvestment.com:9443"
    : "https://openapivts.koreainvestment.com:29443"; // 모의투자 도메인 (기본값, 테스트 권장)

// 서버리스 환경에서는 콜드스타트마다 메모리가 초기화되므로 이 캐시는 "있으면 절약, 없어도 동작"
// 수준의 보조 캐시일 뿐임. 운영 단계에서는 DB나 Vercel KV에 토큰을 저장하는 걸 권장.
let cachedToken: { token: string; expiresAt: number } | null = null;

async function getAccessToken(): Promise<string> {
  if (cachedToken && cachedToken.expiresAt > Date.now()) return cachedToken.token;

  const res = await fetch(`${KIS_DOMAIN}/oauth2/tokenP`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      grant_type: "client_credentials",
      appkey: process.env.KIS_APP_KEY,
      appsecret: process.env.KIS_APP_SECRET,
    }),
  });

  if (!res.ok) {
    throw new Error(`KIS 토큰 발급 실패: ${res.status} ${await res.text()}`);
  }

  const data = (await res.json()) as { access_token: string; expires_in: number };
  cachedToken = {
    token: data.access_token,
    // 보통 24시간 유효. 만료 10분 전에 갱신하도록 여유를 둠.
    expiresAt: Date.now() + (data.expires_in - 600) * 1000,
  };
  return cachedToken.token;
}

export interface KisPrice {
  ticker: string;
  price: number;
  changeRate: number; // 전일 대비 등락률(%)
}

// 국내주식/ETF 현재가 조회 (주식현재가 시세 API)
export async function fetchCurrentPrice(ticker: string): Promise<KisPrice> {
  const token = await getAccessToken();

  const url = new URL(`${KIS_DOMAIN}/uapi/domestic-stock/v1/quotations/inquire-price`);
  url.searchParams.set("fid_cond_mrkt_div_code", "J"); // J = 주식/ETF
  url.searchParams.set("fid_input_iscd", ticker);

  const res = await fetch(url.toString(), {
    headers: {
      authorization: `Bearer ${token}`,
      appkey: process.env.KIS_APP_KEY!,
      appsecret: process.env.KIS_APP_SECRET!,
      tr_id: "FHKST01010100",
    },
  });

  if (!res.ok) {
    throw new Error(`KIS 시세 조회 실패 (${ticker}): ${res.status}`);
  }

  const data = (await res.json()) as { output: { stck_prpr: string; prdy_ctrt: string } };

  return {
    ticker,
    price: Number(data.output.stck_prpr ?? 0),
    changeRate: Number(data.output.prdy_ctrt ?? 0),
  };
}

export async function fetchCurrentPrices(tickers: string[]): Promise<KisPrice[]> {
  // KIS는 호출 빈도 제한이 있어 동시 다발 호출보다는 순차 호출이 안전함
  const results: KisPrice[] = [];
  for (const ticker of tickers) {
    results.push(await fetchCurrentPrice(ticker));
  }
  return results;
}
