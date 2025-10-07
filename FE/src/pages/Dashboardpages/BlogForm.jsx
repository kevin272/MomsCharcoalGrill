// src/pages/admin/BlogForm.jsx
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axiosInstance from "../../config/axios.config";

const API_URL = (import.meta.env.VITE_API_URL || "http://localhost:5000/api").replace(/\/+$/, "");
const SERVER_URL = API_URL.replace(/\/api$/, "");

export default function BlogForm() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [category, setCategory] = useState("general");
  const [tags, setTags] = useState("");
  const [author, setAuthor] = useState("");
  const [isPublic, setIsPublic] = useState(true);
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (!id) return;
    (async () => {
      try {
        const body = await axiosInstance.get(`/blogs/${id}`);
        const b = body.data;
        setTitle(b.title || "");
        setContent(b.content || "");
        setCategory(b.category || "general");
        setTags((b.tags || []).join(", "));
        setAuthor(b.author || "");
        setIsPublic(b.isPublic ?? true);
        if (b.thumbnail) setPreview(`${SERVER_URL}${b.thumbnail}`);
        else if (b.image) setPreview(`${SERVER_URL}${b.image}`);
      } catch (err) {
        setError(err?.message || "Failed to load blog");
      }
    })();
  }, [id]);

  const onFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) {
      setImage(null);
      setPreview("");
      return;
    }
    if (!file.type?.startsWith("image/")) {
      setError("Please select an image file");
      e.target.value = "";
      return;
    }
    setError("");
    setImage(file);
    setPreview(URL.createObjectURL(file));
  };

  const onSubmit = async (e) => {
    e.preventDefault();

    if (!id && !image) {
      setError("Please select an image — it’s required to create a blog post.");
      return;
    }

    try {
      const fd = new FormData();
      fd.append("title", title);
      fd.append("content", content);
      fd.append("category", category);
      fd.append("tags", tags);
      if (author) fd.append("author", author);
      fd.append("isPublic", String(isPublic));

      if (image) {
        // send both keys to satisfy either server expectation
        fd.append("thumbnail", image);
        fd.append("image", image);
      }

      if (id) {
        await axiosInstance.put(`/blogs/${id}`, fd, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      } else {
        await axiosInstance.post(`/blogs`, fd, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      }

      navigate("/admin/blogs", { replace: true });
    } catch (err) {
      const msg =
        typeof err === "string"
          ? err
          : err?.message || err?.error || err?.details || "Save failed";
      setError(msg);
      console.error("Blog submit error:", err);
    }
  };

  return (
    <div className="container py-5">
      <div className="card shadow-lg border-0 rounded-4 mx-auto" style={{ maxWidth: 900 }}>
        <div className="card-body p-5">
          <h2 className="mb-4 fw-bold text-center">{id ? "Edit Blog" : "Add Blog"}</h2>
          {error && <div className="alert alert-danger">{error}</div>}

          <form onSubmit={onSubmit} className="row g-4">
            <div className="col-12">
              <label className="form-label fw-semibold">Title</label>
              <input className="form-control form-control-lg" value={title} onChange={(e) => setTitle(e.target.value)} required />
            </div>

            <div className="col-md-6">
              <label className="form-label fw-semibold">Category</label>
              <input className="form-control form-control-lg" value={category} onChange={(e) => setCategory(e.target.value)} placeholder="general" />
            </div>

            <div className="col-md-6">
              <label className="form-label fw-semibold">Tags</label>
              <input className="form-control form-control-lg" value={tags} onChange={(e) => setTags(e.target.value)} placeholder="energy, hydro, Nepal" />
            </div>

            <div className="col-md-6">
              <label className="form-label fw-semibold">Author</label>
              <input className="form-control form-control-lg" value={author} onChange={(e) => setAuthor(e.target.value)} placeholder="admin" />
            </div>

            <div className="col-md-6 d-flex align-items-end">
              <div className="form-check">
                <input id="isPublic" className="form-check-input" type="checkbox" checked={isPublic} onChange={(e) => setIsPublic(e.target.checked)} />
                <label className="form-check-label" htmlFor="isPublic">Public</label>
              </div>
            </div>

            <div className="col-12">
              <label className="form-label fw-semibold">Content</label>
              <textarea className="form-control" rows={6} value={content} onChange={(e) => setContent(e.target.value)} required />
            </div>

            <div className="col-12">
              <label className="form-label fw-semibold">Image</label>
              <input type="file" className="form-control" accept="image/*" onChange={onFileChange} />
              {preview && (
                <div className="mt-3">
                  <img src={preview} alt="Preview" style={{ width: 160, height: 120, objectFit: "cover", borderRadius: 8 }} />
                </div>
              )}
            </div>

            <div className="col-12">
              <button className="btn btn-primary btn-lg w-100 rounded-3 fw-bold">
                {id ? "Update Blog" : "Create Blog"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
