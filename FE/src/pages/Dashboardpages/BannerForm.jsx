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
      : (typeof cat === "string" ? cat : "");
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
      actions={<Link to="/admin/banners" className="od-btn">Back</Link>}
    >
      <form className="banner-form" onSubmit={onSubmit}>
        <div className="banner-form__head">
          <div>
            <p className="catering-kicker">Hero banner</p>
            <div className="banner-form__title-row">
              <h1>{isEdit ? "Edit Hero Banner" : "New Hero Banner"}</h1>
              <span className={`catering-pill ${form.isActive ? "pill--green" : "pill--gray"}`}>
                {form.isActive ? "Active" : "Hidden"}
              </span>
            </div>
            <div className="catering-pill-row">
              <span className="catering-pill pill--outline">{form.items.length} item{form.items.length === 1 ? "" : "s"} attached</span>
              <span className="catering-pill pill--outline">Primary: {form.primaryItem ? "set" : "not set"}</span>
            </div>
          </div>
          <div className="catering-form__head-actions">
            <Link to="/admin/banners" className="catering-ghost-btn">Back</Link>
          </div>
        </div>

        {error && (
          <div className="catering-alert catering-alert--error">{error}</div>
        )}

        <div className="banner-form__grid">
          <section className="banner-card">
            <div className="catering-section__title">Display settings</div>
            <div className="banner-field-grid">
              <div className="catering-field">
                <label>Order</label>
                <input
                  type="number"
                  className="od-input"
                  value={form.order}
                  onChange={(e) =>
                    setForm((s) => ({ ...s, order: Number(e.target.value) }))
                  }
                />
              </div>
              <div className="catering-field catering-toggle">
                <label htmlFor="isActive">Status</label>
                <div className="toggle-row">
                  <input
                    id="isActive"
                    type="checkbox"
                    checked={form.isActive}
                    onChange={(e) =>
                      setForm((s) => ({ ...s, isActive: e.target.checked }))
                    }
                  />
                  <span>{form.isActive ? "Visible" : "Hidden"}</span>
                </div>
              </div>
            </div>
          </section>

          <section className="banner-card">
            <div className="catering-section__title">Attached item</div>
            <p className="catering-helper">Only one menu item can be linked to a banner. Re-select to replace.</p>
            <div className="catering-pill-row">
              <span className="catering-pill pill--outline">
                {form.primaryItem ? "Item selected" : "No item chosen"}
              </span>
            </div>
          </section>
        </div>

        <section className="banner-card">
          <div className="banner-card__title-row">
            <div>
              <p className="catering-kicker">Attach menu items</p>
              <h4 className="banner-card__title">Search and add</h4>
            </div>
            <div className="menuitem-picker__input banner-search">
              <input
                className="banner-search-input"
                placeholder="Search menu items..."
                value={menuQuery}
                onChange={(e) => setMenuQuery(e.target.value)}
              />
            </div>
          </div>

          <div className="banner-results">
            {loadingMenu ? (
              <div className="menuitem-picker__state">Loading menu items...</div>
            ) : menuResults.length === 0 ? (
              <div className="menuitem-picker__state">No items found.</div>
            ) : (
              <div className="banner-results__grid">
                {menuResults.map((mi) => (
                  <button
                    key={mi._id}
                    type="button"
                    className="banner-result-card"
                    onClick={() => addItem(mi)}
                    title="Add"
                    disabled={form.primaryItem === mi._id}
                  >
                    <div className="banner-result__img">
                      <img src={resolveImage(mi.image)} alt={mi.name} />
                    </div>
                    <div className="banner-result__body">
                      <div className="banner-result__name">{mi.name}</div>
                      {mi.category && <div className="banner-result__sub">{mi.category}</div>}
                      <span className="banner-result__cta">{form.primaryItem === mi._id ? "Selected" : "Add"}</span>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </section>

        <section className="banner-card">
          <div className="banner-card__title-row">
            <div>
              <p className="catering-kicker">Attached item</p>
              <h4 className="banner-card__title">Preview & replace</h4>
              <p className="catering-helper">Click "Add" on another result to replace the attached item.</p>
            </div>
          </div>

          {form.items.length === 0 ? (
            <div className="catering-empty">No item selected yet.</div>
          ) : (
            <div className="banner-selected">
              {form.items.map((mi) => (
                <div key={mi._id} className="banner-selected__row">
                  <div className="banner-selected__thumb">
                    <img src={resolveImage(mi.image)} alt={mi.name} />
                  </div>
                  <div className="banner-selected__meta">
                    <div className="banner-selected__name">{mi.name}</div>
                    {mi.category && <div className="banner-selected__sub">{mi.category}</div>}
                  </div>
                  <div className="banner-selected__actions">
                    <button type="button" className="catering-primary-btn" onClick={() => removeItem(mi._id)}>Remove</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        <div className="catering-form__footer">
          <Link className="catering-ghost-btn" to="/admin/banners">Cancel</Link>
          <button className="catering-primary-btn" type="submit" disabled={saving}>
            {saving ? "Saving…" : isEdit ? "Update Banner" : "Create Banner"}
          </button>
        </div>
      </form>
    </DashboardLayout>
  );
}
