// src/components/DeviceConnectModal.tsx
'use client';
import React from 'react';
import Modal from 'react-modal';
import Image from 'next/image'; // Next.js の Image コンポーネントを使用
import styles from './deviceconnectmodal.module.css'; // モーダル用CSS

// 型定義
type ConnectionStatus = 'disconnected' | 'connecting' | 'connected' | 'failed';

interface Props {
  isOpen: boolean;
  onRequestClose: () => void;
  onConnect: () => Promise<boolean>; // Connect ボタンの処理（Promiseで成功/失敗を返す）
  connectionStatus: ConnectionStatus;
}

// アプリケーションのルート要素を指定 (Next.jsの場合)
// クライアントサイドでのみ実行
if (typeof window !== 'undefined') {
    const appElement = document.getElementById('__next');
    if (appElement) {
        Modal.setAppElement(appElement);
    } else {
        // Next.js 13 App Routerなど、#_nextがない場合のフォールバック
        Modal.setAppElement(document.body);
        console.warn("Modal.setAppElement: Could not find #__next, using document.body as fallback. Ensure your root layout has an identifiable element if needed.");
    }
}


export default function DeviceConnectModal({ isOpen, onRequestClose, onConnect, connectionStatus }: Props) {

  // 接続ボタンクリック時の処理
  const handleConnectClick = async () => {
    // 接続中や接続済みは何もしない
    if (connectionStatus === 'connecting' || connectionStatus === 'connected') return;
    await onConnect(); // 親コンポーネントの接続処理を呼び出す
  };

  // モーダル内のコンテンツを接続状態に応じてレンダリング
  const renderContent = () => {
    const showImage = connectionStatus !== 'failed'; // 失敗時以外は画像表示

    return (
      <>
        {/* デバイス画像 (失敗時以外) */}
        {showImage && (
          <div className={styles.deviceImageContainer}>
            <Image
              // ★★★ publicディレクトリ内の画像パスを確認・修正してください ★★★
              // 例: /public/kaika.jpeg の場合 src="/kaika.jpeg"
              src="/kaika_device.png" // 提供されたファイル名に合わせる
              alt="KAIKA Device"
              width={150} // 画像の表示サイズ (必要に応じて調整)
              height={150} // 画像の表示サイズ (必要に応じて調整)
              className={styles.deviceImage}
              priority // LCP要素になる可能性があれば優先ロード
            />
          </div>
        )}

        {/* ステータスに応じたメッセージとボタン */}
        {connectionStatus === 'connecting' && (
          <>
            <div className={styles.loader}></div>
            <p>Connecting to your KAIKA device...</p>
            <button className={styles.connectButton} disabled>Connecting...</button>
          </>
        )}
        {connectionStatus === 'connected' && (
          <>
            <div className={styles.successIcon}>✓</div>
            <p>Successfully connected!</p>
            <button className={styles.closeButton} onClick={onRequestClose}>Done</button>
          </>
        )}
        {connectionStatus === 'failed' && (
          <>
            <div className={styles.errorIcon}>✕</div>
            <p>Connection failed. Please ensure your device is on and nearby, then try again.</p>
            <button className={styles.connectButton} onClick={handleConnectClick}>Retry</button>
          </>
        )}
        {/* 初期状態 (disconnected) */}
        {connectionStatus === 'disconnected' && (
          <>
            <p>Place your KAIKA device nearby and press connect.</p>
            <button className={styles.connectButton} onClick={handleConnectClick}>Connect</button>
          </>
        )}
      </>
    );
  };

  // モーダル本体のレンダリング
  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onRequestClose} // 背景クリックやEscapeキーで閉じる際の処理
      contentLabel="Connect KAIKA Device" // スクリーンリーダー用ラベル
      className={styles.modalContent} // 本体コンテンツのスタイル
      overlayClassName={styles.modalOverlay} // 背景オーバーレイのスタイル
      shouldCloseOnOverlayClick={connectionStatus !== 'connecting'} // 接続中はオーバーレイクリックで閉じない
      closeTimeoutMS={300} // クローズ時のアニメーション時間 (CSSと合わせる)
    >
      {/* モーダルタイトル */}
      <h2 className={styles.modalTitle}>Your KAIKA Device</h2>
      {/* 閉じるボタン (接続中でなければ表示) */}
      {connectionStatus !== 'connecting' && (
           <button onClick={onRequestClose} className={styles.closeIcon} aria-label="Close modal">×</button>
      )}
      {/* モーダルボディ (状態に応じたコンテンツ) */}
      <div className={styles.modalBody}>
        {renderContent()}
      </div>
    </Modal>
  );
}