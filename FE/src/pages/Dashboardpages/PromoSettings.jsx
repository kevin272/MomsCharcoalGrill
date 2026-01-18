import { useEffect, useState } from "react";
import DashboardLayout from "../../components/Dashboard/DashboardLayout";
import axios from "../../config/axios.config";
import {
  DEFAULT_PROMO_BANNER_TEXT,
  PROMO_BANNER_KEY,
  fetchSettingValue,
} from "../../utils/settings";

export default function PromoSettings() {
  const [value, setValue] = useState(DEFAULT_PROMO_BANNER_TEXT);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [status, setStatus] = useState("");

  useEffect(() => {
    let mounted = true;
    (async () => {
      const existing = await fetchSettingValue(PROMO_BANNER_KEY);
      if (mounted && typeof existing === "string") {
        setValue(existing);
      }
      if (mounted) setLoading(false);
    })();
    return () => { mounted = false };
  }, []);

  const onSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    setStatus("");
    try {
      await axios.put(`settings/${PROMO_BANNER_KEY}`, { value });
      setStatus("Saved.");
    } catch (err) {
      const message = err?.message || err?.error || "Failed to save promo text.";
      setError(message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="admin-page-container">
      <div className="admin-form-card">
        <div className="admin-form-header">
          <h2>Hero Promo Bar</h2>
          <div className="accent-line"></div>
        </div>

        {loading && <div className="p-4 text-center text-gray-500">Loading current promo...</div>}
        {status && <div className="form-success-banner mb-4">{status}</div>}
        {error && <div className="form-error-banner mb-4">{error}</div>}

        <form onSubmit={onSubmit} className="admin-form-grid">
          <div className="form-field full-width">
            <label htmlFor="promoText">Promotional Text</label>
            <input
              id="promoText"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder={DEFAULT_PROMO_BANNER_TEXT}
              disabled={loading || saving}
            />
            <p className="mt-2 text-xs text-gray-500">
              This text appears prominently on the homepage hero section. Leave blank to hide.
            </p>
          </div>

          <div className="form-actions mt-4">
            <button className="submit-btn" type="submit" disabled={saving || loading}>
              {saving ? "Saving..." : "Save Promo Text"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
