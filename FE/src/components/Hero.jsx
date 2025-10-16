import React, { useEffect, useMemo, useRef, useState } from "react";
import axios from "../config/axios.config";

const ROTATE_MS = 4000;

function normalizeToArray(payload) {
  const data = payload?.data ?? payload;
  if (Array.isArray(data)) return data;
  if (Array.isArray(payload?.data?.docs)) return payload.data.docs;
  if (data && typeof data === "object") return [data];
  return [];
}

const baseOrigin = import.meta.env.VITE_API_URL?.replace(/\/api\/?$/, "") || "";

const imgSrc = (menuImg) => {
  if (!menuImg) return "/Ellipse 14.png";
  return menuImg.startsWith("/uploads") ? `${baseOrigin}${menuImg}` : menuImg;
};

async function tryFetch(endpoint, params) {
  try {
    const res = await axios.get(endpoint, { params });
    return normalizeToArray(res);
  } catch (e) {
    if (e?.response?.status !== 404)
      console.warn(`GET ${endpoint} failed:`, e?.response?.data || e.message);
    return [];
  }
}

async function loadBanners() {
  let list = (await tryFetch("banners", { isActive: true })) || [];
  if (list.length === 0) list = await tryFetch("banners", {});
  if (list.length === 0) list = await tryFetch("hero-banners", { isActive: true });
  if (list.length === 0) list = await tryFetch("hero-banners", {});

  if (list.length === 0) {
    const single = await tryFetch("banners/public/active/one", {});
    if (single.length) return single;
    return await tryFetch("hero-banners/public/active/one", {});
  }
  return list;
}

export default function Hero() {
  const [banners, setBanners] = useState([]);
  const [idx, setIdx] = useState(0);
  const [paused, setPaused] = useState(false);
  const timerRef = useRef(null);

  useEffect(() => {
    (async () => {
      const list = await loadBanners();
      const filtered = list.filter((b) => b?.isActive !== false);
      filtered.sort(
        (a, b) =>
          (a?.order ?? 0) - (b?.order ?? 0) ||
          new Date(a?.createdAt || 0) - new Date(b?.createdAt || 0)
      );
      setBanners(filtered);
      setIdx(0);
      if (filtered.length === 0) {
        console.warn("No banners found after all fallbacks.");
      }
    })();
  }, []);

  useEffect(() => {
    if (paused || banners.length <= 1) return;
    timerRef.current = setInterval(
      () => setIdx((i) => (i + 1) % banners.length),
      ROTATE_MS
    );
    return () => clearInterval(timerRef.current);
  }, [paused, banners.length]);

  const current = banners[idx] || null;

  const title = useMemo(() => {
    if (!current) return "CHARCOAL CHICKEN";
    return (
      current?.primaryItem?.name ||
      current?.items?.[0]?.name ||
      "CHARCOAL CHICKEN"
    );
  }, [current]);

  const go = (dir) => {
    if (!banners.length) return;
    setIdx((i) => (i + dir + banners.length) % banners.length);
  };

  if (!current) return null; // No placeholder

  return (
    <section
      className="hero-section hero-rotator"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {/* Left: text/content */}
      <div key={`content-${idx}`} className="hero-content fade-in fade-stagger">
        <p className="hero-offer-banner">Upto 30% off on Catering Menu</p>
        <h1 className="hero-title">{title}</h1>

        <div className="specialty-button" >
          <span role="button" tabIndex={0} onClick={()=>window.location.href="/menu"}>
            <img src="Group 1000002314.png" alt="cta" />
          </span>
        </div>

        {current.items?.length > 1 && (
          <div className="hero-chips">
            {current.items.slice(0, 5).map((m) => (
              <span key={m._id} className="hero-chip">
                {m.name}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Right: circular image + rings */}
      <div key={`image-${idx}`} className="hero-image fade-in">
        <div className="hero-visual fade-in">
          <div className="hero-figure fade-img">
            <img
              src={imgSrc(
                current?.primaryItem?.image || current?.items?.[0]?.image
              )}
              alt={title}
              loading="eager"
            />
          </div>
        </div>
      </div>

      <div className="hero-crescent"></div>

      {banners.length > 1 && (
        <>
          <button
            className="hero-nav hero-prev"
            onClick={() => go(-1)}
            aria-label="Previous banner"
          >
            ‹
          </button>
          <button
            className="hero-nav hero-next"
            onClick={() => go(1)}
            aria-label="Next banner"
          >
            ›
          </button>

          <div className="hero-dots">
            {banners.map((_, i) => (
              <button
                key={i}
                className={`hero-dot ${i === idx ? "active" : ""}`}
                onClick={() => setIdx(i)}
                aria-label={`Go to banner ${i + 1}`}
              />
            ))}
          </div>
        </>
      )}
    </section>
  );
}
