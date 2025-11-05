import { useEffect, useState } from "react";
import axiosInstance from "../../config/axios.config";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "../../components/Dashboard/DashboardLayout";
import DashboardTable from "../../components/Dashboard/DashboardTable";

export default function AdminDashboard() {
  const [admins, setAdmins] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const t = localStorage.getItem("token");
    if (!t) return navigate("/login", { replace: true });

    (async () => {
      try {
        const body = await axiosInstance.get("/admin");
        const list = Array.isArray(body?.data) ? body.data : (Array.isArray(body) ? body : []);
        setAdmins(list);
      } catch (err) {
        console.error("Fetch admins failed:", err);
        navigate("/login", { replace: true });
      }
    })();
  }, [navigate]);

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this admin?")) return;
    try {
      await axiosInstance.delete(`/admin/${id}`);
      setAdmins((prev) => prev.filter((a) => a._id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  const handleReset = async (admin) => {
    const newUsername = prompt("Enter new username (leave blank to keep):", admin.username);
    const newPassword = prompt("Enter new password (leave blank to keep):");
    try {
      // Update username if provided and changed
      if (newUsername && newUsername !== admin.username) {
        const updated = await axiosInstance.put(`/admin/${admin._id}`, { username: newUsername });
        const next = updated?.data || updated;
        setAdmins((prev) => prev.map((a) => (a._id === admin._id ? { ...a, username: next?.username || newUsername } : a)));
      }
      // Update password if provided
      if (newPassword) {
        await axiosInstance.put(`/admin/${admin._id}/reset-password`, { newPassword });
      }
    } catch (err) {
      console.error(err);
      alert(err?.response?.data?.message || err?.message || 'Update failed');
    }
  };

  return (
    <DashboardLayout
      title="Admin Dashboard"

    >
      <DashboardTable
        headers={[
          { label: "Username", maxWidth: "150px" },
          { label: "Full Name", maxWidth: "180px" },
          { label: "Email", maxWidth: "200px" },
          { label: "Role", maxWidth: "120px", className: "text-center" },
          { label: "Active", maxWidth: "100px", className: "text-center" },
          { label: "Actions", maxWidth: "220px", className: "text-center" },
        ]}
        rows={admins.map((admin) => (
          <tr key={admin._id}>
            <td>{admin.username}</td>
            <td>{admin.firstName} {admin.lastName}</td>
            <td>{admin.email}</td>
            <td>
              <span
                className={`px-3 py-1 rounded-full text-xs font-medium ${
                  admin.role === "superadmin" ? "bg-red-100 text-red-700" : "bg-blue-100 text-blue-700"
                }`}
              >
                {admin.role}
              </span>
            </td>
            <td>
              {admin.isActive ? (
                <span className="px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">Yes</span>
              ) : (
                <span className="px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700">No</span>
              )}
            </td>
            <td>
              <button className="od-btn" onClick={() => handleReset(admin)}>
                Reset
              </button>
              {/* <button className="od-btn od-btn--danger" onClick={() => handleDelete(admin._id)}>
                Delete
              </button> */}
            </td>
          </tr>
        ))}
        emptyMessage="No admins found."
      />
    </DashboardLayout>
  );
}
