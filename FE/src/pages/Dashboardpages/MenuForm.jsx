// src/pages/admin/MenuForm.jsx
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axiosInstance from "../../config/axios.config";
import { slugify } from "../../utils/slugify";

const API_URL = (import.meta.env.VITE_API_URL || "http://localhost:5000/api").replace(/\/+$/, "");
const SERVER_URL = API_URL.replace(/\/api$/, "");

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
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState("");
  const [error, setError] = useState("");

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
        // set preview from existing image path
        if (d.image) setPreview(absUrl(d.image));
        else if (d.photo) setPreview(absUrl(d.photo));
      } catch (err) {
        setError(err?.message || "Failed to load menu item");
      }
    })();
  }, [id]);

    useEffect(() => {
    async function fetchCategories() {
      try {
        const res = await axiosInstance.get("/menu-categories"); // adjust route name
        const list = res?.data?.data || res?.data || res || [];
        setCategories(Array.isArray(list) ? list : []); // backend should return an array of categories
      } catch (err) {
        console.error("Failed to load categories", err);
      }
    }
    fetchCategories();
  }, []);


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
    const common = {
      name,
      slug: slugify(name),              // <-- add
      category,                         // <-- must be _id if schema is ObjectId ref
      price: Number(price || 0),
      description,
      isAvailable
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
    <div className="container py-5">
      <div className="card shadow-lg border-0 rounded-4 mx-auto" style={{ maxWidth: 900 }}>
        <div className="card-body p-5">
          <h2 className="mb-4 fw-bold text-center">{id ? "Edit Menu Item" : "Add Menu Item"}</h2>
          {error && <div className="alert alert-danger">{error}</div>}

          <form onSubmit={onSubmit} className="row g-4">
            <div className="col-12">
              <label className="form-label fw-semibold">Name</label>
              <input
                className="form-control form-control-lg"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            <div className="col-md-6">
  <label className="form-label fw-semibold">Category</label>
  <select
    className="form-control form-control-lg"
    value={category}
    onChange={(e) => setCategory(e.target.value)}
    required
  >
    <option value="">-- Select Category --</option>
    {categories.map((c) => (
      <option key={c._id} value={c._id}>
        {c.name}
      </option>
    ))}
  </select>
</div>


            <div className="col-md-6">
              <label className="form-label fw-semibold">Price</label>
              <input
                type="number"
                step="0.01"
                className="form-control form-control-lg"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="0.00"
              />
            </div>

            <div className="col-12">
              <label className="form-label fw-semibold">Description</label>
              <textarea
                className="form-control"
                rows={5}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>

            <div className="col-md-6 d-flex align-items-end">
              <div className="form-check">
                <input
                  id="isAvailable"
                  className="form-check-input"
                  type="checkbox"
                  checked={isAvailable}
                  onChange={(e) => setIsAvailable(e.target.checked)}
                />
                <label className="form-check-label" htmlFor="isAvailable">
                  Available
                </label>
              </div>
            </div>

            <div className="col-12">
              <label className="form-label fw-semibold">Image</label>
              <input type="file" className="form-control" accept="image/*" onChange={onFileChange} />
              {preview && (
                <div className="mt-3">
                  <img
                    src={preview}
                    alt="Preview"
                    style={{ width: 160, height: 120, objectFit: "cover", borderRadius: 8 }}
                    onError={(e) => {
                      e.currentTarget.src =
                        "data:image/svg+xml;charset=UTF-8," +
                        encodeURIComponent(
                          `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 160 120'><rect width='100%' height='100%' fill='#e5e7eb'/><text x='50%' y='50%' dominant-baseline='middle' text-anchor='middle' font-family='sans-serif' font-size='12' fill='#9ca3af'>no image</text></svg>`
                        );
                    }}
                  />
                </div>
              )}
            </div>

            <div className="col-12 d-flex gap-3">
              <button className="btn btn-primary btn-lg rounded-3 fw-bold" type="submit">
                {id ? "Update Item" : "Create Item"}
              </button>
              <button
                type="button"
                className="btn btn-outline-secondary btn-lg rounded-3"
                onClick={() => navigate(-1)}
              >
                Back
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
