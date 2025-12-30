import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "../../config/axios.config";
import DashboardLayout from "../../components/Dashboard/DashboardLayout";
import DashboardTable from "../../components/Dashboard/DashboardTable";

// ✅ helper
const normalizeList = (payload) => {
  if (Array.isArray(payload)) return payload;             // axios interceptor returns array
  if (Array.isArray(payload?.data)) return payload.data;  // raw axios response { data: [...] }
  if (Array.isArray(payload?.results)) return payload.results;
  return [];
};

export default function NoticeDashboard() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    try {
      setLoading(true);
      const res = await axios.get("notices");

      // ✅ support both: res === data OR res === {data, status, ...}
      const payload = res?.data ?? res;
      // (Optional) debug:
      // console.log("[NoticeDashboard] payload:", payload);

      setRows(normalizeList(payload));
    } catch (e) {
      console.error("[NoticeDashboard] GET notices failed:", e);
      setRows([]); // show "No notices yet"
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const headers = [
    { label: "Banner" },
    { label: "Title" },
    { label: "Active" },
    { label: "Priority" },
    { label: "Schedule" },
    { label: "Updated" },
    { label: "Actions" },
  ];

  const rowEls = rows.map(n => (
    <tr key={n._id} className="text-center">
      <td className="px-4 py-3">
        {n.imageUrl ? (
          <div className="dashboard-thumb">
            <img
              src={n.imageUrl}
              alt=""
            />
          </div>
        ) : (
          <div className="dashboard-thumb dashboard-thumb--empty">No image</div>
        )}
      </td>
      <td className="px-4 py-3 font-semibold">{n.title || "—"}</td>
      <td className="px-4 py-3">
        <span className={n.isActive ? "text-green-600" : "text-gray-500"}>
          {n.isActive ? "Active" : "Inactive"}
        </span>
      </td>
      <td className="px-4 py-3">{n.priority ?? 0}</td>
      <td className="px-4 py-3 text-xs leading-tight">
        {n.startsAt ? `From: ${new Date(n.startsAt).toLocaleString()}` : "From: —"}<br/>
        {n.endsAt ? `To: ${new Date(n.endsAt).toLocaleString()}` : "To: —"}
      </td>
      <td className="px-4 py-3">{n.updatedAt ? new Date(n.updatedAt).toLocaleString() : "—"}</td>
      <td className="px-4 py-3">
        <div className="flex gap-2">
          <button
            className="od-btn"
            onClick={async () => {
              await axios.put(`notices/${n._id}`, { isActive: !n.isActive });
              load();
            }}
          >
            {n.isActive ? "Deactivate" : "Activate"}
          </button>
          <Link to={`/admin/notices/${n._id}`} className="od-btn">Edit</Link>
          <button
            className="od-btn od-btn--danger"
            onClick={async () => {
              if (!confirm("Delete notice?")) return;
              await axios.delete(`notices/${n._id}`);
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
      title="Notices"
      actions={<Link to="/admin/notices/new" className="od-btn">+ New Notice</Link>}
    >
      <DashboardTable
        headers={headers}
        rows={rowEls}                          
        emptyMessage={loading ? "Loading…" : "No notices yet"}
      />
    </DashboardLayout>
  );
}
