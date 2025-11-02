import { useEffect } from "react";
import { useLocation } from "react-router-dom";

export default function ScrollToTop({ behavior = "auto" }) {
  const { pathname, hash, key } = useLocation();

  useEffect(() => {
    // If there’s a hash, scroll to that element; otherwise go to top.
    if (hash) {
      const el = document.querySelector(hash);
      if (el) {
        el.scrollIntoView({ behavior });
        return;
      }
    }
    // Always reset main page scroll
    window.scrollTo({ top: 0, left: 0, behavior });
  }, [pathname, hash, key, behavior]);

  return null;
}
