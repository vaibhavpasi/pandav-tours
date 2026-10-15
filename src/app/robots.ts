import type { MetadataRoute } from "next";
import { appUrl } from "@/lib/env";

/** Admin, API and transactional booking pages are never indexed. */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: [
        "/admin",
        "/api/",
        "/checkout",
        "/booking-success",
        "/booking-status",
        "/payment-failed",
      ],
    },
    // sitemap.xml is added in Phase 5.
    host: appUrl(),
  };
}
