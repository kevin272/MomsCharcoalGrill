import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "../../config/axios.config";
import DashboardLayout from "../../components/Dashboard/DashboardLayout";
import DashboardTable from "../../components/Dashboard/DashboardTable";

export default function BannerDashboard() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    try {
      setLoading(true);
      // FIX: remove leading slash so baseURL (/api/) is preserved
      const { data } = await axios.get("banners"); // <-- was "/banners"
      const list = Array.isArray(data?.data) ? data.data : (Array.isArray(data) ? data : []);
      setRows(list || []);
    } finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const headers = [
    { label: "Primary Item" },
    { label: "Items" },
    { label: "Status" },
    { label: "Order" },
    { label: "Updated" },
    { label: "Actions" },
  ];

  const rowEls = rows.map(b => (
    <tr key={b._id}>
      <td className="px-4 py-3 font-semibold">{b?.primaryItem?.name || "—"}</td>
      <td className="px-4 py-3">{b.items?.length || 0}</td>
      <td className="px-4 py-3">
        <span className={b.isActive ? "text-green-600" : "text-gray-500"}>
          {b.isActive ? "Active" : "Inactive"}
        </span>
      </td>
      <td className="px-4 py-3">{b.order ?? 0}</td>
      <td className="px-4 py-3">{b.updatedAt ? new Date(b.updatedAt).toLocaleString() : "—"}</td>
      <td className="px-4 py-3">
        <div className="flex gap-2">
          <Link to={`/admin/banners/${b._id}/edit`} className="admin-btn">Edit</Link>
          <button
            className="admin-danger-btn"
            onClick={async () => {
              if (!confirm("Delete?")) return;
              // FIX: remove leading slash here too
              await axios.delete(`banners/${b._id}`); // <-- was `/banners/${b._id}`
              load();
            }}
          >
            Delete
          </button>
        </div>
      </td>
    </tr>
  ));

  return (
    <DashboardLayout
      title="Hero Banners"
      actions={<Link to="/admin/banners/new" className="admin-primary-btn">+ New Banner</Link>}
    >
      <DashboardTable
        headers={headers}
        rows={rowEls}
        emptyMessage={loading ? "Loading…" : "No banners yet"}
      />
    </DashboardLayout>
  );
}
