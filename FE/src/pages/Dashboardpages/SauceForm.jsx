import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

export default function SauceForm() {
  const { id } = useParams();
  const isEdit = !!id;
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: '',
    price: '',
    description: '',
    isAvailable: true,
    order: 0,
  });
  const [imageFile, setImageFile] = useState(null);
  const [preview, setPreview] = useState('');
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState('');

  useEffect(() => {
    if (!isEdit) return;
    (async () => {
      try {
        const res = await fetch(`/api/sauces/${id}`);
        const json = await res.json();
        if (!json.success) throw new Error(json.message || 'Failed');
        setForm({
          name: json.data.name || '',
          price: json.data.price ?? '',
          description: json.data.description || '',
          isAvailable: !!json.data.isAvailable,
          order: json.data.order ?? 0,
        });
        setPreview(json.data.image || '');
      } catch (e) {
        setErr(e.message);
      }
    })();
  }, [id, isEdit]);

  function onChange(e) {
    const { name, value, type, checked } = e.target;
    setForm((s) => ({ ...s, [name]: type === 'checkbox' ? checked : value }));
  }

  function onFile(e) {
    const f = e.target.files?.[0];
    setImageFile(f || null);
    if (f) setPreview(URL.createObjectURL(f));
  }

  async function onSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setErr('');

    try {
      const fd = new FormData();
      fd.append('name', form.name.trim());
      fd.append('price', String(form.price || 0));
      fd.append('description', form.description || '');
      fd.append('isAvailable', String(!!form.isAvailable));
      fd.append('order', String(form.order || 0));
      if (imageFile) fd.append('image', imageFile);

      const res = await fetch(isEdit ? `/api/sauces/${id}` : '/api/sauces', {
        method: isEdit ? 'PUT' : 'POST',
        body: fd,
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.message || 'Save failed');

      navigate('/admin/sauces');
    } catch (e) {
      setErr(e.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="container" style={{ maxWidth: 720 }}>
      <h2 className="mb-3">{isEdit ? 'Edit Sauce' : 'Add Sauce'}</h2>
      {err && <p style={{ color: 'tomato' }}>{err}</p>}
      <form onSubmit={onSubmit}>
        <div className="mb-3">
          <label className="form-label">Name *</label>
          <input className="form-control" name="name" value={form.name} onChange={onChange} required />
        </div>

        <div className="mb-3">
          <label className="form-label">Price (NPR/USD) *</label>
          <input className="form-control" name="price" type="number" min="0" step="0.01" value={form.price} onChange={onChange} required />
        </div>

        <div className="mb-3">
          <label className="form-label">Description</label>
          <textarea className="form-control" rows={3} name="description" value={form.description} onChange={onChange} />
        </div>

        <div className="mb-3">
          <label className="form-label">Image (upload)</label>
          <input className="form-control" type="file" accept="image/*" onChange={onFile} />
          {preview ? (
            <div style={{ marginTop: 8 }}>
              <img src={preview} alt="preview" style={{ maxWidth: 240, borderRadius: 8 }} />
            </div>
          ) : null}
        </div>

        <div className="mb-3 form-check">
          <input className="form-check-input" type="checkbox" id="isAvailable" name="isAvailable" checked={form.isAvailable} onChange={onChange} />
          <label className="form-check-label" htmlFor="isAvailable">Available</label>
        </div>

        <div className="mb-3">
          <label className="form-label">Order (sort)</label>
          <input className="form-control" name="order" type="number" value={form.order} onChange={onChange} />
        </div>

        <button className="btn btn-primary" disabled={loading}>{loading ? 'Saving…' : 'Save'}</button>
      </form>
    </div>
  );
}
