import { NextRequest, NextResponse } from "next/server";
import { fetchCurrentPrice } from "@/lib/kis";

export async function GET(req: NextRequest) {
  const ticker = req.nextUrl.searchParams.get("ticker");
  if (!ticker) {
    return NextResponse.json({ error: "ticker 쿼리 파라미터가 필요합니다. 예: /api/price?ticker=360750" }, { status: 400 });
  }

  try {
    const price = await fetchCurrentPrice(ticker);
    return NextResponse.json(price);
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 502 });
  }
}
