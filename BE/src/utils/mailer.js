// src/utils/mailer.js
const nodemailer = require('nodemailer');
const { renderTemplate } = require('./emailTemplates');

const {
  SMTP_HOST,
  SMTP_PORT,
  SMTP_SECURE,
  SMTP_USER,
  SMTP_PASS,
  FROM_EMAIL,
  EMAIL_CURRENCY = 'AUD',
  EMAIL_INTERNAL_CC = '', // optional: "orders@momsgrill.com,kitchen@momsgrill.com"
  EMAIL_INTERNAL_BCC = '', // optional
  REPLY_TO = '', // optional e.g. "Support <support@momsgrill.com>"
} = process.env;

const transporter = nodemailer.createTransport({
  host: SMTP_HOST,
  port: Number(SMTP_PORT || 587),
  secure: SMTP_SECURE === "true", // false = TLS
  auth: { user: SMTP_USER, pass: SMTP_PASS },
});

/**
 * Unified mail sender with optional cc/bcc/replyTo and text fallback.
 */
async function sendMail({ to, subject, html, text, cc, bcc, replyTo, attachments }) {
  if (!to) return;

  // very simple fallback if not provided
  const textFallback = text || subject;

  await transporter.sendMail({
    from: FROM_EMAIL || SMTP_USER,
    to,
    cc: cc || undefined,
    bcc: bcc || undefined,
    replyTo: replyTo || REPLY_TO || undefined,
    subject,
    text: textFallback,
    html,
    attachments,
  });
}

/** Build common Handlebars context for order emails */
function toPlain(obj) {
  if (!obj) return obj;
  if (typeof obj.toObject === 'function') return obj.toObject({ getters: true, virtuals: true });
  try { return JSON.parse(JSON.stringify(obj)); } catch { return obj; }
}

function normalizeItems(items = []) {
  return items.map(it => {
    const qty = it.qty ?? it.quantity ?? it.count ?? 1;
    const price = typeof it.price === 'string' ? Number(it.price) || 0 : (it.price ?? 0);
    return { ...it, qty, price };
  });
}

function normalizeTotals(t = {}) {
  const n = (v) => (typeof v === 'string' ? Number(v) || 0 : (v ?? 0));
  return {
    subtotal: n(t.subtotal),
    gst: n(t.gst),
    delivery: n(t.delivery),
    grandTotal: n(t.grandTotal || (n(t.subtotal) + n(t.gst) + n(t.delivery))),
  };
}

function ctx(order) {
  const o = toPlain(order) || {};
  // ensure id is always present
  const id = o.id || (o._id ? String(o._id) : '');
  const items = normalizeItems(o.items || []);
  const totals = normalizeTotals(o.totals || {});
  const customer = o.customer || {};

  return {
    mode: 'receipt', // will be overridden by the caller
    order: { ...o, id }, // expose .id for template; _id still present if needed
    items,
    totals,
    customer,
    shop: {
      name: "Mom’s Charcoal & Grill",
      supportEmail: 'support@momsgrill.com',
      address: '2215 US Highway 1 South, North Brunswick, NJ 08902',
      phone: '732.398.9022',
    },
    currency: process.env.EMAIL_CURRENCY || 'AUD',
  };
}

/** Send: Order created (receipt) */
async function sendOrderReceipt({ order }) {
  if (!order?.customer?.email) return;
  const subject = `We received your order (#${order._id})`;
  const html = renderTemplate('order-unified', { ...ctx(order), mode: 'receipt' });

  await sendMail({
    to: order.customer.email,
    cc: EMAIL_INTERNAL_CC,
    bcc: EMAIL_INTERNAL_BCC,
    subject,
    html,
    text: subject,
  });
}

/** Send: Payment confirmed */
async function sendOrderPaid({ order }) {
  if (!order?.customer?.email) return;
  const subject = `Payment confirmed for order #${order._id}`;
  const html = renderTemplate('order-unified', { ...ctx(order), mode: 'paid' });

  await sendMail({
    to: order.customer.email,
    cc: EMAIL_INTERNAL_CC,
    bcc: EMAIL_INTERNAL_BCC,
    subject,
    html,
    text: subject,
  });
}

/** Send: Order completed/delivered */
async function sendOrderCompleted({ order }) {
  if (!order?.customer?.email) return;
  const subject = `Order #${order._id} is completed`;
  const html = renderTemplate('order-unified', { ...ctx(order), mode: 'completed' });

  await sendMail({
    to: order.customer.email,
    cc: EMAIL_INTERNAL_CC,
    bcc: EMAIL_INTERNAL_BCC,
    subject,
    html,
    text: subject,
  });
}

module.exports = {
  sendOrderReceipt,
  sendOrderPaid,
  sendOrderCompleted,
};
