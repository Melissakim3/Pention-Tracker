import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const body = await req.json();
  const { type, name } = body;

  const account = await prisma.account.update({
    where: { id: params.id },
    data: { ...(type && { type }), ...(name && { name }) },
  });

  return NextResponse.json(account);
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  await prisma.deposit.deleteMany({ where: { accountId: params.id } });
  await prisma.holding.deleteMany({ where: { accountId: params.id } });
  await prisma.snapshotMonthly.deleteMany({ where: { accountId: params.id } });
  await prisma.account.delete({ where: { id: params.id } });

  return NextResponse.json({ deleted: true });
}
