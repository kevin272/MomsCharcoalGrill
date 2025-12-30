import React, { useEffect, useMemo, useRef, useState } from "react";
import axios from "../config/axios.config";
import { DEFAULT_PROMO_BANNER_TEXT, fetchPromoBannerText } from "../utils/settings";

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

function HeroSkeleton() {
  return (
    <section className="hero-section hero-rotator hero-skeleton" aria-hidden="true">
      <div className="hero-content">
        <div className="hero-skeleton__badge skeleton" />
        <div className="hero-skeleton__title skeleton" />
        <div className="hero-skeleton__title hero-skeleton__title--short skeleton" />
        <div className="hero-skeleton__cta skeleton" />
      </div>
      <div className="hero-image">
        <div className="hero-visual">
          <div className="hero-skeleton__image skeleton skeleton-circle" />
        </div>
      </div>
    </section>
  );
}

export default function Hero() {
  const [banners, setBanners] = useState([]);
  const [idx, setIdx] = useState(0);
  const [paused, setPaused] = useState(false);
  const timerRef = useRef(null);
  const [promoText, setPromoText] = useState(DEFAULT_PROMO_BANNER_TEXT);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setLoading(true);
        const list = await loadBanners();
        const filtered = list.filter((b) => b?.isActive !== false);
        filtered.sort(
          (a, b) =>
            (a?.order ?? 0) - (b?.order ?? 0) ||
            new Date(a?.createdAt || 0) - new Date(b?.createdAt || 0)
        );
        if (!mounted) return;
        setBanners(filtered);
        setIdx(0);
        if (filtered.length === 0) {
          console.warn("No banners found after all fallbacks.");
        }
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    let mounted = true;
    (async () => {
      const text = await fetchPromoBannerText();
      if (mounted) setPromoText(text);
    })();
    return () => {
      mounted = false;
    };
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
  const promoTextDisplay = (promoText || "").trim();

  const go = (dir) => {
    if (!banners.length) return;
    setIdx((i) => (i + dir + banners.length) % banners.length);
  };

  if (!current) return loading ? <HeroSkeleton /> : null;

  return (
    <section
      className="hero-section hero-rotator"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {/* Left content */}
      <div key={`content-${idx}`} className="hero-content fade-in fade-stagger">
        {promoTextDisplay && (
          <p className="hero-offer-banner">{promoTextDisplay}</p>
        )}
        <h1 className="hero-title">{title}</h1>

        <div className="specialty-button">
          <span role="button" tabIndex={0} onClick={() => (window.location.href = "/menu")}>
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

      {/* Right visual with ring images */}
      <div key={`image-${idx}`} className="hero-image fade-in">
        <div className="hero-visual fade-in">
          <div className="hero-figure fade-img crescent-left">
            {/* Yellow circle image */}
            <img src="/yellow.png" alt="yellow ring" className="hero-ring yellow-ring" />
            {/* Main product / banner image */}
            <img
              src={imgSrc(current?.primaryItem?.image || current?.items?.[0]?.image)}
              alt={title}
              className="hero-main-img"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
