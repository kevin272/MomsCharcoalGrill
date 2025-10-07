// utils/slugify.js
export const slugify = (s='') =>
  s.toString().trim().toLowerCase()
   .replace(/\s+/g, '-')       // spaces -> dashes
   .replace(/[^a-z0-9-]/g, '') // remove junk
   .replace(/--+/g, '-')       // collapse dashes
   .replace(/^-+|-+$/g, '');   // trim dashes
