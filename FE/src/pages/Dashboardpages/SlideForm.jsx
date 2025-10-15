// src/pages/admin/SlideForm.jsx
import { useEffect, useRef, useState } from "react";
import axiosInstance from "../../config/axios.config";

const TYPES = [
  { value: "menu", label: "Menu" },
  { value: "cateringmenu", label: "Catering Menu" },
];

export default function SlideForm({ typeDefault = "menu", initialData = null, onClose, onSaved }) {
  const isEdit = !!(initialData?._id || initialData?.id);
  const [type, setType] = useState(initialData?.type || typeDefault);
  const [title, setTitle] = useState(initialData?.title || "");
  const [caption, setCaption] = useState(initialData?.caption || "");
  const [linkTo, setLinkTo] = useState(initialData?.linkTo || "");
  const [order, setOrder] = useState(initialData?.order ?? 0);
  const [isActive, setIsActive] = useState(initialData?.isActive ?? true);
  const [file, setFile] = useState(null);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState("");

  const dlg = useRef(null);
  useEffect(() => { try { dlg.current?.showModal?.(); } catch {} }, []);

  const onSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setErr("");

    try {
      // build form-data
      const fd = new FormData();
      fd.append("type", type);
      fd.append("title", title);
      fd.append("caption", caption);
      fd.append("linkTo", linkTo);
      fd.append("order", String(order ?? 0));
      fd.append("isActive", String(!!isActive));
      if (!isEdit && !file) {
        setSaving(false);
        setErr("Image is required for a new slide.");
        return;
      }
      if (file) fd.append("image", file); // field name MUST be "image"

      // IMPORTANT: Do NOT set Content-Type manually; let Axios add the boundary.
      const url = isEdit
        ? `/menu-slides/${initialData._id || initialData.id}`
        : `/menu-slides`;

      const res = isEdit
        ? await axiosInstance.put(url, fd)
        : await axiosInstance.post(url, fd);

      if (res?.data) onSaved?.(res.data);
    } catch (e2) {
      // Surface useful backend message
      const msg = e2?.response?.data?.message || e2?.message || "Save failed.";
      setErr(msg);
      // Quick hints:
      // - If 401/403: token/permission issue (see section 3).
      // - If 400 with Multer text: field name must be "image".
      // - If 404: route path mismatch (see section 2).
    } finally {
      setSaving(false);
    }
  };

  return (
    <dialog ref={dlg} className="od-modal" onClose={onClose}>
      {/* Backdrop */}
      <div
        className="od-modal__backdrop"
        onClick={(e) => { if (e.target === e.currentTarget) onClose?.(); }}
        style={{ display: "grid", placeItems: "center", minHeight: "100%" }}
      >
        {/* Panel */}
        <div className="od-modal__panel" onClick={(e)=>e.stopPropagation()}>
          <div className="od-modal__header">
            <h3 className="od-modal__title">{isEdit ? "Edit Slide" : "Add Slide"}</h3>
            <button type="button" className="od-modal__close" onClick={onClose} aria-label="Close">×</button>
          </div>

          <form className="od-form" onSubmit={onSubmit}>
            <div className="od-form__grid">
              <label className="od-field">
                <span className="od-label">Type</span>
                <select value={type} onChange={(e)=>setType(e.target.value)} className="od-input" required>
                  {TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                </select>
              </label>

              <label className="od-field">
                <span className="od-label">Title</span>
                <input className="od-input" value={title} onChange={(e)=>setTitle(e.target.value)} />
              </label>

              <label className="od-field" style={{ gridColumn: "1 / -1" }}>
                <span className="od-label">Caption</span>
                <textarea className="od-input" rows={2} value={caption} onChange={(e)=>setCaption(e.target.value)} />
              </label>

              <label className="od-field">
                <span className="od-label">Link To</span>
                <input className="od-input" value={linkTo} onChange={(e)=>setLinkTo(e.target.value)} placeholder="/menu/hot-dishes" />
              </label>

              <label className="od-field">
                <span className="od-label">Order</span>
                <input type="number" className="od-input" value={order} onChange={(e)=>setOrder(Number(e.target.value))} />
              </label>

              <label className="od-field" style={{ display:"flex", alignItems:"center", gap:10 }}>
                <input type="checkbox" checked={isActive} onChange={(e)=>setIsActive(e.target.checked)} />
                <span>Active</span>
              </label>

              <label className="od-field" style={{ gridColumn: "1 / -1" }}>
                <span className="od-label">{isEdit ? "Replace Image (optional)" : "Image"}</span>
                <input
                  type="file"
                  accept="image/*"
                  className="od-input"
                  onChange={(e)=>setFile(e.target.files?.[0] || null)}
                  {...(!isEdit ? { required:true } : {})}
                />
              </label>
            </div>

            {!!err && <div style={{ color: "crimson", marginTop: 8 }}>{err}</div>}

            <div className="d-flex justify-content-end g-3 mt-3">
              <button type="button" className="od-btn od-btn--ghost" onClick={onClose}>Cancel</button>
              <button type="submit" className="od-btn" disabled={saving}>{saving ? "Saving…" : (isEdit ? "Save Changes" : "Create Slide")}</button>
            </div>
          </form>
        </div>
      </div>
    </dialog>
  );
}
