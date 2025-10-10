// src/admin/CateringDashboard.jsx
import React, { useEffect, useMemo, useState } from "react";
import DashboardLayout from "../../components/Dashboard/DashboardLayout";
import DashboardTable from "../../components/Dashboard/DashboardTable";

const API = "/api/catering-packages";

// shape helper
const emptyPkg = () => ({
  _id: "",
  title: "",
  perPersonPrice: "",
  trayPrice: "",
  minPeople: 20,
  description: "",
  items: [],              // array of string names
  image: "",
  isActive: true,
  order: 0,
});

export default function CateringDashboard() {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [editing, setEditing] = useState(null); // null or pkg
  const [q, setQ] = useState("");

  // load ALL (admin view shows inactive too)
  const load = async () => {
    setLoading(true);
    setError("");
    try {
      const r = await fetch(`${API}/all`);
      const j = await r.json();
      if (!j.success) throw new Error(j.message || "Failed to load");
      setList(j.data || []);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const filtered = useMemo(() => {
    if (!q.trim()) return list;
    const s = q.toLowerCase();
    return list.filter(p =>
      [p.title, p.description, (p.items || []).join(", ")].join(" ").toLowerCase().includes(s)
    );
  }, [q, list]);

  const startCreate = () => setEditing(emptyPkg());
  const startEdit = (pkg) => setEditing({ ...pkg });

  const save = async (e) => {
    e.preventDefault();
    if (!editing) return;
    setSaving(true);
    setError("");
    try {
      const payload = {
        ...editing,
        perPersonPrice: editing.perPersonPrice === "" ? undefined : Number(editing.perPersonPrice),
        trayPrice: editing.trayPrice === "" ? undefined : Number(editing.trayPrice),
        minPeople: Number(editing.minPeople) || 1,
        order: Number(editing.order) || 0,
        items: (editing.items || []).map(s => String(s).trim()).filter(Boolean),
      };
      const isNew = !payload._id;
      const url = isNew ? API : `${API}/${payload._id}`;
      const method = isNew ? "POST" : "PUT";
      const { _id, ...body } = payload;

      const r = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const j = await r.json();
      if (!j.success) throw new Error(j.message || "Save failed");

      setEditing(null);
      await load();
    } catch (e2) {
      setError(e2.message);
    } finally {
      setSaving(false);
    }
  };

  const remove = async (pkg) => {
    if (!window.confirm(`Delete "${pkg.title}"? This cannot be undone.`)) return;
    try {
      const r = await fetch(`${API}/${pkg._id}`, { method: "DELETE" });
      const j = await r.json();
      if (!j.success) throw new Error(j.message || "Delete failed");
      await load();
    } catch (e) {
      setError(e.message);
    }
  };

  // ---------- DashboardTable wiring ----------
  const headers = [
    { label: "Order", className: "w-16" },
    { label: "Title", className: "min-w-[220px]" },
    { label: "Pricing", className: "min-w-[160px]" },
    { label: "Min", className: "w-20" },
    { label: "Items", className: "min-w-[260px]" },
    { label: "Active", className: "w-20" },
    { label: "Actions", className: "w-40" },
  ];

  const rows = (loading ? [] : filtered).map((p) => (
    <tr key={p._id} className="hover:bg-gray-50">
      <td className="px-4 py-3 text-center">{p.order ?? 0}</td>
      <td className="px-4 py-3">
        <div className="font-medium">{p.title}</div>
        <div className="text-gray-500 text-xs line-clamp-1">{p.description}</div>
      </td>
      <td className="px-4 py-3">
        {p.perPersonPrice !== undefined && p.perPersonPrice !== "" && (
          <div className="text-sm">Per person: ${p.perPersonPrice}</div>
        )}
        {p.trayPrice !== undefined && p.trayPrice !== "" && (
          <div className="text-sm">Per tray: ${p.trayPrice}</div>
        )}
      </td>
      <td className="px-4 py-3 text-center">{p.minPeople}</td>
      <td className="px-4 py-3">
        <div className="text-sm text-gray-700 line-clamp-2">
          {(p.items || []).join(", ")}
        </div>
      </td>
      <td className="px-4 py-3 text-center">{p.isActive ? "Yes" : "No"}</td>
      <td className="px-4 py-3 text-right">
        <button
          onClick={() => startEdit(p)}
          className="inline-flex items-center px-3 py-1.5 border rounded-md mr-2"
        >
          Edit
        </button>
        <button
          onClick={() => remove(p)}
          className="inline-flex items-center px-3 py-1.5 border rounded-md text-red-600"
        >
          Delete
        </button>
      </td>
    </tr>
  ));

  return (
    <DashboardLayout
      title="Catering Packages"
      actions={
        <button onClick={startCreate} className="px-4 py-2 rounded-md bg-black text-white">
          + New Package
        </button>
      }
    >
      {/* Toolbar */}
      <div className="mb-4 flex gap-3">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search title / items / description"
          className="border rounded-md px-3 py-2 w-full"
        />
        <button onClick={load} className="px-3 py-2 border rounded-md">Refresh</button>
      </div>

      {error && <div className="mb-4 text-red-600">{error}</div>}

      <DashboardTable
        headers={headers}
        rows={rows}
        emptyMessage={loading ? "Loading…" : "No packages found"}
      />

      {/* ---------- Form (dashboard form layout) ---------- */}
      {editing && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center">
          <form
            onSubmit={save}
            className="dashboard-form bg-white w-full max-w-3xl rounded-xl shadow-lg"
          >
            <div className="form-header px-6 py-4 border-b">
              <h2 className="text-lg font-semibold">
                {editing._id ? "Edit Catering Package" : "Create Catering Package"}
              </h2>
            </div>

            <div className="form-body px-6 py-5">
              <div className="form-grid grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="form-field">
                  <label className="form-label text-sm font-medium">Title *</label>
                  <input
                    required
                    value={editing.title}
                    onChange={(e) => setEditing(v => ({ ...v, title: e.target.value }))}
                    className="form-control border rounded-md px-3 py-2 w-full"
                    placeholder="e.g., Party Pack"
                  />
                </div>

                <div className="form-field">
                  <label className="form-label text-sm font-medium">Order</label>
                  <input
                    type="number"
                    value={editing.order}
                    onChange={(e) => setEditing(v => ({ ...v, order: e.target.value }))}
                    className="form-control border rounded-md px-3 py-2 w-full"
                    placeholder="0"
                  />
                </div>

                <div className="form-field">
                  <label className="form-label text-sm font-medium">Per Person Price</label>
                  <input
                    type="number" min="0" step="0.01"
                    value={editing.perPersonPrice}
                    onChange={(e) => setEditing(v => ({ ...v, perPersonPrice: e.target.value }))}
                    className="form-control border rounded-md px-3 py-2 w-full"
                    placeholder="e.g., 18.50"
                  />
                </div>

                <div className="form-field">
                  <label className="form-label text-sm font-medium">Per Tray Price</label>
                  <input
                    type="number" min="0" step="0.01"
                    value={editing.trayPrice}
                    onChange={(e) => setEditing(v => ({ ...v, trayPrice: e.target.value }))}
                    className="form-control border rounded-md px-3 py-2 w-full"
                    placeholder="e.g., 120"
                  />
                </div>

                <div className="form-field">
                  <label className="form-label text-sm font-medium">Minimum People *</label>
                  <input
                    type="number" min="1" required
                    value={editing.minPeople}
                    onChange={(e) => setEditing(v => ({ ...v, minPeople: e.target.value }))}
                    className="form-control border rounded-md px-3 py-2 w-full"
                    placeholder="e.g., 20"
                  />
                </div>

                <div className="form-field md:col-span-2">
                  <label className="form-label text-sm font-medium">Description</label>
                  <textarea
                    rows={3}
                    value={editing.description}
                    onChange={(e) => setEditing(v => ({ ...v, description: e.target.value }))}
                    className="form-control border rounded-md px-3 py-2 w-full"
                    placeholder="Short summary..."
                  />
                </div>

                <div className="form-field md:col-span-2">
                  <label className="form-label text-sm font-medium">Items (comma separated)</label>
                  <input
                    value={(editing.items || []).join(", ")}
                    onChange={(e) =>
                      setEditing(v => ({ ...v, items: e.target.value.split(",").map(s => s.trim()) }))
                    }
                    className="form-control border rounded-md px-3 py-2 w-full"
                    placeholder="Chicken Tikka, Salad, Bread..."
                  />
                </div>

                <div className="form-field md:col-span-2">
                  <label className="form-label text-sm font-medium">Image URL</label>
                  <input
                    value={editing.image}
                    onChange={(e) => setEditing(v => ({ ...v, image: e.target.value }))}
                    className="form-control border rounded-md px-3 py-2 w-full"
                    placeholder="https://..."
                  />
                </div>

                <div className="form-field flex items-center gap-2">
                  <input
                    id="isActive"
                    type="checkbox"
                    checked={!!editing.isActive}
                    onChange={(e) => setEditing(v => ({ ...v, isActive: e.target.checked }))}
                  />
                  <label htmlFor="isActive" className="form-label text-sm">Active</label>
                </div>
              </div>
            </div>

            <div className="form-footer px-6 py-4 border-t flex items-center justify-end gap-3">
              <button
                type="button"
                className="px-3 py-2 border rounded-md"
                onClick={() => setEditing(null)}
              >
                Cancel
              </button>
              <button
                disabled={saving}
                className="px-4 py-2 rounded-md bg-black text-white"
              >
                {saving ? "Saving..." : "Save"}
              </button>
            </div>
          </form>
        </div>
      )}
    </DashboardLayout>
  );
}
