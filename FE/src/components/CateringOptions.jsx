import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";

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

function imgUrl(fileName) {
  if (!fileName) return "https://via.placeholder.com/600x400?text=Catering";
  return `${import.meta.env.VITE_API_URL}/uploads/${fileName}`;
}

function Card({ pkg }) {
  const priceLabel = priceLabelFrom(pkg);

  return (
    <div className="catering-option-card">
      <div className="catering-option-image">
        <img
          src={imgUrl(pkg.image)}
          alt={pkg.title}
          onError={(e) => (e.currentTarget.src = "https://via.placeholder.com/600x400?text=Catering")}
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
        const r = await fetch(`/api/catering-options?isActive=true`, {
          headers: { "Accept": "application/json" },
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
