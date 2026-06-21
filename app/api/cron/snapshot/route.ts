import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { fetchCurrentPrices } from "@/lib/kis";

function isLastDayOfMonthKST(): boolean {
  const now = new Date();
  const kstNow = new Date(now.toLocaleString("en-US", { timeZone: "Asia/Seoul" }));
  const tomorrow = new Date(kstNow);
  tomorrow.setDate(kstNow.getDate() + 1);
  return tomorrow.getMonth() !== kstNow.getMonth();
}

export async function GET(req: NextRequest) {
  // Vercel Cron 외 외부에서 함부로 호출하지 못하도록 보호
  const auth = req.headers.get("authorization");
  if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  if (!isLastDayOfMonthKST()) {
    return NextResponse.json({ skipped: true, reason: "월말이 아님" });
  }

  const accounts = await prisma.account.findMany({ include: { holdings: true, deposits: true } });
  const today = new Date();
  const results = [];

  for (const account of accounts) {
    const tickers = account.holdings.map((h) => h.ticker);
    const prices = tickers.length > 0 ? await fetchCurrentPrices(tickers) : [];
    const priceMap = new Map(prices.map((p) => [p.ticker, p.price]));

    const balance = account.holdings.reduce((sum, h) => {
      const price = priceMap.get(h.ticker) ?? h.avgCost; // 시세 조회 실패 시 평단가로 폴백
      return sum + price * h.quantity;
    }, 0);

    const cumulativePrincipal = account.deposits.reduce((sum, d) => sum + d.amount, 0);

    const snapshot = await prisma.snapshotMonthly.upsert({
      where: { accountId_date: { accountId: account.id, date: today } },
      update: { balance, cumulativePrincipal },
      create: { accountId: account.id, date: today, balance, cumulativePrincipal },
    });

    results.push(snapshot);
  }

  return NextResponse.json({ skipped: false, count: results.length, results });
}
