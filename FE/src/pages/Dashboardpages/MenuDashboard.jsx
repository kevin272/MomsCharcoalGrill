import { useEffect, useMemo, useState } from "react";
import axiosInstance from "../../config/axios.config";
import { Link, useNavigate } from "react-router-dom";
import DashboardLayout from "../../components/Dashboard/DashboardLayout";
import DashboardTable from "../../components/Dashboard/DashboardTable";

// ---- API / URL helpers ----
const API_URL = (import.meta.env.VITE_API_URL || "http://localhost:5000/api").replace(/\/+$/, "");
const SERVER_URL = API_URL.replace(/\/api$/, "");
function joinImageUrl(path) {
  if (!path) return "";
  if (/^https?:\/\//i.test(path)) return path;
  return `${SERVER_URL}${path.startsWith("/") ? "" : "/"}${path}`;
}

// ---- safe accessors (axiosInstance likely returns {data,...}) ----
const toArray = (body) =>
  Array.isArray(body?.data?.data) ? body.data.data :
  Array.isArray(body?.data?.items) ? body.data.items :
  Array.isArray(body?.data)        ? body.data :
  Array.isArray(body)              ? body :
  [];

const toObj = (body) =>
  // Prefer nested data object when present and not an array. Avoid treating arrays as objects.
  (body?.data?.data && !Array.isArray(body.data.data) && typeof body.data.data === "object") ? body.data.data :
  (body?.data && !Array.isArray(body.data) && typeof body.data === "object") ? body.data :
  (typeof body === "object" && !Array.isArray(body) ? body : {});

export default function MenuDashboard() {
  const navigate = useNavigate();

  const [items, setItems] = useState([]);
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");
  // simple cache: pagesCache[page] = { items: [...], total }
  const [pagesCache, setPagesCache] = useState({});

  const totalPages = useMemo(() => Math.max(1, Math.ceil(total / limit)), [total, limit]);

  // Load a page, using cache when possible. If prefetch is true we won't set loading/UI state.
  const loadPage = async (p = page, { force = false, prefetch = false } = {}) => {
    // if cached and not forced, use cache
    if (!force && pagesCache[p]) {
      if (!prefetch) {
        setItems(pagesCache[p].items);
        setTotal(pagesCache[p].total);
      }
      return;
    }

    if (!prefetch) {
      setLoading(true);
      setErr("");
    }

    try {
      const body = await axiosInstance.get("/menu", { params: { q: query || undefined, page: p, limit } });
      const data = toObj(body);
      const list = toArray(body);

      const mapped = list.map((m, i) => ({
        id: m._id || m.id || String(i),
        name: m.name || m.title || "Untitled",
        price: m.price ?? 0,
        category: m.category || m.type || "General",
        image: joinImageUrl(m.image || m.photo || m.thumb || ""),
        isAvailable: !!m.isAvailable,
        featured: !!m.featured,
        createdAt: m.createdAt || m.created_at || "",
      }));

      // save to cache
      setPagesCache((prev) => ({ ...prev, [p]: { items: mapped, total: Number(data?.total) || list.length } }));

      if (!prefetch) {
        setItems(mapped);
        setTotal(Number(data?.total) || list.length);
      }

      // prefetch next page (fire-and-forget) if there are more pages
      const totalCount = Number(data?.total) || list.length;
      const totalPagesLocal = Math.max(1, Math.ceil(totalCount / limit));
      if (p < totalPagesLocal && !pagesCache[p + 1]) {
        // don't await
        loadPage(p + 1, { force: false, prefetch: true }).catch(() => {});
      }
    } catch (e) {
      console.error(e);
      if (!prefetch) {
        setErr(e?.response?.data?.message || e?.message || "Failed to load menu.");
        // if unauthorized, bounce to login
        if (String(e?.response?.status) === "401") {
          navigate("/login", { replace: true });
        }
      }
    } finally {
      if (!prefetch) setLoading(false);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login", { replace: true });
      return;
    }
    loadPage(page);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  const onSearch = () => {
    // clear cache for the new query and load page 1
    setPagesCache({});
    setPage(1);
    // explicitly load page 1 for the new query
    loadPage(1, { force: true }).catch(() => {});
  };

  const onSearchKey = (e) => {
    if (e.key === "Enter") onSearch();
  };

  const confirmDelete = async (id) => {
    if (!window.confirm("Delete this menu item?")) return;
    try {
      await axiosInstance.delete(`/menu/${id}`);
      // optimistic update
      setItems((prev) => prev.filter((x) => x.id !== id));
      // adjust total
      setTotal((t) => Math.max(0, t - 1));
    } catch (e) {
      alert(e?.response?.data?.message || e?.message || "Delete failed.");
    }
  };

  const toggleAvailability = async (row) => {
    try {
      await axiosInstance.patch(`/menu/${row.id}`, { isAvailable: !row.isAvailable });
      setItems((prev) =>
        prev.map((x) => (x.id === row.id ? { ...x, isAvailable: !x.isAvailable } : x))
      );
    } catch (e) {
      alert(e?.response?.data?.message || e?.message || "Update failed.");
    }
  };

  const toggleFeatured = async (row) => {
    try {
      await axiosInstance.patch(`/menu/${row.id}`, { featured: !row.featured });
      setItems((prev) =>
        prev.map((x) => (x.id === row.id ? { ...x, featured: !x.featured } : x))
      );
    } catch (e) {
      alert(e?.response?.data?.message || e?.message || "Update failed.");
    }
  };

  return (
    <DashboardLayout
      title="Menu Dashboard"
      actions={
        
          <div className="d-flex g-3" style={{ alignItems: "center" }}>
      <div className="d-flex g-2" role="tablist" aria-label="Menu dashboards">
        <Link className="od-btn od-btn--ghost" to="/admin/menu">Items</Link>
        <Link className="od-btn od-btn--ghost" to="/admin/menu-slides">Slides</Link>
      </div>
          <input
            type="search"
            placeholder="Search by name/category…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={onSearchKey}
            className="od-input"
            style={{ minWidth: 280 }}
          />
          <button className="od-btn od-btn--ghost" onClick={onSearch}>Search</button>
          <Link className="od-btn" to="/admin/menu/new">Add Item</Link>
        </div>
      }
    >
      {/* Loading / Error */}
      {loading && <div>Loading…</div>}
      {!!err && <div style={{ color: "crimson" }}>{err}</div>}

      {!loading && !err && (
        <>
          <DashboardTable
            headers={[
              { label: "#" },
              { label: "Image" },
              { label: "Name" },
              { label: "Category" },
              { label: "Price" },
              { label: "Featured" },
              { label: "Available" },
              { label: "Actions", style: { width: 220 } },
            ]}
            rows={(items || []).map((row, idx) => (
              <tr key={row.id} className="text-center">
                <td>{(page - 1) * limit + idx + 1}</td>
                <td style={{ width: 64 }}>
                  {row.image ? (
                    <img
                      src={row.image}
                      alt={row.name}
                      style={{ width: 56, height: 56, objectFit: "cover", borderRadius: 8 }}
                      onError={(e) => {
                        e.currentTarget.src =
                          "data:image/svg+xml;charset=UTF-8," +
                          encodeURIComponent(
                            `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 160 90'><rect width='100%' height='100%' fill='#e5e7eb'/><text x='50%' y='50%' dominant-baseline='middle' text-anchor='middle' font-family='sans-serif' font-size='12' fill='#9ca3af'>no image</text></svg>`
                          );
                      }}
                    />
                  ) : (
                    "—"
                  )}
                </td>
                <td>{row.name}</td>
                <td>{row.category}</td>
                <td>{Number(row.price).toFixed(2)}</td>
                <td>
                  <label style={{ display: "inline-flex", alignItems: "center", gap: 8, cursor: "pointer" }}>
                    <input
                      type="checkbox"
                      checked={row.featured}
                      onChange={() => toggleFeatured(row)}
                    />
                    {row.featured ? "Yes" : "No"}
                  </label>
                </td>
                <td>
                  <label style={{ display: "inline-flex", alignItems: "center", gap: 8, cursor: "pointer" }}>
                    <input
                      type="checkbox"
                      checked={row.isAvailable}
                      onChange={() => toggleAvailability(row)}
                    />
                    {row.isAvailable ? "Yes" : "No"}
                  </label>
                </td>
                <td>
                  <div className="d-flex g-3 justify-content-center">
                    <button
                      className="od-btn"
                      onClick={() => navigate(`/admin/menu/${row.id}/edit`)}
                    >
                      Edit
                    </button>
                    <button
                      className="od-btn od-btn--danger"
                      onClick={() => confirmDelete(row.id)}
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            emptyMessage="No items found."
          />

          {/* Pager */}
          <div className="d-flex justify-content-end g-3 mt-3">
            <button className="btn" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
              Prev
            </button>
            <span style={{ alignSelf: "center" }}>Page {page} / {totalPages}</span>
            <button className="btn" disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)}>
              Next
            </button>
          </div>
        </>
      )}
    </DashboardLayout>
  );
}
