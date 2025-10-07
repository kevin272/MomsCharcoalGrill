import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axiosInstance from "../../config/axios.config";

export default function TeamForm() {
  const { id } = useParams();
  const [name, setName] = useState("");
  const [role, setRole] = useState("");
  const [img, setImg] = useState(null);
  const [preview, setPreview] = useState("");
  const [error, setError] = useState(null);
  const token = localStorage.getItem("token");
  const navigate = useNavigate();

  const baseURL = import.meta.env.VITE_API_URL.replace("/api", "");

  // Fetch existing member (edit mode)
  useEffect(() => {
    if (id) {
      axiosInstance
        .get(`/team/${id}`, { headers: { Authorization: `Bearer ${token}` } })
        .then((body) => {
          const member = body.data;
          setName(member.name);
          setRole(member.role);
          if (member.img) setPreview(`${baseURL}${member.img}`);
        })
        .catch((err) =>
          setError(err.response?.data?.message || "Failed to fetch member")
        );
    }
  }, [id, token, baseURL]);

  // Handle file selection
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImg(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  // Submit form
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const formData = new FormData();
      formData.append("name", name);
      formData.append("role", role);
      if (img) formData.append("img", img);

      if (id) {
        await axiosInstance.put(`/team/${id}`, formData, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        });
      } else {
        await axiosInstance.post("/team", formData, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        });
      }
      navigate("/admin/team");
    } catch (err) {
      setError(err.response?.data?.message || "Action failed");
    }
  };

  return (
    <div className="container py-5">
      <div className="card shadow-lg border-0 rounded-4 mx-auto" style={{ maxWidth: "600px" }}>
        <div className="card-body p-4">
          <h3 className="mb-4 text-center fw-bold text-primary">
            {id ? "Edit Team Member" : "Add Team Member"}
          </h3>

          {error && (
            <div className="alert alert-danger text-center">{error}</div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label className="form-label fw-semibold">Full Name</label>
              <input
                type="text"
                className="form-control form-control-lg"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter team member's name"
                required
              />
            </div>

            <div className="mb-3">
              <label className="form-label fw-semibold">Role / Position</label>
              <input
                type="text"
                className="form-control form-control-lg"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                placeholder="e.g. Backend Developer"
                required
              />
            </div>

            <div className="mb-3">
              <label className="form-label fw-semibold">Avatar</label>
              <input
                type="file"
                className="form-control"
                accept="image/*"
                onChange={handleFileChange}
              />
              {preview && (
                <div className="text-center mt-3">
                  <img
                    src={preview}
                    alt="Preview"
                    className="rounded-3 shadow-sm"
                    style={{ width: "120px", height: "120px", objectFit: "cover" }}
                  />
                </div>
              )}
            </div>

            <button
              className="btn btn-primary w-100 py-2 fw-semibold rounded-3"
              type="submit"
            >
              {id ? "Update Member" : "Add Member"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
