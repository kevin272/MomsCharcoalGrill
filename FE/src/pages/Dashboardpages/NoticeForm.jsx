import { useEffect, useRef, useState } from "react";

export default function NoticeForm({ initial, initialId, onSubmit, saving }) {
  const [form, setForm] = useState({
    title: "",
    linkUrl: "",
    isActive: true,
    dismissible: true,
    priority: 0,
    startsAt: "", // "YYYY-MM-DDTHH:mm"
    endsAt: "",
  });
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState("");
  const [err, setErr] = useState("");
  const [loadingInitial, setLoadingInitial] = useState(false);

  const lastObjectUrlRef = useRef("");

  // cleanup object URL on unmount
  useEffect(() => {
    return () => {
      if (lastObjectUrlRef.current) URL.revokeObjectURL(lastObjectUrlRef.current);
    };
  }, []);

  // utils
  const toLocalInput = (iso) => {
    if (!iso) return "";
    const d = new Date(iso);
    if (isNaN(d)) return "";
    const pad = (n) => String(n).padStart(2, "0");
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
  };

  const hydrate = (n) => {
    setForm({
      title: n?.title || "",
      linkUrl: n?.linkUrl || "",
      isActive: !!n?.isActive,
      dismissible: n?.dismissible !== false,
      priority: Number(n?.priority || 0),
      startsAt: n?.startsAt ? toLocalInput(n.startsAt) : "",
      endsAt: n?.endsAt ? toLocalInput(n.endsAt) : "",
    });
    setPreview(n?.imageUrl || "");
  };

  // initial load (prop or fetch by id)
  useEffect(() => {
    if (initial) {
      hydrate(initial);
      return;
    }
    if (!initialId) return;

    let cancelled = false;
    (async () => {
      try {
        setLoadingInitial(true);
        const res = await fetch(`/api/notices/${initialId}`, { credentials: "include" });
        if (!res.ok) throw new Error("Failed to load notice");
        const data = await res.json();
        if (!cancelled) hydrate(data);
      } catch (e) {
        if (!cancelled) setErr(e?.message || "Failed to load notice");
      } finally {
        if (!cancelled) setLoadingInitial(false);
      }
    })();

    return () => { cancelled = true; };
  }, [initial, initialId]);

  // handlers
  const update = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((s) => ({
      ...s,
      [name]: type === "checkbox" ? checked : (name === "priority" ? Number(value) : value),
    }));
  };

  const onFileChange = (e) => {
    const f = e.target.files?.[0] || null;
    setFile(f);
    if (lastObjectUrlRef.current) {
      URL.revokeObjectURL(lastObjectUrlRef.current);
      lastObjectUrlRef.current = "";
    }
    if (f) {
      const url = URL.createObjectURL(f);
      lastObjectUrlRef.current = url;
      setPreview(url);
    } else {
      setPreview(initial?.imageUrl || "");
    }
  };

  const submit = async (e) => {
    e.preventDefault();
    setErr("");

    if (typeof onSubmit !== "function") {
      setErr("onSubmit is not a function (check the parent component).");
      return;
    }

    // simple date guard
    if (form.startsAt && form.endsAt) {
      const a = new Date(form.startsAt);
      const b = new Date(form.endsAt);
      if (!isNaN(a) && !isNaN(b) && a > b) {
        setErr("Ends at must be after Starts at.");
        return;
      }
    }

    try {
      await onSubmit(
        {
          title: form.title.trim(),
          linkUrl: form.linkUrl.trim(),
          isActive: !!form.isActive,
          dismissible: !!form.dismissible,
          priority: Number(form.priority || 0),
          startsAt: form.startsAt || "",
          endsAt: form.endsAt || "",
        },
        file
      );
    } catch (e2) {
      setErr(e2?.message || "Save failed");
    }
  };

  const isEdit = !!(initial || initialId);

  return (
    <div className="container" style={{ maxWidth: 720 }}>
      <h2 className="mb-3">{isEdit ? "Edit Notice" : "Create Notice"}</h2>

      {loadingInitial && <p className="mb-2">Loading…</p>}
      {err && <p className="mb-2" style={{ color: "tomato" }}>{err}</p>}

      <form onSubmit={submit}>
        <div className="mb-3">
          <label className="form-label" htmlFor="nf-title">Title *</label>
          <input id="nf-title" className="form-control" name="title" value={form.title} onChange={update} required />
        </div>

        <div className="mb-3">
          <label className="form-label" htmlFor="nf-link">Link URL (optional)</label>
          <input
            id="nf-link"
            className="form-control"
            name="linkUrl"
            value={form.linkUrl}
            onChange={update}
            placeholder="/catering or https://…"
          />
        </div>

        <div className="mb-3 d-flex gap-4 align-items-center">
          <div className="form-check">
            <input className="form-check-input" type="checkbox" id="nf-active" name="isActive" checked={form.isActive} onChange={update} />
            <label className="form-check-label" htmlFor="nf-active">Active</label>
          </div>
          <div className="form-check">
            <input className="form-check-input" type="checkbox" id="nf-dismiss" name="dismissible" checked={form.dismissible} onChange={update} />
            <label className="form-check-label" htmlFor="nf-dismiss">Dismissible</label>
          </div>
        </div>

        <div className="mb-3">
          <label className="form-label" htmlFor="nf-priority">Priority</label>
          <input
            id="nf-priority"
            className="form-control"
            type="number"
            name="priority"
            value={Number.isFinite(form.priority) ? form.priority : 0}
            onChange={update}
          />
        </div>

        <div className="row g-3">
          <div className="col-sm-6">
            <label className="form-label" htmlFor="nf-starts">Starts at</label>
            <input
              id="nf-starts"
              className="form-control"
              type="datetime-local"
              name="startsAt"
              value={form.startsAt}
              onChange={update}
            />
          </div>
          <div className="col-sm-6">
            <label className="form-label" htmlFor="nf-ends">Ends at</label>
            <input
              id="nf-ends"
              className="form-control"
              type="datetime-local"
              name="endsAt"
              value={form.endsAt}
              onChange={update}
            />
          </div>
        </div>

        <div className="mb-3" style={{ marginTop: 12 }}>
          <label className="form-label" htmlFor="nf-file">Banner Image</label>
          <input id="nf-file" className="form-control" type="file" accept="image/*" onChange={onFileChange} />
          {preview ? (
            <div style={{ marginTop: 8 }}>
              <img src={preview} alt="preview" style={{ maxWidth: 240, borderRadius: 8 }} />
            </div>
          ) : null}
        </div>

        <button className="btn btn-primary" disabled={saving}>
          {saving ? "Saving…" : (isEdit ? "Update Notice" : "Create Notice")}
        </button>
      </form>
    </div>
  );
}
