// src/pages/admin/OrderDashboard.jsx
import { useEffect, useMemo, useState } from 'react'
import { createPortal } from 'react-dom'
import DashboardLayout from '../../components/Dashboard/DashboardLayout'
import DashboardTable from '../../components/Dashboard/DashboardTable'

/* ----------------------------- utils ----------------------------- */
// Replace your normalizeOrder with this version
function normalizeOrder(raw = {}) {
  const id = raw._id ?? raw.id ?? raw.orderId ?? raw.reference ?? null

  // ---- customer ----
  const c = raw.customer ?? raw.client ?? raw.user ?? raw.contact ?? {}

  // build name safely
  const derivedFullName = [c.firstName, c.lastName].filter(Boolean).join(' ').trim()
  const name =
    (c.name ?? (derivedFullName || undefined) ?? c.fullName ?? raw.customerName ?? '')

  // build address safely
  const addrLines = [c.address?.line1, c.address?.line2, c.address?.city, c.address?.state, c.address?.zip]
    .filter(Boolean)
    .join(', ')
  const address =
    (c.address?.full ??
     (typeof c.address === 'string' ? c.address : undefined) ??
     (addrLines || undefined) ??
     '')

  const customer = {
    name,
    phone: c.phone ?? c.phoneNumber ?? c.mobile ?? raw.customerPhone ?? '',
    email: c.email ?? c.mail ?? '',
    address,
  }

  // ---- items ----
  const items =
    raw.items ??
    raw.cartItems ??
    raw.orderItems ??
    raw.products ??
    []

  // ---- totals ----
  const t = raw.totals ?? raw.summary ?? raw.amounts ?? raw.pricing ?? {}
  const totals = {
    subtotal: t.subtotal ?? t.subTotal ?? t.itemsTotal ?? t.totalExTax ?? null,
    gst: t.gst ?? t.tax ?? t.vat ?? t.taxAmount ?? null,
    delivery: t.delivery ?? t.shipping ?? t.deliveryFee ?? t.shippingFee ?? null,
    grandTotal: t.grandTotal ?? t.total ?? t.totalAmount ?? t.amount ?? null,
  }

  // ---- delivery / schedule ----
  const d = raw.delivery ?? raw.shipping ?? raw.schedule ?? raw.pickup ?? {}
  const slotFromDateWindow = (d.date && d.window) ? `${d.date} ${d.window}` : undefined
  const delivery = {
    slot: d.slot ?? d.time ?? slotFromDateWindow ?? d.date ?? d.method ?? null,
  }

  // ---- misc ----
  const notes = raw.notes ?? raw.note ?? raw.specialRequirements ?? raw.instructions ?? raw.remarks ?? ''
  const status = raw.status ?? raw.state ?? raw.orderStatus ?? 'new'
  const createdAt = raw.createdAt ?? raw.created_at ?? raw.date ?? raw.placedAt ?? null

  return { _id: id, customer, items, totals, delivery, notes, status, createdAt, __raw: raw }
}


/* ----------------------------- Modal ----------------------------- */
function Modal({ open, onClose, children }) {
  if (!open) return null
  const target =
    document.querySelector('.dashboard-layout') ||
    document.getElementById('root') ||
    document.body

  // click backdrop to close
  const onBackdrop = (e) => {
    if (e.target === e.currentTarget) onClose?.()
  }

  return createPortal(
    <div className="od-modal__overlay" onMouseDown={onBackdrop}>
      <div className="od-modal__card">
        {children}
      </div>
    </div>,
    target
  )
}

/* --------------------------- Main screen -------------------------- */
export default function OrderDashboard() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const [viewingId, setViewingId] = useState(null)
  const [viewLoading, setViewLoading] = useState(false)
  const [viewData, setViewData] = useState(null)

  const [q, setQ] = useState('')
  const [statusFilter, setStatusFilter] = useState('')

  const API_BASE = useMemo(() => {
    return (import.meta.env?.VITE_API_URL
      ? import.meta.env.VITE_API_URL.replace(/\/?$/, '/')
      : 'http://localhost:5000/api/')
  }, [])

  const money = new Intl.NumberFormat('en-NP', {
    style: 'currency',
    currency: 'AUD',
    maximumFractionDigits: 0,
  })

  const fmtDate = (d) => (d ? new Date(d).toLocaleString() : '—')

  /* -------- fetch list -------- */
  const loadOrders = async () => {
    setLoading(true); setError(null)
    try {
      const res = await fetch(`${API_BASE}orders`)
      const data = await res.json()
      if (!res.ok || !data?.success) throw new Error(data?.message || 'Failed to fetch orders')
      const list = Array.isArray(data.data) ? data.data : []
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
    } catch (e) {
      setError(e.message || 'Unknown error')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { loadOrders() }, []) // API_BASE memoized

  /* -------- update status (optimistic) -------- */
  const updateStatus = async (id, next) => {
    const prev = orders
    setOrders((o) => o.map((r) => (r.id === id ? { ...r, status: next } : r)))
    try {
      const res = await fetch(`${API_BASE}orders/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: next }),
      })
      if (!res.ok) throw new Error('Failed to update status')
    } catch (e) {
      setOrders(prev)
      alert('Failed to update status: ' + e.message)
    }
  }

  /* -------- view one -------- */
  const openDetails = async (id) => {
    setViewingId(id); setViewData(null); setViewLoading(true)
    try {
      const res = await fetch(`${API_BASE}orders/${id}`)
      const data = await res.json()
      if (!res.ok) throw new Error(data?.message || 'Failed to load order')

      const raw = data?.data?.order ?? data?.order ?? data?.data ?? data
      if (!raw || typeof raw !== 'object') throw new Error('Order payload missing')

      setViewData(raw)
    } catch (e) {
      alert('Unable to load order: ' + (e?.message || 'Unknown error'))
      setViewingId(null)
    } finally {
      setViewLoading(false)
    }
  }
  const closeDetails = () => { setViewingId(null); setViewData(null); setViewLoading(false) }

  /* -------- delete (optimistic) -------- */
  const deleteOrder = async (id) => {
    if (!confirm('Delete this order permanently?')) return
    const prev = orders
    setOrders((o) => o.filter((r) => r.id !== id))
    try {
      const res = await fetch(`${API_BASE}orders/${id}`, { method: 'DELETE' })
      const body = await res.json().catch(() => ({}))
      if (!res.ok || body?.success === false) throw new Error(body?.message || 'Failed to delete')
      if (viewingId === id) closeDetails()
    } catch (e) {
      setOrders(prev)
      alert('Could not delete order: ' + e.message)
    }
  }

  /* -------- filters -------- */
  const filtered = orders.filter((o) => {
    const hitQ =
      !q ||
      o.id?.toLowerCase().includes(q.toLowerCase()) ||
      o.customerName?.toLowerCase().includes(q.toLowerCase()) ||
      o.customerPhone?.toLowerCase().includes(q.toLowerCase())
    const hitStatus = !statusFilter || o.status === statusFilter
    return hitQ && hitStatus
  })

  /* -------- table -------- */
  const headers = [
    { label: 'ID', maxWidth: 260, className: 'text-left' },
    { label: 'Created', maxWidth: 180, className: 'text-left' },
    { label: 'Customer', className: 'text-left' },
    { label: 'Total', maxWidth: 120, className: 'text-right' },
    { label: 'Status', maxWidth: 180, className: 'text-left' },
    { label: 'Actions', maxWidth: 220, className: 'text-center' },
  ]

  const rows = filtered.map((r) => (
    <tr key={r.id} className="od-row">
      <td className="od-cell"><code className="od-code">{r.id}</code></td>
      <td className="od-cell">{fmtDate(r.createdAt)}</td>
      <td className="od-cell">
        {r.customerName ? `${r.customerName}${r.customerPhone ? ` (${r.customerPhone})` : ''}` : '—'}
      </td>
      <td className="od-cell od-cell--right">{r.grandTotal != null ? money.format(r.grandTotal) : '—'}</td>
      <td className="od-cell">
        <div className="od-status">
          <span className={`od-badge od-badge--${r.status}`}>{r.status}</span>
          <select className="od-select" value={r.status} onChange={(e) => updateStatus(r.id, e.target.value)}>
            <option value="new">new</option>
            <option value="paid">paid</option>
            <option value="preparing">preparing</option>
            <option value="delivered">delivered</option>
            <option value="cancelled">cancelled</option>
          </select>
        </div>
      </td>
      <td className="od-cell od-cell--center">
        <button className="od-btn" onClick={() => openDetails(r.id)}>View</button>
        <button className="od-btn od-btn--danger" onClick={() => deleteOrder(r.id)}>Delete</button>
      </td>
    </tr>
  ))

  return (
    <DashboardLayout title="Orders">
      <div className="od-toolbar">
        <div className="od-toolbar__left">
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search ID, name or phone…" className="od-input" />
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="od-select">
            <option value="">All statuses</option>
            <option value="new">new</option>
            <option value="paid">paid</option>
            <option value="preparing">preparing</option>
            <option value="delivered">delivered</option>
            <option value="cancelled">cancelled</option>
          </select>
          <button className="od-btn od-btn--ghost" onClick={loadOrders}>Refresh</button>
        </div>
        <div className="od-toolbar__right">
          <span className="od-count">{filtered.length} shown</span>
        </div>
      </div>

      {loading && <div className="od-state od-state--loading">Loading orders…</div>}
      {error && <div className="od-state od-state--error">Error: {error}</div>}
      {!loading && !error && (
        <DashboardTable headers={headers} rows={rows} emptyMessage="No orders found." />
      )}

      <Modal open={!!viewingId} onClose={closeDetails}>
        <div className="od-modal__header">
          <div>
            <div className="od-modal__title">Order Details</div>
            {viewData?._id && <div className="od-modal__sub">Raw ID: <code className="od-code">{viewData._id}</code></div>}
          </div>
          <div className="od-modal__actions">
            <button className="od-btn od-btn--danger" onClick={() => deleteOrder(viewingId)}>Delete</button>
            <button className="od-btn od-btn--ghost" onClick={closeDetails}>Close</button>
          </div>
        </div>

        <div className="od-modal__body">
          {viewLoading && <div className="od-state">Loading…</div>}
          {!viewLoading && !viewData && <div className="od-state">Order not found.</div>}
          {!viewLoading && viewData && <OrderDetailsBody order={normalizeOrder(viewData)} money={money} />}
        </div>
      </Modal>
    </DashboardLayout>
  )
}

/* ------------------------- Details body ------------------------- */
function OrderDetailsBody({ order, money }) {
  const [showRaw, setShowRaw] = useState(false)
  const items = Array.isArray(order?.items) ? order.items : []
  const { customer = {}, totals = {}, delivery = {}, notes = '', status, createdAt, __raw } = order

  return (
    <div className="od-details">
      <div className="od-grid">
        <div className="od-card">
          <div className="od-card__title">Customer</div>
          <div className="od-meta"><span>Name</span><strong>{customer?.name || '—'}</strong></div>
          <div className="od-meta"><span>Phone</span><strong>{customer?.phone || '—'}</strong></div>
          <div className="od-meta"><span>Email</span><strong>{customer?.email || '—'}</strong></div>
          {customer?.address && <div className="od-meta"><span>Address</span><strong>{customer.address}</strong></div>}
        </div>

        <div className="od-card">
          <div className="od-card__title">Order</div>
          <div className="od-meta"><span>ID</span><strong>{order?._id || '—'}</strong></div>
          <div className="od-meta"><span>Status</span><strong>{status || '—'}</strong></div>
          <div className="od-meta"><span>Created</span><strong>{createdAt ? new Date(createdAt).toLocaleString() : '—'}</strong></div>
          {delivery?.slot && <div className="od-meta"><span>Delivery</span><strong>{delivery.slot}</strong></div>}
        </div>
      </div>

      <div className="od-tablecard">
        <div className="od-card__title od-card__title--bar">Items</div>
        <div className="od-scroll">
          <table className="od-table">
            <thead>
              <tr>
                <th className="od-th od-th--left">Item</th>
                <th className="od-th od-th--right">Qty</th>
                <th className="od-th od-th--right">Price</th>
                <th className="od-th od-th--right">Total</th>
              </tr>
            </thead>
            <tbody>
              {items.length === 0 && (
                <tr><td className="od-td" colSpan={4}>No items</td></tr>
              )}
              {items.map((it, i) => {
                const price = Number(it?.price ?? it?.unitPrice ?? it?.amount ?? 0) || 0
                const qty = Number(it?.qty ?? it?.quantity ?? it?.count ?? 1) || 1
                const name = it?.name || it?.title || it?.itemName || `Item ${i + 1}`
                const nested = Array.isArray(it?.items)
                  ? it.items
                  : (Array.isArray(it?.selectedItems) ? it.selectedItems : [])
                const nestedLines = Array.isArray(nested)
                  ? nested.map((sel, idx) => {
                      const extras = Array.isArray(sel?.extras) && sel.extras.length
                        ? ` (${sel.extras.join(", ")})`
                        : ""
                      return `${sel?.name || `Item ${idx + 1}`} x${sel?.qty ?? sel?.quantity ?? 0}${extras}`
                    })
                  : []
                const detail = nestedLines.length
                  ? nestedLines.join(" | ")
                  : (it.selectionSummary || it.extra || it.notes || "")
                return (
                  <tr key={i}>
                    <td className="od-td od-td--left">
                      <div>{name}</div>
                      {detail && <div className="od-td__meta">{detail}</div>}
                    </td>
                    <td className="od-td od-td--right">{qty}</td>
                    <td className="od-td od-td--right">{money.format(price)}</td>
                    <td className="od-td od-td--right">{money.format(price * qty)}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      <div className="od-grid od-grid--totals">
        <div className="od-card od-card--notes">
          <div className="od-card__title">Notes</div>
          <div className="od-notes">{(notes ?? '') !== '' ? notes : '—'}</div>
        </div>

        <div className="od-card od-card--totals">
          <div className="od-card__title">Totals</div>
          <div className="od-totals">
            <div><span>Subtotal</span><strong>{totals?.subtotal != null ? money.format(totals.subtotal) : '—'}</strong></div>
            <div><span>GST</span><strong>{totals?.gst != null ? money.format(totals.gst) : '—'}</strong></div>
            <div><span>Delivery</span><strong>{totals?.delivery != null ? money.format(totals.delivery) : '—'}</strong></div>
            <hr />
            <div className="od-grand"><span>Grand Total</span><strong>{totals?.grandTotal != null ? money.format(totals.grandTotal) : '—'}</strong></div>
          </div>
        </div>
      </div>

      <div className="od-card">
        <div className="od-card__title" style={{display:'flex', justifyContent:'space-between', alignItems:'center'}}>
          <span>Debug</span>
          <button className="od-btn od-btn--ghost" onClick={() => setShowRaw((s) => !s)}>
            {showRaw ? 'Hide raw JSON' : 'Show raw JSON'}
          </button>
        </div>
        {showRaw && (
          <pre style={{ whiteSpace: 'pre-wrap', fontSize: 12, background:'#0b1020', color:'#e2e8f0', padding:12, borderRadius:8, overflowX:'auto' }}>
            {JSON.stringify(__raw ?? order, null, 2)}
          </pre>
        )}
      </div>
    </div>
  )
}
