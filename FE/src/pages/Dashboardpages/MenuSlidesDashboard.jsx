// src/pages/admin/MenuSlidesDashboard.jsx
import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axiosInstance from "../../config/axios.config";
import DashboardLayout from "../../components/Dashboard/DashboardLayout";
import DashboardTable from "../../components/Dashboard/DashboardTable";
import SlideForm from "./SlideForm";

const TYPES = [
  { value: "menu", label: "Menu" },
  { value: "cateringmenu", label: "Catering Menu" },
];

// Robust extractor for your sendResponse() format: { success, data, message }
const pickList = (res) => {
  // typical: res.data = { success:true, data:[...] }
  const list = res?.data?.data ?? res?.data ?? [];
  return Array.isArray(list) ? list : [];
};

export default function MenuSlidesDashboard() {
  const navigate = useNavigate();
  const [type, setType] = useState("menu");
  const [slides, setSlides] = useState([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
const API_URL = (import.meta.env.VITE_API_URL || "http://localhost:5000/api").replace(/\/+$/, "");
const SERVER_URL = API_URL.replace(/\/api$/, "");
function joinImageUrl(path) {
  if (!path) return "";
  if (/^https?:\/\//i.test(path)) return path;
  return `${SERVER_URL}${path.startsWith("/") ? "" : "/"}${path}`;
}
  const imgUrl = (p = "") =>
    /^https?:\/\//i.test(p) ? p : `${SERVER_URL}${p.startsWith("/") ? "" : "/"}${p}`;

  const fetchSlides = async () => {
    setLoading(true);
    setErr("");
    try {
      // NOTE: axiosInstance baseURL should already include /api
      // If your baseURL is '/api' or 'http://host/api', keep path as '/menu-slides'
      const res = await axiosInstance.get("/menu-slides", {
        params: { type }, // don’t force isActive filter; get all
      });

      // DEBUG (temporarily): see what came from backend
      // console.log("slides response:", res?.data);

      const list = pickList(res).map((s) => ({
        id: s._id ?? s.id,
        type: s.type,
        title: s.title || "",
        caption: s.caption || "",
        linkTo: s.linkTo || "",
        order: Number.isFinite(+s.order) ? +s.order : 0,
        isActive: !!s.isActive,
        image: s.image ? imgUrl(s.image) : "",
        createdAt: s.createdAt || "",
        raw: s,
      }));

      setSlides(list);
    } catch (e) {
      setErr(e?.response?.data?.message || e?.message || "Failed to load slides.");
      if (String(e?.response?.status) === "401") {
        navigate("/login", { replace: true });
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login", { replace: true });
      return;
    }
    fetchSlides();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [type]);

  const onDelete = async (id) => {
    if (!window.confirm("Delete this slide?")) return;
    try {
      await axiosInstance.delete(`/menu-slides/${id}`);
      setSlides((prev) => prev.filter((x) => x.id !== id));
    } catch (e) {
      alert(e?.response?.data?.message || e?.message || "Delete failed.");
    }
  };

  const toggleActive = async (row) => {
    try {
      await axiosInstance.put(`/menu-slides/${row.id}`, { isActive: !row.isActive });
      setSlides((prev) =>
        prev.map((x) => (x.id === row.id ? { ...x, isActive: !x.isActive } : x))
      );
    } catch (e) {
      alert(e?.response?.data?.message || e?.message || "Update failed.");
    }
  };

  const headers = useMemo(
    () => [
      { label: "#" },
      { label: "Preview" },
      { label: "Title" },
      { label: "Type" },
      { label: "Order" },
      { label: "Active" },
      { label: "Actions", style: { width: 260 } },
    ],
    []
  );

  // Provide rows as ARRAY-OF-ARRAYS (safer for many table components)
  const rows = useMemo(
    () =>
      slides.map((row, idx) => [
        idx + 1,
        row.image ? (
          <div className="dashboard-thumb">
            <img
              src={row.image}
              alt={row.title || "slide"}
              onError={(e) => (e.currentTarget.style.opacity = 0.25)}
            />
          </div>
        ) : (
          <div className="dashboard-thumb dashboard-thumb--empty">No image</div>
        ),
        row.title || "—",
        row.type,
        row.order,
        (
          <label style={{ display: "inline-flex", alignItems: "center", gap: 8, cursor: "pointer" }}>
            <input type="checkbox" checked={row.isActive} onChange={() => toggleActive(row)} />
            {row.isActive ? "Yes" : "No"}
          </label>
        ),
        (
          <div className="d-flex g-3 justify-content-center">
            <button className="od-btn" onClick={() => { setEditing(row.raw); setShowForm(true); }}>
              Edit
            </button>
            <button className="od-btn od-btn--danger" onClick={() => onDelete(row.id)}>
              Delete
            </button>
          </div>
        ),
      ]),
    [slides]
  );

  return (
    <DashboardLayout
      title="Menu Slides"
      actions={
        <div className="d-flex g-3" style={{ alignItems: "center", flexWrap: "wrap" }}>
          <div className="d-flex g-2" role="tablist" aria-label="Menu dashboards">
            <Link className="od-btn od-btn--ghost" to="/admin/menu">Items</Link>
            <Link className="od-btn od-btn--ghost od-btn--active" to="/admin/menu-slides">Slides</Link>
          </div>

          <select value={type} onChange={(e) => setType(e.target.value)} className="od-input" style={{ minWidth: 200 }}>
            {TYPES.map((t) => (
              <option key={t.value} value={t.value}>
                {t.label}
              </option>
            ))}
          </select>

          <button className="od-btn" onClick={() => { setEditing(null); setShowForm(true); }}>
            Add Slide
          </button>
        </div>
      }
    >
      {loading && <div>Loading…</div>}
      {!!err && <div style={{ color: "crimson" }}>{err}</div>}

      {!loading && !err && (
        <DashboardTable headers={headers} rows={rows} emptyMessage="No slides found." />
      )}

      {showForm && (
        <SlideForm
          typeDefault={type}
          initialData={editing}
          onClose={() => setShowForm(false)}
          onSaved={() => { setShowForm(false); fetchSlides(); }}
        />
      )}
    </DashboardLayout>
  );
}

      
