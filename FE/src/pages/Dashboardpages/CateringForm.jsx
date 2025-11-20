// src/pages/admin/CateringForm.jsx
import { useEffect, useMemo, useState } from "react";
import axiosInstance from "../../config/axios.config.js";
import MenuItemPicker from "./MenuItemPicker";
import Modal from "../../components/Dashboard/Modal.jsx";

export default function CateringForm({
  open = true,       // works even if parent does `{show && <CateringForm/>}`
  initial,
  onClose,
  onSuccess
}) {
  const DEFAULT_LIMITS = useMemo(() => ({
    chicken: 1,
    salad: 2,
    veggies: 2,
    breadroll: 1,
  }), []);

  const [title, setTitle] = useState(initial?.title || "");
  const [slug, setSlug] = useState(initial?.slug || "");
  const [order, setOrder] = useState(initial?.order ?? 0);
  const [price, setPrice] = useState(initial?.price ?? "");
  const [priceType, setPriceType] = useState(initial?.priceType || "per_tray");
  const [minPeople, setMinPeople] = useState(initial?.minPeople ?? "");
  const [isActive, setIsActive] = useState(Boolean(initial?.isActive));
  const [imageFile, setImageFile] = useState(null);
  const [preview, setPreview] = useState("");
  const [itemExtras, setItemExtras] = useState({});
  const [selectionRules, setSelectionRules] = useState({
    enabled: Boolean(initial?.selectionRules?.enabled),
    categoryLimits: { ...DEFAULT_LIMITS, ...(initial?.selectionRules?.categoryLimits || {}) },
  });
  const [itemsLookup, setItemsLookup] = useState({});

  const initialItemIds = useMemo(
    () => (Array.isArray(initial?.items) ? initial.items.map(String) : []),
    [initial]
  );
  const [selectedItemIds, setSelectedItemIds] = useState(initialItemIds);

  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState("");

  // Rehydrate when initial changes (editing existing item)
  useEffect(() => {
    if (!initial) {
      setTitle("");
      setSlug("");
      setOrder(0);
      setPrice("");
      setPriceType("per_tray");
      setMinPeople("");
      setIsActive(false);
      setSelectedItemIds([]);
      setItemExtras({});
      setSelectionRules({ enabled: false, categoryLimits: { ...DEFAULT_LIMITS } });
      setPreview("");
      setImageFile(null);
      return;
    }
    setTitle(initial.title || "");
    setSlug(initial.slug || "");
    setOrder(initial.order ?? 0);
    setPrice(initial.price ?? "");
    setPriceType(initial.priceType || "per_tray");
    setMinPeople(initial.minPeople ?? "");
    setIsActive(Boolean(initial.isActive));
    setSelectedItemIds(
      Array.isArray(initial.items) ? initial.items.map(String) : []
    );
    const extrasMap = {};
    if (Array.isArray(initial.itemConfigurations)) {
      initial.itemConfigurations.forEach((cfg) => {
        const id = cfg?.menuItem?._id || cfg?.menuItem || cfg?._id || cfg?.id;
        if (!id) return;
        const extraOptions = Array.isArray(cfg.extraOptions) ? cfg.extraOptions : [];
        extrasMap[String(id)] = extraOptions.join(", ");
      });
    }
    setItemExtras(extrasMap);
    setSelectionRules({
      enabled: Boolean(initial.selectionRules?.enabled),
      categoryLimits: { ...DEFAULT_LIMITS, ...(initial?.selectionRules?.categoryLimits || {}) },
    });
    // hydrate preview image from existing data
    const API_URL = (import.meta.env.VITE_API_URL || "http://localhost:5000/api").replace(/\/+$/, "");
    const SERVER_URL = API_URL.replace(/\/api$/, "");
    const joinImageUrl = (p = "") => {
      if (!p) return "";
      if (/^https?:\/\//i.test(p)) return p;
      return `${SERVER_URL}${p.startsWith("/") ? "" : "/"}${p}`;
    };
    if (initial.image) setPreview(joinImageUrl(initial.image));
  }, [initial, DEFAULT_LIMITS]);

  useEffect(() => {
    if (!title) return;
    if (!initial || slug === initial.slug) {
      const s = String(title)
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");
      setSlug(s);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [title]);

  // Drop extras when an item gets removed
  useEffect(() => {
    setItemExtras((prev) => {
      const next = { ...prev };
      Object.keys(next).forEach((id) => {
        if (!selectedItemIds.includes(id)) delete next[id];
      });
      return next;
    });
  }, [selectedItemIds]);

  // Fetch missing item labels so the extras UI can show item names
  useEffect(() => {
    const missing = selectedItemIds.filter((id) => !itemsLookup[id]);
    if (!missing.length) return;
    (async () => {
      const updates = {};
      await Promise.all(
        missing.map(async (id) => {
          try {
            const body = await axiosInstance.get(`/menu-items/${id}`);
            const d = body?.data || body;
            if (d?._id || d?.id) updates[id] = d;
          } catch (err) {
            console.error("Failed to load menu item", id, err);
          }
        })
      );
      if (Object.keys(updates).length) {
        setItemsLookup((prev) => ({ ...prev, ...updates }));
      }
    })();
  }, [selectedItemIds, itemsLookup]);

  const handleItemsLoaded = (list = []) => {
    const map = {};
    list.forEach((it) => {
      const id = it?._id || it?.id;
      if (id) map[id] = it;
    });
    if (Object.keys(map).length) {
      setItemsLookup((prev) => ({ ...prev, ...map }));
    }
  };

  const updateLimit = (key, value) => {
    setSelectionRules((prev) => ({
      ...prev,
      categoryLimits: {
        ...prev.categoryLimits,
        [key]: Number(value) || 0,
      },
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setErr("");
    try {
      const fd = new FormData();
      fd.append("title", title);
      fd.append("slug", slug);
      fd.append("order", Number(order) || 0);
      if (price !== "") fd.append("price", Number(price));
      fd.append("priceType", priceType);
      if (minPeople !== "") fd.append("minPeople", Number(minPeople));
      fd.append("isActive", isActive ? "true" : "false");
      selectedItemIds.forEach((id) => fd.append("items", id));
      const itemConfigurations = selectedItemIds.map((id) => ({
        menuItem: id,
        extraOptions: String(itemExtras[id] || "")
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean),
      }));
      fd.append("itemConfigurations", JSON.stringify(itemConfigurations));
      const safeRules = selectionRules.enabled
        ? {
            enabled: true,
            categoryLimits: selectionRules.categoryLimits,
          }
        : { enabled: false, categoryLimits: {} };
      fd.append("selectionRules", JSON.stringify(safeRules));
      if (imageFile) fd.append("image", imageFile);

      if (initial?._id) {
        await axiosInstance.put(`/catering-options/${initial._id}`, fd, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      } else {
        await axiosInstance.post(`/catering-options`, fd, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      }
      onSuccess?.();
    } catch (e2) {
      setErr(e2?.response?.data?.message || e2?.message || "Save failed");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose}>
      <form className="catering-form p-4 md:p-5" onSubmit={handleSubmit}>
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg md:text-xl font-semibold text-gray-100">
            {initial ? "Edit Catering Option" : "New Catering Option"}
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="od-btn od-btn--ghost"
          >
            ✕
          </button>
        </div>

        {err && (
          <div className="bg-red-900/50 text-red-200 px-3 py-2 rounded-md border border-red-500/40 mb-3">
            {err}
          </div>
        )}

        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block mb-1 text-sm font-semibold text-gray-200">Title</label>
            <input
              className="od-input"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., BBQ Feast"
              required
            />
          </div>

          <div>
            <label className="block mb-1 text-sm font-semibold text-gray-200">Slug</label>
            <input
              className="od-input"
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              placeholder="bbq-feast"
              required
            />
          </div>

          <div>
            <label className="block mb-1 text-sm font-semibold text-gray-200">Order</label>
            <input
              type="number"
              className="od-input"
              value={order}
              onChange={(e) => setOrder(e.target.value)}
              min="0"
            />
          </div>

          <div>
            <label className="block mb-1 text-sm font-semibold text-gray-200">Price</label>
            <input
              type="number"
              className="od-input"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder="160"
              min="0"
              step="0.01"
            />
          </div>

          <div>
            <label className="block mb-1 text-sm font-semibold text-gray-200">Price Type</label>
            <select
              className="od-select"
              value={priceType}
              onChange={(e) => setPriceType(e.target.value)}
            >
              <option value="per_tray">Per Tray</option>
              <option value="per_person">Per Person</option>
            </select>
          </div>

          <div>
            <label className="block mb-1 text-sm font-semibold text-gray-200">Min People</label>
            <input
              type="number"
              className="od-input"
              value={minPeople}
              onChange={(e) => setMinPeople(e.target.value)}
              placeholder="20"
              min="0"
            />
          </div>

          <div className="flex items-center gap-3">
            <input
              id="isActive"
              type="checkbox"
              checked={isActive}
              onChange={(e) => setIsActive(e.target.checked)}
            />
            <label htmlFor="isActive" className="text-gray-200">Active</label>
          </div>

          <div>
            <label className="block mb-1 text-sm font-semibold text-gray-200">Image</label>
            <input
              type="file"
              accept="image/*"
              className="od-input"
              onChange={(e) => {
                const f = e.target.files?.[0] || null;
                setImageFile(f);
                if (f) setPreview(URL.createObjectURL(f));
              }}
            />
            {preview ? (
              <div className="mt-2">
                <img
                  src={preview}
                  alt="preview"
                  style={{ maxWidth: 240, borderRadius: 8 }}
                  onError={(e) => (e.currentTarget.style.opacity = 0.4)}
                />
              </div>
            ) : null}
          </div>

          <div className="md:col-span-2 menu-picker">
            <label className="block mb-1 text-sm font-semibold text-gray-200">Items</label>
            <MenuItemPicker value={selectedItemIds} onChange={setSelectedItemIds} onItemsLoaded={handleItemsLoaded} />
          </div>

          <div className="md:col-span-2">
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-semibold text-gray-200">
                Extra selection options for each item (comma separated)
              </label>
              <span className="text-xs text-gray-400">Shown to customers when ordering</span>
            </div>
            {selectedItemIds.length === 0 && (
              <p className="text-gray-400 text-sm">Select menu items first.</p>
            )}
            <div className="space-y-3">
              {selectedItemIds.map((id) => {
                const item = itemsLookup[id];
                const label = item?.name || item?.title || `Item ${id}`;
                return (
                  <div key={id} className="p-3 rounded-md border border-gray-700 bg-[#101010]">
                    <div className="text-sm text-gray-200 mb-1 font-semibold">{label}</div>
                    <input
                      type="text"
                      className="w-full bg-[#141414] border border-gray-700 rounded-md px-3 py-2 text-gray-100"
                      placeholder="Example: with gravy, extra spicy"
                      value={itemExtras[id] || ""}
                      onChange={(e) =>
                        setItemExtras((prev) => ({ ...prev, [id]: e.target.value }))
                      }
                    />
                    <p className="text-[11px] text-gray-500 mt-1">
                      Separate multiple options with a comma. Leave blank if no extra selection is needed.
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="mt-6 p-4 rounded-md border border-gray-700 bg-[#0f0f0f]">
          <div className="flex items-center gap-3">
            <input
              id="selectionRules"
              type="checkbox"
              checked={selectionRules.enabled}
              onChange={(e) =>
                setSelectionRules((prev) => ({
                  ...prev,
                  enabled: e.target.checked,
                  categoryLimits: e.target.checked ? { ...DEFAULT_LIMITS, ...prev.categoryLimits } : {},
                }))
              }
            />
            <label htmlFor="selectionRules" className="text-gray-200 font-semibold">
              Apply general catering limits (1 chicken, 2 salads, 2 veggies, 1 bread roll)
            </label>
          </div>
          {selectionRules.enabled && (
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-3 mt-3">
              {Object.entries(DEFAULT_LIMITS).map(([key, defaultVal]) => (
                <div key={key}>
                  <label className="block mb-1 text-sm font-semibold text-gray-200 capitalize">
                    {key}
                  </label>
                  <input
                    type="number"
                    min="0"
                    className="w-full bg-[#141414] border border-gray-700 rounded-md px-3 py-2 text-gray-100"
                    value={selectionRules.categoryLimits?.[key] ?? defaultVal}
                    onChange={(e) => updateLimit(key, e.target.value)}
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="flex items-center justify-end gap-3 mt-6">
          <button
            type="button"
            onClick={onClose}
            className="od-btn"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={saving}
            className="od-btn od-btn--danger"
          >
            {saving ? "Saving..." : (initial ? "Update" : "Create")}
          </button>
        </div>
      </form>
    </Modal>
  );
}
