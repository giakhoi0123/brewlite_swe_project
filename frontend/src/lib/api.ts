// Next.js inlines NEXT_PUBLIC_API_URL into the client bundle at build time.
export const API_BASE_URL = (
  process.env.NEXT_PUBLIC_API_URL?.trim() || "http://localhost:3002/api"
).replace(/\/+$/, "");
