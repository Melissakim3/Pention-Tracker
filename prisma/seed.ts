import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function main() {
  const pensionSavings = await prisma.account.create({
    data: { type: "PENSION_SAVINGS", name: "연금저축펀드" },
  });
  const irp = await prisma.account.create({ data: { type: "IRP", name: "IRP" } });
  const isa = await prisma.account.create({ data: { type: "ISA", name: "ISA(중개형)" } });
  const general = await prisma.account.create({ data: { type: "GENERAL", name: "일반계좌" } });

  // 실제 보유 종목/수량/평단가로 교체하세요. assetClass는 7분법 키와 정확히 일치해야 합니다.
  // (국내주식 | 해외주식 | 채권 | 배당주 | 리츠 | 금 | 달러)
  await prisma.holding.createMany({
    data: [
      { accountId: pensionSavings.id, ticker: "360750", name: "TIGER 미국S&P500", assetClass: "해외주식", riskType: "RISK", quantity: 10, avgCost: 18000 },
      { accountId: irp.id, ticker: "308620", name: "KODEX 미국채10년선물", assetClass: "채권", riskType: "SAFE", quantity: 20, avgCost: 11000 },
      { accountId: isa.id, ticker: "329200", name: "TIGER 리츠부동산인프라", assetClass: "리츠", riskType: "RISK", quantity: 50, avgCost: 5500 },
      { accountId: general.id, ticker: "091160", name: "TIGER 200 IT", assetClass: "국내주식", riskType: "RISK", quantity: 15, avgCost: 32000 },
    ],
  });

  await prisma.deposit.createMany({
    data: [
      { accountId: pensionSavings.id, date: new Date("2026-01-15"), amount: 500000, sourceType: "SELF", taxCredited: true },
      { accountId: irp.id, date: new Date("2026-01-15"), amount: 250000, sourceType: "SELF", taxCredited: true },
      { accountId: isa.id, date: new Date("2026-01-15"), amount: 1000000, sourceType: "SELF", taxCredited: false },
      { accountId: general.id, date: new Date("2026-01-15"), amount: 500000, sourceType: "SELF", taxCredited: false },
    ],
  });

  console.log("시드 완료");
}

main().finally(() => prisma.$disconnect());
