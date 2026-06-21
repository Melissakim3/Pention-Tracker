"use client";

import { useState } from "react";
import { ACCOUNT_TYPES } from "@/lib/constants";

export default function AccountForm() {
  const [type, setType] = useState<keyof typeof ACCOUNT_TYPES>("PENSION_SAVINGS");
  const [name, setName] = useState("");
  const [status, setStatus] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("저장 중...");
    const res = await fetch("/api/accounts", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ type, name }),
    });
    if (res.ok) {
      setStatus("계좌가 추가되었습니다. 새로고침하면 아래 입금/종목 폼에서 선택할 수 있어요.");
      setName("");
    } else {
      const data = await res.json();
      setStatus(`실패: ${data.error}`);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm items-end">
      <label className="flex flex-col gap-1">
        계좌 유형
        <select
          value={type}
          onChange={(e) => setType(e.target.value as keyof typeof ACCOUNT_TYPES)}
          className="rounded border border-gray-300 px-2 py-1"
        >
          {Object.entries(ACCOUNT_TYPES).map(([key, label]) => (
            <option key={key} value={key}>
              {label}
            </option>
          ))}
        </select>
      </label>
      <label className="flex flex-col gap-1">
        계좌 이름 (예: 삼성증권 연금저축)
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          className="rounded border border-gray-300 px-2 py-1"
        />
      </label>
      <button type="submit" className="rounded bg-brand-600 text-white px-4 py-1.5 hover:bg-brand-700">
        계좌 추가
      </button>
      {status && <p className="text-xs text-gray-500 col-span-full">{status}</p>}
    </form>
  );
}
