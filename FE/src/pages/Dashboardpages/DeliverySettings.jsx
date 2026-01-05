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
    <DashboardLayout title="Delivery Fee">
      <form className="banner-form" onSubmit={onSubmit}>
        <div className="banner-form__head">
          <div>
            <p className="catering-kicker">Checkout</p>
            <div className="banner-form__title-row">
              <h1>Delivery fee</h1>
            </div>
            <p className="catering-helper">
              Set the delivery charge applied to online orders. Pickup stays free.
            </p>
          </div>
        </div>

        {loading && (
          <div className="catering-note">Loading current delivery fee...</div>
        )}
        {status && (
          <div className="catering-note">{status}</div>
        )}
        {error && (
          <div className="catering-alert catering-alert--error">{error}</div>
        )}

        <section className="banner-card">
          <div className="catering-section__title">Pricing</div>
          <div className="catering-field">
            <label htmlFor="deliveryFee">Delivery fee (AUD)</label>
            <input
              id="deliveryFee"
              type="number"
              min="0"
              step="0.01"
              className="od-input"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              disabled={loading || saving}
            />
          </div>
          <p className="catering-helper">
            Customers see this fee in the cart unless they choose pickup.
          </p>
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
