// src/pages/admin/SauceDashboard.jsx
import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import DashboardLayout from '../../components/Dashboard/DashboardLayout'
import DashboardTable from '../../components/Dashboard/DashboardTable'

export default function SauceDashboard() {
  const navigate = useNavigate()
  const [sauces, setSauces] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  // Base API URL
  const API_BASE =
    (import.meta.env?.VITE_API_URL
      ? import.meta.env.VITE_API_URL.replace(/\/?$/, '/')
      : 'http://localhost:5000/api/')

  // ---------- Fetch ----------
  const fetchSauces = async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`${API_BASE}sauces`, { credentials: 'include' })
      const body = await res.json().catch(() => null)
      if (!res.ok) throw new Error(body?.message || `HTTP ${res.status}`)

      const raw = Array.isArray(body)
        ? body
        : Array.isArray(body?.data)
        ? body.data
        : Array.isArray(body?.sauces)
        ? body.sauces
        : []

      setSauces(
        raw.map((m) => ({
          id: m._id || m.id,
          name: m.name ?? '',
          price: Number(m.price ?? 0),
          description: m.description ?? '',
          image: m.image ?? '',
          isAvailable: !!m.isAvailable,
        }))
      )
    } catch (err) {
      setError(err.message || 'Could not load sauces.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchSauces()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // ---------- Actions ----------
  const confirmDelete = async (id) => {
    if (!window.confirm('Delete this sauce?')) return
    try {
      const res = await fetch(`${API_BASE}sauces/${id}`, {
        method: 'DELETE',
        credentials: 'include',
      })
      const body = await res.json().catch(() => null)
      if (!res.ok) throw new Error(body?.message || `HTTP ${res.status}`)
      setSauces((prev) => prev.filter((x) => x.id !== id))
    } catch (err) {
      alert(err.message || 'Delete failed')
    }
  }

  const toggleAvailability = async (row) => {
    const next = !row.isAvailable
    setSauces((prev) => prev.map((x) => (x.id === row.id ? { ...x, isAvailable: next } : x)))
    try {
      const payload = { ...row, isAvailable: next }
      const res = await fetch(`${API_BASE}sauces/${row.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(payload),
      })
      const body = await res.json().catch(() => null)
      if (!res.ok) throw new Error(body?.message || `HTTP ${res.status}`)
    } catch (err) {
      setSauces((prev) => prev.map((x) => (x.id === row.id ? { ...x, isAvailable: !next } : x)))
      alert(err.message || 'Update failed')
    }
  }

  // ---------- Table ----------
  const headers = useMemo(
    () => [
      { label: '#', className: 'w-10' },
      { label: 'Image', className: 'w-24' },
      { label: 'Name', className: 'min-w-[150px]' },
      { label: 'Price', className: 'w-24' },
      { label: 'Available', className: 'w-32' },
      { label: 'Actions', className: 'w-44' },
    ],
    []
  )

  const rows = useMemo(
    () =>
      sauces.map((row, idx) => (
        <tr key={row.id}>
          {/* Index */}
          <td className="px-4 py-3">{idx + 1}</td>

          {/* Image */}
          <td className="px-4 py-3" style={{ width: 160, height: 160 }}>
            {row.image ? (
              <img
                src={
                  row.image.startsWith('http')
                    ? row.image
                    : `${API_BASE.replace('/api/', '/')}${row.image.replace(/^\/+/, '')}`
                }
                alt={row.name}
                className="w-12 h-12 object-cover rounded-md mx-auto border"
              />
            ) : (
              <span className="text-gray-400">—</span>
            )}
          </td>

          {/* Name */}
          <td className="px-4 py-3 text-left">{row.name}</td>

          {/* Price */}
          <td className="px-4 py-3">AUD {row.price.toFixed(2)}</td>

          {/* Availability */}
          <td className="px-4 py-3">
            <label className="inline-flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={row.isAvailable}
                onChange={() => toggleAvailability(row)}
              />
              {row.isAvailable ? 'Yes' : 'No'}
            </label>
          </td>

          {/* Actions */}
          <td className="px-4 py-3">
            <div className="flex gap-2 justify-center">
              <button
                className="od-btn"
                onClick={() => navigate(`/admin/sauces/${row.id}/edit`)}
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
      )),
    [sauces, navigate]
  )

  return (
    <DashboardLayout
      title="Sauce Dashboard"
      actions={
        <Link className="btn btn-success" to="/admin/sauces/new">
          + Add Sauce
        </Link>
      }
    >
      {loading && <p>Loading…</p>}
      {error && <p className="text-red-600">{error}</p>}
      {!loading && !error && (
        <DashboardTable headers={headers} rows={rows} emptyMessage="No sauces found." />
      )}
    </DashboardLayout>
  )
}
