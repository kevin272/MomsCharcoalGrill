import React, { useEffect, useMemo, useRef, useState } from "react";

const DATA = [
  { src: "/Ellipse 18.png", title: "Pasta", alt: "Pasta" },
  { src: "/Ellipse 14.png", title: "Chicken", alt: "Chicken" },
  { src: "/Ellipse 17.png", title: "Salad", alt: "Salad" },
  { src: "/Ellipse 19.png", title: "Chicken", alt: "Chicken" },
];

export default function MenuCarousel({ items = DATA, autoplay = true, interval = 4000 }) {
  const [index, setIndex] = useState(0);
  const wrap = (n) => (n + items.length) % items.length;
  const go = (i) => setIndex(wrap(i));
  const next = () => go(index + 1);
  const prev = () => go(index - 1);

  // Autoplay
  useEffect(() => {
    if (!autoplay || items.length <= 1) return;
    const id = setInterval(next, interval);
    return () => clearInterval(id);
  }, [index, autoplay, interval, items.length]);

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
  }, [next, prev]);

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
    const THRESH = 40; // px
    if (deltaX.current < -THRESH) next();
    else if (deltaX.current > THRESH) prev();
    startX.current = 0;
    deltaX.current = 0;
  };

  // Compute transform
  const trackStyle = useMemo(
    () => ({
      display: "flex",
      transition: "transform 400ms ease",
      transform: `translateX(-${index * 100}%)`,
      width: `${items.length * 100}%`,
    }),
    [index, items.length]
  );

  const slideStyle = {
    width: `${100 / items.length}%`,
    flex: "0 0 auto",
  };

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
      >
        <img src="/Vector.png" alt="Previous" />
      </button>

      {/* Track */}
      <div className="menu-items" style={{ overflow: "hidden" }}>
        <div className="menu-track" style={trackStyle}>
          {items.map((it, i) => (
            <div className="menu-item" style={slideStyle} key={i} aria-roledescription="slide" aria-label={`${it.title} (${i + 1} of ${items.length})`}>
              <img src={it.src} alt={it.alt || it.title} />
              <h3>{it.title}</h3>
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
      >
        <img src="/Vector-1.png" alt="Next" />
      </button>

      {/* Dots */}
      <div className="carousel-dots" aria-label="Select slide">
        {items.map((_, i) => (
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
    </section>
  );
}
