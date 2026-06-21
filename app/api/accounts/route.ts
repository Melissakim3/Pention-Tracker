import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET() {
  const accounts = await prisma.account.findMany({ orderBy: { createdAt: "asc" } });
  return NextResponse.json(accounts);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { type, name } = body;
  if (!type || !name) {
    return NextResponse.json({ error: "type, name은 필수입니다." }, { status: 400 });
  }
  const account = await prisma.account.create({ data: { type, name } });
  return NextResponse.json(account, { status: 201 });
}
