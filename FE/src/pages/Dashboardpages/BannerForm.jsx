import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import axios from "../../config/axios.config";
import DashboardLayout from "../../components/Dashboard/DashboardLayout";

// Keep relative "/uploads/..." fine for dev via Vite proxy
const resolveImage = (url) => url || "";

const normalizeMenuArray = (arr = []) =>
  arr.map((m, idx) => {
    const cat = m?.category;
    const categoryLabel = typeof cat === "object" && cat !== null
      ? (cat.name || cat.title || cat.label || cat.slug || "")
      : (typeof cat === "string" && !/^[0-9a-fA-F]{24}$/.test(cat) ? cat : ""); // Hide if it looks like an ObjectId
    const id = m?._id || m?.id || m?.value || m?.menuItem || m?.item || idx;
    return {
      _id: String(id),
      name: m?.name || m?.title || `Item ${idx + 1}`,
      image: m?.image || m?.photo || "",
      category: categoryLabel,
    };
  });

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
          primaryItem: b.primaryItem?._id || b.primaryItem?.id || b.primaryItem || "",
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
  const mergeMenuResults = useCallback((list = []) => {
    const map = new Map();
    (Array.isArray(list) ? list : []).forEach((mi) => {
      if (!mi?._id) return;
      map.set(mi._id, mi);
    });
    (Array.isArray(form.items) ? form.items : []).forEach((mi) => {
      if (!mi?._id) return;
      if (!map.has(mi._id)) map.set(mi._id, mi);
    });
    return Array.from(map.values());
  }, [form.items]);

  const fetchMenu = useCallback(async (q = "") => {
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
      setMenuResults(mergeMenuResults(list || []));
    } catch (e) {
      console.error(e);
      setError(e?.response?.data?.message || "Failed to load menu items.");
      setMenuResults(mergeMenuResults([]));
    } finally {
      setLoadingMenu(false);
    }
  }, [mergeMenuResults]);

  // initial load + debounced search
  useEffect(() => { fetchMenu(""); }, [fetchMenu]);
  useEffect(() => {
    const t = setTimeout(() => fetchMenu(menuQuery), 250);
    return () => clearTimeout(t);
  }, [fetchMenu, menuQuery]);

  // -------- Form helpers
  const addItem = (mi) => {
    // Banner supports only one attached item; replace existing
    setForm((s) => ({
      ...s,
      items: [mi],
      primaryItem: mi._id,
    }));
  };

  const removeItem = (_id) => {
    setForm((s) => ({
      ...s,
      items: [],
      primaryItem: "",
    }));
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
    >
      <div className="admin-form-container">
        {error && <div className="alert alert-danger mb-4">{error}</div>}

        <form onSubmit={onSubmit} className="admin-form grid-2">
          <div className="form-field">
            <label className="form-label">Display Order</label>
            <input
              className="form-control"
              type="number"
              placeholder="0"
              value={form.order}
              onChange={(e) =>
                setForm((s) => ({ ...s, order: Number(e.target.value) }))
              }
            />
            <p className="form-help">Lower numbers appear first.</p>
          </div>

          <div className="form-field">
            <label className="form-label">Banner Status</label>
            <div className="pt-2">
              <label className="switch">
                <input
                  type="checkbox"
                  checked={form.isActive}
                  onChange={(e) =>
                    setForm((s) => ({ ...s, isActive: e.target.checked }))
                  }
                />
                <span className="track">
                  <span className="thumb"></span>
                </span>
                <span className="label">Visible on homepage</span>
              </label>
            </div>
          </div>

          <div className="form-field span-2">
            <h4 className="mt-4 mb-3 text-yellow-400 font-bold uppercase text-xs tracking-widest">
              1. Search & Select Menu Item
            </h4>
            <div className="mb-4">
              <input
                className="form-control"
                placeholder="Search by menu item name..."
                value={menuQuery}
                onChange={(e) => setMenuQuery(e.target.value)}
              />
            </div>

            <div className="banner-results-container" style={{ maxHeight: '400px', overflowY: 'auto' }}>
              {loadingMenu ? (
                <div className="p-8 text-center text-gray-500">Loading menu...</div>
              ) : menuResults.length === 0 ? (
                <div className="p-8 text-center text-gray-500 border border-dashed border-gray-800 rounded-xl">No matching items.</div>
              ) : (
                <div className="banner-results__grid">
                  {menuResults.map((mi) => (
                    <div
                      key={mi._id}
                      className={`banner-result-card ${form.primaryItem === mi._id ? 'active' : ''}`}
                      onClick={() => addItem(mi)}
                    >
                      <div className="banner-result__img">
                        <img src={resolveImage(mi.image)} alt={mi.name} />
                      </div>
                      <div className="banner-result__body">
                        <div className="banner-result__name">{mi.name}</div>
                        <div className="banner-result__sub">{mi.category}</div>
                        <div className="banner-result__cta">
                          {form.primaryItem === mi._id ? "✓ SELECTED" : "+ ADD TO BANNER"}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="form-field span-2">
            <h4 className="mt-6 mb-3 text-yellow-400 font-bold uppercase text-xs tracking-widest">
              2. Banner Preview
            </h4>
            {form.items.length === 0 ? (
              <div className="border border-dashed border-gray-800 rounded-xl p-12 text-center text-gray-600">
                <p>No item selected yet. Use the search above.</p>
              </div>
            ) : (
              <div className="banner-selected">
                {form.items.map((mi) => (
                  <div key={mi._id} className="banner-selected__row">
                    <div className="banner-selected__thumb">
                      <img src={resolveImage(mi.image)} alt={mi.name} />
                    </div>
                    <div className="banner-selected__meta">
                      <div className="banner-selected__name">{mi.name}</div>
                      <div className="banner-selected__sub">{mi.category}</div>
                    </div>
                    <div className="banner-selected__primary">
                      <span className="text-yellow-400 text-xs font-bold uppercase">Main Display Item</span>
                    </div>
                    <div className="banner-selected__actions">
                      <button
                        type="button"
                        className="od-btn od-btn--danger"
                        onClick={() => removeItem(mi._id)}
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="form-actions span-2 mt-8 flex gap-3">
            <button className="od-btn" type="submit" disabled={saving}>
              {saving ? "Saving…" : isEdit ? "Update Banner" : "Create Banner"}
            </button>
            <button
              type="button"
              className="od-btn od-btn--secondary"
              onClick={() => navigate("/admin/banners")}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
}
