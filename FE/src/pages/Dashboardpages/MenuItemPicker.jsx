import { useEffect, useState, useMemo } from "react";
import axiosInstance from "../../config/axios.config.js";

/**
 * MenuItemPicker
 * Props (either works):
 * - value: string[]              // preferred
 * - selectedIds: string[]        // legacy
 * - onChange: (ids: string[]) => void
 * - onItemsLoaded?: (items: any[]) => void
 */
export default function MenuItemPicker({ value, selectedIds, onChange, onItemsLoaded }) {
  // Normalize selected ids from either prop; always an array.
  const selected = useMemo(() => {
    if (Array.isArray(value)) return value;
    if (Array.isArray(selectedIds)) return selectedIds;
    return [];
  }, [value, selectedIds]);

  const [items, setItems] = useState([]);
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const safeSet = (ids) => onChange?.(Array.isArray(ids) ? ids : []);

  const fetchItems = async () => {
    setLoading(true);
    setError("");
    try {
      const { data } = await axiosInstance.get("/menu-items", {
        params: { q, isActive: true },
      });
      const list = Array.isArray(data?.data)
        ? data.data
        : Array.isArray(data?.items)
        ? data.items
        : Array.isArray(data)
        ? data
        : [];
      setItems(list);
      onItemsLoaded?.(list);
    } catch (err) {
      console.error(err);
      setError("Failed to load menu items");
      onItemsLoaded?.([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q]);

  const toggle = (id) => {
    const curr = selected;
    if (curr.includes(id)) {
      safeSet(curr.filter((x) => x !== id));
    } else {
      safeSet([...curr, id]);
    }
  };

  const toPublicUrl = (p) => {
    if (!p) return "";
    if (/^https?:\/\//i.test(p)) return p;
    return p.startsWith("/") ? p : `/${p}`;
  };

  const initials = (label = "") => {
    const parts = String(label).trim().split(/\s+/).slice(0, 2);
    return parts.map((p) => p[0]?.toUpperCase() || "").join("");
  };

  const selectedCount = Array.isArray(selected) ? selected.length : 0;

  return (
    <div className="menuitem-picker revamped">
      <div className="menuitem-picker__top">
        <div>
          <p className="catering-kicker">Menu items</p>
          <div className="menuitem-picker__title-row">
            <h3 className="menuitem-picker__title">Select from your menu</h3>
            <span className="catering-pill pill--outline">
              {selectedCount} selected
            </span>
          </div>
        </div>
        <div className="menuitem-picker__search">
          <div className="menuitem-picker__input">
            <span className="material-symbols-outlined" aria-hidden>search</span>
            <input
              type="text"
              placeholder="Search by name..."
              value={q}
              onChange={(e) => setQ(e.target.value)}
            />
          </div>
        </div>
      </div>

      {selectedCount > 0 && (
        <div className="menuitem-picker__chips">
          {selected.map((id) => {
            const item = items.find((it) => (it?._id || it?.id) === id) || null;
            const label = item?.name || item?.title || `Item ${id}`;
            return (
              <button
                key={id}
                type="button"
                className="chip"
                onClick={() => toggle(id)}
              >
                {label}
                <span aria-hidden>x</span>
              </button>
            );
          })}
        </div>
      )}

      <div className="menuitem-picker__body">
        {loading && <div className="menuitem-picker__state">Loading...</div>}
        {error && <div className="menuitem-picker__state error">{error}</div>}
        {!loading && !error && (!Array.isArray(items) || items.length === 0) && (
          <div className="menuitem-picker__state">No menu items found</div>
        )}

        {!loading && !error && Array.isArray(items) && items.length > 0 && (
          <div className="menuitem-picker__grid">
            {items.map((it) => {
              const id = it?._id || it?.id;
              const name = it?.name || it?.title || "Untitled";
              const price = it?.price ?? it?.unitPrice ?? null;
              const checked = Array.isArray(selected) && selected.includes(id);

              return (
                <label
                  key={id}
                  className={`menuitem-card ${checked ? "menuitem-card--active" : ""}`}
                >
                  <input
                    type="checkbox"
                    checked={!!checked}
                    onChange={() => toggle(id)}
                  />
                  <div className="menuitem-card__avatar">
                    {it?.image ? (
                      <img src={toPublicUrl(it.image)} alt={name} />
                    ) : (
                      <span>{initials(name) || "M"}</span>
                    )}
                  </div>
                  <div className="menuitem-card__meta">
                    <div className="menuitem-card__name">{name}</div>
                    <div className="menuitem-card__sub">
                      {price != null ? `A$ ${Number(price).toFixed(2)}` : "No price"}
                    </div>
                  </div>
                  <span className="menuitem-card__check" aria-hidden>&#10003;</span>
                </label>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
