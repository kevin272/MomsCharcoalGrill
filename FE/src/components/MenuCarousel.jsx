import React, { useEffect, useMemo, useRef, useState } from "react";
import axiosInstance from "../config/axios.config.js";

const BUCKETS = ["Chicken", "Salad", "Pasta", "Roll"];

const KEYWORDS = {
  Chicken: ["chicken","charcoal","roast","wings","drumstick","breast","thigh","tandoori","peri","bbq"],
  Salad: ["salad","coleslaw","slaw","greek","potato","pumpkin","asian","garden","caesar","vinaigrette"],
  Pasta: ["pasta","spaghetti","penne","fettuccine","alfredo","bolognese","lasagna","lasagne","mac","gnocchi"],
  Roll: ["roll","bread roll","wrap","shawarma","kebab","sub","tortilla","burrito"],
};

const CATEGORY_HINTS = {
  chicken: "Chicken", poultry: "Chicken",
  salad: "Salad", sides: "Salad",
  pasta: "Pasta", italian: "Pasta",
  roll: "Roll", rolls: "Roll", breads: "Roll", bakery: "Roll",
};

function scoreItemForBucket(item, bucket) {
  const name = String(item.name || "").toLowerCase();
  const cat  = String(item.category || "").toLowerCase();
  const img  = String(item.image || item.img || "").toLowerCase();
  const keys = KEYWORDS[bucket];

  let score = 0;
  keys.forEach((k) => { if (name.includes(k)) score += 5; });
  if (CATEGORY_HINTS[cat] === bucket) score += 6;
  keys.forEach((k) => { if (img.includes(k)) score += 2; });
  if (cat.includes(bucket.toLowerCase())) score += 3;

  return score;
}

function pickMatches(items = [], minScore = 1) {
  // returns [{ bucket, item, score }]
  const ranked = BUCKETS.map((b) => {
    const candidates = items
      .map((it, idx) => ({ it, idx, score: scoreItemForBucket(it, b) }))
      .filter(({ score }) => score >= minScore)
      .sort((a, b2) => b2.score - a.score);
    return { bucket: b, candidates };
  });

  const usedIdx = new Set();
  const chosen = [];
  for (const { bucket, candidates } of ranked) {
    const pick = candidates.find((c) => !usedIdx.has(c.idx));
    if (pick) {
      usedIdx.add(pick.idx);
      chosen.push({ bucket, item: pick.it, score: pick.score });
    }
  }
  return chosen;
}

export default function MenuCarousel({
  fetchUrl,
  autoplay = true,
  interval = 4000,
}) {
  const [index, setIndex] = useState(0);
  const [slides, setSlides] = useState([]);
  const [loading, setLoading] = useState(true);
  const [itemsPerPage, setItemsPerPage] = useState(() => {
    if (typeof window === "undefined") return 4;
    return window.matchMedia && window.matchMedia("(max-width: 768px)").matches ? 2 : 4;
  });

  const API_URL = (import.meta.env.VITE_API_URL || "").replace(/\/$/, "");
  const SERVER_URL = API_URL.replace(/\/api$/, "");

  const joinImageUrl = (path) => {
    if (!path) return "";
    if (/^https?:\/\//i.test(path)) return path;
    // If SERVER_URL is empty, leave relative path as-is
    if (!SERVER_URL) return path.startsWith("/") ? path : `/${path}`;
    return `${SERVER_URL}${path.startsWith("/") ? "" : "/"}${path}`;
  };

  // Chunk helper to build pages
  const chunk = (arr, size) => {
    const res = [];
    for (let i = 0; i < arr.length; i += size) res.push(arr.slice(i, i + size));
    return res;
  };

  // Build a list of cards (not capped); grouping happens later per page
  const buildCards = (data) => {
    if (!Array.isArray(data) || data.length === 0) return [];

    // prefer items that have an image we can render
    const withImg = data.filter((d) => !!(d?.image || d?.img));

    const topMatches = pickMatches(withImg, 1);
    const used = new Set(topMatches.map(({ item }) => item)); // same references, ok
    const remaining = withImg.filter((it) => !used.has(it));
    const secondMatches = pickMatches(remaining, 1);

    const safeText = (v, fallback = "") => {
      if (v == null) return fallback;
      if (typeof v === "object") return typeof v.name === "string" ? v.name : fallback;
      return String(v);
    };

    const toCard = (bucket, item) => ({
      title: safeText(bucket, ""),
      subtitle: safeText(item?.name, ""),
      src: joinImageUrl(item?.image || item?.img || ""),
      alt: safeText(item?.name, safeText(bucket, "")),
    });

    // Start with one per bucket (max 4)
    const firstWave = topMatches.map(({ bucket, item }) => toCard(bucket, item));

    // Fill any gaps (still keeping bucket titles consistent)
    const secondWave = secondMatches.map(({ bucket, item }) => toCard(bucket, item));

    // If still short, fallback to any remaining items with generic titles
    const fallback = remaining
      .filter((it) => !!(it?.image || it?.img))
      .map((it) => {
        const catName = typeof it?.category === "object" ? it?.category?.name : it?.category;
        const title = safeText(catName, "Featured");
        const name = safeText(it?.name, "");
        return { title, subtitle: name, src: joinImageUrl(it?.image || it?.img || ""), alt: name || title };
      });

    const combined = [...firstWave, ...secondWave, ...fallback].filter((c) => !!c.src);
    return combined;
  };

  useEffect(() => {
    let mounted = true;
    (async () => {
      setLoading(true);
      try {
        const url = fetchUrl || `${API_URL}/menu-items`;
        const res = await axiosInstance.get(url);
        const raw = Array.isArray(res.data?.data)
          ? res.data.data
          : (Array.isArray(res.data) ? res.data : []);
        const built = buildCards(raw);

        if (mounted) {
          setSlides(built);
          setIndex(0);
        }
      } catch (err) {
        if (mounted) {
          setSlides([]);
          setIndex(0);
        }
      } finally {
        mounted && setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, [fetchUrl, API_URL]);

  // Build pages of 4 items each
  const pages = useMemo(() => {
    if (slides.length === 0) return [];
    return chunk(slides, itemsPerPage);
  }, [slides, itemsPerPage]);

  const pageCount = pages.length; // 0 or 2
  const wrap = (n) => (n + Math.max(pageCount, 1)) % Math.max(pageCount, 1);
  const go = (i) => setIndex(wrap(i));
  const next = () => setIndex((i) => wrap(i + 1));
  const prev = () => setIndex((i) => wrap(i - 1));

  // Autoplay (only if we truly have 2 pages)
  useEffect(() => {
    if (!autoplay || pageCount <= 1) return;
    const id = setInterval(next, interval);
    return () => clearInterval(id);
  }, [autoplay, interval, pageCount]);

  // Update itemsPerPage on viewport changes (2 on mobile, 4 otherwise)
  useEffect(() => {
    if (typeof window === "undefined" || !window.matchMedia) return;
    const mql = window.matchMedia("(max-width: 768px)");
    const apply = () => setItemsPerPage(mql.matches ? 2 : 4);
    apply();
    mql.addEventListener ? mql.addEventListener("change", apply) : mql.addListener(apply);
    return () => {
      mql.removeEventListener ? mql.removeEventListener("change", apply) : mql.removeListener(apply);
    };
  }, []);

  // Ensure index stays in range if pageCount changes (e.g., on resize)
  useEffect(() => {
    setIndex((i) => (pageCount > 0 ? i % pageCount : 0));
  }, [pageCount]);

  // Keyboard arrows
  const rootRef = useRef(null);
  useEffect(() => {
    const el = rootRef.current;
    if (!el) return;
    const onKey = (e) => {
      if (e.key === "ArrowRight") next();
      if (e.key === "ArrowLeft") prev();
    };
    el.addEventListener("keydown", onKey);
    return () => el.removeEventListener("keydown", onKey);
  }, []);

  // Touch swipe
  const startX = useRef(0);
  const deltaX = useRef(0);
  const onTouchStart = (e) => {
    startX.current = e.touches[0].clientX;
    deltaX.current = 0;
  };
  const onTouchMove = (e) => {
    deltaX.current = e.touches[0].clientX - startX.current;
  };
  const onTouchEnd = () => {
    const THRESH = 40;
    if (deltaX.current < -THRESH) next();
    else if (deltaX.current > THRESH) prev();
    startX.current = 0;
    deltaX.current = 0;
  };

  // Styles use pageCount (not item count); rely on App.css for layout
  const trackStyle = useMemo(
    () => ({
      transform: `translateX(-${pageCount ? (index * (150 / pageCount)) : 0}%)`,
    }),
    [index, pageCount]
  );


  if (!loading && slides.length === 0) {
    return (
      <section className="menu-carousel empty" aria-label="Featured menu items" />
    );
  }

  return (
    <section
      className="menu-carousel"
      ref={rootRef}
      tabIndex={0}
      role="region"
      aria-roledescription="carousel"
      aria-label="Featured menu items"
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
    >
      {/* Prev */}
      <button
        type="button"
        className="carousel-nav prev"
        aria-label="Previous"
        onClick={prev}
        disabled={loading || pageCount <= 1}
      >
        <img src="/Vector.png" alt="Previous" />
      </button>

      {/* Track (each page shows 4 items) */}
      <div className="menu-items">
        <div className="menu-track" style={trackStyle}>
          {pages.map((group, pageIdx) => (
            <div
              className="menu-page"
              key={`page-${pageIdx}`}
              aria-roledescription="slide"
              aria-label={`Slide ${pageIdx + 1} of ${pageCount}`}
            >
              <div
                className="menu-page-inner"
              >
                {group.map((it, i) => (
                  <div className="menu-item" key={`${it.title}-${i}`}>
                    <img src={it.src} alt={it.alt || it.title} />
                    <h3>{it.title}</h3>                  </div>
                ))}
              </div>
            </div>
          ))}

        </div>
      </div>

      {/* Next */}
      <button
        type="button"
        className="carousel-nav next"
        aria-label="Next"
        onClick={next}
        disabled={loading || pageCount <= 1}
      >
        <img src="/Vector-1.png" alt="Next" />
      </button>

      {/* Dots */}
      {pageCount > 1 && (
        <div className="carousel-dots" aria-label="Select slide">
          {Array.from({ length: pageCount }).map((_, i) => (
            <span
              key={i}
              className={`dot ${i === index ? "active" : ""}`}
              onClick={() => go(i)}
              role="button"
              tabIndex={0}
              aria-label={`Go to slide ${i + 1}`}
              onKeyDown={(e) => e.key === "Enter" && go(i)}
            />
          ))}
        </div>
      )}
    </section>
  );
}
