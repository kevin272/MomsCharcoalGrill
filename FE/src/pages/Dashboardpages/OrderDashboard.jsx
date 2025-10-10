// src/pages/admin/OrderDashboard.jsx
import { useEffect, useMemo, useState } from 'react'
import DashboardLayout from '../../components/Dashboard/DashboardLayout'
import DashboardTable from '../../components/Dashboard/DashboardTable'

export default function OrderDashboard() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Ensure exactly one trailing slash so `${API_BASE}orders` works.
  const API_BASE =
    (import.meta.env?.VITE_API_URL
      ? import.meta.env.VITE_API_URL.replace(/\/?$/, '/')
      : 'http://localhost:5000/api/')

  const money = new Intl.NumberFormat('en-NP', {
    style: 'currency',
    currency: 'NPR',
    maximumFractionDigits: 0,
  })

  // Fetch orders on mount
  useEffect(() => {
    ;(async () => {
      try {
        const res = await fetch(`${API_BASE}orders`)
        const data = await res.json()
        if (!res.ok || !data?.success) {
          throw new Error(data?.message || `Failed to fetch orders: ${res.statusText}`)
        }
        const list = Array.isArray(data?.data) ? data.data : []
        setOrders(
          list.map((o) => ({
            id: o._id,
            createdAt: o.createdAt,
            customerName: o.customer?.name ?? '',
            customerPhone: o.customer?.phone ?? '',
            grandTotal: o.totals?.grandTotal ?? null,
            status: o.status ?? 'new',
          }))
        )
      } catch (err) {
        setError(err.message || 'Unknown error')
      } finally {
        setLoading(false)
      }
    })()
  }, [API_BASE])

  // Update order status (optimistic)
  const updateStatus = async (id, next) => {
    // optimistic UI
    setOrders((prev) => prev.map((o) => (o.id === id ? { ...o, status: next } : o)))
    try {
      const res = await fetch(`${API_BASE}orders/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: next }),
      })
      if (!res.ok) {
        const b = await res.json().catch(() => ({}))
        throw new Error(b?.message || 'Failed to update status')
      }
    } catch (err) {
      // revert on failure
      setOrders((prev) => prev.map((o) => (o.id === id ? { ...o, status: prev.find(p => p.id === id)?.status || 'new' } : o)))
      alert('Failed to update status: ' + err.message)
    }
  }

  // Table columns for shared DashboardTable
  const columns = useMemo(
    () => [
      {
        key: 'id',
        header: 'ID',
        render: (row) => (
          <code style={{ fontSize: 12 }}>
            {row.id}
          </code>
        ),
        width: 260,
      },
      {
        key: 'createdAt',
        header: 'Created',
        render: (row) => new Date(row.createdAt).toLocaleString(),
        width: 180,
      },
      {
        key: 'customer',
        header: 'Customer',
        render: (row) =>
          row.customerName
            ? `${row.customerName}${row.customerPhone ? ` (${row.customerPhone})` : ''}`
            : '—',
      },
      {
        key: 'grandTotal',
        header: 'Total',
        render: (row) => (row.grandTotal != null ? money.format(row.grandTotal) : '—'),
        width: 120,
      },
      {
        key: 'status',
        header: 'Status',
        render: (row) => (
          <select
            value={row.status}
            onChange={(e) => updateStatus(row.id, e.target.value)}
            className="form-select form-select-sm"
            style={{ minWidth: 140 }}
          >
            <option value="new">new</option>
            <option value="paid">paid</option>
            <option value="preparing">preparing</option>
            <option value="delivered">delivered</option>
            <option value="cancelled">cancelled</option>
          </select>
        ),
        width: 180,
      },
    ],
    []
  )

  return (
    <DashboardLayout title="Orders">
      {loading && <p>Loading orders…</p>}
      {error && <p style={{ color: 'crimson' }}>Error: {error}</p>}
      {!loading && !error && (
        <DashboardTable
          columns={columns}
          data={orders}
          getRowId={(r) => r.id}
          emptyMessage="No orders found."
          striped
          responsive
        />
      )}
    </DashboardLayout>
  )
}
