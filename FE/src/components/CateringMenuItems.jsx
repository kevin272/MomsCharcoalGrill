import React, { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useCart } from "../context/CartContext.jsx";
import { useToast } from "./common/ToastProvider.jsx";

const DEFAULT_LIMITS = { chicken: 1, salad: 2, veggies: 2, breadroll: 1 };
const CATEGORY_ORDER = [
  { key: "chicken", label: "Chicken" },
  { key: "salad", label: "Salads" },
  { key: "veggies", label: "Veggies" },
  { key: "breadroll", label: "Bread Roll" },
];

const KEYWORDS = {
  chicken: ["chicken", "peri", "tandoori", "drum", "wing", "breast", "thigh"],
  salad: ["salad", "slaw", "coleslaw", "garden", "greek", "caesar"],
  veggies: ["veg", "veggie", "vegetable", "paneer", "broccoli", "spinach", "mushroom", "beans"],
  breadroll: ["roll", "bread", "bun", "pita", "tortilla", "wrap", "naan","Bread","Roll"],
};

function toPublicUrl(p, serverUrl) {
  if (!p) return "";
  if (/^https?:\/\//i.test(p)) return p;
  if (!serverUrl) return p.startsWith("/") ? p : `/${p}`;
  let rel = p.replace(/\\/g, "/");
  if (!rel.startsWith("/uploads/")) rel = `/uploads/${rel.replace(/^\/+/, "")}`;
  return `${serverUrl}${rel}`;
}

function normalizeLimits(selectionRules) {
  const base = { ...DEFAULT_LIMITS };
  if (!selectionRules?.enabled) return base;
  const raw = selectionRules.categoryLimits instanceof Map
    ? Object.fromEntries(selectionRules.categoryLimits)
    : selectionRules.categoryLimits || {};
  Object.entries(raw).forEach(([key, val]) => {
    const n = Number(val);
    if (!Number.isNaN(n)) base[key] = n;
  });
  return base;
}

function scoreForCategory(item, key) {
  const name = String(item.name || "").toLowerCase();
  const cat = String(item.categoryName || item.categorySlug || "").toLowerCase();
  const words = KEYWORDS[key] || [];
  let score = 0;
  words.forEach((w) => {
    if (name.includes(w)) score += 5;
    if (cat.includes(w)) score += 3;
  });
  return score;
}

function detectCategory(item) {
  let best = { key: null, score: 0 };
  CATEGORY_ORDER.forEach(({ key }) => {
    const score = scoreForCategory(item, key);
    if (score > best.score) best = { key, score };
  });
  return best.score > 0 ? best.key : null;
}

function normalizeItems(option, serverUrl) {
  const configs = Array.isArray(option?.itemConfigurations) ? option.itemConfigurations : [];
  if (configs.length) {
    return configs.map((cfg, idx) => {
      const menu = cfg?.menuItem || cfg;
      const id = String(menu?._id || menu?.id || cfg?._id || cfg?.id || idx);
      const extraOptions = Array.isArray(cfg?.extraOptions) ? cfg.extraOptions.filter(Boolean) : [];
      return {
        id,
        menuItemId: menu?._id || menu?.id || id,
        name: menu?.name || cfg?.name || `Item ${idx + 1}`,
        description: menu?.description || "",
        image: toPublicUrl(menu?.image || option?.image || "", serverUrl),
        categoryName: menu?.category?.name || menu?.category?.slug || "",
        categorySlug: menu?.category?.slug || "",
        price: typeof option?.price === "number"
          ? option.price
          : (typeof menu?.price === "number" ? menu.price : 0),
        extraOptions,
      };
    });
  }
  if (Array.isArray(option?.items) && option.items.length) {
    return option.items.map((raw, idx) => {
      const name = typeof raw === "string" ? raw : (raw?.name || `Item ${idx + 1}`);
      return {
        id: String(raw?._id || raw?.id || idx),
        menuItemId: raw?._id || raw?.id || null,
        name,
        description: raw?.description || "",
        image: toPublicUrl(raw?.image || option?.image || "", serverUrl),
        categoryName: raw?.category?.name || raw?.category?.slug || "",
        categorySlug: raw?.category?.slug || "",
        price: typeof option?.price === "number" ? option.price : (typeof raw?.price === "number" ? raw.price : 0),
        extraOptions: [],
      };
    });
  }
  return [];
}

function formatPrice(option) {
  if (!option) return "";
  const val = typeof option.price === "number" ? option.price : null;
  if (val == null) return "";
  switch (option.priceType) {
    case "per_person": return `$${val.toFixed(2)} per person`;
    case "per_tray": return `$${val.toFixed(2)} / tray`;
    case "fixed": return `$${val.toFixed(2)}`;
    default: return `$${val.toFixed(2)}`;
  }
}

export default function CateringMenuItems() {
  const { optionId } = useParams();
  const toast = useToast();
  const { addToCart } = useCart();

  const API_URL = useMemo(
    () => (import.meta.env.VITE_API_URL || "http://localhost:5000/api").replace(/\/+$/, ""),
    []
  );
  const SERVER_URL = useMemo(() => API_URL.replace(/\/api$/, ""), [API_URL]);

  const [pkg, setPkg] = useState(null);
  const [items, setItems] = useState([]);
  const [quantities, setQuantities] = useState({});
  const [selectedExtras, setSelectedExtras] = useState({});
  const [extrasModal, setExtrasModal] = useState({ open: false, item: null, delta: 1 });
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmQty, setConfirmQty] = useState(1);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  useEffect(() => {
    let alive = true;
    setLoading(true);
    setErr("");
    // simple local cache to avoid re-fetching every visit
    const TTL = 5 * 60 * 1000; // 5 minutes
    const key = `mcg:catering:option:${optionId}`;
    try {
      const cached = JSON.parse(localStorage.getItem(key) || 'null');
      if (cached && cached.exp > Date.now() && cached.option && Array.isArray(cached.items)) {
        setOption(cached.option);
        setItems(cached.items);
        setLoading(false);
        // Short-circuit: fresh cache, skip network
        return () => { alive = false; };
      }
    } catch {}

    (async () => {
      setLoading(true);
      setErr("");
      setDebug(null);

      // 1) Try by ObjectId
      if (isHexId(optionId)) {
        const url = `${API_URL}/catering-options/${optionId}?populate=1`;
        try {
          const res = await fetch(url, { headers: { Accept: "application/json" } });
          const body = await res.json().catch(() => ({}));
          if (!res.ok || body?.success === false) {
            throw Object.assign(new Error(body?.message || res.statusText), { status: res.status, body });
          }
          const data = body?.data || body;
          if (!alive) return;
          const mapped = (data.items || []).map((it) => ({
              id: it._id || it.id,
              name: it.name || it.title || "Item",
              price: Number(it.price || 0),
              description: it.description || "",
              image: toPublicUrl(it.image) || PLACEHOLDER,
              glutenFree: !!(it.glutenFree || it.isGlutenFree || /\bgluten\s*-?\s*free\b/i.test(String(it.name||"") + " " + String(it.description||"")) || /\(\s*gf\s*\)/i.test(String(it.name||""))),
            }))
          setOption(data);
          setItems(mapped);
          try { localStorage.setItem(key, JSON.stringify({ exp: Date.now() + TTL, option: data, items: mapped })); } catch {}
          setLoading(false);
          return;
        } catch (e) {
          if (!alive) return;
          setDebug({ where: "byId", url, error: String(e), status: e?.status, body: e?.body });
          // fallthrough
        }
      }

      // 2) Try by slug (FIX: do NOT double /api)
      {
        const url = `${API_URL}/catering-options?slug=${encodeURIComponent(optionId)}&populate=1`;
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
          const mapped = (data.items || []).map((it) => ({
              id: it._id || it.id,
              name: it.name || it.title || "Item",
              price: Number(it.price || 0),
              description: it.description || "",
              image: toPublicUrl(it.image) || PLACEHOLDER,
              glutenFree: !!(it.glutenFree || it.isGlutenFree || /\bgluten\s*-?\s*free\b/i.test(String(it.name||"") + " " + String(it.description||"")) || /\(\s*gf\s*\)/i.test(String(it.name||""))),
            }))
          setOption(data);
          setItems(mapped);
          try { localStorage.setItem(key, JSON.stringify({ exp: Date.now() + TTL, option: data, items: mapped })); } catch {}
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
      glutenFree: !!it.glutenFree,
    });
  };

  const handleSaveExtras = (optionList, applyDelta = true) => {
    if (!extrasModal.item) return;
    setSelectedExtras((prev) => ({ ...prev, [extrasModal.item.id]: optionList }));
    setExtrasModal({ open: false, item: null, delta: 1 });
    if (applyDelta) updateQty(extrasModal.item, extrasModal.delta || 1, { skipExtrasPrompt: true });
  };

  const openConfirmModal = () => {
    if (!totalSelected) {
      toast.info("Pick at least one item before adding to cart.");
      return;
    }
    if (isGeneral) {
      const missing = CATEGORY_ORDER.filter(
        ({ key }) => (categoryLimits[key] ?? 0) > 0 && (selectedCounts[key] || 0) < (categoryLimits[key] ?? 0)
      );
      if (missing.length) {
        const msg = missing
          .map(({ key, label }) => `${label}: ${selectedCounts[key] || 0}/${categoryLimits[key] ?? 0}`)
          .join(" | ");
        toast.error(`Select required items first (${msg}).`);
        return;
      }
    }
    setConfirmOpen(true);
  };

  const addSelectionToCart = () => {
    const multiplier = Math.max(1, Number(confirmQty) || 1);
    const chosen = items
      .map((it) => ({
        it,
        qty: quantities[it.id] || 0,
        extras: selectedExtras[it.id] || [],
      }))
      .filter(({ qty }) => qty > 0);

    if (isGeneral) {
      const summary = chosen
        .map(({ it, qty, extras }) => {
          const extraTxt = extras.length ? ` (${extras.join(", ")})` : "";
          return `${it.name} x${qty}${extraTxt}`;
        })
        .join(" • ");

      const selectionKey = chosen
        .map(({ it, qty, extras }) => `${it.id}:${qty}:${extras.join("+")}`)
        .join("|") || "default";

      addToCart({
        id: `catering-${pkg?._id || optionId}-general-${selectionKey}`,
        name: `${pkg?.title || "General Catering"} (per person)`,
        price: packagePrice,
        image: pkg?.image || chosen[0]?.it?.image,
        quantity: multiplier,
        extra: summary,
      });
    } else {
      chosen.forEach(({ it, qty, extras }) => {
        const extraLabel = Array.isArray(extras) && extras.length ? extras.join(", ") : "";
        addToCart({
          id: `catering-${pkg?._id || optionId}-${it.id}-${extraLabel || "plain"}`,
          name: `${pkg?.title || "Catering"} - ${it.name}`,
          price: typeof it.price === "number" ? it.price : packagePrice,
          image: it.image || pkg?.image,
          quantity: qty * multiplier,
          extra: extraLabel,
          menuItem: it.menuItemId,
        });
      });
    }

    setConfirmOpen(false);
    setConfirmQty(1);
    setQuantities({});
    setSelectedExtras({});
  };

  const renderItemCard = (item) => {
    const qty = quantities[item.id] || 0;
    const hasExtras = Array.isArray(item.extraOptions) && item.extraOptions.length > 0;
    const displayPrice = isGeneral
      ? (packagePrice ? `$${packagePrice.toFixed(2)} per person` : "Per person")
      : `$${Number(item.price || pkg?.price || 0).toFixed(2)}`;
    return (
      <div key={item.id} className="hot-dish-card">
        <div className="hot-dish-hover-bg" aria-hidden />
        <div className="hot-dish-image-container">
          <img
            src={item.image || "https://via.placeholder.com/480x320?text=Catering"}
            alt={item.name}
            className="hot-dish-image"
          />
        </div>
        <div className="hot-dish-content">
          <div className="hot-dish-header">
            <h3 className="hot-dish-name">{item.name}</h3>
            <span className="hot-dish-price">{displayPrice}</span>
          </div>
          {item.description && <p className="hot-dish-description">{item.description}</p>}
          {hasExtras && (
            <p className="text-xs opacity-80 mt-1">
              Extras available
              {selectedExtras[item.id]?.length ? `: ${selectedExtras[item.id].join(", ")}` : ""}
            </p>
          )}
          <div className="quantity-controls mt-3">
            <button className="quantity-btn" onClick={() => updateQty(item, -1)} aria-label={`Remove ${item.name}`}>
              -
            </button>
            <div className="quantity-display">{qty}</div>
            <button className="quantity-btn" onClick={() => updateQty(item, 1)} aria-label={`Add ${item.name}`}>
              +
            </button>
          </div>
        </div>
      </div>
    );
  };

  if (loading) return <div className="container py-10 text-gray-700">Loading...</div>;
  if (err) return <div className="container py-10 text-red-600">{err}</div>;
  if (!pkg) return <div className="container py-10">Not found.</div>;

  const priceLabel = formatPrice(pkg);

  return (
    <div className="option-menu-page">
      <main className="hot-dishes-main">
        <div className="hot-dishes-hero">
          <div className="container">
            <h1 className="hot-dishes-title">{pkg.title || "CATERING MENU"}</h1>
            <p className="hot-dishes-subtitle">
              Minimum {pkg.minPeople || 0} people {priceLabel && <span className="opacity-80">- {priceLabel}</span>}
            </p>
            {!!pkg.description && <p className="mt-2 opacity-80">{pkg.description}</p>}
            {isGeneral && (
              <p className="mt-3 text-sm opacity-80">
                General catering lets you choose {categoryLimits.chicken} chicken, {categoryLimits.salad} salad,
                {` ${categoryLimits.veggies} veggies and ${categoryLimits.breadroll} bread roll option(s).`}
              </p>
            )}
          </div>
        </div>

        <section className="hot-dishes-grid-section">
          <div className="container">
            {!items.length && <p>No menu available for this option.</p>}

            {isGeneral ? (
              <div className="space-y-8">
                {CATEGORY_ORDER.map(({ key, label }) => (
                  <div key={key}>
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-lg font-semibold">{label}</h3>
                      <span className="text-sm opacity-80">
                        {selectedCounts[key] || 0} / {categoryLimits[key] ?? 0} selected
                      </span>
                    </div>
                    <div className="hot-dishes-grid">
                      {(groupedItems.groups[key] || []).length
                        ? groupedItems.groups[key].map((it) => renderItemCard(it))
                        : <p className="opacity-70 text-sm">No {label.toLowerCase()} available.</p>}
                    </div>
                  </div>
                ))}

                {/* {groupedItems.others.length > 0 && (
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-lg font-semibold">Other items</h3>
                      <span className="text-sm opacity-80">Optional extras</span>
                      {dish.glutenFree && (
                        <span className="gf-badge" aria-label="Gluten free">GF</span>
                      )}
                    </div>
                    <div className="hot-dishes-grid">
                      {groupedItems.others.map((it) => renderItemCard(it))}
                    </div>
                  </div>
                )} */}
              </div>
            ) : (
              <div className="hot-dishes-grid">
                {items.map((it) => renderItemCard(it))}
              </div>
            )}

            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="text-sm opacity-80">
                Selected: {totalSelected} item{totalSelected === 1 ? "" : "s"}
              </div>
              <div className="flex gap-3">
                <Link to="/catering" className="underline">Back to Catering</Link>
                <button className="hot-dish-cart-btn" onClick={openConfirmModal}>
                  ADD TO CART
                </button>
              </div>
            </div>
          </div>
        </section>
      </main>

      {extrasModal.open && extrasModal.item && (
        <div className="modal-overlay">
          <div className="customer-details-modal extras-modal">
            <div className="modal-header mb-1">
              <p className="extras-kicker">Extras for</p>
              <h3>{extrasModal.item.name}</h3>
              <p className="extras-subtext">Tick the extras you want. Leave blank if none.</p>
            </div>
            <div className="extra-options-grid">
              {extrasModal.item.extraOptions.map((opt) => {
                const checked = (selectedExtras[extrasModal.item.id] || []).includes(opt);
                return (
                  <label key={opt} className={`extra-option ${checked ? "is-checked" : ""}`}>
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={(e) => {
                        setSelectedExtras((prev) => {
                          const current = new Set(prev[extrasModal.item.id] || []);
                          if (e.target.checked) current.add(opt);
                          else current.delete(opt);
                          return { ...prev, [extrasModal.item.id]: Array.from(current) };
                        });
                      }}
                    />
                    <span>{opt}</span>
                  </label>
                );
              })}
              {!extrasModal.item.extraOptions.length && (
                <p className="text-sm opacity-75">No extra options available.</p>
              )}
            </div>
            <div className="extras-actions">
              <button className="modal-submit-btn secondary" onClick={() => handleSaveExtras([], true)}>
                Skip
              </button>
              <button className="modal-submit-btn" onClick={() => handleSaveExtras(selectedExtras[extrasModal.item.id] || [])}>
                Save & Add
              </button>
            </div>
          </div>
        </div>
      )}

      {confirmOpen && (
        <div className="modal-overlay">
          <div className="customer-details-modal">
            <div className="modal-header">
              <h3>{isGeneral ? "How many people are you catering for?" : "How many sets to add?"}</h3>
            </div>
            <div className="customer-form">
              <input
                type="number"
                min="1"
                value={confirmQty}
                onChange={(e) => setConfirmQty(e.target.value)}
                placeholder={isGeneral ? "Number of people" : "Number of sets"}
              />
              {isGeneral && packagePrice ? (
                <p className="text-sm opacity-80 mt-1">Price: ${packagePrice.toFixed(2)} per person</p>
              ) : null}
            </div>
            <button className="modal-submit-btn mt-2" onClick={addSelectionToCart}>
              CONFIRM
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
