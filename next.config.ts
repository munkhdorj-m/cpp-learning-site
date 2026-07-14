import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./i18n/request.ts");

const nextConfig: NextConfig = {
  experimental: {
    staleTimes: {
      dynamic: 30, // serve stale dynamic pages for 30s while revalidating
    },
  },
};

export default withNextIntl(nextConfig);
