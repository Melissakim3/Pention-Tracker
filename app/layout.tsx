import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "연금 포트폴리오 대시보드",
  description: "계좌별 연금 자산 자동 계산 대시보드",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <body className="bg-gray-50 text-gray-900">{children}</body>
    </html>
  );
}
