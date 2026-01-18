// src/pages/admin/CateringForm.jsx
import { useCallback, useEffect, useMemo, useState } from "react";
import axiosInstance from "../../config/axios.config.js";
import MenuItemPicker from "./MenuItemPicker";
import Modal from "../../components/Dashboard/Modal.jsx";

export default function CateringForm({
  open = true,       // works even if parent does `{show && <CateringForm/>}`
  initial,
  onClose,
  onSuccess
}) {
  const GENERAL_PROFILES = useMemo(() => ({
    classic: {
      key: "classic",
      label: "Chicken, salads, veggies & bread rolls",
      defaults: { chicken: 1, salad: 2, veggies: 2, breadroll: 1 },
    },
    roast_and_chicken: {
      key: "roast_and_chicken",
      label: "Roast + chicken with salads, veggies & bread rolls",
      defaults: { roast: 1, chicken: 1, salad: 2, veggies: 2, breadroll: 1 },
    },
  }), []);

  const getPresetDefaults = useCallback(
    (type) => GENERAL_PROFILES[type]?.defaults || GENERAL_PROFILES.classic.defaults,
    [GENERAL_PROFILES]
  );

  const initialGeneralType = useMemo(() => {
    if (initial?.selectionRules?.type && GENERAL_PROFILES[initial.selectionRules.type]) {
      return initial.selectionRules.type;
    }
    const hasRoast = Boolean(initial?.selectionRules?.categoryLimits?.roast);
    return hasRoast ? "roast_and_chicken" : "classic";
  }, [GENERAL_PROFILES, initial]);

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
  const [itemPricing, setItemPricing] = useState({});
  const [selectionRules, setSelectionRules] = useState({
    enabled: Boolean(initial?.selectionRules?.enabled),
    type: initialGeneralType,
    categoryLimits: {
      ...getPresetDefaults(initialGeneralType),
      ...(initial?.selectionRules?.categoryLimits || {}),
    },
  });
  const [itemsLookup, setItemsLookup] = useState({});

  const initialItemIds = useMemo(
    () => {
      if (Array.isArray(initial?.items) && initial.items.length) {
        return initial.items.map(String);
      }
      if (Array.isArray(initial?.itemConfigurations) && initial.itemConfigurations.length) {
        return initial.itemConfigurations
          .map((cfg) => {
            const id = cfg?.menuItem?._id || cfg?.menuItem || cfg?._id || cfg?.id;
            return id ? String(id) : null;
          })
          .filter(Boolean);
      }
      return [];
    },
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
      setItemPricing({});
      setSelectionRules({
        enabled: false,
        type: "classic",
        categoryLimits: { ...getPresetDefaults("classic") },
      });
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
    const fallbackIds = Array.isArray(initial.itemConfigurations)
      ? initial.itemConfigurations
        .map((cfg) => cfg?.menuItem?._id || cfg?.menuItem || cfg?._id || cfg?.id)
        .filter(Boolean)
        .map(String)
      : [];
    setSelectedItemIds(
      Array.isArray(initial.items) && initial.items.length
        ? initial.items.map(String)
        : fallbackIds
    );
    const extrasMap = {};
    const pricingMap = {};
    if (Array.isArray(initial.itemConfigurations)) {
      initial.itemConfigurations.forEach((cfg) => {
        const id = cfg?.menuItem?._id || cfg?.menuItem || cfg?._id || cfg?.id;
        if (!id) return;
        const extraOptions = Array.isArray(cfg.extraOptions) ? cfg.extraOptions : [];
        extrasMap[String(id)] = extraOptions.join(", ");
        pricingMap[String(id)] = !!cfg?.useMenuItemPrice;
      });
    }
    setItemExtras(extrasMap);
    setItemPricing(pricingMap);
    const nextType = (initial?.selectionRules?.type && GENERAL_PROFILES[initial.selectionRules.type])
      ? initial.selectionRules.type
      : (initial?.selectionRules?.categoryLimits?.roast ? "roast_and_chicken" : "classic");
    setSelectionRules({
      enabled: Boolean(initial.selectionRules?.enabled),
      type: nextType,
      categoryLimits: { ...getPresetDefaults(nextType), ...(initial?.selectionRules?.categoryLimits || {}) },
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
  }, [GENERAL_PROFILES, getPresetDefaults, initial]);

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
    setItemPricing((prev) => {
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
        useMenuItemPrice: !!itemPricing[id],
      }));
      fd.append("itemConfigurations", JSON.stringify(itemConfigurations));
      const safeRules = selectionRules.enabled
        ? {
          enabled: true,
          type: selectionRules.type || "classic",
          categoryLimits: selectionRules.categoryLimits,
        }
        : { enabled: false, type: selectionRules.type || "classic", categoryLimits: {} };
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

  const activePreset = GENERAL_PROFILES[selectionRules.type] || GENERAL_PROFILES.classic;
  const limitKeys = Array.from(
    new Set([
      ...Object.keys(activePreset.defaults || {}),
      ...Object.keys(selectionRules.categoryLimits || {}),
    ])
  );
  const presetSummary = limitKeys
    .map((key) => {
      const val = selectionRules.categoryLimits?.[key] ?? activePreset.defaults?.[key] ?? 0;
      return `${val} ${key}`;
    })
    .join(", ");

  const activeBadge = isActive ? "Active" : "Hidden";
  const priceHint = price ? `$${Number(price).toFixed(2)}` : "No price yet";
  const minLabel = minPeople ? `${minPeople}+ ppl` : "No minimum set";

  return (
    <Modal open={open} onClose={onClose}>
      <div className="admin-form-header px-6 pt-6">
        <h2>{initial ? "Edit Catering Option" : "New Catering Option"}</h2>
        <div className="accent-line"></div>
      </div>

      {err && <div className="form-error-banner mx-6 mb-4">{err}</div>}

      <form className="admin-form-grid p-6 pt-0" onSubmit={handleSubmit}>
        <div className="form-field full-width">
          <h4 className="text-yellow-400 font-bold uppercase text-xs tracking-widest mb-4">Basics</h4>
        </div>

        <div className="form-field half-width">
          <label>Title *</label>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g., BBQ Feast"
            required
          />
        </div>

        <div className="form-field half-width">
          <label>Slug *</label>
          <input
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
            placeholder="bbq-feast"
            required
          />
        </div>

        <div className="form-field half-width">
          <label>Display Order</label>
          <input
            type="number"
            value={order}
            onChange={(e) => setOrder(e.target.value)}
            min="0"
          />
        </div>

        <div className="form-field half-width">
          <label>Status</label>
          <div className="options-group">
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
              />
              <span>{isActive ? "Visible on site" : "Hidden"}</span>
            </label>
          </div>
        </div>

        <div className="form-field full-width">
          <label>Cover Image</label>
          <div className="image-upload-zone">
            <input
              type="file"
              accept="image/*"
              onChange={(e) => {
                const f = e.target.files?.[0] || null;
                setImageFile(f);
                if (f) setPreview(URL.createObjectURL(f));
              }}
            />
            {preview && (
              <div className="image-preview">
                <img src={preview} alt="preview" />
              </div>
            )}
          </div>
        </div>

        <div className="form-field full-width mt-4">
          <h4 className="text-yellow-400 font-bold uppercase text-xs tracking-widest mb-4">Pricing & Minimums</h4>
        </div>

        <div className="form-field half-width">
          <label>Price</label>
          <input
            type="number"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            placeholder="160"
            min="0"
            step="0.01"
          />
        </div>

        <div className="form-field half-width">
          <label>Price Type</label>
          <select
            value={priceType}
            onChange={(e) => setPriceType(e.target.value)}
          >
            <option value="per_tray">Per Tray</option>
            <option value="per_person">Per Person</option>
          </select>
        </div>

        <div className="form-field half-width">
          <label>Minimum People</label>
          <input
            type="number"
            value={minPeople}
            onChange={(e) => setMinPeople(e.target.value)}
            placeholder="20"
            min="0"
          />
        </div>

        <div className="form-field full-width mt-6 border-t border-gray-900 pt-6">
          <h4 className="text-yellow-400 font-bold uppercase text-xs tracking-widest mb-4">Menu Selection</h4>
          <MenuItemPicker
            value={selectedItemIds}
            onChange={setSelectedItemIds}
            onItemsLoaded={handleItemsLoaded}
            pricingMode={itemPricing}
            onPricingModeChange={setItemPricing}
          />
        </div>

        {selectedItemIds.length > 0 && (
          <div className="form-field full-width mt-6 bg-gray-950 p-6 border border-gray-900">
            <h4 className="text-white font-bold uppercase text-xs tracking-widest mb-4">Item Add-ons (Extras)</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {selectedItemIds.map((id) => {
                const item = itemsLookup[id];
                const label = item?.name || item?.title || `Item ${id}`;
                return (
                  <div key={id} className="form-field">
                    <label className="text-xs text-gray-500">{label}</label>
                    <input
                      type="text"
                      className="text-sm"
                      placeholder="e.g. extra gravy, spicy"
                      value={itemExtras[id] || ""}
                      onChange={(e) =>
                        setItemExtras((prev) => ({ ...prev, [id]: e.target.value }))
                      }
                    />
                  </div>
                );
              })}
            </div>
          </div>
        )}

        <div className="form-field full-width mt-6 border-t border-gray-900 pt-6">
          <h4 className="text-yellow-400 font-bold uppercase text-xs tracking-widest mb-4">Order Rules</h4>
          <div className="options-group mb-4">
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={selectionRules.enabled}
                onChange={(e) =>
                  setSelectionRules((prev) => {
                    const nextLimits = e.target.checked
                      ? { ...getPresetDefaults(prev.type || "classic"), ...(prev.categoryLimits || {}) }
                      : {};
                    return { ...prev, enabled: e.target.checked, categoryLimits: nextLimits };
                  })
                }
              />
              <span>Use per-person bundle limits</span>
            </label>
          </div>

          {selectionRules.enabled && (
            <div className="bg-gray-950 p-6 border border-gray-900">
              <div className="flex flex-wrap gap-2 mb-6">
                {Object.values(GENERAL_PROFILES).map((preset) => {
                  const isActive = (selectionRules.type || "classic") === preset.key;
                  return (
                    <button
                      key={preset.key}
                      type="button"
                      className={`px-4 py-2 text-xs font-bold uppercase tracking-widest border transition-all ${isActive
                        ? 'border-yellow-400 bg-yellow-400 text-black'
                        : 'border-gray-800 text-gray-400 hover:border-gray-600'
                        }`}
                      onClick={() => {
                        const nextType = preset.key;
                        setSelectionRules((prev) => {
                          const defaults = getPresetDefaults(nextType);
                          const nextLimits = { ...defaults };
                          Object.entries(prev.categoryLimits || {}).forEach(([key, val]) => {
                            if (defaults[key] !== undefined) nextLimits[key] = val;
                          });
                          return { ...prev, type: nextType, categoryLimits: nextLimits };
                        });
                      }}
                    >
                      {preset.label}
                    </button>
                  );
                })}
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {limitKeys.map((key) => {
                  const defaultVal = activePreset.defaults?.[key] ?? 0;
                  return (
                    <div key={key} className="form-field">
                      <label className="capitalize">{key}</label>
                      <input
                        type="number"
                        min="0"
                        value={selectionRules.categoryLimits?.[key] ?? defaultVal}
                        onChange={(e) => updateLimit(key, e.target.value)}
                      />
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        <div className="form-field full-width flex gap-4 mt-8 pb-8">
          <button className="submit-btn" type="submit" disabled={saving}>
            {saving ? "Saving..." : (initial ? "Update Package" : "Create Package")}
          </button>
          <button
            type="button"
            className="back-btn"
            onClick={onClose}
          >
            Cancel
          </button>
        </div>
      </form>
    </Modal>
  );
}
