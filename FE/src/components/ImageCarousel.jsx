// src/components/common/ImageCarousel.jsx
import React, { useEffect, useMemo, useRef, useState } from "react";

export default function ImageCarousel({
  type = "menu",
  endpointBase = "/menu-slides",
  autoplay = true,
  interval = 4000,
  className = "",
}) {
  const API_BASE = import.meta.env.VITE_API_URL?.replace(/\/$/, "") || "";
  const SERVER_URL = API_BASE.replace(/\/api$/, "");

  const [slides, setSlides] = useState([]);
  const [index, setIndex] = useState(0);
  const timerRef = useRef(null);
  const pausedRef = useRef(false);

  const data = useMemo(() => (Array.isArray(slides) ? slides : []), [slides]);
  const len = data.length;
  const wrap = (n) => (len ? (n + len) % len : 0);

  const next = () => setIndex((i) => wrap(i + 1));
  const prev = () => setIndex((i) => wrap(i - 1));
  const go = (i) => setIndex(wrap(i));

  // Fetch slides
  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const r = await fetch(`${API_BASE}${endpointBase}?type=${encodeURIComponent(type)}&isActive=true`);
        const j = await r.json();
        if (!j?.success) throw new Error(j?.message || "Failed to load slides");
        if (alive) {
          setSlides(Array.isArray(j.data) ? j.data : []);
          setIndex(0);
        }
      } catch (e) {
        console.error("Carousel fetch error:", e);
        if (alive) {
          setSlides([]);
          setIndex(0);
        }
      }
    })();
    return () => {
      alive = false;
    };
  }, [API_BASE, endpointBase, type]);

  // Autoplay logic
  useEffect(() => {
    if (!autoplay || len <= 1 || pausedRef.current) return;
    timerRef.current && clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      next();
    }, interval);
    return () => clearTimeout(timerRef.current);
  }, [autoplay, interval, len, index]);

  const onMouseEnter = () => {
    pausedRef.current = true;
    clearTimeout(timerRef.current);
  };
  const onMouseLeave = () => {
    pausedRef.current = false;
    setIndex((i) => i);
  };

  if (!len) return null;
  const cur = data[index];

  const imgSrc = cur?.image?.startsWith("http")
    ? cur.image
    : `${SERVER_URL}${cur?.image || ""}`;

// inside ImageCarousel.jsx return(...)
return (
  <div className={`img-carousel ${className}`} style={{ position: "relative" }}>
    {/* wrap to position arrows outside the image but inside component */}
    <div className="img-carousel__wrap">
      {/* viewport */}
      <div
        className="img-carousel__viewport"
        style={{ position: "relative", overflow: "hidden", borderRadius: 12 }}
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
      >
        <a
          key={cur?._id || index}
          href={cur?.linkTo || undefined}
          className="img-carousel__slide"
          style={{ display: "block", position: "relative" }}
        >
          <img
            src={imgSrc}
            alt={cur?.title || "Slide"}
            className="img-carousel__image"
            loading="eager"
            style={{ width: "100%", height: "auto", display: "block" }}
          />
          {(cur?.title || cur?.caption) && (
            <div className="img-carousel__caption">
              {cur?.title && <h3>{cur.title}</h3>}
              {cur?.caption && <p>{cur.caption}</p>}
            </div>
          )}
        </a>
      </div>

      {/* arrows OUTSIDE the image */}
      {len > 1 && (
        <>
          <button className="img-carousel__nav img-carousel__nav--prev" onClick={prev} aria-label="Previous">
              <span className="arrow-mask"
              src="/vector.svg"             // <- CORRECT path for /public/vector.svg
              alt=""
              onError={(e) => {        // fallback if asset missing
                e.currentTarget.outerHTML = '<span style="font-size:28px;line-height:1">‹</span>';
              }}
            />
          </button>

          <button className="img-carousel__nav img-carousel__nav--next" onClick={next} aria-label="Next">
              <span className="arrow-mask arrow-mask--rtl"
              src="/vector.svg"
              alt=""
              style={{ transform: "scaleX(-1)" }}
              onError={(e) => {
                e.currentTarget.outerHTML = '<span style="font-size:28px;line-height:1">›</span>';
              }}
            />
          </button>
        </>
      )}

      {/* dots */}
      {len > 1 && (
        <div className="img-carousel__dots">
          {data.map((_, i) => (
            <button
              key={i}
              className={`img-carousel__dot ${i === index ? "is-active" : ""}`}
              onClick={() => go(i)}
              aria-label={`Go to slide ${i + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  </div>
);

}
