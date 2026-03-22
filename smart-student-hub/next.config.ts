import type { NextConfig } from "next";
import path from "path";
import { fileURLToPath } from "url";

const appDir = path.dirname(fileURLToPath(import.meta.url));

const nextConfig: NextConfig = {
  // Monorepo: parent `SIH/package-lock.json` exists; pin Turbopack root to this app.
  turbopack: {
    root: appDir,
  },
};

export default nextConfig;
