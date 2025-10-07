import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axiosInstance from "../../config/axios.config";
import DashboardLayout from "../../components/Dashboard/DashboardLayout";
import DashboardTable from "../../components/Dashboard/DashboardTable";

// Normalize API & server URLs safely
const API_URL = (import.meta.env.VITE_API_URL || "http://localhost:5000/api").replace(/\/+$/, "");
const SERVER_URL = API_URL.replace(/\/api$/, "");

function joinUrl(path) {
  if (!path) return "";
  if (/^https?:\/\//i.test(path)) return path;
  return `${SERVER_URL}${path.startsWith("/") ? "" : "/"}${path}`;
}

export default function BlogDashboard() {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const t = localStorage.getItem("token");
    if (!t) return navigate("/login", { replace: true });

    (async () => {
      try {
        const body = await axiosInstance.get("/blogs"); // BODY = { success, message, data }
        setBlogs(body.data || []);
      } catch (err) {
        console.error("Fetch blogs failed:", err);
        navigate("/login", { replace: true });
      } finally {
        setLoading(false);
      }
    })();
  }, [navigate]);

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this blog post?")) return;
    try {
      await axiosInstance.delete(`/blogs/${id}`);
      setBlogs((prev) => prev.filter((b) => b._id !== id));
    } catch (err) {
      console.error(err);
      alert(err?.message || "Delete failed");
    }
  };

  const headers = [
    { label: "Image" },
    { label: "Title" },
    { label: "Category" },
    { label: "Public" },
    { label: "Actions", style: { width: "220px" } },
  ];

  const rows =
    (blogs || []).map((b) => (
      <tr key={b._id}>
        <td>
          {b.thumbnail ? (
            <img
              src={joinUrl(b.thumbnail)}
              alt={b.title}
              style={{ width: 80, height: 60, objectFit: "cover", borderRadius: 6 }}
            />
          ) : (
            "—"
          )}
        </td>
        <td>{b.title}</td>
        <td>{b.category || "general"}</td>
        <td>{b.isPublic ? "✅" : "❌"}</td>
        <td>
          <Link to={`/admin/blogs/edit/${b._id}`} className="btn btn-sm btn-primary me-2">
            Edit
          </Link>
          <button className="btn btn-sm btn-danger" onClick={() => handleDelete(b._id)}>
            Delete
          </button>
        </td>
      </tr>
    ));

  if (loading) return <p className="p-6">Loading blogs...</p>;

  return (
    <DashboardLayout
      title="Blogs"
      actions={
        <Link to="/admin/blogs/add" className="btn btn-success">
          ➕ Add Blog
        </Link>
      }
    >
      <DashboardTable headers={headers} rows={rows} emptyMessage="No blog posts found." />
    </DashboardLayout>
  );
}
