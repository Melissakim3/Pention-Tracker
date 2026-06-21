"use client";

import { useState } from "react";

interface Account {
  id: string;
  type: string;
  name: string;
}

export default function DepositForm({ accounts }: { accounts: Account[] }) {
  const [accountId, setAccountId] = useState(accounts[0]?.id ?? "");
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [amount, setAmount] = useState(500000);
  const [sourceType, setSourceType] = useState("SELF");
  const [taxCredited, setTaxCredited] = useState(true);
  const [status, setStatus] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("저장 중...");
    const res = await fetch("/api/deposits", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ accountId, date, amount, sourceType, taxCredited }),
    });
    setStatus(res.ok ? "입금 기록 저장됨. 대시보드에서 새로고침하면 반영됩니다." : "실패했습니다.");
  }

  if (accounts.length === 0) {
    return <p className="text-sm text-gray-400">먼저 위에서 계좌를 하나 이상 추가하세요.</p>;
  }

  return (
    <form onSubmit={handleSubmit} className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-sm items-end">
      <label className="flex flex-col gap-1">
        계좌
        <select value={accountId} onChange={(e) => setAccountId(e.target.value)} className="rounded border border-gray-300 px-2 py-1">
          {accounts.map((a) => (
            <option key={a.id} value={a.id}>
              {a.name}
            </option>
          ))}
        </select>
      </label>
      <label className="flex flex-col gap-1">
        납입일
        <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="rounded border border-gray-300 px-2 py-1" />
      </label>
      <label className="flex flex-col gap-1">
        금액
        <input
          type="number"
          value={amount}
          onChange={(e) => setAmount(Number(e.target.value))}
          className="rounded border border-gray-300 px-2 py-1"
        />
      </label>
      <label className="flex flex-col gap-1">
        납입 유형
        <select value={sourceType} onChange={(e) => setSourceType(e.target.value)} className="rounded border border-gray-300 px-2 py-1">
          <option value="SELF">본인납입</option>
          <option value="SEVERANCE_TRANSFER">퇴직금이전(IRP)</option>
          <option value="ISA_CONVERSION">ISA 만기전환</option>
        </select>
      </label>
      <label className="flex items-center gap-2">
        <input type="checkbox" checked={taxCredited} onChange={(e) => setTaxCredited(e.target.checked)} />
        세액공제 받음
      </label>
      <button type="submit" className="rounded bg-brand-600 text-white px-4 py-1.5 hover:bg-brand-700 col-span-2 sm:col-span-1">
        입금 기록 저장
      </button>
      {status && <p className="text-xs text-gray-500 col-span-full">{status}</p>}
    </form>
  );
}
