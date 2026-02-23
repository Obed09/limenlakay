export const dynamic = "force-dynamic"; // ensures it's generated at request time (good while developing)

type UrlEntry = {
  loc: string;
  lastmod?: string;
  changefreq?: string;
  priority?: number;
};

function toXml(urls: UrlEntry[]) {
  const items = urls
    .map((u) => {
      const lastmod = u.lastmod ? `<lastmod>${u.lastmod}</lastmod>` : "";
      const changefreq = u.changefreq ? `<changefreq>${u.changefreq}</changefreq>` : "";
      const priority = typeof u.priority === "number" ? `<priority>${u.priority.toFixed(1)}</priority>` : "";

      return `
  <url>
    <loc>${u.loc}</loc>
    ${lastmod}
    ${changefreq}
    ${priority}
  </url>`;
    })
    .join("");

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${items}
</urlset>`;
}

export async function GET() {
  // Get base URL for sitemap
  const baseUrl =
    process.env.NEXT_PUBLIC_SITE_URL ||
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000");

  // Comprehensive list of customer-facing pages
  const urls: UrlEntry[] = [
    // Main pages
    { loc: `${baseUrl}/`, changefreq: "daily", priority: 1.0, lastmod: new Date().toISOString().split('T')[0] },
    { loc: `${baseUrl}/about`, changefreq: "monthly", priority: 0.8 },
    
    // Shop & Products
    { loc: `${baseUrl}/candle`, changefreq: "weekly", priority: 0.9 },
    { loc: `${baseUrl}/bulk-order`, changefreq: "monthly", priority: 0.7 },
    { loc: `${baseUrl}/custom-order`, changefreq: "weekly", priority: 0.9 },
    { loc: `${baseUrl}/vessel-calculator`, changefreq: "monthly", priority: 0.6 },
    { loc: `${baseUrl}/checkout`, changefreq: "daily", priority: 0.8 },
    
    // Workshops
    { loc: `${baseUrl}/workshop-subscription`, changefreq: "monthly", priority: 0.8 },
    
    // Tracking & Info
    { loc: `${baseUrl}/track-order`, changefreq: "monthly", priority: 0.7 },
    { loc: `${baseUrl}/wishlist`, changefreq: "weekly", priority: 0.6 },
    
    // Legal & Info
    { loc: `${baseUrl}/privacy-policy`, changefreq: "yearly", priority: 0.3 },
    { loc: `${baseUrl}/terms`, changefreq: "yearly", priority: 0.3 },
    
    // Authentication
    { loc: `${baseUrl}/auth/login`, changefreq: "monthly", priority: 0.5 },
    { loc: `${baseUrl}/auth/sign-up`, changefreq: "monthly", priority: 0.5 },
    
    // Payment
    { loc: `${baseUrl}/payment`, changefreq: "monthly", priority: 0.6 },
    { loc: `${baseUrl}/payment-success`, changefreq: "monthly", priority: 0.5 },
  ];

  const xml = toXml(urls);

  return new Response(xml, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, max-age=0, s-maxage=3600",
    },
  });
}
