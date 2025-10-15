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
  const [title, setTitle] = useState(initial?.title || "");
  const [slug, setSlug] = useState(initial?.slug || "");
  const [order, setOrder] = useState(initial?.order ?? 0);
  const [price, setPrice] = useState(initial?.price ?? "");
  const [priceType, setPriceType] = useState(initial?.priceType || "per_tray");
  const [minPeople, setMinPeople] = useState(initial?.minPeople ?? "");
  const [isActive, setIsActive] = useState(Boolean(initial?.isActive));
  const [imageFile, setImageFile] = useState(null);

  const initialItemIds = useMemo(
    () => (Array.isArray(initial?.items) ? initial.items.map(String) : []),
    [initial]
  );
  const [selectedItemIds, setSelectedItemIds] = useState(initialItemIds);

  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState("");

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
            className="rounded-md px-2 py-1 border border-gray-600 text-gray-200 hover:bg-gray-800"
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
              className="w-full bg-[#141414] border border-gray-700 rounded-md px-3 py-2 text-gray-100"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., BBQ Feast"
            />
          </div>

          <div>
            <label className="block mb-1 text-sm font-semibold text-gray-200">Slug</label>
            <input
              className="w-full bg-[#141414] border border-gray-700 rounded-md px-3 py-2 text-gray-100"
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              placeholder="bbq-feast"
            />
          </div>

          <div>
            <label className="block mb-1 text-sm font-semibold text-gray-200">Order</label>
            <input
              type="number"
              className="w-full bg-[#141414] border border-gray-700 rounded-md px-3 py-2 text-gray-100"
              value={order}
              onChange={(e) => setOrder(e.target.value)}
            />
          </div>

          <div>
            <label className="block mb-1 text-sm font-semibold text-gray-200">Price</label>
            <input
              type="number"
              className="w-full bg-[#141414] border border-gray-700 rounded-md px-3 py-2 text-gray-100"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder="160"
            />
          </div>

          <div>
            <label className="block mb-1 text-sm font-semibold text-gray-200">Price Type</label>
            <select
              className="od-select height-10 !important"
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
              className="w-full bg-[#141414] border border-gray-700 rounded-md px-3 py-2 text-gray-100"
              value={minPeople}
              onChange={(e) => setMinPeople(e.target.value)}
              placeholder="20"
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
              className="w-full bg-[#141414] border border-gray-700 rounded-md px-3 py-2 text-gray-100"
              onChange={(e) => setImageFile(e.target.files?.[0] || null)}
            />
          </div>

          <div className="md:col-span-2">
            <label className="block mb-1 text-sm font-semibold text-gray-200">Items</label>
            <MenuItemPicker value={selectedItemIds} onChange={setSelectedItemIds} />
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 mt-6">
          <button
            type="button"
            onClick={onClose}
            className="od-btn od-btn--danger"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={saving}
            className="od-btn od-btn--danger color-white"
          >
            {saving ? "Saving..." : (initial ? "Update" : "Create")}
          </button>
        </div>
      </form>
    </Modal>
  );
}
