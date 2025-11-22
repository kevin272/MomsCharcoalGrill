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

  return (
    <div className="card menuitem-picker" style={{ background: "#0f0f0f", border: "1px solid rgba(255,255,255,.1)" }}>
      <div className="card-header d-flex align-items-center justify-content-between"
           style={{ background: "#0b0b0b", borderBottom: "1px solid rgba(255,255,255,.08)" }}>
        <div style={{ color: "#FFF200", fontWeight: 700 }}>Select Menu Items</div>
        <div className="d-flex gap-2 align-items-center">
          <input
            type="text"
            className="form-control form-control-sm"
            placeholder="Search..."
            value={q}
            onChange={(e) => setQ(e.target.value)}
            style={{ background: "#141414", color: "#fff", border: "1px solid rgba(255,255,255,.14)", minWidth: 180 }}
          />
          <span className="badge rounded-pill"
                style={{ background: "#111", color: "#FFF200", border: "1px dashed rgba(255,255,255,.2)", fontSize: 13 }}>
            {(selected && selected.length) || 0} selected
          </span>
        </div>
      </div>

      <div className="card-body" style={{ maxHeight: 320, overflowY: "auto" }}>
        {loading && <div className="text-muted">Loading...</div>}
        {error && <div className="text-danger">{error}</div>}

        {!loading && !error && (!Array.isArray(items) || items.length === 0) && (
          <div className="text-muted">No menu items found</div>
        )}

        {!loading && !error && Array.isArray(items) && items.length > 0 && (
          <div className="row g-2">
            {items.map((it) => {
              const id = it?._id || it?.id;
              const name = it?.name || it?.title || "Untitled";
              const price = it?.price ?? it?.unitPrice ?? null;
              const checked = Array.isArray(selected) && selected.includes(id);

              return (
                <div key={id} className="col-12 col-md-6 col-lg-4">
                  <label
                    className="d-flex align-items-center gap-2 p-2 rounded"
                    style={{
                      border: checked ? "1px solid #FFF200" : "1px solid rgba(255,255,255,.12)",
                      background: checked ? "#1a1a00" : "#111",
                      cursor: "pointer",
                    }}
                  >
                    <input
                      type="checkbox"
                      className="form-check-input"
                      checked={!!checked}
                      onChange={() => toggle(id)}
                    />
                    <div className="flex-grow-1">
                      <div style={{ color: "#fff", fontWeight: 600, lineHeight: 1.2 }}>{name}</div>
                      <div className="small text-muted">
                        {price != null ? `A$ ${Number(price).toFixed(2)}` : "—"}
                      </div>
                    </div>
                  </label>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
