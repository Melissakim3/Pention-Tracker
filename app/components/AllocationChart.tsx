"use client";

import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from "recharts";

const COLORS = ["#4338ca", "#0ea5e9", "#16a34a", "#f59e0b", "#dc2626", "#a855f7", "#0891b2"];

export default function AllocationChart({
  data,
}: {
  data: { name: string; target: number; current: number }[];
}) {
  const currentData = data.map((d) => ({ name: d.name, value: Math.round(d.current * 1000) / 10 }));

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
      <ResponsiveContainer width="100%" height={260}>
        <PieChart>
          <Pie data={currentData} dataKey="value" nameKey="name" innerRadius={60} outerRadius={100}>
            {currentData.map((_, i) => (
              <Cell key={i} fill={COLORS[i % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip formatter={(v: number) => `${v}%`} />
          <Legend />
        </PieChart>
      </ResponsiveContainer>

      <table className="text-sm w-full">
        <thead>
          <tr className="text-left text-gray-500">
            <th className="py-1">자산군</th>
            <th className="py-1 text-right">목표</th>
            <th className="py-1 text-right">현재</th>
            <th className="py-1 text-right">차이</th>
          </tr>
        </thead>
        <tbody>
          {data.map((d) => {
            const drift = d.current - d.target;
            return (
              <tr key={d.name} className="border-t border-gray-100">
                <td className="py-1">{d.name}</td>
                <td className="py-1 text-right">{(d.target * 100).toFixed(0)}%</td>
                <td className="py-1 text-right">{(d.current * 100).toFixed(1)}%</td>
                <td className={`py-1 text-right ${Math.abs(drift) >= 0.05 ? "text-red-600 font-medium" : "text-gray-400"}`}>
                  {drift > 0 ? "+" : ""}
                  {(drift * 100).toFixed(1)}%p
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
