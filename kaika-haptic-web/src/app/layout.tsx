import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css"; // グローバルCSSをインポート

const inter = Inter({ subsets: ["latin"] });

// SEO や PWA のためのメタデータ
export const metadata: Metadata = {
  title: "KAIKA Haptic App", // アプリのタイトル
  description: "Feel the ground with Haptic Insoles", // アプリの説明
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en"> {/* 言語を日本語に設定 */}
      <body className={inter.className}>
        {/* ここに全ページ共通のヘッダーやフッターを追加することも可能 */}
        {children} {/* 各ページのコンテンツがここに挿入される */}
      </body>
    </html>
  );
}