// src/pages/CateringMenu.jsx
import React from "react";
import { useParams } from "react-router-dom";
import { useCart } from "../context/CartContext.jsx";

const API_ORIGIN = (import.meta.env.VITE_API_URL || "http://localhost:5000").replace(/\/$/, "");

const toFileUrl = (f) =>
  f ? `${API_ORIGIN}/${f}` : "https://via.placeholder.com/480x320?text=Image";

const isHexId = (s = "") => /^[a-f0-9]{24}$/i.test(s);

export default function CateringMenu() {
  const { optionId } = useParams(); // expects /catering/package/:optionId
  const { addToCart } = useCart();

  const [option, setOption] = React.useState(null);
  const [items, setItems] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [err, setErr] = React.useState("");
  const [debug, setDebug] = React.useState(null); // shows raw error/body

  React.useEffect(() => {
    let alive = true;

    (async () => {
      setLoading(true);
      setErr("");
      setDebug(null);

      // 1) Try by ID if it looks like a Mongo ObjectId
      if (isHexId(optionId)) {
        const url = `${API_ORIGIN}/catering-options/${optionId}?populate=1`;
        try {
          const res = await fetch(url, { headers: { Accept: "application/json" } });
          const body = await res.json().catch(() => ({}));
          if (!res.ok || body?.success === false) {
            throw Object.assign(new Error(body?.message || res.statusText), { status: res.status, body });
          }
          const data = body?.data || body;
          if (!alive) return;
          setOption(data);
          setItems(
            (data.items || []).map((it) => ({
              id: it._id || it.id,
              name: it.name || it.title || "Item",
              price: Number(it.price || 0),
              description: it.description || "",
              image: it.image?.startsWith?.("http") ? it.image : toFileUrl(it.image),
            }))
          );
          setLoading(false);
          return;
        } catch (e) {
          if (!alive) return;
          setDebug({ where: "byId", url, error: String(e), status: e?.status, body: e?.body });
          // fall through to slug attempt
        }
      }

      // 2) Try by slug
      {
        const url = `${API_ORIGIN}/api/catering-options?slug=${encodeURIComponent(optionId)}&populate=1`;
        try {
          const res = await fetch(url, { headers: { Accept: "application/json" } });
          const body = await res.json().catch(() => ({}));
          if (!res.ok || body?.success === false) {
            throw Object.assign(new Error(body?.message || res.statusText), { status: res.status, body });
          }
          const arr = Array.isArray(body?.data) ? body.data : Array.isArray(body) ? body : [];
          const data = arr[0];
          if (!data) throw Object.assign(new Error("Option not found"), { status: 404, body });
          if (!alive) return;
          setOption(data);
          setItems(
            (data.items || []).map((it) => ({
              id: it._id || it.id,
              name: it.name || it.title || "Item",
              price: Number(it.price || 0),
              description: it.description || "",
              image: it.image?.startsWith?.("http") ? it.image : toFileUrl(it.image),
            }))
          );
          setLoading(false);
          return;
        } catch (e) {
          if (!alive) return;
          setErr(e?.body?.message || e.message || "Failed to load option");
          setDebug({ where: "bySlug", url, error: String(e), status: e?.status, body: e?.body });
          setLoading(false);
        }
      }
    })();

    return () => {
      alive = false;
    };
  }, [optionId]);

  const handleAddToCart = (it) => {
    addToCart({
      id: `menu-${it.id}`,
      name: it.name,
      price: it.price,
      image: it.image,
    });
  };

  if (loading) return <div className="container py-5 text-muted">Loading…</div>;
  if (err)
    return (
      <div className="container py-4">
        <div className="alert alert-danger mb-3">{err}</div>
        {debug && (
          <pre
            style={{
              background: "#0b1020",
              color: "#b6ffea",
              padding: "12px",
              borderRadius: 8,
              overflowX: "auto",
            }}
          >
{JSON.stringify({ optionId, ...debug }, null, 2)}
          </pre>
        )}
      </div>
    );
  if (!option) return null;

  // ——— below uses your HotDishes CSS so it matches that layout ———
  const priceHeader =
    option.priceType === "per_person"
      ? `(${Number(option.price || 0).toFixed(2)} per person)`
      : option.priceType === "per_tray"
      ? `(${Number(option.price || 0).toFixed(2)} per tray)`
      : `(${Number(option.price || 0).toFixed(2)})`;

  return (
    <div className="hot-dishes-page">
      <main className="hot-dishes-main">
        <div className="hot-dishes-hero">
          <div className="container">
            <h1 className="hot-dishes-title">
              {option.title?.toUpperCase() || "CATERING MENU"} {priceHeader}
            </h1>
            <p className="hot-dishes-subtitle">
              {option.feeds || ""} {option.minPeople ? `• Minimum ${option.minPeople} People` : ""}
            </p>
          </div>
        </div>

        <section className="hot-dishes-grid-section">
          <div className="container">
            <div className="hot-dishes-grid">
              {items.map((dish) => (
                <div key={dish.id} className="hot-dish-card">
                  <div className="hot-dish-image-container">
                    <img
                      src={dish.image}
                      alt={dish.name}
                      className="hot-dish-image"
                      onError={(e) => (e.currentTarget.src = "https://via.placeholder.com/480x320?text=Item")}
                    />
                  </div>
                  <div className="hot-dish-content">
                    <div className="hot-dish-header">
                      <h3 className="hot-dish-name">{dish.name}</h3>
                      <span className="hot-dish-price">Rs. {dish.price.toFixed(2)}</span>
                    </div>
                    <p className="hot-dish-description">{dish.description}</p>
                    <button className="hot-dish-cart-btn" onClick={() => handleAddToCart(dish)} aria-label="Add to cart">
                      {/* same cart icon as your HotDishes */}
                      <svg width="47" height="47" viewBox="0 0 47 47" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M37.6006 30.9731H12.9872L8.25391 12.0398H42.3339L37.6006 30.9731Z" fill="#FAEB30" />
                        <path d="M3.51953 6.35986H6.83286L8.25286 12.0399M8.25286 12.0399L12.9862 30.9732H37.5995L42.3329 12.0399H8.25286Z" stroke="#FAEB30" strokeWidth="1.28" strokeLinecap="round" strokeLinejoin="round" />
                        <path d="M12.9845 40.4399C14.553 40.4399 15.8245 39.1684 15.8245 37.5999C15.8245 36.0314 14.553 34.7599 12.9845 34.7599C11.416 34.7599 10.1445 36.0314 10.1445 37.5999C10.1445 39.1684 11.416 40.4399 12.9845 40.4399Z" stroke="#FAEB30" strokeWidth="1.28" strokeLinecap="round" strokeLinejoin="round" />
                        <path d="M37.5978 40.4399C39.1663 40.4399 40.4378 39.1684 40.4378 37.5999C40.4378 36.0314 39.1663 34.7599 37.5978 34.7599C36.0293 34.7599 34.7578 36.0314 34.7578 37.5999C34.7578 39.1684 36.0293 40.4399 37.5978 40.4399Z" stroke="#FAEB30" strokeWidth="1.28" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {option.description && (
              <p className="text-muted mt-4" style={{ maxWidth: 720 }}>
                {option.description}
              </p>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}
