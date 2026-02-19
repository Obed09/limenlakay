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
  // ✅ Change this to your real domain (or use env var)
  const baseUrl =
  process.env.NEXT_PUBLIC_SITE_URL ||
  process.env.VERCEL_URL
    ? `https://${process.env.VERCEL_URL}`
    : "http://localhost:3000";


  // ✅ Start simple: list your known routes
  const urls: UrlEntry[] = [
    { loc: `${baseUrl}/`, changefreq: "daily", priority: 1.0 },
    { loc: `${baseUrl}/about`, changefreq: "monthly", priority: 0.7 },
    { loc: `${baseUrl}/contact`, changefreq: "monthly", priority: 0.6 },
  ];

  // Later: add dynamic routes from DB/CMS here (posts, products, docs...)

  const xml = toXml(urls);

  return new Response(xml, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, max-age=0, s-maxage=3600",
    },
  });
}
