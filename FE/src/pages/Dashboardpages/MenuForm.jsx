// src/pages/admin/MenuForm.jsx
import { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axiosInstance from "../../config/axios.config";
import { slugify } from "../../utils/slugify";

const API_URL = (import.meta.env.VITE_API_URL || "http://localhost:5000/api").replace(/\/+$/, "");
const SERVER_URL = API_URL.replace(/\/api$/, "");
const CHICKEN_SLUG = "chicken";
const CHICKEN_PLACEHOLDER = "__create_chicken__";

const absUrl = (u = "") => {
  if (!u) return "";
  if (/^https?:\/\//i.test(u)) return u;
  return `${SERVER_URL}${u.startsWith("/") ? "" : "/"}${u}`;
};

export default function MenuForm() {
  const { id } = useParams();
  const navigate = useNavigate();

  // form state (BlogForm-style: 1 state per field)
  const [categories, setCategories] = useState([]);
  const [name, setName] = useState("");
  const [category, setCategory] = useState("");
  const [price, setPrice] = useState("");
  const [description, setDescription] = useState("");
  const [isAvailable, setIsAvailable] = useState(true);
  const [featured, setFeatured] = useState(false);
  const [glutenFree, setGlutenFree] = useState(false);
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState("");
  const [error, setError] = useState("");

  const normalizeCategories = useCallback((list = []) => {
    const normalized = list.map((c, idx) => {
      const id = c?._id || c?.id || c?.value || c?.slug || c?.name || idx;
      return {
        _id: String(id),
        name: c?.name || c?.title || c?.label || c?.slug || "Untitled",
        slug: c?.slug || slugify(c?.name || c?.title || ""),
        isPlaceholder: false,
      };
    });
    const hasChicken = normalized.some((c) => c.slug?.toLowerCase() === CHICKEN_SLUG || c.name?.toLowerCase() === "chicken");
    if (!hasChicken) {
      normalized.push({
        _id: CHICKEN_PLACEHOLDER,
        name: "Chicken",
        slug: CHICKEN_SLUG,
        isPlaceholder: true,
      });
    }
    return normalized;
  }, []);

  const fetchCategories = useCallback(async () => {
    try {
      const res = await axiosInstance.get("/menu-categories"); // adjust route name
      const list = res?.data?.data || res?.data || res || [];
      const normalized = normalizeCategories(Array.isArray(list) ? list : []);
      setCategories(normalized);
      return normalized;
    } catch (err) {
      console.error("Failed to load categories", err);
      return [];
    }
  }, [normalizeCategories]);

  const ensureChickenCategory = useCallback(async () => {
    const existing = categories.find(
      (c) => !c.isPlaceholder && (c.slug?.toLowerCase() === CHICKEN_SLUG || c.name?.toLowerCase() === "chicken")
    );
    if (existing) return existing._id;
    try {
      const res = await axiosInstance.post("/menu-categories", {
        name: "Chicken",
        slug: CHICKEN_SLUG,
        isActive: true,
      });
      const created = res?.data?.data || res?.data || res || {};
      const id = created?._id || created?.id || created?.value || created?.slug || CHICKEN_SLUG;
      const normalized = {
        _id: String(id),
        name: created?.name || "Chicken",
        slug: created?.slug || CHICKEN_SLUG,
        isPlaceholder: false,
      };
      setCategories((prev) => {
        const filtered = (prev || []).filter((c) => c._id !== CHICKEN_PLACEHOLDER);
        return [...filtered, normalized];
      });
      return id;
    } catch (err) {
      console.error("Failed to create Chicken category", err);
      const refreshed = await fetchCategories();
      const fallback = refreshed.find(
        (c) => c.slug?.toLowerCase() === CHICKEN_SLUG || c.name?.toLowerCase() === "chicken"
      );
      return fallback?._id || "";
    }
  }, [categories, fetchCategories]);

  // load for edit
  useEffect(() => {
    if (!id) return;
    (async () => {
      try {
        const body = await axiosInstance.get(`/menu/${id}`);
        const d = body?.data || body; // interceptor may unwrap
        setName(d.name || "");
        setCategory(d.category?._id || d.category || "");
        setPrice(d.price ?? "");
        setDescription(d.description || "");
        setIsAvailable(!!d.isAvailable);
        setFeatured(!!d.featured);
        setGlutenFree(!!(d.glutenFree || d.isGlutenFree));
        // set preview from existing image path
        if (d.image) setPreview(absUrl(d.image));
        else if (d.photo) setPreview(absUrl(d.photo));
      } catch (err) {
        setError(err?.message || "Failed to load menu item");
      }
    })();
  }, [id]);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);


  const onFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) {
      setImage(null);
      // keep existing preview for edit if user clears file selection
      return;
    }
    if (!file.type?.startsWith("image/")) {
      setError("Please select a valid image file");
      e.target.value = "";
      return;
    }
    setError("");
    setImage(file);
    setPreview(URL.createObjectURL(file));
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      let categoryId = category;
      if (categoryId === CHICKEN_PLACEHOLDER) {
        categoryId = await ensureChickenCategory();
      }

      if (!categoryId) {
        setError("Please choose a category.");
        return;
      }

      const common = {
        name,
        slug: slugify(name),              // <-- add
        category: categoryId,             // <-- must be _id if schema is ObjectId ref
        price: Number(price || 0),
        description,
        isAvailable,
        featured,
        glutenFree,
      };

      let payload, headers;

      if (image) {
        // Need multipart only when a file is present
        const fd = new FormData();
        Object.entries(common).forEach(([k, v]) => fd.append(k, String(v)));
        fd.append("image", image);        // pick one server key; avoid duplicating
        payload = fd;
        headers = { "Content-Type": "multipart/form-data" };
      } else {
        // Send JSON so express.json() can parse it
        payload = common;
        headers = { "Content-Type": "application/json" };
      }

      if (id) {
        await axiosInstance.put(`/menu/${id}`, payload, { headers });
      } else {
        await axiosInstance.post(`/menu`, payload, { headers });
      }

      navigate("/admin/menu", { replace: true });
    } catch (err) {
      const msg =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        err?.message ||
        "Save failed";
      setError(msg);
      console.error("Menu submit error:", err?.response?.data || err);
    }

  };
  return (
    <div className="admin-page-container">
      <div className="admin-form-card">
        <div className="admin-form-header">
          <h2>{id ? "Edit Menu Item" : "Add Menu Item"}</h2>
          <div className="accent-line"></div>
        </div>

        {error && <div className="form-error-banner mb-4">{error}</div>}

        <form onSubmit={onSubmit} className="admin-form-grid">
          <div className="form-field full-width">
            <label>Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              placeholder="e.g. Traditional Charcoal Chicken"
            />
          </div>

          <div className="form-field half-width">
            <label>Category</label>
            <div className="select-wrap">
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                required
              >
                <option value="">-- Select Category --</option>
                {categories.map((c) => (
                  <option key={c._id} value={c._id}>
                    {c.name}{c.isPlaceholder ? " (create)" : ""}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-field half-width">
            <label>Price (AUD)</label>
            <input
              type="number"
              step="0.01"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder="0.00"
            />
          </div>

          <div className="form-field full-width">
            <label>Description</label>
            <textarea
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Enter item description..."
            />
          </div>

          <div className="form-field full-width">
            <div className="options-group">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={isAvailable}
                  onChange={(e) => setIsAvailable(e.target.checked)}
                />
                <span>Available for order</span>
              </label>
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={featured}
                  onChange={(e) => setFeatured(e.target.checked)}
                />
                <span>Featured Item</span>
              </label>
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={glutenFree}
                  onChange={(e) => setGlutenFree(e.target.checked)}
                />
                <span>Gluten-free (GF)</span>
              </label>
            </div>
          </div>

          <div className="form-field full-width">
            <label>Item Image</label>
            <div className="image-upload-zone">
              <input type="file" accept="image/*" onChange={onFileChange} />
              {preview && (
                <div className="image-preview">
                  <img
                    src={preview}
                    alt="Preview"
                    onError={(e) => {
                      e.currentTarget.src =
                        "data:image/svg+xml;charset=UTF-8," +
                        encodeURIComponent(
                          `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 160 120'><rect width='100%' height='100%' fill='#1a1a1a'/><text x='50%' y='50%' dominant-baseline='middle' text-anchor='middle' font-family='sans-serif' font-size='12' fill='#333'>no image</text></svg>`
                        );
                    }}
                  />
                </div>
              )}
            </div>
          </div>

          <div className="form-actions">
            <button className="submit-btn" type="submit">
              {id ? "Update Item" : "Create Item"}
            </button>
            <button
              type="button"
              className="back-btn"
              onClick={() => navigate(-1)}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
