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
      <form className="catering-form p-4 md:p-5 catering-form--revamp" onSubmit={handleSubmit}>
        <div className="catering-form__head">
          <div>
            <p className="catering-kicker">Catering option</p>
            <div className="catering-form__title-row">
              <h2 className="catering-form__title">
                {initial ? "Edit Catering Option" : "New Catering Option"}
              </h2>
              <span className={`catering-pill ${isActive ? "pill--green" : "pill--gray"}`}>
                {activeBadge}
              </span>
            </div>
            <div className="catering-pill-row">
              <span className="catering-pill pill--outline">{priceHint}</span>
              <span className="catering-pill pill--outline">{priceType === "per_person" ? "Per person" : "Per tray"}</span>
              <span className="catering-pill pill--outline">{minLabel}</span>
            </div>
          </div>
          <div className="catering-form__head-actions">
            <button
              type="button"
              onClick={onClose}
              aria-label="Close"
              className="catering-ghost-btn"
            >
              Close
            </button>
          </div>
        </div>

        {err && (
          <div className="catering-alert catering-alert--error">
            {err}
          </div>
        )}

        <div className="catering-form__section-grid">
          <section className="catering-form__section">
            <div className="catering-section__title">Basics</div>
            <div className="catering-field-grid">
              <div className="catering-field">
                <label>Title</label>
                <input
                  className="od-input"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g., BBQ Feast"
                  required
                />
              </div>
              <div className="catering-field">
                <label>Slug</label>
                <input
                  className="od-input"
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  placeholder="bbq-feast"
                  required
                />
              </div>
              <div className="catering-field">
                <label>Display Order</label>
                <input
                  type="number"
                  className="od-input"
                  value={order}
                  onChange={(e) => setOrder(e.target.value)}
                  min="0"
                />
              </div>
              <div className="catering-field catering-toggle">
                <label htmlFor="isActive">Status</label>
                <div className="toggle-row">
                  <input
                    id="isActive"
                    type="checkbox"
                    checked={isActive}
                    onChange={(e) => setIsActive(e.target.checked)}
                  />
                  <span>{isActive ? "Visible on site" : "Hidden"}</span>
                </div>
              </div>
              <div className="catering-field catering-upload">
                <label>Cover Image</label>
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
                  <div className="catering-upload__preview">
                    <img
                      src={preview}
                      alt="preview"
                      onError={(e) => (e.currentTarget.style.opacity = 0.4)}
                    />
                  </div>
                ) : null}
              </div>
            </div>
          </section>

          <section className="catering-form__section">
            <div className="catering-section__title">Pricing & People</div>
            <div className="catering-field-grid">
              <div className="catering-field">
                <label>Price</label>
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
              <div className="catering-field">
                <label>Price Type</label>
                <select
                  className="od-select"
                  value={priceType}
                  onChange={(e) => setPriceType(e.target.value)}
                >
                  <option value="per_tray">Per Tray</option>
                  <option value="per_person">Per Person</option>
                </select>
              </div>
              <div className="catering-field">
                <label>Minimum People</label>
                <input
                  type="number"
                  className="od-input"
                  value={minPeople}
                  onChange={(e) => setMinPeople(e.target.value)}
                  placeholder="20"
                  min="0"
                />
              </div>
              <div className="catering-note">
                <p>Customers will see this pricing and minimum on the package page.</p>
              </div>
            </div>
          </section>
        </div>

        <section className="catering-form__section">
          <div className="catering-section__title">Menu items & extras</div>
          <MenuItemPicker value={selectedItemIds} onChange={setSelectedItemIds} onItemsLoaded={handleItemsLoaded} />

          <div className="catering-extras">
            <div className="catering-extras__header">
              <div>
                <p className="catering-kicker">Extras</p>
                <h4>Offer add-ons per item (comma separated)</h4>
                <p className="catering-helper">Shown to customers when ordering this catering option.</p>
              </div>
              <span className="catering-pill pill--outline">
                {selectedItemIds.length} item{selectedItemIds.length === 1 ? "" : "s"}
              </span>
            </div>
            {selectedItemIds.length === 0 && (
              <p className="catering-empty">Select menu items first.</p>
            )}
            <div className="catering-extras__grid">
              {selectedItemIds.map((id) => {
                const item = itemsLookup[id];
                const label = item?.name || item?.title || `Item ${id}`;
                return (
                  <div key={id} className="catering-extras__card">
                    <div className="catering-extras__title">{label}</div>
                    <input
                      type="text"
                      className="catering-extras__input"
                      placeholder="Example: with gravy, extra spicy"
                      value={itemExtras[id] || ""}
                      onChange={(e) =>
                        setItemExtras((prev) => ({ ...prev, [id]: e.target.value }))
                      }
                    />
                    <p className="catering-helper">Separate with a comma. Leave blank if none.</p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        <section className="catering-form__section">
          <div className="catering-section__title">General selection rules</div>
          <div className="catering-rules">
            <div className="catering-rules__toggle">
              <div className="toggle-row">
                <input
                  id="selectionRules"
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
                <label htmlFor="selectionRules">Apply general catering limits</label>
              </div>
              <p className="catering-helper">Gate how many items customers can choose per category.</p>
            </div>

            {selectionRules.enabled && (
              <>
                <div className="catering-rules__presets">
                  {Object.values(GENERAL_PROFILES).map((preset) => {
                    const isPresetActive = (selectionRules.type || "classic") === preset.key;
                    return (
                      <label
                        key={preset.key}
                        className={`catering-pill pill--outline preset-pill ${isPresetActive ? "preset-pill--active" : ""}`}
                      >
                        <input
                          type="radio"
                          name="generalType"
                          value={preset.key}
                          checked={isPresetActive}
                          onChange={(e) => {
                            const nextType = e.target.value;
                            setSelectionRules((prev) => {
                              const defaults = getPresetDefaults(nextType);
                              const nextLimits = { ...defaults };
                              Object.entries(prev.categoryLimits || {}).forEach(([key, val]) => {
                                if (defaults[key] !== undefined) nextLimits[key] = val;
                              });
                              return { ...prev, type: nextType, categoryLimits: nextLimits };
                            });
                          }}
                        />
                        <span>{preset.label}</span>
                        {isPresetActive && <span className="preset-pill__tag">Selected</span>}
                      </label>
                    );
                  })}
                </div>

                <div className="catering-rules__grid">
                  {limitKeys.map((key) => {
                    const defaultVal = activePreset.defaults?.[key] ?? 0;
                    return (
                      <div key={key} className="catering-field">
                        <label className="capitalize">{key}</label>
                        <input
                          type="number"
                          min="0"
                          className="od-input"
                          value={selectionRules.categoryLimits?.[key] ?? defaultVal}
                          onChange={(e) => updateLimit(key, e.target.value)}
                        />
                      </div>
                    );
                  })}
                </div>

                <div className="catering-helper">
                  Preset summary: {presetSummary}
                </div>
              </>
            )}
          </div>
        </section>

        <div className="catering-form__footer">
          <button
            type="button"
            onClick={onClose}
            className="catering-ghost-btn"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={saving}
            className="catering-primary-btn"
          >
            {saving ? "Saving..." : (initial ? "Update" : "Create")}
          </button>
        </div>
      </form>
    </Modal>
  );
}
