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
const API = (import.meta.env.VITE_API_URL || "").trim();

  const update = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  };
  const submit = async (e) => {
  e.preventDefault();
  setError("");

  if (!form.name || !form.email || !form.enquiry) {
    setError("Please fill Name, Email and Enquiry.");
    return;
  }

  const payload = {
    name: form.name,
    email: form.email,
    number: form.contact,
    subject: "General enquiry", 
    message: form.enquiry,
  };

  try {
    setSending(true);
    const res = await fetch(`${API}contact`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const errorText = await res.text();
      throw new Error(errorText || "Bad Request");
    }

    setForm({ name: "", email: "", contact: "", enquiry: "" });
  } catch (err) {
    setError("Something went wrong. Please try again.");
    console.error("Submit error:", err);
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
