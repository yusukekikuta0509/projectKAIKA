// src/components/DeviceConnectModal.tsx
'use client';

// ★★★ lazy と Suspense を React からインポート ★★★
import React, { Suspense, lazy } from 'react';
import Modal from 'react-modal';
// DeviceModel の通常のインポートは削除 (lazyで読み込むため)
// import DeviceModel from './DeviceModel';
import styles from './deviceconnectmodal.module.css'; // モーダル用CSS

// ★★★ DeviceModel を遅延読み込みするように定義 ★★★
const DeviceModelLazy = lazy(() => import('./DeviceModel'));

// 型定義
type ConnectionStatus = 'disconnected' | 'connecting' | 'connected' | 'failed';

interface Props {
  isOpen: boolean;
  onRequestClose: () => void;
  onConnect: () => Promise<boolean>; // Connect ボタンの処理（Promiseで成功/失敗を返す）
  connectionStatus: ConnectionStatus;
}

// --- アプリケーションのルート要素を指定するロジックはここから削除 ---
// --- この設定は layout.tsx や providers.tsx の useEffect で行う ---
/*
if (typeof window !== 'undefined') {
    const appElement = document.getElementById('__next');
    if (appElement) {
        Modal.setAppElement(appElement);
    } else {
        Modal.setAppElement(document.body);
        console.warn("Modal.setAppElement: Could not find #__next, using document.body as fallback...");
    }
}
*/

export default function DeviceConnectModal({ isOpen, onRequestClose, onConnect, connectionStatus }: Props) {

  const handleConnectClick = async () => {
    // 接続中や接続済みは何もしない
    if (connectionStatus === 'connecting' || connectionStatus === 'connected') return;
    await onConnect(); // 親コンポーネントの接続処理を呼び出す
  };

  const renderContent = () => {
    // 失敗時以外は3Dモデルを表示するフラグ (変更なし)
    const showModel = connectionStatus !== 'failed';

    return (
      <>
        {/* ★★★ 3Dモデル表示部分を Suspense で囲み、lazy コンポーネントを使用 ★★★ */}
        {showModel && (
          <Suspense fallback={
            // ↓↓↓ 3Dモデルロード中の表示 (任意で調整) ↓↓↓
            <div className={styles.loaderContainer}> {/* 必要ならCSSでスタイル定義 */}
              <div className={styles.loader}></div> {/* スピナー流用 */}
              <p>Loading 3D Model...</p>
            </div>
            // ↑↑↑ 3Dモデルロード中の表示 ↑↑↑
          }>
            <DeviceModelLazy /> {/* 遅延読み込みするコンポーネントをレンダリング */}
          </Suspense>
        )}

        {/* ステータスに応じたメッセージとボタン (変更なし) */}
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
            {/* 失敗時もモデル表示する場合の Suspense (showModel=true の場合) */}
            {/* {showModel && (
              <Suspense fallback={<div className={styles.loaderContainer}><div className={styles.loader}></div><p>Loading 3D Model...</p></div>}>
                <DeviceModelLazy />
              </Suspense>
            )} */}
            <button className={styles.connectButton} onClick={handleConnectClick}>Retry</button>
          </>
        )}
        {/* 初期状態 (disconnected) - モデルは showModel && ... で表示される */}
        {connectionStatus === 'disconnected' && (
          <>
            <p>Place your KAIKA device nearby and press connect.</p>
            <button className={styles.connectButton} onClick={handleConnectClick}>Connect</button>
          </>
        )}
      </>
    );
  };

  // モーダル本体のレンダリング (変更なし)
  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onRequestClose}
      contentLabel="Connect KAIKA Device"
      className={styles.modalContent}
      overlayClassName={styles.modalOverlay}
      shouldCloseOnOverlayClick={connectionStatus !== 'connecting'}
      closeTimeoutMS={300}
      // appElement の設定はここではなく、アプリのルートで行う
    >
      <h2 className={styles.modalTitle}>Your KAIKA Device</h2>
      {connectionStatus !== 'connecting' && (
           <button onClick={onRequestClose} className={styles.closeIcon} aria-label="Close modal">×</button>
      )}
      <div className={styles.modalBody}>
        {renderContent()}
      </div>
    </Modal>
  );
}