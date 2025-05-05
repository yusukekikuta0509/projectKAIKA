// src/app/providers/WalletProvider.tsx (ファイルパスを確認してください)
'use client';

// ★★★ useEffect を React からインポート ★★★
import React, { FC, ReactNode, useMemo, useEffect } from 'react';
import {
  ConnectionProvider,
  WalletProvider
} from '@solana/wallet-adapter-react';
import { WalletModalProvider } from '@solana/wallet-adapter-react-ui';
import {
  PhantomWalletAdapter,
  SolflareWalletAdapter
} from '@solana/wallet-adapter-wallets';
import { clusterApiUrl } from '@solana/web3.js';
// ★★★ ReactModal をインポート ★★★
import ReactModal from 'react-modal';

// ウォレットUIのデフォルトスタイル（もしlayout.tsxにもあれば重複を避けるか、どちらか一方に）
// require('@solana/wallet-adapter-react-ui/styles.css');

/** Wrap _once_ around your App (layout.tsx) */
export const SolanaWalletCtx: FC<{ children: ReactNode }> = ({ children }) => {
  // Solanaネットワークとウォレットの設定 (既存)
  const endpoint = useMemo(() => clusterApiUrl('mainnet-beta'), []); // Mainnet設定になっていますね
  const wallets = useMemo(
    () => [new PhantomWalletAdapter(), new SolflareWalletAdapter()],
    []
  );

  // ★★★ ここに ReactModal の appElement を設定する useEffect を追加 ★★★
  useEffect(() => {
    const appRoot = document.getElementById('__next'); // Next.js のルート要素 ID
    if (appRoot) {
        ReactModal.setAppElement(appRoot);
        console.log('ReactModal appElement set to #__next');
    } else {
        console.warn('Could not find #__next element for ReactModal. Setting appElement to document.body (less ideal).');
        ReactModal.setAppElement(document.body); // フォールバック
    }
  }, []); // マウント時に一度だけ実行

  // 既存のプロバイダーのレンダリング
  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider wallets={wallets} autoConnect>
        <WalletModalProvider>{children}</WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
};