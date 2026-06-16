import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  base: process.env.GITHUB_REPOSITORY?.endsWith("/NextStep-2") ? "/NextStep-2/" : "/",
});
