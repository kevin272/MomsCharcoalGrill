import { useEffect, useState } from "react";
import DashboardLayout from "../../components/Dashboard/DashboardLayout";
import axios from "../../config/axios.config";
import {
  DEFAULT_DELIVERY_FEE,
  DELIVERY_FEE_KEY,
  fetchDeliveryFee,
} from "../../utils/settings";

export default function DeliverySettings() {
  const [value, setValue] = useState(DEFAULT_DELIVERY_FEE.toString());
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [status, setStatus] = useState("");

  useEffect(() => {
    let mounted = true;
    (async () => {
      const existing = await fetchDeliveryFee();
      if (mounted) {
        setValue(existing.toString());
        setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, []);

  const onSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    setStatus("");

    const numeric = Number(value);
    const payload = Number.isFinite(numeric) && numeric >= 0
      ? numeric
      : DEFAULT_DELIVERY_FEE;

    try {
      await axios.put(`settings/${DELIVERY_FEE_KEY}`, { value: payload });
      setValue(payload.toString());
      setStatus("Saved.");
    } catch (err) {
      const message = err?.message || err?.error || "Failed to save delivery fee.";
      setError(message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="admin-page-container">
      <div className="admin-form-card">
        <div className="admin-form-header">
          <h2>Delivery Settings</h2>
          <div className="accent-line"></div>
        </div>

        {loading && <div className="p-4 text-center text-gray-500">Loading settings...</div>}
        {status && <div className="form-success-banner mb-4">{status}</div>}
        {error && <div className="form-error-banner mb-4">{error}</div>}

        <form onSubmit={onSubmit} className="admin-form-grid">
          <div className="form-field full-width">
            <label htmlFor="deliveryFee">Standard Delivery Fee (AUD)</label>
            <input
              id="deliveryFee"
              type="number"
              min="0"
              step="0.01"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              disabled={loading || saving}
              placeholder="e.g. 5.00"
            />
            <p className="mt-2 text-xs text-gray-500">
              This fee is applied to all delivery orders. In-store pickup remains free.
            </p>
          </div>

          <div className="form-actions mt-4">
            <button className="submit-btn" type="submit" disabled={saving || loading}>
              {saving ? "Saving..." : "Save Delivery Fee"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
