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
    <div className="admin-page-container">
      <div className="admin-form-card">
        <div className="admin-form-header">
          <h2>{isEdit ? 'Edit Sauce' : 'Add Sauce'}</h2>
          <div className="accent-line"></div>
        </div>

        {err && <div className="form-error-banner mb-4">{err}</div>}

        <form onSubmit={onSubmit} className="admin-form-grid">
          <div className="form-field full-width">
            <label>Name *</label>
            <input
              name="name"
              value={form.name}
              onChange={onChange}
              required
              placeholder="e.g. Garlic Aioli"
            />
          </div>

          <div className="form-field half-width">
            <label>Price (AUD) *</label>
            <input
              name="price"
              type="number"
              min="0"
              step="0.01"
              value={form.price}
              onChange={onChange}
              required
              placeholder="0.00"
            />
          </div>

          <div className="form-field half-width">
            <label>Display Order</label>
            <input
              name="order"
              type="number"
              value={form.order}
              onChange={onChange}
            />
          </div>

          <div className="form-field full-width">
            <label>Description</label>
            <textarea
              rows={3}
              name="description"
              value={form.description}
              onChange={onChange}
              placeholder="Briefly describe the sauce..."
            />
          </div>

          <div className="form-field full-width">
            <label>Product Image</label>
            <div className="image-upload-zone">
              <input type="file" accept="image/*" onChange={onFile} />
              {preview && (
                <div className="image-preview">
                  <img src={preview} alt="preview" />
                </div>
              )}
            </div>
          </div>

          <div className="form-field full-width">
            <div className="options-group">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  id="isAvailable"
                  name="isAvailable"
                  checked={form.isAvailable}
                  onChange={onChange}
                />
                <span>Available for order</span>
              </label>
            </div>
          </div>

          <div className="form-actions">
            <button className="submit-btn" disabled={loading}>
              {loading ? 'Saving…' : 'Save'}
            </button>
            <button
              type="button"
              className="back-btn"
              onClick={() => navigate('/admin/sauces')}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
