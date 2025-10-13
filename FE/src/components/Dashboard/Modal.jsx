import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";

export default function Modal({
  open,
  onClose,
  title = "Dialog",
  children,
  maxWidth = 720,
}) {
  const overlayRef = useRef(null);
  const dialogRef = useRef(null);

  // Body scroll lock
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = prev; };
  }, [open]);

  // ESC to close + focus
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => {
      if (e.key === "Escape") onClose?.();
      if (e.key === "Tab") {
        // basic focus trap
        const focusables = dialogRef.current?.querySelectorAll(
          'a,button,input,textarea,select,[tabindex]:not([tabindex="-1"])'
        );
        if (!focusables || focusables.length === 0) return;
        const first = focusables[0];
        const last = focusables[focusables.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          last.focus(); e.preventDefault();
        } else if (!e.shiftKey && document.activeElement === last) {
          first.focus(); e.preventDefault();
        }
      }
    };
    document.addEventListener("keydown", onKey);
    // focus the first element inside
    setTimeout(() => {
      const el = dialogRef.current?.querySelector(
        'input,textarea,select,button,[tabindex]:not([tabindex="-1"])'
      );
      el?.focus();
    }, 0);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  return createPortal(
    <div
      ref={overlayRef}
      className="mcg-modal__overlay"
      onMouseDown={(e) => {
        // close on backdrop click (but not when clicking inside dialog)
        if (e.target === overlayRef.current) onClose?.();
      }}
    >
      <div
        className="mcg-modal__dialog"
        role="dialog"
        aria-modal="true"
        aria-label={title}
        ref={dialogRef}
        style={{ maxWidth }}
      >
        <div className="mcg-modal__header">
          <h3 className="mcg-modal__title">{title}</h3>
          <button className="mcg-modal__close" onClick={onClose} aria-label="Close">×</button>
        </div>
        <div className="mcg-modal__body">{children}</div>
      </div>
    </div>,
    document.body
  );
}
