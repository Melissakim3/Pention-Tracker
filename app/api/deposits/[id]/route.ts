import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const body = await req.json();
  const { date, amount, sourceType, taxCredited } = body;

  const deposit = await prisma.deposit.update({
    where: { id: params.id },
    data: {
      ...(date && { date: new Date(date) }),
      ...(amount !== undefined && { amount: Number(amount) }),
      ...(sourceType && { sourceType }),
      ...(taxCredited !== undefined && { taxCredited }),
    },
  });

  return NextResponse.json(deposit);
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  await prisma.deposit.delete({ where: { id: params.id } });
  return NextResponse.json({ deleted: true });
}
