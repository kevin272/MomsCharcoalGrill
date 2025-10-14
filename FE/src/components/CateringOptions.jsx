import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";

const API_URL = (import.meta.env.VITE_API_URL || "http://localhost:5000/api").replace(/\/+$/, "");
const SERVER_URL = API_URL.replace(/\/api$/, ""); // http://localhost:5000

// Make any backend image path public + robust
function toPublicUrl(p) {
  if (!p) return "";
  if (/^https?:\/\//i.test(p)) return p; // already absolute (e.g., CDN or absolute from BE)

  // Ensure we have a single leading /uploads/ prefix
  let rel = p.replace(/\\/g, "/"); // normalize windows slashes if any
  if (!rel.startsWith("/uploads/")) {
    rel = "/uploads/" + rel.replace(/^\/+/, ""); // ensure exactly one leading slash and 'uploads/'
  }
  return `${SERVER_URL}${rel}`;
}

// Optional: you can remove this if you won't use it here
function priceLabelFrom(option) {
  if (typeof option.price !== "number") return "";
  switch (option.priceType) {
    case "per_person":
      return `(${option.price.toFixed(2)} per person)`;
    case "per_tray":
      return `(${option.price.toFixed(2)} per tray)`;
    case "fixed":
      return `(${option.price.toFixed(2)})`;
    default:
      return "";
  }
}

const PLACEHOLDER = "https://via.placeholder.com/600x400?text=Catering";

function Card({ pkg }) {
  const priceLabel = priceLabelFrom(pkg);
  const [broken, setBroken] = useState(false);

  const src = broken ? PLACEHOLDER : toPublicUrl(pkg.image);

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
          <span className="opacity-70">
            Items: {Array.isArray(pkg.items) ? pkg.items.length : 0}
          </span>
        </div>

        <Link to={`/catering/package/${pkg._id}`} className="catering-view-menu-btn">
          VIEW FULL MENU
        </Link>
      </div>
    </div>
  );
}

export default function CateringOptions() {
  const [pkgs, setPkgs] = useState([]);
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        // Use API_URL so it works in all envs
        const r = await fetch(`${API_URL}/catering-options?isActive=true`, {
          headers: { Accept: "application/json" },
        });
        const j = await r.json();
        if (!j?.success) throw new Error(j?.message || "Failed to load options");
        setPkgs(Array.isArray(j.data) ? j.data : []);
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
        <Card key={p._id} pkg={p} />
      ))}
    </div>
  );
}
