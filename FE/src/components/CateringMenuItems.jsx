// src/pages/CateringMenu.jsx
import React from "react";
import { useParams } from "react-router-dom";
import { useCart } from "../context/CartContext.jsx";
import { useToast } from "./common/ToastProvider.jsx";
import axiosInstance from "../config/axios.config.js";

const API_URL = (import.meta.env.VITE_API_URL || "http://localhost:5000/api").replace(/\/+$/, "");
const SERVER_URL = API_URL.replace(/\/api$/, ""); // http://localhost:5000

// Build a public URL from whatever BE stored (filename OR /uploads/... OR absolute)
function toPublicUrl(p) {
  if (!p) return "";
  if (/^https?:\/\//i.test(p)) return p; // already absolute
  let rel = String(p).replace(/\\/g, "/");
  if (!rel.startsWith("/uploads/")) rel = "/uploads/" + rel.replace(/^\/+/, "");
  return `${SERVER_URL}${rel}`;
}

const PLACEHOLDER = "https://via.placeholder.com/480x320?text=Item";
const isHexId = (s = "") => /^[a-f0-9]{24}$/i.test(s);
const categoryKey = (cat) => {
  const raw = (cat?.slug || cat?.name || "").toLowerCase();
  if (raw.includes("chicken"||"Chicken")) return "chicken";
  if (raw.includes("salad")) return "salad";
  if (raw.includes("veg")) return "veggies";
  if (raw.includes("bread"||"Bread")) return "breadroll";
  return raw || "other";
};
const CATEGORY_LABEL = {
  chicken: "Chicken",
  salad: "Salad",
  veggies: "Veggies",
  breadroll: "Bread Roll",
  other: "Other",
};

function DishImage({ src, alt, className }) {
  const [broken, setBroken] = React.useState(false);
  return (
    <img
      src={broken ? PLACEHOLDER : src || PLACEHOLDER}
      alt={alt}
      className={className}
      onError={() => setBroken(true)}
      loading="lazy"
    />
  );
}

export default function CateringMenu() {
  const { optionId } = useParams(); // /catering/package/:optionId
  const { addToCart, items: cartItems } = useCart();
  const toast = useToast();

  const [option, setOption] = React.useState(null);
  const [items, setItems] = React.useState([]);
  const [allMenuItems, setAllMenuItems] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [err, setErr] = React.useState("");
  const [debug, setDebug] = React.useState(null);
  const [extraChoice, setExtraChoice] = React.useState({});
  const [selectedCategory, setSelectedCategory] = React.useState("");
  const [modalItem, setModalItem] = React.useState(null); // for general catering item-level modal
  const [modalExtra, setModalExtra] = React.useState("");
  const [modalPeople, setModalPeople] = React.useState(0);
  const [selectedCounts, setSelectedCounts] = React.useState({}); // non-general: item selections via +/- 
  const [bulkModalOpen, setBulkModalOpen] = React.useState(false); // non-general: final "add to cart" modal

  const limits = React.useMemo(() => {
    if (option?.selectionRules?.enabled) {
      return option.selectionRules.categoryLimits || {};
    }
    return {};
  }, [option]);
  const limitSummary = React.useMemo(() => {
    const entries = Object.entries(limits || {});
    if (!entries.length) return "";
    return entries.map(([k, v]) => `${k}: ${v}`).join(" | ");
  }, [limits]);
  const isGeneral = !!option?.selectionRules?.enabled;
  const categories = React.useMemo(() => {
    const baseKeys = ["chicken", "salad", "veggies", "breadroll"];
    const bucket = baseKeys.reduce((acc, k) => ({ ...acc, [k]: [] }), {});
    const extras = {};

    items.forEach((it) => {
      const key = it.categoryKey || "other";
      if (bucket[key]) bucket[key].push(it);
      else {
        if (!extras[key]) extras[key] = [];
        extras[key].push(it);
      }
    });

    const baseList = baseKeys.map((key) => ({
      key,
      label: CATEGORY_LABEL[key] || key,
      items: bucket[key] || [],
    }));
    if (option?.selectionRules?.enabled) {
      return baseList;
    }
    const extraList = Object.entries(extras).map(([key, list]) => ({
      key,
      label: CATEGORY_LABEL[key] || key,
      items: list,
    }));
    return [...baseList, ...extraList];
  }, [items, option?.selectionRules?.enabled]);
  const cartCategoryCounts = React.useMemo(() => {
    const counts = {};
    (cartItems || []).forEach((it) => {
      const key = it.categoryKey || it.category || it.catKey;
      if (!key) return;
      counts[key] = (counts[key] || 0) + (it.quantity || 1);
    });
    return counts;
  }, [cartItems]);

  const buildItems = (data) => {
    if (option?.selectionRules?.enabled && allMenuItems.length) {
      return allMenuItems
        .map((src) => {
          const key = categoryKey(src.category);
          if (!["chicken", "salad", "veggies", "breadroll"].includes(key)) return null;
          return {
            id: src._id || src.id,
            name: src.name || src.title || "Item",
            price: Number(src.price || 0),
            description: src.description || "",
            image: toPublicUrl(src.image) || PLACEHOLDER,
            category: src.category,
            categoryKey: key,
            extraOptions: [], // extras are per config; general shows none
          };
        })
        .filter(Boolean);
    }

    if (Array.isArray(data?.itemConfigurations) && data.itemConfigurations.length) {
      return data.itemConfigurations
        .map((cfg) => {
          const src = cfg?.menuItem || {};
          const id = src._id || src.id || cfg?.menuItem;
          return {
            id,
            name: src.name || cfg.name || "Item",
            price: Number(src.price || cfg.price || 0),
            description: src.description || cfg.description || "",
            image: toPublicUrl(src.image || cfg.image) || PLACEHOLDER,
            category: src.category,
            categoryKey: categoryKey(src.category),
            extraOptions: Array.isArray(cfg.extraOptions) ? cfg.extraOptions.filter(Boolean) : [],
          };
        })
        .filter((it) => it.id);
    }

    return (data?.items || [])
      .map((it) => ({
        id: it._id || it.id,
        name: it.name || it.title || "Item",
        price: Number(it.price || 0),
        description: it.description || "",
        image: toPublicUrl(it.image) || PLACEHOLDER,
        category: it.category,
        categoryKey: categoryKey(it.category),
        extraOptions: [],
      }))
      .filter((it) => it.id);
  };

  React.useEffect(() => {
    let alive = true;

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
          setOption(data);
          setItems(buildItems(data));
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
          setOption(data);
          setItems(buildItems(data));
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

  // Prefill extra selection with the first option for convenience
  React.useEffect(() => {
    setExtraChoice((prev) => {
      const next = { ...prev };
      items.forEach((it) => {
        if (Array.isArray(it.extraOptions) && it.extraOptions.length && !next[it.id]) {
          next[it.id] = it.extraOptions[0];
        }
      });
      return next;
    });
  }, [items]);

  // Default category selection when option has rules
  React.useEffect(() => {
    if (!isGeneral) return;
    if (selectedCategory) return;
    if (categories.length) setSelectedCategory(categories[0].key);
  }, [isGeneral, categories, selectedCategory]);

  // Load all menu items when general catering wants full list
  React.useEffect(() => {
    if (!isGeneral) return;
    (async () => {
      try {
        const res = await axiosInstance.get("/menu-items", { params: { isAvailable: true } });
        const list = Array.isArray(res?.data?.data) ? res.data.data : Array.isArray(res) ? res : res?.data || [];
        setAllMenuItems(list);
      } catch (e2) {
        console.error("Failed to load menu items for general catering", e2);
      }
    })();
  }, [option?.selectionRules?.enabled]);

  // Recompute items once full menu arrives for general catering
  React.useEffect(() => {
    if (!isGeneral) return;
    setItems(buildItems(option || {}));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [allMenuItems]);

  const openModalForItem = (it) => {
    if (!isGeneral) return; // general-only; non-general uses bulk modal
    const limitForCat = limits[it.categoryKey];
    const used = cartCategoryCounts[it.categoryKey] || 0;
    if (limitForCat && used >= limitForCat) {
      const msg = `Limit reached for ${it.categoryKey || "this category"}.`;
      if (toast?.error) toast.error(msg);
      else alert(msg);
      return;
    }

    setModalItem(it);
    const defaultExtra =
      Array.isArray(it.extraOptions) && it.extraOptions.length
        ? (extraChoice[it.id] || it.extraOptions[0] || "")
        : "";
    setModalExtra(defaultExtra);
    setModalPeople(Math.max(Number(option?.minPeople) || 0, 1));
  };

  const confirmModalAdd = () => {
    if (!modalItem) return;
    if (modalItem.extraOptions.length && !modalExtra) {
      const msg = "Please choose an option before adding this item.";
      if (toast?.error) toast.error(msg);
      else alert(msg);
      return;
    }
    const people = Math.max(Number(modalPeople) || 0, 0);
    if (!people) {
      const msg = "Please enter number of people.";
      if (toast?.error) toast.error(msg);
      else alert(msg);
      return;
    }

    addToCart({
      id: `menu-${modalItem.id}${modalExtra ? `-${modalExtra}` : ""}`,
      name: `${modalItem.name}${modalExtra ? ` (${modalExtra})` : ""}`,
      price: modalItem.price,
      image: modalItem.image,
      menuItem: modalItem.id,
      extra: modalExtra || undefined,
      categoryKey: modalItem.categoryKey,
      quantity: people,
      isCatering: true,
      people,
    });
    setExtraChoice((prev) => ({ ...prev, [modalItem.id]: modalExtra }));
    setModalItem(null);
    setModalExtra("");
    setModalPeople(0);
  };

  if (loading) return <div className="container py-5 text-muted">Loading...</div>;
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
            {isGeneral ? (
              <>
                {limitSummary && (
                  <div className="mb-4 p-3 rounded-md border border-yellow-400/40 bg-yellow-500/5 text-yellow-100 text-sm">
                    General catering limits: {limitSummary}
                  </div>
                )}

                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-3 mb-5">
                  {categories.map((cat) => {
                    const limitForCat = limits[cat.key];
                    const usedFromCart = cartCategoryCounts[cat.key] || 0;
                    const remaining = limitForCat ? Math.max(limitForCat - usedFromCart, 0) : "�?�";
                    const active = selectedCategory === cat.key;
                    return (
                      <button
                        key={cat.key}
                        className={`p-4 rounded-lg border text-left transition ${
                          active ? "border-yellow-400 bg-yellow-500/10" : "border-gray-700 bg-[#0f0f0f]"
                        }`}
                        onClick={() => setSelectedCategory(cat.key)}
                      >
                        <div className="text-sm text-gray-400">{cat.label}</div>
                        <div className="text-lg font-semibold text-gray-100">{cat.items.length} items</div>
                        {limitForCat ? (
                          <div className="text-xs text-yellow-100 mt-1">
                            Remaining: {remaining} / {limitForCat}
                          </div>
                        ) : null}
                      </button>
                    );
                  })}
                </div>

                <div className="hot-dishes-grid">
                  {items
                    .filter((d) => !selectedCategory || d.categoryKey === selectedCategory)
                    .map((dish) => {
                      const limitForCat = limits[dish.categoryKey];
                      const usedFromCart = cartCategoryCounts[dish.categoryKey] || 0;
                      const remaining = limitForCat ? Math.max(limitForCat - usedFromCart, 0) : null;
                      const atLimit = limitForCat ? remaining <= 0 : false;
                      return (
                        <div key={dish.id} className="hot-dish-card">
                          <div className="hot-dish-hover-bg" aria-hidden />
                          <div className="hot-dish-image-container">
                            <DishImage src={dish.image} alt={dish.name} className="hot-dish-image" />
                          </div>
                          <div className="hot-dish-content">
                            <div className="hot-dish-header">
                              <h3 className="hot-dish-name">{dish.name}</h3>
                              <span className="hot-dish-price">A$ {dish.price.toFixed(2)}</span>
                            </div>
                            <p className="hot-dish-description">{dish.description}</p>
                            {limitForCat ? (
                              <p className="text-[11px] text-gray-400 mt-2">
                                Remaining {dish.categoryKey || "items"}: {remaining} / {limitForCat}
                              </p>
                            ) : null}
                            {limitForCat && usedFromCart >= limitForCat ? (
                              <p className="text-[11px] text-red-400 mt-1">
                                Remove a {dish.categoryKey} item from cart to add a different one.
                              </p>
                            ) : null}

                            <button
                              className={`hot-dish-cart-btn ${atLimit ? "opacity-40 cursor-not-allowed" : ""}`}
                              onClick={() => openModalForItem(dish)}
                              aria-label="Add to cart"
                              disabled={atLimit}
                              title={atLimit ? "Limit reached for this category" : "Add to cart"}
                            >
                              <svg width="47" height="47" viewBox="0 0 47 47" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M37.6006 30.9731H12.9872L8.25391 12.0398H42.3339L37.6006 30.9731Z" fill="#FAEB30" />
                                <path
                                  d="M3.51953 6.35986H6.83286L8.25286 12.0399M8.25286 12.0399L12.9862 30.9732H37.5995L42.3329 12.0399H8.25286Z"
                                  stroke="#FAEB30"
                                  strokeWidth="1.28"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                />
                                <path
                                  d="M12.9845 40.4399C14.553 40.4399 15.8245 39.1684 15.8245 37.5999C15.8245 36.0314 14.553 34.7599 12.9845 34.7599C11.416 34.7599 10.1445 36.0314 10.1445 37.5999C10.1445 39.1684 11.416 40.4399 12.9845 40.4399Z"
                                  stroke="#FAEB30"
                                  strokeWidth="1.28"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                />
                                <path
                                  d="M37.5978 40.4399C39.1663 40.4399 40.4378 39.1684 40.4378 37.5999C40.4378 36.0314 39.1663 34.7599 37.5978 34.7599C36.0293 34.7599 34.7578 36.0314 34.7578 37.5999C34.7578 39.1684 36.0293 40.4399 37.5978 40.4399Z"
                                  stroke="#FAEB30"
                                  strokeWidth="1.28"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                />
                              </svg>
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  {items.filter((d) => !selectedCategory || d.categoryKey === selectedCategory).length === 0 && (
                    <div className="col-span-full text-sm text-gray-400">
                      No items listed for this category yet.
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="hot-dishes-grid">
                {items.map((dish) => {
                  const count = selectedCounts[dish.id] || 0;
                  return (
                  <div key={dish.id} className="hot-dish-card">
                    <div className="hot-dish-hover-bg" aria-hidden />

                    <div className="hot-dish-image-container">
                      <DishImage src={dish.image} alt={dish.name} className="hot-dish-image" />
                    </div>
                    <div className="hot-dish-content">
                      <div className="hot-dish-header">
                        <h3 className="hot-dish-name">{dish.name}</h3>
                        <span className="hot-dish-price">A$ {dish.price.toFixed(2)}</span>
                      </div>
                      <p className="hot-dish-description">{dish.description}</p>

                      {dish.extraOptions.length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-3">
                          {dish.extraOptions.map((opt) => {
                            const active = extraChoice[dish.id] === opt;
                            return (
                              <button
                                key={opt}
                                type="button"
                                onClick={() =>
                                  setExtraChoice((prev) => ({
                                    ...prev,
                                    [dish.id]: active ? "" : opt,
                                  }))
                                }
                                className={`px-3 py-1 rounded-full text-xs border ${
                                  active ? "border-yellow-400 bg-yellow-400/10 text-yellow-100" : "border-gray-700 text-gray-200"
                                }`}
                              >
                                {opt} {active ? "(on)" : "(off)"}
                              </button>
                            );
                          })}
                        </div>
                      )}

                      <div className="flex items-center gap-3 mt-4">
                        <button
                          className="px-3 py-1 border border-gray-700 text-gray-200 rounded-md"
                          onClick={() =>
                            setSelectedCounts((prev) => {
                              const curr = prev[dish.id] || 0;
                              const next = Math.max(curr - 1, 0);
                              return { ...prev, [dish.id]: next };
                            })
                          }
                          type="button"
                        >
                          -
                        </button>
                        <div className="min-w-[32px] text-center text-gray-100">{count}</div>
                        <button
                          className="px-3 py-1 border border-gray-700 text-gray-200 rounded-md"
                          onClick={() =>
                            setSelectedCounts((prev) => ({
                              ...prev,
                              [dish.id]: (prev[dish.id] || 0) + 1,
                            }))
                          }
                          type="button"
                        >
                          +
                        </button>
                      </div>
                    </div>
                  </div>
                );})}
              </div>
            )}

            {modalItem && (
              <div
                className="modal-overlay"
                style={{
                  position: "fixed",
                  inset: 0,
                  background: "rgba(0,0,0,0.65)",
                  display: "grid",
                  placeItems: "center",
                  zIndex: 2000,
                  padding: "16px",
                }}
              >
                <div
                  className="modal-card max-w-lg"
                  style={{
                    width: "100%",
                    maxWidth: 520,
                    background: "#0f0f0f",
                    borderRadius: 12,
                    border: "1px solid rgba(255,255,255,0.08)",
                    padding: 16,
                  }}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-100">{modalItem.name}</h3>
                      <p className="text-sm text-gray-400">A$ {modalItem.price.toFixed(2)}</p>
                    </div>
                    <button
                      className="text-gray-400 hover:text-gray-100"
                      onClick={() => setModalItem(null)}
                      aria-label="Close"
                    >
                      ×
                    </button>
                  </div>
                  <div className="mb-3 rounded-lg overflow-hidden border border-gray-800">
                    <DishImage src={modalItem.image} alt={modalItem.name} className="w-full h-48 object-cover" />
                  </div>
                  <p className="text-sm text-gray-300 mb-3">{modalItem.description}</p>

                  {modalItem.extraOptions.length > 0 ? (
                    <div className="mb-4">
                      <p className="text-sm font-semibold text-gray-200 mb-2">Choose an option</p>
                      <div className="space-y-2">
                        {modalItem.extraOptions.map((opt) => (
                          <label key={opt} className="flex items-center gap-2 text-gray-100 text-sm">
                            <input
                              type="radio"
                              name="modal-extra"
                              value={opt}
                              checked={modalExtra === opt}
                              onChange={(e) => setModalExtra(e.target.value)}
                            />
                            <span>{opt}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  ) : null}

                  <div className="mb-4">
                    <p className="text-sm font-semibold text-gray-200 mb-1">Number of people</p>
                    <input
                      type="number"
                      min={1}
                      className="w-full bg-[#141414] border border-gray-700 rounded-md px-3 py-2 text-gray-100"
                      value={modalPeople}
                      onChange={(e) => setModalPeople(e.target.value)}
                      placeholder={option?.minPeople ? `Minimum ${option.minPeople}` : "Enter people count"}
                    />
                    {option?.minPeople ? (
                      <p className="text-[11px] text-gray-500 mt-1">Minimum {option.minPeople} people</p>
                    ) : null}
                  </div>

                  <div className="flex justify-end gap-3 mt-4">
                    <button
                      className="px-4 py-2 rounded-md border border-gray-700 text-gray-200"
                      onClick={() => setModalItem(null)}
                      type="button"
                    >
                      Cancel
                    </button>
                    <button
                      className="px-4 py-2 rounded-md bg-yellow-400 text-black font-semibold"
                      onClick={confirmModalAdd}
                      type="button"
                    >
                      Add to cart
                    </button>
                  </div>
                </div>
              </div>
            )}

            {option.description && (
              <p className="text-muted mt-4" style={{ maxWidth: 720 }}>
                {option.description}
              </p>
            )}

            {!isGeneral && (
              <div className="sticky bottom-4 mt-8">
                <div className="flex items-center justify-between bg-[#0f0f0f] border border-gray-800 rounded-lg px-4 py-3 shadow-lg">
                  <div className="text-sm text-gray-300">
                    Selected items:{" "}
                    {Object.values(selectedCounts).reduce((a, b) => a + (b || 0), 0)}
                  </div>
                  <button
                    className="px-4 py-2 rounded-md bg-yellow-400 text-black font-semibold disabled:opacity-50"
                    disabled={
                      Object.values(selectedCounts).reduce((a, b) => a + (b || 0), 0) === 0
                    }
                    onClick={() => {
                      setModalPeople(Math.max(Number(option?.minPeople) || 0, 1));
                      setBulkModalOpen(true);
                    }}
                    type="button"
                  >
                    Add to cart
                  </button>
                </div>
              </div>
            )}
          </div>
        </section>
      </main>

      {!isGeneral && bulkModalOpen && (
        <div
          className="modal-overlay"
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.65)",
            display: "grid",
            placeItems: "center",
            zIndex: 2000,
            padding: "16px",
          }}
        >
          <div
            className="modal-card max-w-lg"
            style={{
              width: "100%",
              maxWidth: 520,
              background: "#0f0f0f",
              borderRadius: 12,
              border: "1px solid rgba(255,255,255,0.08)",
              padding: 16,
            }}
          >
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-semibold text-gray-100">Confirm catering</h3>
              <button
                className="text-gray-400 hover:text-gray-100"
                onClick={() => setBulkModalOpen(false)}
                aria-label="Close"
              >
                ×
              </button>
            </div>

            <div className="mb-4">
              <p className="text-sm font-semibold text-gray-200 mb-1">Number of people</p>
              <input
                type="number"
                min={1}
                className="w-full bg-[#141414] border border-gray-700 rounded-md px-3 py-2 text-gray-100"
                value={modalPeople}
                onChange={(e) => setModalPeople(e.target.value)}
                placeholder={option?.minPeople ? `Minimum ${option.minPeople}` : "Enter people count"}
              />
              {option?.minPeople ? (
                <p className="text-[11px] text-gray-500 mt-1">Minimum {option.minPeople} people</p>
              ) : null}
            </div>

            <div className="max-h-64 overflow-y-auto space-y-3 mb-4">
              {items
                .filter((it) => (selectedCounts[it.id] || 0) > 0)
                .map((it) => (
                  <div
                    key={it.id}
                    className="p-3 rounded-md border border-gray-800 bg-[#111]"
                  >
                    <div className="flex justify-between items-center">
                      <div className="text-gray-100 font-semibold">{it.name}</div>
                      <div className="text-sm text-gray-300">x {selectedCounts[it.id]}</div>
                    </div>
                    {it.extraOptions.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-2">
                        {it.extraOptions.map((opt) => {
                          const active = extraChoice[it.id] === opt;
                          return (
                            <button
                              key={opt}
                              type="button"
                              onClick={() =>
                                setExtraChoice((prev) => ({
                                  ...prev,
                                  [it.id]: active ? "" : opt,
                                }))
                              }
                              className={`px-3 py-1 rounded-full text-xs border ${
                                active ? "border-yellow-400 bg-yellow-400/10 text-yellow-100" : "border-gray-700 text-gray-200"
                              }`}
                            >
                              {opt} {active ? "(on)" : "(off)"}
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                ))}
            </div>

            <div className="flex justify-end gap-3">
              <button
                className="px-4 py-2 rounded-md border border-gray-700 text-gray-200"
                onClick={() => setBulkModalOpen(false)}
                type="button"
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 rounded-md bg-yellow-400 text-black font-semibold"
                onClick={() => {
                  const people = Math.max(Number(modalPeople) || 0, 0);
                  if (!people) {
                    const msg = "Please enter number of people.";
                    if (toast?.error) toast.error(msg);
                    else alert(msg);
                    return;
                  }
                  const totalSelected = Object.entries(selectedCounts).filter(([, v]) => v > 0);
                  if (!totalSelected.length) {
                    setBulkModalOpen(false);
                    return;
                  }
                  totalSelected.forEach(([id, count]) => {
                    const it = items.find((x) => x.id === id);
                    if (!it) return;
                    const extra = extraChoice[id] || "";
                    const qty = Math.max(count, 1) * people;
                    addToCart({
                      id: `menu-${it.id}${extra ? `-${extra}` : ""}`,
                      name: `${it.name}${extra ? ` (${extra})` : ""}`,
                      price: it.price,
                      image: it.image,
                      menuItem: it.id,
                      extra: extra || undefined,
                      categoryKey: it.categoryKey,
                      quantity: qty,
                      isCatering: true,
                      people,
                    });
                  });
                  setBulkModalOpen(false);
                }}
                type="button"
              >
                Add to cart
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
