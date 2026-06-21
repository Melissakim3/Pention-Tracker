"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ACCOUNT_TYPES } from "@/lib/constants";

interface Account {
  id: string;
  type: string;
  name: string;
}
interface Deposit {
  id: string;
  accountId: string;
  date: string;
  amount: number;
  sourceType: string;
  taxCredited: boolean;
  account: { name: string };
}
interface Holding {
  id: string;
  accountId: string;
  ticker: string;
  name: string;
  assetClass: string;
  riskType: string;
  quantity: number;
  avgCost: number;
  account: { name: string };
}

async function callApi(url: string, method: string, body?: unknown) {
  const res = await fetch(url, {
    method,
    headers: body ? { "content-type": "application/json" } : undefined,
    body: body ? JSON.stringify(body) : undefined,
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error ?? `요청 실패 (${res.status})`);
  }
  return res.json();
}

export default function RecordsManager({
  accounts,
  deposits,
  holdings,
}: {
  accounts: Account[];
  deposits: Deposit[];
  holdings: Holding[];
}) {
  const router = useRouter();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleDelete(kind: "accounts" | "deposits" | "holdings", id: string, confirmMsg: string) {
    if (!confirm(confirmMsg)) return;
    try {
      await callApi(`/api/${kind}/${id}`, "DELETE");
      router.refresh();
    } catch (e) {
      setError(String(e));
    }
  }

  async function handleSaveAccount(id: string, type: string, name: string) {
    try {
      await callApi(`/api/accounts/${id}`, "PATCH", { type, name });
      setEditingId(null);
      router.refresh();
    } catch (e) {
      setError(String(e));
    }
  }

  async function handleSaveDeposit(id: string, date: string, amount: number) {
    try {
      await callApi(`/api/deposits/${id}`, "PATCH", { date, amount });
      setEditingId(null);
      router.refresh();
    } catch (e) {
      setError(String(e));
    }
  }

  async function handleSaveHolding(id: string, quantity: number, avgCost: number) {
    try {
      await callApi(`/api/holdings/${id}`, "PATCH", { quantity, avgCost });
      setEditingId(null);
      router.refresh();
    } catch (e) {
      setError(String(e));
    }
  }

  return (
    <div className="space-y-8">
      {error && (
        <div className="rounded bg-red-50 text-red-700 text-sm px-3 py-2 flex justify-between">
          <span>{error}</span>
          <button onClick={() => setError(null)} className="text-red-400">
            ✕
          </button>
        </div>
      )}

      {/* 계좌 목록 */}
      <div>
        <h3 className="text-sm font-medium mb-2">계좌 목록</h3>
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-gray-500 border-b border-gray-100">
              <th className="py-1.5">유형</th>
              <th className="py-1.5">이름</th>
              <th className="py-1.5 text-right">관리</th>
            </tr>
          </thead>
          <tbody>
            {accounts.map((a) =>
              editingId === `acc-${a.id}` ? (
                <EditAccountRow key={a.id} account={a} onSave={handleSaveAccount} onCancel={() => setEditingId(null)} />
              ) : (
                <tr key={a.id} className="border-b border-gray-50">
                  <td className="py-1.5">{ACCOUNT_TYPES[a.type as keyof typeof ACCOUNT_TYPES] ?? a.type}</td>
                  <td className="py-1.5">{a.name}</td>
                  <td className="py-1.5 text-right space-x-2">
                    <button className="text-brand-600" onClick={() => setEditingId(`acc-${a.id}`)}>
                      수정
                    </button>
                    <button
                      className="text-red-500"
                      onClick={() => handleDelete("accounts", a.id, `"${a.name}" 계좌를 삭제하면 그 안의 입금기록·보유종목도 모두 같이 삭제됩니다. 계속할까요?`)}
                    >
                      삭제
                    </button>
                  </td>
                </tr>
              )
            )}
            {accounts.length === 0 && (
              <tr>
                <td colSpan={3} className="py-3 text-gray-400">
                  등록된 계좌가 없습니다.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* 입금기록 목록 */}
      <div>
        <h3 className="text-sm font-medium mb-2">입금 기록</h3>
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-gray-500 border-b border-gray-100">
              <th className="py-1.5">계좌</th>
              <th className="py-1.5">날짜</th>
              <th className="py-1.5 text-right">금액</th>
              <th className="py-1.5 text-right">관리</th>
            </tr>
          </thead>
          <tbody>
            {deposits.map((d) =>
              editingId === `dep-${d.id}` ? (
                <EditDepositRow key={d.id} deposit={d} onSave={handleSaveDeposit} onCancel={() => setEditingId(null)} />
              ) : (
                <tr key={d.id} className="border-b border-gray-50">
                  <td className="py-1.5">{d.account.name}</td>
                  <td className="py-1.5">{new Date(d.date).toLocaleDateString("ko-KR")}</td>
                  <td className="py-1.5 text-right">{d.amount.toLocaleString()}원</td>
                  <td className="py-1.5 text-right space-x-2">
                    <button className="text-brand-600" onClick={() => setEditingId(`dep-${d.id}`)}>
                      수정
                    </button>
                    <button className="text-red-500" onClick={() => handleDelete("deposits", d.id, "이 입금 기록을 삭제할까요?")}>
                      삭제
                    </button>
                  </td>
                </tr>
              )
            )}
            {deposits.length === 0 && (
              <tr>
                <td colSpan={4} className="py-3 text-gray-400">
                  입금 기록이 없습니다.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* 보유종목 목록 */}
      <div>
        <h3 className="text-sm font-medium mb-2">보유 종목</h3>
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-gray-500 border-b border-gray-100">
              <th className="py-1.5">계좌</th>
              <th className="py-1.5">종목</th>
              <th className="py-1.5 text-right">수량</th>
              <th className="py-1.5 text-right">평단가</th>
              <th className="py-1.5 text-right">관리</th>
            </tr>
          </thead>
          <tbody>
            {holdings.map((h) =>
              editingId === `hol-${h.id}` ? (
                <EditHoldingRow key={h.id} holding={h} onSave={handleSaveHolding} onCancel={() => setEditingId(null)} />
              ) : (
                <tr key={h.id} className="border-b border-gray-50">
                  <td className="py-1.5">{h.account.name}</td>
                  <td className="py-1.5">
                    {h.name} <span className="text-gray-400">({h.ticker})</span>
                  </td>
                  <td className="py-1.5 text-right">{h.quantity}</td>
                  <td className="py-1.5 text-right">{h.avgCost.toLocaleString()}원</td>
                  <td className="py-1.5 text-right space-x-2">
                    <button className="text-brand-600" onClick={() => setEditingId(`hol-${h.id}`)}>
                      수정
                    </button>
                    <button className="text-red-500" onClick={() => handleDelete("holdings", h.id, `"${h.name}" 종목을 삭제할까요?`)}>
                      삭제
                    </button>
                  </td>
                </tr>
              )
            )}
            {holdings.length === 0 && (
              <tr>
                <td colSpan={5} className="py-3 text-gray-400">
                  보유 종목이 없습니다.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function EditAccountRow({
  account,
  onSave,
  onCancel,
}: {
  account: Account;
  onSave: (id: string, type: string, name: string) => void;
  onCancel: () => void;
}) {
  const [type, setType] = useState(account.type);
  const [name, setName] = useState(account.name);
  return (
    <tr className="border-b border-gray-50 bg-gray-50">
      <td className="py-1.5">
        <select value={type} onChange={(e) => setType(e.target.value)} className="rounded border border-gray-300 px-1 py-0.5">
          {Object.entries(ACCOUNT_TYPES).map(([key, label]) => (
            <option key={key} value={key}>
              {label}
            </option>
          ))}
        </select>
      </td>
      <td className="py-1.5">
        <input value={name} onChange={(e) =>
