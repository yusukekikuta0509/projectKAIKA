// src/app/layout.tsx
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { SolanaWalletCtx } from "./providers/WalletProvider"; // Import the provider
import '@solana/wallet-adapter-react-ui/styles.css';

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "KAIKA Haptic App",
  description: "Feel the ground with Haptic Insoles",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body className={inter.className}>
        {/* Wrap the entire application with SolanaProviders */}
        <SolanaWalletCtx>
          {children}
        </SolanaWalletCtx>
      </body>
    </html>
  );
}