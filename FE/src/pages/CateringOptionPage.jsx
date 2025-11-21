import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useCart } from "../context/CartContext.jsx";

const API_URL = (import.meta.env.VITE_API_URL || "http://localhost:5000/api").replace(/\/+$/, "");

export default function CateringOptionPage() {
  // NOTE: we keep your same param name so routes don't change
  const { optionId } = useParams(); // this is the package _id now
  const { addToCart } = useCart();

  const [pkg, setPkg] = useState(null);
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(true);
  // Badge-only: detect GF from item label text
  const isGfLabel = (name) => /\bgluten\s*-?\s*free\b/i.test(String(name)) || /\(\s*gf\s*\)/i.test(String(name));

  useEffect(() => {
    let alive = true;
    const controller = new AbortController();
    const TTL = 5 * 60 * 1000;
    const key = `mcg:catering:pkg:${API_URL}:${optionId}`;
    try {
      const cached = JSON.parse(localStorage.getItem(key) || 'null');
      if (cached && cached.exp > Date.now() && cached.pkg) {
        setPkg(cached.pkg);
        setLoading(false);
        return () => { alive = false; };
      }
    } catch {}

    (async () => {
      const url = `${API_URL}/catering-packages/${optionId}`;
      setLoading(true);
      setErr("");
      try {
        const r = await fetch(url, {
          signal: controller.signal,
          headers: { Accept: "application/json" },
        });
        const j = await r.json();
        if (!r.ok || !j.success) throw new Error(j.message || `Failed to load package`);
        if (alive) {
          setPkg(j.data);
          try { localStorage.setItem(key, JSON.stringify({ exp: Date.now() + TTL, pkg: j.data })); } catch {}
        }
      } catch (e) {
        if (alive && e?.name !== "AbortError") setErr(e.message);
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => {
      alive = false;
      controller.abort();
    };
  }, [optionId]);

  const unitPrice =
    pkg && (pkg.perPersonPrice ?? pkg.trayPrice ?? 0);

  const addItemToCart = (name) => {
    // keep your simple addToCart shape
    addToCart({
      id: `${optionId}:${name}`,           // stable composite id
      name,
      price: Number(unitPrice) || 0,       // per person OR per tray baseline
      image: pkg?.image,
      glutenFree: isGfLabel(name),
    });
  };

  if (loading) return <div className="container py-10">Loading…</div>;
  if (err) return <div className="container py-10 text-red-600">{err}</div>;
  if (!pkg) return <div className="container py-10">Not found.</div>;

  const priceLabel =
    pkg.perPersonPrice !== undefined && pkg.perPersonPrice !== ""
      ? `$${Number(pkg.perPersonPrice).toFixed(2)} / person`
      : pkg.trayPrice !== undefined && pkg.trayPrice !== ""
      ? `$${Number(pkg.trayPrice).toFixed(2)} / tray`
      : "";

  return (
    <div className="option-menu-page">
      <main className="hot-dishes-main">
        <div className="hot-dishes-hero">
          <div className="container">
            <h1 className="hot-dishes-title">{pkg.title || "CATERING MENU"}</h1>
            <p className="hot-dishes-subtitle">
              Minimum {pkg.minPeople} people {priceLabel && `• ${priceLabel}`}
            </p>
            {!!pkg.description && (
              <p className="mt-2 opacity-80">{pkg.description}</p>
            )}
          </div>
        </div>

        <section className="hot-dishes-grid-section">
          <div className="container">
            {(!pkg.items || pkg.items.length === 0) && (
              <p>No menu available for this option.</p>
            )}

            <div className="hot-dishes-grid">
              {(pkg.items || []).map((name, idx) => (
                <div key={idx} className="hot-dish-card">
                    <div className="hot-dish-hover-bg" aria-hidden />

                  <div className="hot-dish-image-container">
                    <img
                      src={pkg.image || "https://via.placeholder.com/640x480?text=Catering+Item"}
                      alt={name}
                      className="hot-dish-image"
                    />
                    
                  </div>
                  
                  <div className="hot-dish-content">
                    <div className="hot-dish-header">
                      {isGfLabel(name) && (
                        <span className="gf-badge" aria-label="Gluten free">GF</span>
                      )}
                      <h3 className="hot-dish-name">{name}</h3>
                      {unitPrice ? (
                        <span className="hot-dish-price">
                          ${Number(unitPrice).toFixed(2)}
                        </span>
                      ) : null}
                      </div>
                      <button
                        className="hot-dish-cart-btn"
                        aria-label="Add to cart"
                        onClick={() => addItemToCart(name)}
                      >
                        <svg
                          width="28"
                          height="28"
                          viewBox="0 0 47 47"
                          fill="currentColor"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path d="M37.6006 30.9731H12.9872L8.25391 12.0398H42.3339L37.6006 30.9731Z" fill="currentColor"/>
                          <path d="M3.51953 6.35986H6.83286L8.25286 12.0399M8.25286 12.0399L12.9862 30.9732H37.5995L42.3329 12.0399H8.25286Z" stroke="currentColor" strokeWidth="1.28" strokeLinecap="round" strokeLinejoin="round"/>
                          <path d="M12.9845 40.4399C14.553 40.4399 15.8245 39.1684 15.8245 37.5999C15.8245 36.0314 14.553 34.7599 12.9845 34.7599C11.416 34.7599 10.1445 36.0314 10.1445 37.5999C10.1445 39.1684 11.416 40.4399 12.9845 40.4399Z" stroke="currentColor" strokeWidth="1.28" strokeLinecap="round" strokeLinejoin="round"/>
                          <path d="M37.5978 40.4399C39.1663 40.4399 40.4378 39.1684 40.4378 37.5999C40.4378 36.0314 39.1663 34.7599 37.5978 34.7599C36.0293 34.7599 34.7578 36.0314 34.7578 37.5999C34.7578 39.1684 36.0293 40.4399 37.5978 40.4399Z" stroke="currentColor" strokeWidth="1.28" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="option-nav">
              <Link to="/" className="option-nav-link">Back to Home</Link>
              <Link to="/catering" className="option-nav-link option-nav-link--primary">Back to Catering</Link>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
