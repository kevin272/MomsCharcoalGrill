import React, { useEffect, useState } from 'react';

const RAW = import.meta?.env?.VITE_API_URL || "";         // "", "https://.../api", "https://..."
const BASE = RAW.replace(/\/+$/, "");                      // trim trailing slashes
// If provided, ensure it ends with /api. If not provided, default to same-origin /api
const API = BASE ? (BASE.endsWith("/api") ? BASE : `${BASE}/api`) : "/api";


const localKey = (id) => `notice:dismissed:${id}`;

export default function NoticeBanner() {
  const [notice, setNotice] = useState(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    let mounted = true;

    (async () => {
      try {
        const res = await fetch(`${API}/notices/active`, { credentials: 'include' });
        const data = await res.json();
        if (!mounted || !data) return;

        // If previously dismissed, don't show
        if (localStorage.getItem(localKey(data.id))) return;

        setNotice(data);
        setVisible(true);
      } catch (e) {
        // fail silently
      }
    })();

    return () => { mounted = false; };
  }, []);

  if (!notice || !visible) return null;

  const handleDismiss = () => {
    if (notice.dismissible) {
      localStorage.setItem(localKey(notice.id), '1');
      setVisible(false);
    }
  };

  const content = (
    <img
      src={notice.imageUrl}
      alt={notice.title || 'Notice'}
      className="notice-banner-image"
      loading="eager"
      decoding="async"
    />
  );

  return (
    <>
      {/* Backdrop (dim the page slightly) */}
      <div className="notice-backdrop" aria-hidden="true" onClick={handleDismiss} />

      {/* Fixed ribbon at top */}
      <div className="notice-banner" role="dialog" aria-label={notice.title || 'Notice'}>
        <div className="notice-inner">
          {notice.linkUrl ? (
            <a href={notice.linkUrl} target="_blank" rel="noreferrer" className="notice-link">
              {content}
            </a>
          ) : content}

          {notice.dismissible && (
            <button
              className="notice-dismiss"
              onClick={handleDismiss}
              aria-label="Dismiss notice"
              title="Close"
            >
              {/* X icon */}
              <svg width="22" height="22" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M18.3 5.71 12 12l6.3 6.29-1.42 1.42L10.59 13.4 4.3 19.71 2.89 18.3 9.17 12 2.89 5.71 4.3 4.29l6.29 6.3 6.29-6.3z" fill="currentColor"/>
              </svg>
            </button>
          )}
        </div>
      </div>
    </>
  );
}
