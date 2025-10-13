// src/utils/emailTemplates.js
const fs = require('fs');
const path = require('path');
const Handlebars = require('handlebars');

const TEMPLATE_DIR = process.env.EMAIL_TEMPLATE_DIR || path.join(__dirname, '..', 'emails');
let compiledCache = Object.create(null);
let partialsLoaded = false;

function registerHelpers() {
  // currency helper: {{currency totals.grandTotal 'NPR'}}
  Handlebars.registerHelper('currency', function (value, code = 'NPR') {
    try {
      return new Intl.NumberFormat('en-NP', {
        style: 'currency',
        currency: code,
        maximumFractionDigits: 0,
      }).format(Number(value || 0));
    } catch {
      return `${code} ${value}`;
    }
  });

  // date/time helper: {{datetime order.createdAt}}
  Handlebars.registerHelper('datetime', function (value) {
    try { return new Date(value).toLocaleString(); }
    catch { return String(value || ''); }
  });

  // logical helpers
  Handlebars.registerHelper('eq', (a, b) => a === b);
}

function loadPartialsOnce() {
  if (partialsLoaded) return;
  const partialsDir = path.join(TEMPLATE_DIR, 'partials');
  if (fs.existsSync(partialsDir)) {
    for (const file of fs.readdirSync(partialsDir)) {
      if (file.endsWith('.hbs')) {
        const name = path.basename(file, '.hbs');
        const src = fs.readFileSync(path.join(partialsDir, file), 'utf8');
        Handlebars.registerPartial(name, src);
      }
    }
  }
  partialsLoaded = true;
}

function compileTemplate(name) {
  const filePath = path.join(TEMPLATE_DIR, `${name}.hbs`);
  const layoutPath = path.join(TEMPLATE_DIR, 'layout.hbs');

  if (!fs.existsSync(filePath)) {
    throw new Error(`Email template not found: ${filePath}`);
  }
  const bodySrc = fs.readFileSync(filePath, 'utf8');

  // Optional layout
  let layoutSrc = null;
  if (fs.existsSync(layoutPath)) {
    layoutSrc = fs.readFileSync(layoutPath, 'utf8');
  }

  // Wrap body in layout if provided
  const fullSrc = layoutSrc
    ? layoutSrc.replace('{{{body}}}', bodySrc)
    : bodySrc;

  const compiled = Handlebars.compile(fullSrc);
  compiledCache[name] = compiled;
  return compiled;
}

function renderTemplate(name, data) {
  registerHelpers();
  loadPartialsOnce();
  const compiled = compiledCache[name] || compileTemplate(name);
  return compiled(data);
}

module.exports = {
  renderTemplate,
  TEMPLATE_DIR,
};
