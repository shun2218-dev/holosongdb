import type { MetadataRoute } from "next"

export default function robots(): MetadataRoute.Robots {
  const baseUrl = "https://www.holosongdb.com"

  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/", "/popular"],
        disallow: ["/admin", "/admin-login", "/api", "/settings"],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  }
}
