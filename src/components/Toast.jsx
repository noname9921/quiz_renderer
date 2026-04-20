import { useEffect } from "react";

export default function Toast({ message, type = "info", onDismiss }) {
  useEffect(() => {
    if (!message) return;
    const timer = setTimeout(() => {
      onDismiss?.();
    }, 3600);

    return () => clearTimeout(timer);
  }, [message, onDismiss]);

  if (!message) return null;

  return (
    <div className={`toast toast-${type}`}>
      <span>{message}</span>
      <button className="toast-close" onClick={onDismiss}>
        ×
      </button>
    </div>
  );
}
