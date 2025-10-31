import { useEffect, useState } from "react";

export default function NoticeForm({ initial, onSubmit, saving }) {
  const [form, setForm] = useState({
    title: "",
    linkUrl: "",
    isActive: true,
    dismissible: true,
    priority: 0,
    startsAt: "",
    endsAt: "",
  });
  const [file, setFile] = useState(null);

  useEffect(() => {
    if (initial) {
      setForm({
        title: initial.title || "",
        linkUrl: initial.linkUrl || "",
        isActive: !!initial.isActive,
        dismissible: initial.dismissible !== false,
        priority: Number(initial.priority || 0),
        // Expect ISO string from API; trim for datetime-local
        startsAt: initial.startsAt ? initial.startsAt.slice(0, 16) : "",
        endsAt: initial.endsAt ? initial.endsAt.slice(0, 16) : "",
      });
    }
  }, [initial]);

  const update = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((s) => ({ ...s, [name]: type === "checkbox" ? checked : value }));
  };

  const submit = (e) => {
    e.preventDefault();
    onSubmit(form, file);
  };

  return (
    <form onSubmit={submit} className="grid gap-3" style={{ maxWidth: 560 }}>
      <label className="grid gap-1">
        <span>Title</span>
        <input name="title" value={form.title} onChange={update} required />
      </label>

      <label className="grid gap-1">
        <span>Link URL (optional)</span>
        <input name="linkUrl" value={form.linkUrl} onChange={update} placeholder="/catering or https://…" />
      </label>

      <div className="flex items-center gap-4">
        <label className="flex items-center gap-2">
          <input type="checkbox" name="isActive" checked={form.isActive} onChange={update} />
          <span>Active</span>
        </label>
        <label className="flex items-center gap-2">
          <input type="checkbox" name="dismissible" checked={form.dismissible} onChange={update} />
          <span>Dismissible</span>
        </label>
      </div>

      <label className="grid gap-1">
        <span>Priority</span>
        <input type="number" name="priority" value={form.priority} onChange={update} />
      </label>

      <div className="grid sm:grid-cols-2 gap-3">
        <label className="grid gap-1">
          <span>Starts at</span>
          <input type="datetime-local" name="startsAt" value={form.startsAt} onChange={update} />
        </label>
        <label className="grid gap-1">
          <span>Ends at</span>
          <input type="datetime-local" name="endsAt" value={form.endsAt} onChange={update} />
        </label>
      </div>

      <label className="grid gap-1">
        <span>Banner Image</span>
        <input type="file" accept="image/*" onChange={(e) => setFile(e.target.files?.[0] || null)} />
        {initial?.imageUrl && (
          <div style={{ marginTop: 6 }}>
            <small>Current:</small><br />
            <img src={initial.imageUrl} alt="notice" style={{ maxWidth: 280, border: "1px solid #333" }} />
          </div>
        )}
      </label>

      <div className="flex gap-2 pt-2">
        <button type="submit" className="od-btn" disabled={saving}>
          {saving ? "Saving…" : (initial ? "Update Notice" : "Create Notice")}
        </button>
      </div>
    </form>
  );
}
