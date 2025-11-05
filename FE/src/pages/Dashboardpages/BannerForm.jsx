import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import axios from "../../config/axios.config";
import DashboardLayout from "../../components/Dashboard/DashboardLayout";

// Keep relative "/uploads/..." fine for dev via Vite proxy
const resolveImage = (url) => url || "";

const normalizeMenuArray = (arr = []) =>
  arr.map((m) => ({
    _id: m._id,
    name: m.name,
    image: m.image,
    category: m.category?.name || "", // <-- include category to avoid undefined
  }));

export default function BannerForm() {
  const { id } = useParams();
  const isEdit = !!id;
  const navigate = useNavigate();

  const [saving, setSaving] = useState(false);
  const [menuQuery, setMenuQuery] = useState("");
  const [menuResults, setMenuResults] = useState([]);
  const [loadingMenu, setLoadingMenu] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    items: [],        // [{ _id, name, image, category }]
    primaryItem: "",  // _id (must be one of items)
    isActive: true,
    order: 0,
  });

  // -------- Load existing banner (edit)
  useEffect(() => {
    (async () => {
      if (!isEdit) return;
      try {
        const body = await axios.get(`banners/${id}`);
        const b = body?.data?.data || body?.data || body; // handle unwrapped interceptor or wrapped shapes
        if (!b) return;
        setForm({
          items: normalizeMenuArray(b.items || []),
          primaryItem: b.primaryItem?._id || b.primaryItem || "",
          isActive: !!b.isActive,
          order: b.order ?? 0,
        });
      } catch (e) {
        console.error(e);
        setError(e?.response?.data?.message || "Failed to load banner.");
      }
    })();
  }, [id, isEdit]);

  // -------- Fetch MenuItems (try menu-items then fallback to menu)
  const fetchMenu = async (q = "") => {
    setError("");
    setLoadingMenu(true);
    try {
      const tryPrimary = await axios.get("menu-items", { params: { q } });
      let list = normalizeMenuArray(tryPrimary?.data?.data || []);

      if (!Array.isArray(list) || list.length === 0) {
        try {
          const tryFallback = await axios.get("menu", { params: { q } });
          list = normalizeMenuArray(tryFallback?.data?.data || tryFallback?.data || []);
        } catch {
          /* ignore */
        }
      }
      setMenuResults(list || []);
    } catch (e) {
      console.error(e);
      setError(e?.response?.data?.message || "Failed to load menu items.");
      setMenuResults([]);
    } finally {
      setLoadingMenu(false);
    }
  };

  // initial load + debounced search
  useEffect(() => { fetchMenu(""); }, []);
  useEffect(() => {
    const t = setTimeout(() => fetchMenu(menuQuery), 250);
    return () => clearTimeout(t);
  }, [menuQuery]);

  // -------- Form helpers
  const addItem = (mi) => {
    if (form.items.find((x) => x._id === mi._id)) return;
    setForm((s) => ({
      ...s,
      items: [...s.items, mi],
      primaryItem: s.primaryItem || mi._id, // auto-pick first
    }));
  };

  const removeItem = (_id) => {
    setForm((s) => {
      const next = s.items.filter((i) => i._id !== _id);
      const nextPrimary = s.primaryItem === _id ? (next[0]?._id || "") : s.primaryItem;
      return { ...s, items: next, primaryItem: nextPrimary };
    });
  };

  const move = (idx, dir) => {
    setForm((s) => {
      const arr = [...s.items];
      const ni = idx + dir;
      if (ni < 0 || ni >= arr.length) return s;
      [arr[idx], arr[ni]] = [arr[ni], arr[idx]];
      return { ...s, items: arr };
    });
  };

  const payload = useMemo(
    () => ({
      items: form.items.map((i) => i._id),
      primaryItem: form.primaryItem,
      isActive: !!form.isActive,
      order: Number(form.order || 0),
    }),
    [form]
  );

  const onSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!payload.items.length) return setError("Select at least one MenuItem.");
    if (!payload.primaryItem) return setError("Choose the primary MenuItem (title).");
    try {
      setSaving(true);
      if (isEdit) await axios.put(`banners/${id}`, payload);
      else await axios.post("banners", payload);
      navigate("/admin/banners");
    } catch (e) {
      console.error(e);
      setError(e?.response?.data?.message || "Save failed.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <DashboardLayout
      title={isEdit ? "Edit Hero Banner" : "New Hero Banner"}
      actions={<Link to="/admin/banners" className="od-btn">Back</Link>}
    >
      <form className="admin-form" onSubmit={onSubmit}>
        {error && (
          <div className="mb-4 rounded-md border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-700">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label className="admin-label">Order</label>
            <input
              type="number"
              className="admin-input"
              value={form.order}
              onChange={(e) =>
                setForm((s) => ({ ...s, order: Number(e.target.value) }))
              }
            />
          </div>

          <div className="flex items-center gap-2 mt-7">
            <input
              id="isActive"
              type="checkbox"
              checked={form.isActive}
              onChange={(e) =>
                setForm((s) => ({ ...s, isActive: e.target.checked }))
              }
            />
            <label htmlFor="isActive" className="admin-label">Active</label>
          </div>
        </div>

        {/* MENU SEARCH */}
        <div className="mt-8">
          <h3 className="admin-subtitle">Attach Menu Items</h3>
          <input
            className="admin-input"
            placeholder="Search menu items…"
            value={menuQuery}
            onChange={(e) => setMenuQuery(e.target.value)}
          />

          {/* FIXED MENU GRID (results) */}
          <div className="mt-3 menu-picker-grid">
            {loadingMenu ? (
              <div className="text-sm text-gray-500">Loading menu items…</div>
            ) : menuResults.length === 0 ? (
              <div className="text-sm text-gray-500">No items found.</div>
            ) : (
              menuResults.map((mi) => (
                <button
                  key={mi._id}
                  type="button"
                  className="menu-card"
                  onClick={() => addItem(mi)}
                  title="Add"
                >
                  <div className="menu-card-img">
                    <img src={resolveImage(mi.image)} alt={mi.name} />
                  </div>
                  <div className="menu-card-body">
                    <h4 className="menu-card-title">{mi.name}</h4>
                    {mi.category && (
                      <p className="menu-card-category">{mi.category}</p>
                    )}
                    <span className="menu-card-cta">Add</span>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>

        {/* SELECTED LIST (primary + reorder) */}
        <div className="mt-10">
          <h4 className="admin-subtitle">Selected (choose Primary & order)</h4>
          {form.items.length === 0 ? (
            <div className="text-sm text-gray-500">No items selected yet.</div>
          ) : (
            <ul className="selected-list">
              {form.items.map((mi, idx) => (
                <li key={mi._id} className="selected-row">
                  <img
                    src={resolveImage(mi.image)}
                    alt=""
                    className="selected-thumb"
                  />
                  <div className="selected-meta">
                    <div className="selected-title">{mi.name}</div>
                    {mi.category && (
                      <div className="selected-sub">{mi.category}</div>
                    )}
                  </div>

                  <label className="selected-primary">
                    <input
                      type="radio"
                      name="primary"
                      checked={form.primaryItem === mi._id}
                      onChange={() =>
                        setForm((s) => ({ ...s, primaryItem: mi._id }))
                      }
                    />
                    <span>Primary</span>
                  </label>

                  <div className="selected-actions">
                    <button type="button" className="od-btn" onClick={() => move(idx, -1)}>↑</button>
                    <button type="button" className="od-btn" onClick={() => move(idx, 1)}>↓</button>
                    <button type="button" className="od-btn od-btn--danger" onClick={() => removeItem(mi._id)}>Remove</button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="mt-8 flex items-center gap-3">
          <button className="od-btn" type="submit" disabled={saving}>
            {saving ? "Saving…" : isEdit ? "Update Banner" : "Create Banner"}
          </button>
          <Link className="od-btn" to="/admin/banners">Cancel</Link>
        </div>
      </form>
    </DashboardLayout>
  );
}
