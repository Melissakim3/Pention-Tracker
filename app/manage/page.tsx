import { prisma } from "@/lib/db";
import AccountForm from "../components/AccountForm";
import DepositForm from "../components/DepositForm";
import HoldingForm from "../components/HoldingForm";

export const dynamic = "force-dynamic";

export default async function ManagePage() {
  const accounts = await prisma.account.findMany({ orderBy: { createdAt: "asc" } });

  return (
    <main className="max-w-4xl mx-auto px-4 py-8 space-y-8">
      <header>
        <a href="/" className="text-sm text-brand-600 hover:underline">
          ← 대시보드로
        </a>
        <h1 className="text-xl font-medium mt-1">데이터 입력</h1>
        <p className="text-sm text-gray-500">계좌를 만들고, 매달 입금을 기록하고, 보유종목을 입력/업데이트하세요.</p>
      </header>

      <section className="rounded-xl bg-white border border-gray-200 p-5">
        <h2 className="text-sm font-medium mb-3">1. 계좌 추가</h2>
        <AccountForm />
      </section>

      <section className="rounded-xl bg-white border border-gray-200 p-5">
        <h2 className="text-sm font-medium mb-3">2. 입금 기록</h2>
        <DepositForm accounts={accounts} />
      </section>

      <section className="rounded-xl bg-white border border-gray-200 p-5">
        <h2 className="text-sm font-medium mb-3">3. 보유종목 입력/업데이트</h2>
        <p className="text-xs text-gray-500 mb-3">
          이미 있는 종목코드로 다시 저장하면 수량·평단가가 갱신됩니다 (덮어쓰기).
        </p>
        <HoldingForm accounts={accounts} />
      </section>
    </main>
  );
}
