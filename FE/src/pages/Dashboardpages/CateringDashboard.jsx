// src/pages/admin/CateringDashboard.jsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import axiosInstance from "../../config/axios.config.js";
import DashboardLayout from "../../components/Dashboard/DashboardLayout.jsx";
import DashboardTable from "../../components/Dashboard/DashboardTable.jsx";
import CateringForm from "./CateringForm.jsx";

/* ---------- OrderDashboard-like Modal (inline) ---------- */
function ODModal({ open, onClose, title, children, widthClass = "max-w-4xl" }) {
  const mountTarget = document.getElementById("root") || document.body;
  const dialogRef = useRef(null);

  useEffect(() => {
    if (!open) return;
    const onKey = (e) => e.key === "Escape" && onClose?.();
    document.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    // focus first focusable control
    setTimeout(() => {
      dialogRef.current
        ?.querySelector("input,select,textarea,button")
        ?.focus?.();
    }, 0);

    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [open, onClose]);

  if (!open) return null;

  const onBackdrop = (e) => {
    if (e.target === e.currentTarget) onClose?.();
  };

  return createPortal(
    <div className="od-modal__overlay" onMouseDown={onBackdrop} role="dialog" aria-modal="true">
      <div ref={dialogRef} className={`od-modal__card ${widthClass}`} onMouseDown={(e) => e.stopPropagation()}>
        <div className="od-modal__card-header">
          <h5 className="od-modal__card-title">{title}</h5>
          <button className="od-modal__card-close" onClick={onClose} aria-label="Close">X</button>
        </div>
        <div className="od-modal__card-body">{children}</div>
      </div>
    </div>,
    mountTarget
  );
}

/* ---------- Helpers ---------- */
const API_URL = (import.meta.env.VITE_API_URL || "http://localhost:5000/api").replace(/\/+$/, "");
const SERVER_URL = API_URL.replace(/\/api$/, ""); // strip only a trailing /api

function joinImageUrl(path) {
  if (!path) return "";
  if (/^https?:\/\//i.test(path)) return path; // already absolute
  return `${SERVER_URL}${path.startsWith("/") ? "" : "/"}${path}`;
}
/** Try multiple endpoints gracefully (works with your older/newer route names). */
async function fetchWithFallbacks(getterFns) {
  let lastErr;
  for (const fn of getterFns) {
    try {
      // eslint-disable-next-line no-await-in-loop
      const res = await fn();
      return res;
    } catch (e) {
      lastErr = e;
    }
  }
  throw lastErr;
}

/* ---------- Page ---------- */
export default function CateringDashboard() {
  const [options, setOptions] = useState([]);
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);

  const imgBase = useMemo(() => SERVER_URL || "", []);
  const totalPages = useMemo(() => Math.max(1, Math.ceil(total / limit)), [total, limit]);

  const fetchOptions = async (targetPage = page) => {
    setLoading(true);
    setError("");
    try {
      const res = await fetchWithFallbacks([
        () => axiosInstance.get("/catering-options", { params: { page: targetPage, limit } }),
      ]);
      const payload = res && typeof res === "object" ? res : res ?? {};
      const data =
        Array.isArray(payload?.data?.data) ? payload.data.data :
        Array.isArray(payload?.data) ? payload.data :
        Array.isArray(payload?.items) ? payload.items :
        Array.isArray(payload) ? payload :
        [];

      const reportedTotal = Number(payload?.total ?? payload?.data?.total ?? payload?.count ?? payload?.data?.count);
      const rawPage = Number(payload?.page ?? payload?.data?.page);
      const rawLimit = Number(payload?.limit ?? payload?.data?.limit);
      const serverPaginated = Number.isFinite(rawPage) || Number.isFinite(rawLimit) || Number.isFinite(reportedTotal);
      const sliced = serverPaginated
        ? data
        : data.slice((targetPage - 1) * limit, (targetPage - 1) * limit + limit);

      setOptions(Array.isArray(sliced) ? sliced : []);
      setTotal(Number.isFinite(reportedTotal) ? reportedTotal : data.length);
    } catch (e) {
      setError(e?.response?.data?.message || e?.message || "Failed to load catering options");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOptions(page);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  const handleAdd = () => {
    setEditing(null);
    setShowForm(true);
  };

  const handleEdit = (opt) => {
    setEditing(opt);
    setShowForm(true);
  };

  const handleClose = () => {
    setShowForm(false);
    setEditing(null);
  };

  const handleSuccess = (nextPage = page) => {
    handleClose();
    if (nextPage !== page) {
      setPage(nextPage);
      return;
    }
    fetchOptions(nextPage);
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this catering option?")) return;
    try {
      await fetchWithFallbacks([
        () => axiosInstance.delete(`/catering/${id}`),
        () => axiosInstance.delete(`/catering-options/${id}`),
      ]);
      const nextTotal = Math.max(0, total - 1);
      const nextTotalPages = Math.max(1, Math.ceil(nextTotal / limit));
      const nextPage = Math.min(page, nextTotalPages);

      setTotal(nextTotal);
      setOptions((prev) => prev.filter((x) => x._id !== id));

      if (nextPage !== page) {
        setPage(nextPage);
      } else {
        fetchOptions(nextPage);
      }
    } catch (e) {
      alert(e?.response?.data?.message || e?.message || "Delete failed");
    }
  };

  return (
    <DashboardLayout title="Catering Options">
      <div className="flex justify-between items-center mb-4">
        <div className="text-sm text-gray-400">
          {loading ? "Loading..." : `${total} option(s)`}
          {error ? <span className="text-red-400 ml-3">Error: {error}</span> : null}
        </div>
        <button onClick={handleAdd} className="od-btn">
          + Add New
        </button>
      </div>

      <DashboardTable
        headers={[
          { label: "Image", maxWidth: 120 },
          { label: "Title" },
          { label: "Price" },
          { label: "Price Type" },
          { label: "Active" },
          { label: "Actions", className: "text-right", maxWidth: 160 },
        ]}
        rows={(loading ? [] : options).map((opt) => {
          const {
            _id,
            title,
            price,
            priceType,
            isActive,
            image, // file path or url
          } = opt;

          // Safe image src: if it already looks like a full URL, keep it; else prefix with API_BASE
          const imgSrc =
            typeof image === "string" && /^https?:\/\//i.test(image)
              ? image
              : image
              ? `${imgBase}/${image}`.replace(/([^:]\/)\/+/g, "$1")
              : "";

          return (
            <tr key={_id}>
              <td className="px-3 py-2" style={{ width: 160, height: 160 }}>
                <div className="thumb-fixed">
                  {imgSrc ? (
                    <img
                      src={joinImageUrl(imgSrc)}
                      alt={title || "Catering option"}
                      className="w-16 h-16 object-cover rounded-md border border-gray-200/20"
                    />
                  ) : (
                    <div className="w-16 h-16 rounded-md bg-gray-800/70 border border-gray-200/10 grid place-items-center text-xs text-gray-400">
                      No Image
                    </div>
                  )}
                </div>
              </td>
              <td className="px-3 py-2">{title || "-"}</td>
              <td className="px-3 py-2">{price ?? "-"}</td>
              <td className="px-3 py-2 capitalize">
                {priceType === "per_person" ? "Per Person" : priceType === "per_tray" ? "Per Tray" : priceType || "-"}
              </td>
              <td className="px-3 py-2">{isActive ? "Yes" : "No"}</td>
              <td className="px-3 py-2 text-right whitespace-nowrap">
                <button onClick={() => handleEdit(opt)} className="od-btn">
                  Edit
                </button>
                <button onClick={() => handleDelete(_id)} className="od-btn od-btn--danger">
                  Delete
                </button>
              </td>
            </tr>
          );
        })}
      />

      {!loading && (
        <div className="d-flex justify-content-end g-3 mt-3">
          <button className="btn" disabled={page <= 1} onClick={() => setPage((p) => Math.max(1, p - 1))}>
            Prev
          </button>
          <span style={{ alignSelf: "center" }}>Page {page} / {totalPages}</span>
          <button className="btn" disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)}>
            Next
          </button>
        </div>
      )}

      <CateringForm
        open={showForm}
        initial={editing}
        onClose={handleClose}
        onSuccess={() => handleSuccess(1)}
      />
    </DashboardLayout>
  );
}
