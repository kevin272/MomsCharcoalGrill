import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axiosInstance from "../../config/axios.config";

export default function ProjectEdit() {
  const { id } = useParams();
  const navigate = useNavigate();
  const API_URL = (import.meta.env.VITE_API_URL || "http://localhost:5000/api").replace(/\/+$/, "");

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    shortDescription: "",
    category: "hydropower",
    status: "planning",
    featured: false,
    isPublic: true,
    capacityMW: "",
    river: "",
    client: "",
    technologies: "",
    startDate: "",
    endDate: "",
  });

  const [existingImages, setExistingImages] = useState([]);
  const [newImages, setNewImages] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Fetch project by ID
  useEffect(() => {
    (async () => {
      try {
        const body = await axiosInstance.get(`/projects/${id}`);
        const project = body.data;

        setFormData({
          title: project.title || "",
          description: project.description || "",
          shortDescription: project.shortDescription || "",
          category: project.category || "hydropower",
          status: project.status || "planning",
          featured: project.featured || false,
          isPublic: project.isPublic ?? true,
          capacityMW: project.capacityMW || "",
          river: project.river || "",
          client: project.client || "",
          technologies: project.technologies?.join(", ") || "",
          startDate: project.duration?.start ? project.duration.start.split("T")[0] : "",
          endDate: project.duration?.end ? project.duration.end.split("T")[0] : "",
        });

        setExistingImages(project.images || []); // [{ url, caption }]
      } catch {
        setError("Failed to load project data");
      }
    })();
  }, [id]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    setNewImages((prev) => [...prev, ...files]);
    const previews = files.map((file) => URL.createObjectURL(file));
    setImagePreviews((prev) => [...prev, ...previews]);
  };

  const removeExistingImage = (idx) => {
    setExistingImages((prev) => prev.filter((_, i) => i !== idx));
  };

  const removeNewImage = (idx) => {
    setNewImages((prev) => prev.filter((_, i) => i !== idx));
    setImagePreviews((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const payload = new FormData();
      const normalized = {
        ...formData,
        technologies: formData.technologies
          ? formData.technologies.split(",").map((t) => t.trim())
          : [],
        startDate: formData.startDate,
        endDate: formData.endDate,
      };

      Object.entries(normalized).forEach(([key, value]) => {
        payload.append(key, value);
      });

      // Optional: keep existing images (server currently ignores this,
      // but harmless if you add support later)
      existingImages.forEach((img) => {
        payload.append("existingImages", JSON.stringify(img));
      });

      newImages.forEach((file) => {
        payload.append("images", file);
      });

      await axiosInstance.put(`/projects/${id}`, payload, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      navigate("/admin/projects");
    } catch (err) {
      setError(err?.message || "Failed to update project");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container py-5 d-flex justify-content-center">
      <div className="card shadow-lg rounded-4 w-100" style={{ maxWidth: "800px" }}>
        <div className="card-body p-5">
          <h2 className="fw-bold mb-4 text-center">Edit Project</h2>
          {error && <div className="alert alert-danger">{error}</div>}

          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label className="fw-semibold">Project Title</label>
              <input type="text" name="title" value={formData.title} onChange={handleChange} className="form-control" required />
            </div>

            <div className="mb-3">
              <label className="fw-semibold">Status</label>
              <select name="status" value={formData.status} onChange={handleChange} className="form-select">
                <option value="planning">Planning</option>
                <option value="construction">Construction</option>
                <option value="completed">Completed</option>
              </select>
            </div>

            <div className="mb-3">
              <label className="fw-semibold">Description</label>
              <textarea name="description" value={formData.description} onChange={handleChange} className="form-control" rows={4} required />
            </div>

            <div className="mb-3">
              <label className="fw-semibold">Short Description</label>
              <input type="text" name="shortDescription" value={formData.shortDescription} onChange={handleChange} className="form-control" maxLength={200} />
            </div>

            <div className="mb-3">
              <label className="fw-semibold">Project Images</label>
              <div className="d-flex flex-wrap gap-2 mt-2">
                {existingImages.map((img, idx) => (
                  <div key={idx} className="position-relative border rounded overflow-hidden" style={{ width: "100px", height: "100px" }}>
                    <img
                      src={`${API_URL.replace("/api", "")}${img.url}`}
                      alt={img.caption}
                      className="w-100 h-100 object-fit-cover"
                    />
                    <button type="button" onClick={() => removeExistingImage(idx)} className="btn btn-sm btn-danger position-absolute top-0 end-0">
                      ×
                    </button>
                  </div>
                ))}

                {imagePreviews.map((src, idx) => (
                  <div key={idx} className="position-relative border rounded overflow-hidden" style={{ width: "100px", height: "100px" }}>
                    <img src={src} alt={`new-${idx}`} className="w-100 h-100 object-fit-cover" />
                    <button type="button" onClick={() => removeNewImage(idx)} className="btn btn-sm btn-danger position-absolute top-0 end-0">
                      ×
                    </button>
                  </div>
                ))}
              </div>
              <input type="file" multiple className="form-control mt-2" onChange={handleImageChange} />
            </div>

            <button type="submit" disabled={loading} className="btn btn-primary w-100">
              {loading ? "Updating..." : "Update Project"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
