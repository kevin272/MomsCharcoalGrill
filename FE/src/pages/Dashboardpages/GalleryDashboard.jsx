import { useEffect, useState } from "react";
import axiosInstance from "../../config/axios.config";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "../../components/Dashboard/DashboardLayout";
import DashboardTable from "../../components/Dashboard/DashboardTable";

// Normalize API & server URLs safely
const API_URL = (import.meta.env.VITE_API_URL || "http://localhost:5000/api").replace(/\/+$/, "");
const SERVER_URL = API_URL.replace(/\/api$/, ""); // strip only a trailing /api

function joinImageUrl(path) {
  if (!path) return "";
  if (/^https?:\/\//i.test(path)) return path; // already absolute
  return `${SERVER_URL}${path.startsWith("/") ? "" : "/"}${path}`;
}

export default function GalleryDashboard() {
  const [images, setImages] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login", { replace: true });
      return;
    }

    (async () => {
      try {
        // axiosInstance returns the BODY due to your response interceptor
        // Expecting: { success, message, data: [...] }
        const body = await axiosInstance.get("/gallery");
        const list = Array.isArray(body?.data) ? body.data : [];
        setImages(list);
      } catch (err) {
        console.error("Fetch gallery failed:", err);
        // If token invalid/expired, just send them to login
        navigate("/login", { replace: true });
      }
    })();
  }, [navigate]);

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this image?")) return;
    try {
      await axiosInstance.delete(`/gallery/${id}`);
      setImages((prev) => prev.filter((img) => img._id !== id));
    } catch (err) {
      const msg =
        typeof err === "string"
          ? err
          : err?.message ||
            err?.error ||
            err?.data?.message ||
            err?.data?.error ||
            "Delete failed";
      console.error(err);
      alert(msg);
    }
  };

  return (
    <DashboardLayout
      title="GalleryDashboard"
      actions={
        <button
          className="btn btn-success"
          onClick={() => navigate("/admin/gallery/add")}
        >
          ➕ Add New Image
        </button>
      }
    >
      <DashboardTable
        headers={[
          { label: "Title" },
          { label: "Image" },
          { label: "Actions", style: { width: "200px" } },
        ]}
        rows={(images || []).map((img) => (
          <tr key={img._id}>
            <td>{img.title}</td>
            <td>
              <div className="dashboard-thumb">
                <img
                  src={joinImageUrl(img.image)}
                  alt={img.title || "Gallery image"}
                  onError={(e) => {
                    // graceful fallback (light gray block)
                    e.currentTarget.src =
                      "data:image/svg+xml;charset=UTF-8," +
                      encodeURIComponent(
                        `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 160 90'><rect width='100%' height='100%' fill='#e5e7eb'/><text x='50%' y='50%' dominant-baseline='middle' text-anchor='middle' font-family='sans-serif' font-size='12' fill='#9ca3af'>no image</text></svg>`
                      );
                  }}
                />
              </div>
            </td>

            <td>
              <button
                className="od-btn od-btn--danger"
                onClick={() => handleDelete(img._id)}
              >
                Delete
              </button>
            </td>
          </tr>
        ))}
        emptyMessage="No images found."
      />
    </DashboardLayout>
  );
}
