/* src/app/layout.tsx  ── サーバーコンポーネント (← "use client" を付けない) */

import '@solana/wallet-adapter-react-ui/styles.css';   // ★ ここで全体読み込み
import { Inter } from 'next/font/google';
import { SolanaWalletCtx } from './providers/WalletProvider';

export const metadata = {
  title: 'KAIKA Haptic App',
  description: 'Feel the ground with Haptic Insoles'
};

const inter = Inter({ subsets: ['latin'] });

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        {/* ここから先がクライアント領域 */}
        <SolanaWalletCtx>{children}</SolanaWalletCtx>
      </body>
    </html>
  );
}
