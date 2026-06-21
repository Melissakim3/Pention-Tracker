"use client";

import { useState } from "react";
import { SEVEN_ASSET_TARGET } from "@/lib/constants";

interface Account {
  id: string;
  type: string;
  name: string;
}

export default function HoldingForm({ accounts }: { accounts: Account[] }) {
  const [accountId, setAccountId] = useState(accounts[0]?.id ?? "");
  const [ticker, setTicker] = useState("");
  const [name, setName] = useState("");
  const [assetClass, setAssetClass] = useState(Object.keys(SEVEN_ASSET_TARGET)[0]);
  const [riskType, setRiskType] = useState<"RISK" | "SAFE">("RISK");
  const [quantity, setQuantity] = useState(1);
  const [avgCost, setAvgCost] = useState(10000);
  const [status, setStatus] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("저장 중...");
    const res = await fetch("/api/holdings", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ accountId, ticker, name, assetClass, riskType, quantity, avgCost }),
    });
    if (res.ok) {
      setStatus("종목 저장됨. 대시보드에서 새로고침하면 반영됩니다.");
    } else {
      const data = await res.json();
      setStatus(`거부됨: ${data.error}`); // 예: 연금계좌 레버리지 금지, IRP 위험자산 70% 초과 등
    }
  }

  if (accounts.length === 0) {
    return <p className="text-sm text-gray-400">먼저 위에서 계좌를 하나 이상 추가하세요.</p>;
  }

  return (
    <form onSubmit={handleSubmit} className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm items-end">
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
        종목코드(6자리)
        <input value={ticker} onChange={(e) => setTicker(e.target.value)} placeholder="360750" className="rounded border border-gray-300 px-2 py-1" />
      </label>
      <label className="flex flex-col gap-1">
        종목명
        <input value={name} onChange={(e) => setName(e.target.value)} placeholder="TIGER 미국S&P500" className="rounded border border-gray-300 px-2 py-1" />
      </label>
      <label className="flex flex-col gap-1">
        자산군(7분법)
        <select value={assetClass} onChange={(e) => setAssetClass(e.target.value)} className="rounded border border-gray-300 px-2 py-1">
          {Object.keys(SEVEN_ASSET_TARGET).map((k) => (
            <option key={k} value={k}>
              {k}
            </option>
          ))}
        </select>
      </label>
      <label className="flex flex-col gap-1">
        위험/안전
        <select value={riskType} onChange={(e) => setRiskType(e.target.value as "RISK" | "SAFE")} className="rounded border border-gray-300 px-2 py-1">
          <option value="RISK">위험자산</option>
          <option value="SAFE">안전자산</option>
        </select>
      </label>
      <label className="flex flex-col gap-1">
        수량
        <input type="number" value={quantity} onChange={(e) => setQuantity(Number(e.target.value))} className="rounded border border-gray-300 px-2 py-1" />
      </label>
      <label className="flex flex-col gap-1">
        평단가
        <input type="number" value={avgCost} onChange={(e) => setAvgCost(Number(e.target.value))} className="rounded border border-gray-300 px-2 py-1" />
      </label>
      <button type="submit" className="rounded bg-brand-600 text-white px-4 py-1.5 hover:bg-brand-700">
        종목 저장
      </button>
      {status && <p className="text-xs text-gray-500 col-span-full">{status}</p>}
    </form>
  );
}
