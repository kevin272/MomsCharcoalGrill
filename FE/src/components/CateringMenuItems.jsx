import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useCart } from "../context/CartContext.jsx";
import { useToast } from "./common/ToastProvider.jsx";

const CATEGORY_META = {
  roast: "Roast",
  chicken: "Chicken",
  salad: "Salads",
  veggies: "Veggies",
  breadroll: "Bread Roll",
};

const GENERAL_PROFILES = {
  classic: {
    key: "classic",
    categories: ["chicken", "salad", "veggies", "breadroll"],
    defaults: { chicken: 1, salad: 2, veggies: 2, breadroll: 1 },
  },
  roast_and_chicken: {
    key: "roast_and_chicken",
    categories: ["roast", "chicken", "salad", "veggies", "breadroll"],
    defaults: { roast: 1, chicken: 1, salad: 2, veggies: 2, breadroll: 1 },
  },
};

const FALLBACK_DEFAULTS = GENERAL_PROFILES.classic.defaults;

const KEYWORDS = {
  roast: ["roast", "roasted", "beef", "lamb", "pork", "sirloin", "roast beef"],
  chicken: ["chicken", "peri", "tandoori", "drum", "wing", "breast", "thigh"],
  salad: ["salad", "slaw", "coleslaw", "garden", "greek", "caesar"],
  veggies: ["veg", "veggie", "vegetable", "paneer", "broccoli", "spinach", "mushroom", "beans"],
  breadroll: ["roll", "bread", "bun", "pita", "tortilla", "wrap", "naan","Bread","Roll"],
};

const PLACEHOLDER = "https://via.placeholder.com/640x480?text=Catering";
const HEX_ID_RE = /^[0-9a-f]{24}$/i;
const isHexId = (value) => HEX_ID_RE.test(String(value || ""));

const CartIcon = ({ className }) => (
  <svg
    viewBox="0 0 24 24"
    role="img"
    aria-hidden="true"
    className={className}
  >
    <path
      d="M3.5 4.5h2l1.2 10.6a1 1 0 0 0 1 .9h8.6a1 1 0 0 0 .98-.8l1.22-6.2H7.1"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <circle cx="10" cy="19" r="1.4" fill="currentColor" />
    <circle cx="17" cy="19" r="1.4" fill="currentColor" />
  </svg>
);

function toPublicUrl(p, serverUrl) {
  if (!p) return "";
  if (/^https?:\/\//i.test(p)) return p;
  if (!serverUrl) return p.startsWith("/") ? p : `/${p}`;
  let rel = p.replace(/\\/g, "/");
  if (!rel.startsWith("/uploads/")) rel = `/uploads/${rel.replace(/^\/+/, "")}`;
  return `${serverUrl}${rel}`;
}

function normalizeLimits(selectionRules, profile) {
  const base = {
    ...(
      profile?.defaults
      || (selectionRules?.type && GENERAL_PROFILES[selectionRules.type]?.defaults)
      || FALLBACK_DEFAULTS
    ),
  };
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

function detectCategory(item, categoryKeys = []) {
  const ordered = categoryKeys.length ? categoryKeys : Object.keys(CATEGORY_META);
  let best = { key: null, score: 0 };
  ordered.forEach((key) => {
    const score = scoreForCategory(item, key);
    if (score > best.score) best = { key, score };
  });
  return best.score > 0 ? best.key : null;
}

function inferGeneralType(selectionRules) {
  const type = selectionRules?.type;
  if (type && GENERAL_PROFILES[type]) return type;
  const hasRoast = Boolean(selectionRules?.categoryLimits?.roast);
  return hasRoast ? "roast_and_chicken" : "classic";
}

function normalizeItems(option, serverUrl, categoryKeys) {
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
  const { addToCart, items: cartItems } = useCart();

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
  const [, setDebug] = useState(null);

  const pkgKey = pkg?._id || optionId;
  const generalType = useMemo(
    () => inferGeneralType(pkg?.selectionRules || {}),
    [pkg?.selectionRules]
  );
  const activeProfile = useMemo(
    () => GENERAL_PROFILES[generalType] || GENERAL_PROFILES.classic,
    [generalType]
  );
  const categoryOrder = useMemo(
    () => (activeProfile?.categories || Object.keys(FALLBACK_DEFAULTS)).map((key) => ({
      key,
      label: CATEGORY_META[key] || key,
    })),
    [activeProfile]
  );
  const categoryKeys = useMemo(() => categoryOrder.map((c) => c.key), [categoryOrder]);

  const cartMenuIds = useMemo(() => {
    const ids = new Set();
    cartItems.forEach((cartItem) => {
      if (cartItem?.menuItem) ids.add(String(cartItem.menuItem));
      if (Array.isArray(cartItem?.items)) {
        cartItem.items.forEach((sub) => {
          if (sub?.menuItem) ids.add(String(sub.menuItem));
        });
      }
    });
    return ids;
  }, [cartItems]);

  const hasCartForPkg = useMemo(() => {
    if (!pkgKey) return false;
    return cartItems.some((cartItem) => {
      const idStr = String(cartItem?.id || "");
      if (idStr.includes(pkgKey)) return true;
      if (cartItem?.menuItem && cartMenuIds.has(String(cartItem.menuItem))) return true;
      if (Array.isArray(cartItem?.items)) {
        return cartItem.items.some((sub) => {
          const menuId = String(sub?.menuItem || "");
          return menuId === String(pkgKey) || cartMenuIds.has(menuId);
        });
      }
      return false;
    });
  }, [cartItems, cartMenuIds, pkgKey]);

  const isItemInCart = useCallback((item) => {
    const key = String(item?.menuItemId || item?.id || "");
    return cartMenuIds.has(key);
  }, [cartMenuIds]);

  const buildItems = useCallback((option, fallbackItems = []) => {
    if (!option) return [];
    const normalized = normalizeItems(option, SERVER_URL, categoryKeys);
    const base = normalized.length
      ? normalized
      : (Array.isArray(fallbackItems) ? fallbackItems : []);
    return base.map((item, idx) => {
      const imageSource = item.image || option?.image || "";
      const normalizedImage = imageSource ? toPublicUrl(imageSource, SERVER_URL) : PLACEHOLDER;
      const categoryKey = item.categoryKey || detectCategory(item, categoryKeys);
      return {
        ...item,
        id: item.id || item._id || String(idx),
        image: normalizedImage || PLACEHOLDER,
        categoryKey,
        extraOptions: Array.isArray(item.extraOptions) ? item.extraOptions.filter(Boolean) : [],
      };
    });
  }, [SERVER_URL, categoryKeys]);

  const packagePrice = useMemo(() => {
    if (!pkg) return 0;
    const direct = Number(pkg.price);
    if (!Number.isNaN(direct) && direct > 0) return direct;
    const perPerson = pkg.perPersonPrice ?? pkg.trayPrice;
    return Number(perPerson) || 0;
  }, [pkg]);

  const minPeopleRequired = useMemo(() => {
    const n = Number(pkg?.minPeople);
    return Number.isFinite(n) && n > 0 ? n : 0;
  }, [pkg?.minPeople]);

  const isGeneral = Boolean(pkg?.selectionRules?.enabled);
  const categoryLimits = useMemo(
    () => normalizeLimits(pkg?.selectionRules, activeProfile),
    [activeProfile, pkg?.selectionRules]
  );

  const groupedItems = useMemo(() => {
    if (!isGeneral) return { groups: {}, others: [] };
    const groups = categoryOrder.reduce((acc, { key }) => {
      acc[key] = [];
      return acc;
    }, {});
    const others = [];
    items.forEach((item) => {
      const key = item.categoryKey || detectCategory(item, categoryKeys);
      if (key && groups[key]) groups[key].push(item);
      else others.push(item);
    });
    return { groups, others };
  }, [categoryKeys, categoryOrder, isGeneral, items]);

  const selectedCounts = useMemo(() => {
    if (!isGeneral) return {};
    return categoryOrder.reduce((acc, { key }) => {
      const list = groupedItems.groups[key] || [];
      acc[key] = list.reduce((sum, item) => sum + (quantities[item.id] || 0), 0);
      return acc;
    }, {});
  }, [categoryOrder, groupedItems, isGeneral, quantities]);

  const totalSelected = useMemo(
    () => Object.values(quantities).reduce((sum, qty) => sum + qty, 0),
    [quantities]
  );

  const selectionSummaryParts = categoryOrder.map(
    ({ key, label }) => `${categoryLimits[key] ?? 0} ${label.toLowerCase()}`
  );

  const updateQty = useCallback((item, delta = 1, opts = {}) => {
    if (!item || !delta) return;
    const extras = Array.isArray(item.extraOptions) ? item.extraOptions.filter(Boolean) : [];
    if (delta > 0 && extras.length && !opts.skipExtrasPrompt) {
      setExtrasModal({ open: true, item, delta });
      return;
    }

    if (isGeneral && delta > 0) {
      const key = item.categoryKey || detectCategory(item, categoryKeys);
      const limit = categoryLimits[key] ?? 0;
      if (limit > 0 && (selectedCounts[key] || 0) >= limit) {
        const label = categoryOrder.find((c) => c.key === key)?.label || "this category";
        toast.error(`Limit reached for ${label}.`);
        return;
      }
    }

    setQuantities((prev) => {
      const current = prev[item.id] || 0;
      let next = current + delta;
      if (next < 0) next = 0;
      const updated = { ...prev };
      if (next === 0) delete updated[item.id];
      else updated[item.id] = next;

      if (next === 0) {
        setSelectedExtras((prevExtras) => {
          if (!prevExtras[item.id]) return prevExtras;
          const clone = { ...prevExtras };
          delete clone[item.id];
          return clone;
        });
      }
      return updated;
    });
  }, [categoryKeys, categoryLimits, categoryOrder, isGeneral, selectedCounts, toast]);

  useEffect(() => {
    let alive = true;
    setLoading(true);
    setErr("");
    // simple local cache to avoid re-fetching every visit
    const TTL = 5 * 60 * 1000; // 5 minutes
    const key = `mcg:catering:option:${API_URL}:${optionId}`;
    try {
      const cached = JSON.parse(localStorage.getItem(key) || 'null');
      const cachedPkg = cached?.pkg || cached?.option;
      if (cached && cached.exp > Date.now() && cachedPkg && Array.isArray(cached.items)) {
        const readyItems = buildItems(cachedPkg, cached.items);
        setPkg(cachedPkg);
        setItems(readyItems);
        setLoading(false);
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
          const mapped = buildItems(data);
          setPkg(data);
          setItems(mapped);
          try { localStorage.setItem(key, JSON.stringify({ exp: Date.now() + TTL, pkg: data, items: mapped })); } catch {}
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
          const mapped = buildItems(data);
          setPkg(data);
          setItems(mapped);
          try { localStorage.setItem(key, JSON.stringify({ exp: Date.now() + TTL, pkg: data, items: mapped })); } catch {}
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
  }, [API_URL, buildItems, optionId]);

  useEffect(() => {
    setQuantities({});
    setSelectedExtras({});
    setExtrasModal({ open: false, item: null, delta: 1 });
    setConfirmQty(Math.max(1, minPeopleRequired || 1));
  }, [minPeopleRequired, optionId]);

  useEffect(() => {
    if (!confirmOpen) return;
    if (minPeopleRequired > 0 && (Number(confirmQty) || 0) < minPeopleRequired) {
      setConfirmQty(minPeopleRequired);
    }
  }, [confirmOpen, confirmQty, minPeopleRequired]);

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
      const missing = categoryOrder.filter(
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
    if (minPeopleRequired > 0 && (Number(confirmQty) || 0) < minPeopleRequired) {
      setConfirmQty(minPeopleRequired);
    }
    setConfirmOpen(true);
  };

  const addSelectionToCart = () => {
    const multiplier = Math.max(1, Number(confirmQty) || 1);
    if (minPeopleRequired > 0 && multiplier < minPeopleRequired) {
      toast.error(`Minimum ${minPeopleRequired} people required for this catering option.`);
      return;
    }
    const chosen = items
      .map((it) => ({
        it,
        qty: quantities[it.id] || 0,
        extras: selectedExtras[it.id] || [],
      }))
      .filter(({ qty }) => qty > 0);

    if (isGeneral) {
      const selectionList = chosen.map(({ it, qty, extras }) => ({
        id: it.id,
        name: it.name,
        menuItem: it.menuItemId,
        qty,
        extras,
      }));

      const summary = selectionList
        .map(({ name, qty, extras }) => {
          const extraTxt = extras.length ? ` (${extras.join(", ")})` : "";
          return `${name} x${qty}${extraTxt}`;
        })
        .join(" | ");

      const selectionKey = selectionList
        .map(({ id, qty, extras }) => `${id}:${qty}:${extras.join("+")}`)
        .join("|") || "default";

      addToCart({
        id: `catering-${pkg?._id || optionId}-general-${selectionKey}`,
        name: `${pkg?.title || "General Catering"} (per person)`,
        price: packagePrice,
        image: pkg?.image || chosen[0]?.it?.image,
        quantity: multiplier,
        extra: summary,
        items: selectionList,
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
    const showPrice = !isGeneral;
    const displayPrice = isGeneral
      ? ""
      : `$${Number(item.price || pkg?.price || 0).toFixed(2)}`;
    const inCart = qty > 0 || isItemInCart(item);

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
            {showPrice && <span className="hot-dish-price">{displayPrice}</span>}
          </div>
          {item.description && <p className="hot-dish-description">{item.description}</p>}
          {hasExtras && (
            <p className="text-xs opacity-80 mt-1">
              Extras available
              {selectedExtras[item.id]?.length ? `: ${selectedExtras[item.id].join(", ")}` : ""}
            </p>
          )}
          <div className="item-actions">
            <div className="quantity-controls">
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
                General catering lets you choose {selectionSummaryParts.join(", ").replace(/, ([^,]*)$/, " and $1")}.
              </p>
            )}
          </div>
        </div>

        <section className="hot-dishes-grid-section">
          <div className="container">
            {!items.length && <p>No menu available for this option.</p>}

            {isGeneral ? (
              <div className="space-y-8">
                {categoryOrder.map(({ key, label }) => (
                  <div key={key} className="category-section">
                    <div className="category-header">
                      <div className="category-title-wrap">
                        <span className="category-dot" aria-hidden />
                        <h3 className="category-title">{label}</h3>
                      </div>
                      <span className="category-count">
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

            <div className="menu-action-bar">
              <div className="selection-pill">
                Selected: {totalSelected} item{totalSelected === 1 ? "" : "s"}
              </div>
              <div className="menu-action-buttons">
                <Link to="/catering" className="od-btn menu-action-btn secondary">
                  Back to Catering
                </Link>
                <button
                  className={`od-btn menu-action-btn primary ${hasCartForPkg ? "cart-active" : ""}`}
                  onClick={openConfirmModal}
                  aria-label="Add to cart"
                  type="button"
                >
                  <CartIcon className="cart-icon" />
                  <span className="text-sm font-semibold sm:text-base">Add to cart</span>
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
              <h3>{isGeneral ? "How many people are you ordering for?" : "How many sets to add?"}</h3>
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
                <p className="text-sm mt-1">Price: ${packagePrice.toFixed(2)} per person</p>
              ) : null}
              {minPeopleRequired > 0 && (
                <p className="text-xs opacity-80 mt-1">Minimum {minPeopleRequired} people required.</p>
              )}
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
