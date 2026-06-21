import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(req: NextRequest) {
  const accountId = req.nextUrl.searchParams.get("accountId");
  const deposits = await prisma.deposit.findMany({
    where: accountId ? { accountId } : undefined,
    orderBy: { date: "desc" },
    include: { account: true },
  });
  return NextResponse.json(deposits);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { accountId, date, amount, sourceType, taxCredited } = body;

  if (!accountId || !date || !amount) {
    return NextResponse.json({ error: "accountId, date, amount는 필수입니다." }, { status: 400 });
  }

  const deposit = await prisma.deposit.create({
    data: {
      accountId,
      date: new Date(date),
      amount: Number(amount),
      sourceType: sourceType ?? "SELF",
      taxCredited: taxCredited ?? true,
    },
  });

  return NextResponse.json(deposit, { status: 201 });
}
