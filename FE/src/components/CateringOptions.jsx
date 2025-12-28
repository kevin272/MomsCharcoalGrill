import React, { useEffect, useState, useMemo } from "react";
import { Link } from "react-router-dom";

const API_URL = (import.meta.env.VITE_API_URL || "http://localhost:5000/api").replace(/\/+$/, "");
const SERVER_URL = API_URL.replace(/\/api$/, "");
const CACHE_TTL = {
  options: 1000 * 60 * 5,
  items: 1000 * 60 * 10,
};
const OPTIONS_CACHE_KEY = "mcg:catering:options-cache";

let cachedSnapshot = null;

const readOptionsCache = () => {
  if (cachedSnapshot !== null) return cachedSnapshot;
  if (typeof window === "undefined") return null;
  try {
    const raw = sessionStorage.getItem(OPTIONS_CACHE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (parsed?.exp && parsed.exp > Date.now()) {
      cachedSnapshot = parsed;
      return parsed;
    }
    sessionStorage.removeItem(OPTIONS_CACHE_KEY);
  } catch {}
  return null;
};

const persistOptionsCache = (payload) => {
  if (typeof window === "undefined") return;
  try {
    const data = { ...payload, exp: Date.now() + CACHE_TTL.options };
    sessionStorage.setItem(OPTIONS_CACHE_KEY, JSON.stringify(data));
    cachedSnapshot = data;
  } catch {}
};

function toPublicUrl(p) {
  if (!p) return "";
  if (/^https?:\/\//i.test(p)) return p;
  let rel = p.replace(/\\/g, "/");
  if (!rel.startsWith("/uploads/")) rel = "/uploads/" + rel.replace(/^\/+/, "");
  return `${SERVER_URL}${rel}`;
}

function priceLabelFrom(option) {
  if (typeof option.price !== "number") return "";
  switch (option.priceType) {
    case "per_person": return `(${option.price.toFixed(2)} per person)`;
    case "per_tray":   return `(${option.price.toFixed(2)} per tray)`;
    case "fixed":      return `(${option.price.toFixed(2)})`;
    default: return "";
  }
}

const PLACEHOLDER = "https://via.placeholder.com/600x400?text=Catering";

/* ---------------- Card ---------------- */
function Card({ pkg, itemsById, itemsReady }) {
  const [broken, setBroken] = useState(false);
  const src = broken ? PLACEHOLDER : toPublicUrl(pkg.image);
  const priceLabel = priceLabelFrom(pkg);

  // map IDs -> names
  const itemNames = useMemo(() => {
    if (!Array.isArray(pkg.items)) return [];
    return pkg.items
      .map((id) => itemsById[id]?.name || itemsById[id]?.title)
      .filter(Boolean);
  }, [pkg.items, itemsById]);

  const preview = itemNames.slice(0, 4);
  const more = itemNames.length > 4 ? itemNames.length - 4 : 0;

  const hasItemRefs = Array.isArray(pkg.items) && pkg.items.length > 0;

  return (
    <div className="catering-option-card">
      <div className="catering-option-image">
        <img
          src={src || PLACEHOLDER}
          alt={pkg.title}
          onError={() => setBroken(true)}
          loading="lazy"
        />
      </div>

      <div className="catering-option-content">
        <p className="catering-min-people">
          Minimum {pkg.minPeople || 0} People {pkg.feeds ? `• ${pkg.feeds}` : ""}
        </p>

        <h3 className="catering-option-title">
          {pkg.title} {priceLabel && <span className="opacity-70"> {priceLabel}</span>}
        </h3>

        {pkg.description && (
          <p className="catering-option-description">{pkg.description}</p>
        )}

        <div className="catering-option-meta">
          {!hasItemRefs && <span className="opacity-70">No items listed</span>}
          {hasItemRefs && !itemsReady && (
            <div className="catering-items-skeleton" aria-hidden="true">
              <div className="skeleton skeleton-line skeleton-line--wide" />
              <div className="skeleton skeleton-line" style={{ width: "70%" }} />
            </div>
          )}
          {hasItemRefs && itemsReady && (
            preview.length ? (
              <p className="catering-items-list">
                {preview.join(", ")}
                {more > 0 && (
                  <span className="catering-item-more"> +{more} more</span>
                )}
              </p>
            ) : (
              <span className="opacity-70">No items listed</span>
            )
          )}
        </div>

        <Link to={`/catering/package/${pkg._id}`} className="catering-view-menu-btn">
          VIEW FULL MENU
        </Link>
      </div>
    </div>
  );
}

/* ---------------- Main Component ---------------- */
export default function CateringOptions() {
  const [pkgs, setPkgs] = useState(() => readOptionsCache()?.pkgs || []);
  const [itemsById, setItemsById] = useState(() => readOptionsCache()?.itemsById || {});
  const [itemsReady, setItemsReady] = useState(() => {
    const cached = readOptionsCache();
    return !!(cached?.itemsById && Object.keys(cached.itemsById).length);
  });
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(() => !(readOptionsCache()?.pkgs?.length));

  // Fetch catering options
  useEffect(() => {
    const controller = new AbortController();
    let cancelled = false;
    let latestPkgs = null;

    (async () => {
      try {
        const r = await fetch(`${API_URL}/catering-options?isActive=true`, {
          headers: { Accept: "application/json" },
          signal: controller.signal,
          cacheTtl: CACHE_TTL.options,
        });
        const j = await r.json();
        if (!j?.success) throw new Error(j?.message || "Failed to load options");
        const data = Array.isArray(j.data) ? j.data : [];
        latestPkgs = data;
        if (!cancelled) {
          setPkgs(data);
          if (!data.length) {
            persistOptionsCache({ pkgs: [], itemsById: {} });
          }
        }

        // collect all item IDs from all packages
        const allIds = data.flatMap((p) => p.items || []);
        const uniqueIds = [...new Set(allIds)];

        // fetch all items once (you can optimize with your /menu-items/bulk endpoint if you have one)
        if (uniqueIds.length) {
          const fetchedEntries = await Promise.all(
            uniqueIds.map(async (id) => {
              try {
                const res = await fetch(`${API_URL}/menu-items/${id}`, {
                  signal: controller.signal,
                  cacheTtl: CACHE_TTL.items,
                });
                if (!res.ok) return null;
                const item = await res.json();
                const name = item?.data?.name || item?.data?.title;
                return name ? [id, { name }] : null;
              } catch {
                return null;
              }
            })
          );
          const fetchedItems = fetchedEntries.reduce((acc, entry) => {
            if (!entry) return acc;
            acc[entry[0]] = entry[1];
            return acc;
          }, {});
          if (!cancelled) {
            setItemsById(fetchedItems);
            setItemsReady(true);
            persistOptionsCache({
              pkgs: latestPkgs || data,
              itemsById: fetchedItems,
            });
          }
        } else if (!cancelled) {
          setItemsById({});
          setItemsReady(true);
          persistOptionsCache({
            pkgs: latestPkgs || data,
            itemsById: {},
          });
        }
      } catch (e) {
        if (e?.name !== "AbortError" && !cancelled) {
          setErr(e.message || "Something went wrong");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
      controller.abort();
    };
  }, []);

  if (loading) {
    return (
      <div className="catering-options-grid container" aria-busy="true">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={`catering-skeleton-${i}`} className="catering-option-card skeleton-card" aria-hidden="true">
            <div className="catering-option-image skeleton" />
            <div className="catering-option-content">
              <div className="skeleton skeleton-line skeleton-line--short" />
              <div className="skeleton skeleton-line skeleton-line--wide" />
              <div className="skeleton skeleton-line" style={{ width: "85%" }} />
              <div className="skeleton skeleton-line" style={{ width: "65%" }} />
              <div className="skeleton skeleton-line" style={{ width: "40%", marginTop: "12px" }} />
            </div>
          </div>
        ))}
      </div>
    );
  }
  if (err) return <div className="text-red-600">{err}</div>;
  if (!pkgs.length) return <div className="text-gray-600">No catering options available right now.</div>;

  return (
    <div className="catering-options-grid container">
      {pkgs.map((p) => (
        <Card key={p._id} pkg={p} itemsById={itemsById} itemsReady={itemsReady} />
      ))}
    </div>
  );
}
