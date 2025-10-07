import React, { useEffect, useMemo, useRef, useState } from "react";
import axiosInstance from "../config/axios.config";
import Breadcrumb from "../components/CateringHero";
import GLightbox from "glightbox";
import "glightbox/dist/css/glightbox.min.css";

// ---- URL helpers ----
const API_URL = (import.meta.env.VITE_API_URL || "http://localhost:5000/api").replace(/\/+$/, "");
const SERVER_URL = API_URL.replace(/\/api$/, "");

// Join absolute/relative image URLs safely
const toImgUrl = (u = "") => {
  if (!u) return "";
  try { return new URL(u, SERVER_URL).href; } catch { return u; }
};

// Parse various sendResponse shapes safely
const toArray = (body) =>
  Array.isArray(body?.data?.data) ? body.data.data :
  Array.isArray(body?.data?.items) ? body.data.items :
  Array.isArray(body?.data)        ? body.data :
  Array.isArray(body)              ? body :
  [];

// Split an array into chunks (keep your arrows/dots UX)
const chunk = (arr, size = 20) => {
  const out = [];
  for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size));
  return out;
};

export default function Gallery() {
  const [items, setItems]   = useState([]);
  const [loading, setLoad]  = useState(true);
  const [error, setError]   = useState("");
  const [currentPage, setCurrentPage] = useState(0);

  const lightboxRef = useRef(null);

  // Fetch once
  useEffect(() => {
    let alive = true;
    (async () => {
      setLoad(true); setError("");
      try {
        const res = await axiosInstance.get("/gallery"); // adjust if needed
        const list = toArray(res).filter(Boolean);

        if (!alive) return;
        const normalized = list.map((g, i) => ({
          id: g._id || g.id || String(i),
          image: toImgUrl(g.image || g.url || g.src || ""),
          thumb: toImgUrl(g.thumb || g.thumbnail || g.image || g.url || ""),
        }));

        setItems(normalized);
        setCurrentPage(0);
      } catch (e) {
        console.error(e);
        setError(e?.response?.data?.message || e?.message || "Failed to load gallery.");
      } finally {
        if (alive) setLoad(false);
      }
    })();
    return () => { alive = false; };
  }, []);

  // Keep your paging (20 per page)
  const pages = useMemo(() => chunk(items, 20), [items]);
  const totalPages = pages.length || 1;
  const currentImages = pages[currentPage] || [];

  // (Re)initialize GLightbox whenever the page of images changes
  useEffect(() => {
    // Destroy any previous instance to avoid duplicates
    if (lightboxRef.current) {
      try { lightboxRef.current.destroy(); } catch {}
      lightboxRef.current = null;
    }

    // Only init when there are anchors on the page
    if (currentImages.length) {
      lightboxRef.current = GLightbox({
        selector: '.glightbox-item',
        touchNavigation: true,
        loop: true,
        autoplayVideos: false,
        plyr: { css: '', js: '' }, // keeps bundle lean when no videos
      });
    }

    // Cleanup on unmount
    return () => {
      if (lightboxRef.current) {
        try { lightboxRef.current.destroy(); } catch {}
        lightboxRef.current = null;
      }
    };
  }, [currentImages]);

  const handlePrevPage = () => setCurrentPage(p => (p > 0 ? p - 1 : totalPages - 1));
  const handleNextPage = () => setCurrentPage(p => (p < totalPages - 1 ? p + 1 : 0));
  const handleDotClick = (i) => setCurrentPage(i);

  return (
    <div className="gallery-page">
      <Breadcrumb
        title="Gallery"
        backgroundImage="https://api.builder.io/api/v1/image/assets/TEMP/8f3784c8c4f948c9b9545fa1d56598510743f14c?width=3456"
      />

      <section className="gallery-grid-section">
        <div className="gallery-container">
          {loading && <div style={{ padding: 32, textAlign: "center" }}>Loading gallery…</div>}
          {!!error && !loading && (
            <div style={{ padding: 32, textAlign: "center", color: "crimson" }}>
              {error}
            </div>
          )}

          {!loading && !error && (
            <>
              {/* Left Arrow */}
              <button
                className="gallery-nav-arrow gallery-nav-left"
                onClick={handlePrevPage}
                aria-label="Previous page"
              >
                {/* keep your SVGs */}
                <svg width="79" height="40" viewBox="0 0 79 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M17.2671 0.0556641L0 9.53243L17.2671 19.0299L22.5714 16.098L10.6086 9.53243L22.5714 2.96683L17.2671 0.0556641Z" fill="black"/>
                  <path d="M39.1614 0.0556641L33.8571 2.96683L45.82 9.53243L33.8571 16.098L39.1614 19.0299L56.4286 9.53243L39.1614 0.0556641Z" fill="black"/>
                  <path d="M73.6957 16.9445L43.2619 33.6476L29.4557 26.0497L24.1514 28.9608L43.2619 39.4699L79 19.8557L73.6957 16.9445Z" fill="black"/>
                </svg>
              </button>

              {/* Gallery Grid + GLightbox anchors */}
              <div className="gallery-grid">
                {currentImages.map((img) => (
                  <div key={img.id} className="gallery-image-container">
                    <a
                      href={img.image}
                      className="glightbox-item"
                      data-gallery="moms-gallery"
                      data-title={img.title}
                      data-description={img.description}
                    >
                      <img
                        src={img.thumb || img.image}
                        alt={img.title}
                        className="gallery-image"
                        loading="lazy"
                      />
                    </a>
                  </div>
                ))}
              </div>

              {/* Right Arrow */}
              <button
                className="gallery-nav-arrow gallery-nav-right"
                onClick={handleNextPage}
                aria-label="Next page"
              >
                <svg width="79" height="41" viewBox="0 0 79 41" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M61.7329 0.0881348L79 9.8817L61.7329 19.6966L56.4286 16.6668L68.3914 9.8817L56.4286 3.09662L61.7329 0.0881348Z" fill="black"/>
                  <path d="M39.8386 0.0881348L45.1429 3.09662L33.18 9.8817L45.1429 16.6668L39.8386 19.6966L22.5714 9.8817L39.8386 0.0881348Z" fill="black"/>
                  <path d="M5.30426 17.5416L35.7381 34.803L49.5443 26.9511L54.8486 29.9596L35.7381 40.82L0 20.5501L5.30426 17.5416Z" fill="black"/>
                </svg>
              </button>

              {/* Dots */}
              <div className="carousel-dots" style={{ marginTop: 16 }}>
                {Array.from({ length: totalPages }).map((_, i) => (
                  <span
                    key={i}
                    className={`dot ${i === currentPage ? "active" : ""}`}
                    onClick={() => handleDotClick(i)}
                    style={{ cursor: "pointer" }}
                  />
                ))}
              </div>
            </>
          )}
        </div>
      </section>
    </div>
  );
}
