/** @type {import('next').NextConfig} */

// Security headers applied to every route. Mostly defense-in-depth — the app
// is static-rendered and has no auth, but these block clickjacking and curb
// what third-party scripts could do if one ever sneaks in.
const SECURITY_HEADERS = [
  { key: "X-Frame-Options", value: "DENY" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  {
    key: "Permissions-Policy",
    // Camera & mic never needed. Geolocation is requested by the app itself,
    // so allow self only. Block FLoC/topics interest cohorts.
    value: "camera=(), microphone=(), geolocation=(self), browsing-topics=(), interest-cohort=()",
  },
  // CSP is intentionally absent here until v0/Vercel inline styles + analytics
  // are catalogued. Add Content-Security-Policy-Report-Only first when ready.
]

const nextConfig = {
  images: {
    unoptimized: true,
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: SECURITY_HEADERS,
      },
    ]
  },
}

export default nextConfig
