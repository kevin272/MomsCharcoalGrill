import { useEffect, useState } from "react";

export default function NoticeForm({ initial, onSubmit, saving }) {
  const isEdit = !!initial;

  const [form, setForm] = useState({
    title: "",
    linkUrl: "",
    isActive: true,
    dismissible: true,
    priority: 0,
    startsAt: "",   // yyyy-MM-ddTHH:mm
    endsAt: "",     // yyyy-MM-ddTHH:mm
  });
  const [imageFile, setImageFile] = useState(null);
  const [preview, setPreview] = useState("");
  const [err, setErr] = useState("");

  useEffect(() => {
    if (!initial) return;
    setForm({
      title: initial.title || "",
      linkUrl: initial.linkUrl || "",
      isActive: !!initial.isActive,
      dismissible: initial.dismissible !== false,
      priority: Number(initial.priority || 0),
      startsAt: initial.startsAt ? toLocalInput(initial.startsAt) : "",
      endsAt: initial.endsAt ? toLocalInput(initial.endsAt) : "",
    });
    setPreview(initial.imageUrl || "");
  }, [initial]);

  function toLocalInput(iso) {
    // convert ISO → "YYYY-MM-DDTHH:mm" for datetime-local
    const d = new Date(iso);
    const pad = (n) => String(n).padStart(2, "0");
    const yyyy = d.getFullYear();
    const mm = pad(d.getMonth() + 1);
    const dd = pad(d.getDate());
    const hh = pad(d.getHours());
    const min = pad(d.getMinutes());
    return `${yyyy}-${mm}-${dd}T${hh}:${min}`;
  }

  function onChange(e) {
    const { name, value, type, checked } = e.target;
    setForm((s) => ({ ...s, [name]: type === "checkbox" ? checked : value }));
  }

  function onFile(e) {
    const f = e.target.files?.[0];
    setImageFile(f || null);
    if (f) setPreview(URL.createObjectURL(f));
  }

  async function submit(e) {
    e.preventDefault();
    setErr("");
    try {
      await onSubmit(
        {
          title: form.title.trim(),
          linkUrl: form.linkUrl.trim(),
          isActive: !!form.isActive,
          dismissible: !!form.dismissible,
          priority: Number(form.priority || 0),
          // send as strings compatible with FormData
          startsAt: form.startsAt || "",
          endsAt: form.endsAt || "",
        },
        imageFile
      );
    } catch (e2) {
      setErr(e2?.message || "Save failed");
    }
  }

  return (
    <div className="container" style={{ maxWidth: 720 }}>
      <h2 className="mb-3" style={{marginTop: 20}}>{isEdit ? "Edit Notice" : "Add Notice"}</h2>
      {err && <p style={{ color: "tomato" }}>{err}</p>}

      <form onSubmit={submit}>
        <div className="mb-3">
          <label className="form-label">Title *</label>
          <input
            className="form-control"
            name="title"
            value={form.title}
            onChange={onChange}
            required
          />
        </div>

        <div className="mb-3">
          <label className="form-label">Link URL (optional)</label>
          <input
            className="form-control"
            name="linkUrl"
            placeholder="/catering or https://…"
            value={form.linkUrl}
            onChange={onChange}
          />
        </div>

        <div className="mb-3">
          <label className="form-label">Priority (sort)</label>
          <input
            className="form-control"
            name="priority"
            type="number"
            value={form.priority}
            onChange={onChange}
          />
        </div>

        <div className="mb-3">
          <label className="form-label">Starts at</label>
          <input
            className="form-control"
            type="datetime-local"
            name="startsAt"
            value={form.startsAt}
            onChange={onChange}
          />
        </div>

        <div className="mb-3">
          <label className="form-label">Ends at</label>
          <input
            className="form-control"
            type="datetime-local"
            name="endsAt"
            value={form.endsAt}
            onChange={onChange}
          />
        </div>

        <div className="mb-3">
          <label className="form-label">Image (upload)</label>
          <input
            className="form-control"
            type="file"
            accept="image/*"
            onChange={onFile}
          />
          {preview ? (
            <div style={{ marginTop: 8 }}>
              <img
                src={preview}
                alt="preview"
                style={{ maxWidth: 240, borderRadius: 8 }}
              />
            </div>
          ) : null}
        </div>

        <div className="mb-3 form-check">
          <input
            className="form-check-input"
            type="checkbox"
            id="isActive"
            name="isActive"
            checked={form.isActive}
            onChange={onChange}
          />
          <label className="form-check-label" htmlFor="isActive">
            Active
          </label>
        </div>

        <div className="mb-3 form-check">
          <input
            className="form-check-input"
            type="checkbox"
            id="dismissible"
            name="dismissible"
            checked={form.dismissible}
            onChange={onChange}
          />
          <label className="form-check-label" htmlFor="dismissible">
            Dismissible (show close button)
          </label>
        </div>

        <button className="btn btn-primary" disabled={saving}>
          {saving ? "Saving…" : isEdit ? "Update Notice" : "Save"}
        </button>
      </form>
    </div>
  );
}
