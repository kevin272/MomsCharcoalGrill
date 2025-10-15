// src/components/ui/ToastProvider.jsx
import React, { createContext, useCallback, useContext, useRef, useState } from "react";
import { createPortal } from "react-dom";

const ToastCtx = createContext(null);

export function ToastProvider({
  children,
  defaultDuration = 2800,
  max = 4,
  position = "bottom-left",
  offsetTop = "calc(var(--header-h, 64px) + 12px)", // 👈 adjust via CSS var or number w/ "px"
  zIndex = 2147483647, // 👈 above any sticky header
}) {
  const [toasts, setToasts] = useState([]);
  const idRef = useRef(0);

  const remove = useCallback((id) => {
    setToasts((t) => t.filter((x) => x.id !== id));
  }, []);

  const push = useCallback((msg, opts = {}) => {
    const id = ++idRef.current;
    const t = { id, msg, type: opts.type || "default", duration: opts.duration || defaultDuration };
    setToasts((prev) => [...prev.slice(-(max - 1)), t]);
    setTimeout(() => remove(id), t.duration);
  }, [defaultDuration, max, remove]);

  const api = {
    show: (m, o) => push(m, o),
    success: (m, o) => push(m, { ...o, type: "success" }),
    error: (m, o) => push(m, { ...o, type: "error" }),
    info: (m, o) => push(m, { ...o, type: "info" }),
  };

  const pos = normalizePosition(position, offsetTop);

  const stack = (
    <div
      className="mcg-toast__portal"
      style={{ position: "fixed", ...pos, zIndex, pointerEvents: "none" }}
    >
      {toasts.map((t) => (
        <div
          key={t.id}
          className={`mcg-toast mcg-toast--${t.type}`}
          style={{ pointerEvents: "auto" }}
          role="status"
          aria-live="polite"
        >
          {t.msg}
        </div>
      ))}
    </div>
  );

  return (
    <ToastCtx.Provider value={api}>
      {children}
      {createPortal(stack, document.body)}
    </ToastCtx.Provider>
  );
}

function normalizePosition(position, offsetTop) {
  // Accept number -> px
  const off = typeof offsetTop === "number" ? `${offsetTop}px` : String(offsetTop || "16px");
  switch (position) {
    case "top-left": return { top: off, left: 16 };
    case "top-center": return { top: off, left: "50%", transform: "translateX(-50%)" };
    case "top-right": return { top: off, right: 16 };
    case "bottom-left": return { bottom: 16, left: 16 };
    case "bottom-center": return { bottom: 16, left: "50%", transform: "translateX(-50%)" };
    case "bottom-right": return { bottom: 16, right: 16 };
    default: return { top: off, right: 16 };
  }
}

export function useToast() {
  const ctx = useContext(ToastCtx);
  if (!ctx) throw new Error("useToast must be used within <ToastProvider>");
  return ctx;
}
