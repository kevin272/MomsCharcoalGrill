import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axiosInstance from "../../config/axios.config";
import DashboardLayout from "../../components/Dashboard/DashboardLayout";
import DashboardTable from "../../components/Dashboard/DashboardTable";

export default function ProjectDashboard() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const fetchProjects = async () => {
    try {
      const body = await axiosInstance.get("/projects"); // BODY = { data: [...] }
      setProjects(body.data || []);
    } catch (err) {
      console.error("Error fetching projects:", err);
      setProjects([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return navigate("/login", { replace: true });
    fetchProjects();
  }, [navigate]);

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this project?")) return;
    try {
      await axiosInstance.delete(`/projects/${id}`);
      setProjects((prev) => prev.filter((p) => p._id !== id));
    } catch (err) {
      console.error("Error deleting project:", err);
      alert(err?.message || "Delete failed");
    }
  };

  const headers = [
    { label: "Title" },
    { label: "Status" },
    { label: "Featured" },
    { label: "Actions", style: { width: "200px" } },
  ];

  const rows =
    projects.length > 0
      ? projects.map((p) => (
          <tr key={p._id} className="border-t">
            <td className="px-4 py-3">{p.title}</td>
            <td className="px-4 py-3">{p.status}</td>
            <td className="px-4 py-3">{p.featured ? "✅" : "❌"}</td>
            <td className="px-4 py-3 text-right">
              <Link
                to={`/admin/projects/edit/${p._id}`}
                className="btn btn-primary btn-sm me-2"
              >
                Edit
              </Link>
              <button
                onClick={() => handleDelete(p._id)}
                className="btn btn-danger btn-sm"
              >
                Delete
              </button>
            </td>
          </tr>
        ))
      : [];

  if (loading) return <p className="p-6">Loading projects...</p>;

  return (
    <DashboardLayout
      title="Projects Dashboard"
      actions={
        <Link to="/admin/projects/add" className="btn btn-success">
          ➕ Add Project
        </Link>
      }
    >
      <DashboardTable headers={headers} rows={rows} emptyMessage="No projects found." />
    </DashboardLayout>
  );
}
