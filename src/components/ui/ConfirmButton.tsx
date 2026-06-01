import { useEffect, useState } from "react";
import type { ReactNode } from "react";

/**
 * 破壞性操作（清除、重設）的二次確認按鈕：第一次點擊進入「確認」態，
 * 3 秒內再次點擊才執行；逾時自動還原，避免誤觸清空課堂資料。
 */
export function ConfirmButton({
  onConfirm,
  children,
  confirmLabel = "再按一次確認",
  className = "danger-button"
}: {
  onConfirm: () => void;
  children: ReactNode;
  confirmLabel?: string;
  className?: string;
}) {
  const [armed, setArmed] = useState(false);

  useEffect(() => {
    if (!armed) return undefined;
    const timer = window.setTimeout(() => setArmed(false), 3000);
    return () => window.clearTimeout(timer);
  }, [armed]);

  return (
    <button
      className={className}
      onClick={() => {
        if (armed) {
          onConfirm();
          setArmed(false);
        } else {
          setArmed(true);
        }
      }}
    >
      {armed ? confirmLabel : children}
    </button>
  );
}
