import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const body = await req.json();
  const { name, assetClass, riskType, quantity, avgCost } = body;

  const holding = await prisma.holding.update({
    where: { id: params.id },
    data: {
      ...(name && { name }),
      ...(assetClass && { assetClass }),
      ...(riskType && { riskType }),
      ...(quantity !== undefined && { quantity: Number(quantity) }),
      ...(avgCost !== undefined && { avgCost: Number(avgCost) }),
    },
  });

  return NextResponse.json(holding);
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  await prisma.holding.delete({ where: { id: params.id } });
  return NextResponse.json({ deleted: true });
}
