// src/pages/admin/ProjectForm.jsx
import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axiosInstance from "../../config/axios.config";

export default function ProjectForm() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [title, setTitle] = useState("");
  const [client, setClient] = useState("");
  const [category, setCategory] = useState("");
  const [technologies, setTechnologies] = useState("");
  const [status, setStatus] = useState("planning"); // enum: planning | in-progress | completed | on-hold
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [shortDescription, setShortDescription] = useState("");
  const [description, setDescription] = useState(""); // required
  const [images, setImages] = useState([]);
  const [preview, setPreview] = useState([]);
  const [featured, setFeatured] = useState(false);   // ✅ new
  const [isPublic, setIsPublic] = useState(true);    // ✅ new
  const [error, setError] = useState(null);

  const baseURL = (import.meta.env.VITE_API_URL || "http://localhost:5000/api").replace(/\/api$/, "");

  // Load existing project (edit mode)
  useEffect(() => {
    if (!id) return;
    axiosInstance
      .get(`/projects/${id}`)
      .then((res) => {
        const p = res?.data?.data ?? res?.data ?? {};
        setTitle(p.title || "");
        setClient(p.client || "");
        setCategory(p.category || "");
        setTechnologies(Array.isArray(p.technologies) ? p.technologies.join(", ") : (p.technologies || ""));
        setStatus(p.status || "planning");
        setStartDate(p.duration?.start ? String(p.duration.start).slice(0, 10) : "");
        setEndDate(p.duration?.end ? String(p.duration.end).slice(0, 10) : "");
        setShortDescription(p.shortDescription || "");
        setDescription(p.description || "");
        setFeatured(Boolean(p.featured));      // ✅ populate
        setIsPublic(p.isPublic !== false);     // ✅ default true if missing
        if (Array.isArray(p.images)) {
          setPreview(p.images.map((img) => `${baseURL}${img.url}`));
        }
      })
      .catch((err) => setError(err?.response?.data?.message || err?.message || "Failed to load project"));
  }, [id, baseURL]);

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files || []);
    setImages(files);
    setPreview(files.map((f) => URL.createObjectURL(f)));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!description.trim()) {
      setError("Description is required.");
      return;
    }

    try {
      const formData = new FormData();
      formData.append("title", title);
      formData.append("client", client);
      formData.append("category", category);
      formData.append("technologies", technologies); // server splits/normalizes
      formData.append("status", status);
      formData.append("shortDescription", shortDescription);
      formData.append("description", description);
      formData.append("startDate", startDate);
      formData.append("endDate", endDate);
      formData.append("featured", String(!!featured)); // ✅ send as "true"/"false"
      formData.append("isPublic", String(!!isPublic)); // ✅ send as "true"/"false"
      images.forEach((file) => formData.append("images", file)); // field name must be "images"

      if (id) {
        await axiosInstance.put(`/projects/${id}`, formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      } else {
        await axiosInstance.post("/projects", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      }

      navigate("/admin/projects");
    } catch (err) {
      const msg =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        err?.message ||
        "Action failed";
      setError(msg);
    }
  };

  return (
    <div className="container py-5">
      <div className="card shadow-lg rounded-4 border-0 mx-auto" style={{ maxWidth: "900px" }}>
        <div className="card-body p-5">
          <h2 className="mb-4 fw-bold text-center">{id ? "Edit Project" : "Add New Project"}</h2>
          {error && <p className="text-danger">{error}</p>}

          <form onSubmit={handleSubmit} className="row g-4">
            <div className="col-md-6">
              <label className="form-label fw-semibold">Project Title</label>
              <input type="text" className="form-control form-control-lg" value={title} onChange={(e) => setTitle(e.target.value)} required />
            </div>
            <div className="col-md-6">
              <label className="form-label fw-semibold">Client</label>
              <input type="text" className="form-control form-control-lg" value={client} onChange={(e) => setClient(e.target.value)} />
            </div>

            <div className="col-md-6">
              <label className="form-label fw-semibold">Category</label>
              <input type="text" className="form-control form-control-lg" value={category} onChange={(e) => setCategory(e.target.value)} />
            </div>
            <div className="col-md-6">
              <label className="form-label fw-semibold">Technologies</label>
              <input
                type="text"
                className="form-control form-control-lg"
                placeholder="Turbine, Dam Construction, Hydraulic Modeling"
                value={technologies}
                onChange={(e) => setTechnologies(e.target.value)}
              />
            </div>

            <div className="col-md-6">
              <label className="form-label fw-semibold">Status</label>
              <select className="form-select form-select-lg" value={status} onChange={(e) => setStatus(e.target.value)}>
                <option value="planning">Planning</option>
                <option value="in-progress">In Progress</option>
                <option value="completed">Completed</option>
                <option value="on-hold">On Hold</option>
              </select>
            </div>

            <div className="col-md-6">
              <label className="form-label fw-semibold">Start Date</label>
              <input type="date" className="form-control form-control-lg" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
            </div>
            <div className="col-md-6">
              <label className="form-label fw-semibold">End Date</label>
              <input type="date" className="form-control form-control-lg" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
            </div>

            <div className="col-12">
              <label className="form-label fw-semibold">Short Description</label>
              <textarea
                className="form-control form-control-lg"
                rows="2"
                maxLength={200}
                value={shortDescription}
                onChange={(e) => setShortDescription(e.target.value)}
                placeholder="Max 200 characters"
              />
            </div>

            <div className="col-12">
              <label className="form-label fw-semibold">
                Description <span className="text-danger">*</span>
              </label>
              <textarea
                className="form-control form-control-lg"
                rows="5"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
              />
            </div>

            {/* ✅ Visibility & Featured toggles */}
            <div className="col-md-6 d-flex align-items-center">
              <div className="form-check form-switch">
                <input
                  id="isPublic"
                  className="form-check-input"
                  type="checkbox"
                  checked={isPublic}
                  onChange={(e) => setIsPublic(e.target.checked)}
                />
                <label className="form-check-label ms-2" htmlFor="isPublic">
                  Public (visible on site)
                </label>
              </div>
            </div>

            <div className="col-md-6 d-flex align-items-center">
              <div className="form-check form-switch">
                <input
                  id="featured"
                  className="form-check-input"
                  type="checkbox"
                  checked={featured}
                  onChange={(e) => setFeatured(e.target.checked)}
                />
                <label className="form-check-label ms-2" htmlFor="featured">
                  Featured (show in header menu/featured list)
                </label>
              </div>
            </div>

            <div className="col-12">
              <label className="form-label fw-semibold">Project Images</label>
              <input type="file" className="form-control form-control-lg" accept="image/*" multiple onChange={handleFileChange} />
              {preview.length > 0 && (
                <div className="d-flex flex-wrap gap-3 mt-3">
                  {preview.map((src, i) => (
                    <img key={i} src={src} alt="Preview" style={{ width: 100, height: 100, objectFit: "cover", borderRadius: 8 }} />
                  ))}
                </div>
              )}
            </div>

            <div className="col-12">
              <button className="btn btn-primary btn-lg w-100 rounded-3 fw-bold">
                {id ? "Update Project" : "Create Project"}
              </button>
            </div>
          </form>

          {/* Tiny hint so editors know what "Featured" does */}
          <p className="text-muted mt-3" style={{ fontSize: 13 }}>
            Tip: Mark a project as <b>Featured</b> to include it in the header “PROJECT” dropdown when you fetch featured items.
          </p>
        </div>
      </div>
    </div>
  );
}
