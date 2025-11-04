import { useState } from "react";

export default function ContactSection() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    contact: "",
    enquiry: "",
  });
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");

  const update = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  };

  const submit = async (e) => {
    e.preventDefault();
    setError("");

    // minimal validation for the mock layout
    if (!form.name || !form.email || !form.enquiry) {
      setError("Please fill Name, Email and Enquiry.");
      return;
    }

    try {
      setSending(true);
      // If/when you hook this to your API, do it here:
      // await fetch('/api/contact', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(form) });
      // For now, just clear:
      setForm({ name: "", email: "", contact: "", enquiry: "" });
    } catch (err) {
      setError("Something went wrong. Please try again.");
    } finally {
      setSending(false);
    }
  };

  return (
    <section className="contact-section" id="contact">
      <h2>CONTACT US</h2>

      <form className="contact-form" onSubmit={submit} noValidate>
        {/* LEFT COLUMN */}
        <div className="form-left">
          <input
            type="text"
            name="name"
            placeholder="NAME"
            value={form.name}
            onChange={update}
            aria-label="Name"
          />

          <input
            type="email"
            name="email"
            placeholder="EMAIL"
            value={form.email}
            onChange={update}
            aria-label="Email"
          />

          <input
            type="tel"
            name="contact"
            placeholder="CONTACT"
            value={form.contact}
            onChange={update}
            aria-label="Contact number"
          />
        </div>

        {/* RIGHT COLUMN */}
        <div className="form-right">
          <textarea
            name="enquiry"
            placeholder="ENQUIRY"
            value={form.enquiry}
            onChange={update}
            aria-label="Enquiry"
          />
        </div>

        {/* SUBMIT */}
        <div className="submit-row contact-submit">
          <button type="submit" className="send-button" disabled={sending}>
            {sending ? "Sending..." : "Send Message"}
          </button>
        </div>
      </form>

      {error ? (
        <p style={{ color: "#FAEB30", marginTop: 12, fontFamily: "Afacad, sans-serif" }}>
          {error}
        </p>
      ) : null}
    </section>
  );
}
