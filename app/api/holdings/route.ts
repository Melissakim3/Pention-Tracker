import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { validateHoldingForAccount } from "@/lib/validation";
import { ACCOUNT_TYPES } from "@/lib/constants";

export async function GET(req: NextRequest) {
  const accountId = req.nextUrl.searchParams.get("accountId");
  const holdings = await prisma.holding.findMany({
    where: accountId ? { accountId } : undefined,
    include: { account: true },
  });
  return NextResponse.json(holdings);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { accountId, ticker, name, assetClass, riskType, quantity, avgCost } = body;

  const account = await prisma.account.findUnique({ where: { id: accountId } });
  if (!account) return NextResponse.json({ error: "계좌를 찾을 수 없습니다." }, { status: 404 });

  const existing = await prisma.holding.findMany({ where: { accountId } });
  const marketValue = Number(quantity) * Number(avgCost);

  const result = validateHoldingForAccount(
    account.type as keyof typeof ACCOUNT_TYPES,
    { ticker, name, riskType: riskType ?? "RISK", marketValue },
    existing.map((h) => ({ riskType: h.riskType as "RISK" | "SAFE", marketValue: h.quantity * h.avgCost }))
  );

  if (!result.valid) {
    return NextResponse.json({ error: result.reason }, { status: 422 });
  }

  const holding = await prisma.holding.upsert({
    where: { accountId_ticker: { accountId, ticker } },
    update: { quantity, avgCost, name, assetClass, riskType },
    create: { accountId, ticker, name, assetClass, riskType: riskType ?? "RISK", quantity, avgCost },
  });

  return NextResponse.json(holding, { status: 201 });
}
