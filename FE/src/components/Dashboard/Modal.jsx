import { useEffect } from "react";
import { createPortal } from "react-dom";

export default function Modal({ open, onClose, children }) {
  if (!open) return null;

  const target =
    document.querySelector(".dashboard-layout") ||
    document.getElementById("root") ||
    document.body;

  // Close when clicking outside the modal content
  const onBackdrop = (e) => {
    if (e.target === e.currentTarget) {
      e.stopPropagation();
      onClose?.();
    }
  };

  // Close when pressing Escape key
  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === "Escape") onClose?.();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [onClose]);

  return createPortal(
    <div className="od-modal__overlay" onMouseDown={onBackdrop}>
      <div
        className="od-modal__card"
        onMouseDown={(e) => e.stopPropagation()} // Prevent clicks inside from closing
      >
        {children}
      </div>
    </div>,
    target
  );
}
