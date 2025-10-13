import React, { useEffect, useMemo, useRef, useState } from 'react';
import axios from '../config/axios.config';

const ROTATE_MS = 4000;

function normalizeToArray(payload) {
  // Accept: {success, data: [...]} | {success, data: {...}} | [...]
  const data = payload?.data ?? payload;
  if (Array.isArray(data)) return data;
  if (Array.isArray(payload?.data?.docs)) return payload.data.docs;
  if (data && typeof data === 'object') return [data];
  return [];
}
const baseOrigin = import.meta.env.VITE_API_URL?.replace(/\/api\/?$/, '') || '';

const imgSrc = (menuImg) => {
  if (!menuImg) return '/Ellipse 14.png';
  return menuImg.startsWith('/uploads') ? `${baseOrigin}${menuImg}` : menuImg;
};

async function tryFetch(endpoint, params) {
  try {
    const res = await axios.get(endpoint, { params });
    return normalizeToArray(res);
  } catch (e) {
    if (e?.response?.status !== 404) console.warn(`GET ${endpoint} failed:`, e?.response?.data || e.message);
    return [];
  }
}

async function loadBanners() {
  // Try preferred path first, then fallback, with and without isActive
  let list =
    await tryFetch('banners', { isActive: true }) ||
    [];
  if (list.length === 0) list = await tryFetch('banners', {});
  if (list.length === 0) list = await tryFetch('hero-banners', { isActive: true });
  if (list.length === 0) list = await tryFetch('hero-banners', {});

  // Last resort: public active one
  if (list.length === 0) {
    const single = await tryFetch('banners/public/active/one', {});
    if (single.length) return single;
    return await tryFetch('hero-banners/public/active/one', {});
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

      // Filter out explicitly inactive banners only
      const filtered = list.filter(b => b?.isActive !== false);

      // Sort by order asc, then createdAt asc (handles undefined)
      filtered.sort((a, b) => (a?.order ?? 0) - (b?.order ?? 0)
        || new Date(a?.createdAt || 0) - new Date(b?.createdAt || 0));

      setBanners(filtered);
      setIdx(0);
      if (filtered.length === 0) {
        console.warn('No banners found after all fallbacks. Check BE mount path and axios baseURL.');
      }
    })();
  }, []);

  useEffect(() => {
    if (paused || banners.length <= 1) return;
    timerRef.current = setInterval(() => setIdx(i => (i + 1) % banners.length), ROTATE_MS);
    return () => clearInterval(timerRef.current);
  }, [paused, banners.length]);

  const current = banners[idx] || null;

  const title = useMemo(() => {
    if (!current) return 'CHARCOAL CHICKEN';
    return current?.primaryItem?.name
      || current?.items?.[0]?.name
      || 'CHARCOAL CHICKEN';
  }, [current]);

  const go = (dir) => {
    if (!banners.length) return;
    setIdx(i => (i + dir + banners.length) % banners.length);
  };

  if (!current) {
    // placeholder (no data)
    return (
      <section className="hero-section">
        <div className="hero-content">
          <p className="hero-offer-banner">Upto 30% off on Catering Menu</p>
          <h1 className="hero-title">CHARCOAL CHICKEN</h1>
          <div className="specialty-button">
            <span><img src='Group 1000002315.png'/></span>
             
          </div>
        </div>
        <div className="hero-image"><img src="/Ellipse 14.png" alt="Charcoal Chicken" /></div>
         
        <div className="hero-crescent"></div>
      </section>
    );
  }

  return (
    <section
      className="hero-section hero-rotator"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div className="hero-content fade-in">
        <p className="hero-offer-banner">Upto 30% off on Catering Menu</p>
        <h1 className="hero-title">{title}</h1>

        <div className="specialty-button">
            <span><img src='Group 1000002314.png'/></span>
          
        </div>

        {current.items?.length > 1 && (
          <div className="hero-chips">
            {current.items.slice(0, 5).map(m => (
              <span key={m._id} className="hero-chip">{m.name}</span>
            ))}
          </div>
        )}
      </div>

      <div className="hero-image fade-in">
  {/* Right: circular image with left crescents */}
      <div className="hero-visual fade-in">
        <div className="hero-figure">
          <img
            src={imgSrc(current?.primaryItem?.image || current?.items?.[0]?.image)}
            alt={title}
            loading="eager"
          />
        </div>
      </div>
</div>
      <div className="hero-crescent"></div>

      {banners.length > 1 && (
        <>
          <button className="hero-nav hero-prev" onClick={() => go(-1)} aria-label="Previous banner">‹</button>
          <button className="hero-nav hero-next" onClick={() => go(1)} aria-label="Next banner">›</button>

          <div className="hero-dots">
            {banners.map((_, i) => (
              <button
                key={i}
                className={`hero-dot ${i === idx ? 'active' : ''}`}
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
