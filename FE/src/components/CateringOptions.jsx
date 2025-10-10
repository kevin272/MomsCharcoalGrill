import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";

function Card({ pkg }) {
  const priceLabel = pkg.perPersonPrice != null && pkg.perPersonPrice !== ""
    ? `(${Number(pkg.perPersonPrice).toFixed(2)} per person)`
    : pkg.trayPrice != null && pkg.trayPrice !== ""
      ? `(${Number(pkg.trayPrice).toFixed(2)} per tray)`
      : "";

  return (
    <div className="catering-option-card">
      <div className="catering-option-image">
        <img src={pkg.image || "https://via.placeholder.com/600x400?text=Catering"} alt={pkg.title} />
      </div>
      <div className="catering-option-content">
        <p className="catering-min-people">Minimum {pkg.minPeople} People</p>
        <h3 className="catering-option-title">
          {pkg.title} {priceLabel && <span className="opacity-70">{priceLabel}</span>}
        </h3>
        <p className="catering-option-description">{pkg.description}</p>
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

  useEffect(() => {
    (async () => {
      try {
        const r = await fetch("/api/catering-packages");
        const j = await r.json();
        if (!j.success) throw new Error(j.message || "Failed to load packages");
        setPkgs(j.data || []);
      } catch (e) {
        setErr(e.message);
      }
    })();
  }, []);

  if (err) return <div className="text-red-600">{err}</div>;
  if (!pkgs.length) return <div className="text-gray-600">No catering packages available right now.</div>;

  return (
    <div className="catering-options-grid container">
      {pkgs.map(p => <Card key={p._id} pkg={p} />)}
    </div>
  );
}
