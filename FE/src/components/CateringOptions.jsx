import React, { useEffect, useState, useMemo } from "react";
import { Link } from "react-router-dom";

const API_URL = (import.meta.env.VITE_API_URL || "http://localhost:5000/api").replace(/\/+$/, "");
const SERVER_URL = API_URL.replace(/\/api$/, "");

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
function Card({ pkg, itemsById }) {
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
          {preview.length ? (
            <p className="catering-items-list">
              {preview.join(", ")}
              {more > 0 && (
                <span className="catering-item-more"> +{more} more</span>
              )}
            </p>
          ) : (
            <span className="opacity-70">No items listed</span>
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
  const [pkgs, setPkgs] = useState([]);
  const [itemsById, setItemsById] = useState({});
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(true);

  // Fetch catering options
  useEffect(() => {
    (async () => {
      try {
        const r = await fetch(`${API_URL}/catering-options?isActive=true`, {
          headers: { Accept: "application/json" },
        });
        const j = await r.json();
        if (!j?.success) throw new Error(j?.message || "Failed to load options");
        const data = Array.isArray(j.data) ? j.data : [];
        setPkgs(data);

        // collect all item IDs from all packages
        const allIds = data.flatMap((p) => p.items || []);
        const uniqueIds = [...new Set(allIds)];

        // fetch all items once (you can optimize with your /menu-items/bulk endpoint if you have one)
        if (uniqueIds.length) {
          const fetchedItems = {};
          for (const id of uniqueIds) {
            try {
              const res = await fetch(`${API_URL}/menu-items/${id}`);
              if (!res.ok) continue;
              const item = await res.json();
              const name = item?.data?.name || item?.data?.title;
              if (name) fetchedItems[id] = { name };
            } catch {}
          }
          setItemsById(fetchedItems);
        }
      } catch (e) {
        setErr(e.message || "Something went wrong");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) return <div className="text-gray-600">Loading…</div>;
  if (err) return <div className="text-red-600">{err}</div>;
  if (!pkgs.length) return <div className="text-gray-600">No catering options available right now.</div>;

  return (
    <div className="catering-options-grid container">
      {pkgs.map((p) => (
        <Card key={p._id} pkg={p} itemsById={itemsById} />
      ))}
    </div>
  );
}
