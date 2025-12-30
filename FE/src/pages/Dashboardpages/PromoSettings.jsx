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
    <DashboardLayout title="Promo Banner">
      <form className="banner-form" onSubmit={onSubmit}>
        <div className="banner-form__head">
          <div>
            <p className="catering-kicker">Homepage</p>
            <div className="banner-form__title-row">
              <h1>Promo banner text</h1>
            </div>
            <p className="catering-helper">
              This line appears on the hero banner and promo strip.
            </p>
          </div>
        </div>

        {loading && (
          <div className="catering-note">Loading current promo text...</div>
        )}
        {status && (
          <div className="catering-note">{status}</div>
        )}
        {error && (
          <div className="catering-alert catering-alert--error">{error}</div>
        )}

        <section className="banner-card">
          <div className="catering-section__title">Text</div>
          <div className="catering-field">
            <label htmlFor="promoText">Promo line</label>
            <input
              id="promoText"
              className="od-input"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder={DEFAULT_PROMO_BANNER_TEXT}
              disabled={loading || saving}
            />
          </div>
          <p className="catering-helper">Leave blank to hide the promo message.</p>
        </section>

        <div className="catering-form__footer">
          <button className="catering-primary-btn" type="submit" disabled={saving || loading}>
            {saving ? "Saving..." : "Save changes"}
          </button>
        </div>
      </form>
    </DashboardLayout>
  );
}
