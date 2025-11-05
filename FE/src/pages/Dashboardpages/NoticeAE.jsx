import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "../../config/axios.config";
import DashboardLayout from "../../components/Dashboard/DashboardLayout";
import NoticeForm from "./NoticeForm";

export default function NoticeAE() {
  const { id } = useParams(); // /admin/notices/:id  → edit mode if present
  const navigate = useNavigate();
  const [initial, setInitial] = useState(null);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(!!id);

  // ---- Load existing notice if editing ----
  useEffect(() => {
    if (!id) return;
    (async () => {
      try {
        const body = await axios.get(`notices/${id}`);
        const payload = body?.data?.data || body?.data || body;
        const notice = payload?.notice || payload?.item || payload; // accept common shapes
        setInitial(notice);
      } catch (e) {
        console.error("Failed to load notice:", e);
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  // ---- Submit handler passed to NoticeForm ----
  const handleSubmit = async (payload, file) => {
    setSaving(true);
    try {
      const fd = new FormData();
      Object.entries(payload).forEach(([k, v]) => fd.append(k, v ?? ""));
      if (file) fd.append("image", file);

      const method = id ? "put" : "post";
      const url = id ? `notices/${id}` : "notices";

      await axios[method](url, fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      navigate("/admin/notices"); // back to list after save
    } catch (e) {
      console.error("Save failed:", e);
      alert(e?.response?.data?.message || "Failed to save notice");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <DashboardLayout title="Loading…" />;

  return (
    <DashboardLayout title={id ? "Edit Notice" : "Add Notice"}>
      <NoticeForm
        initial={initial}
        onSubmit={handleSubmit}   // ✅ proper function reference
        saving={saving}
      />
    </DashboardLayout>
  );
}
