import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [react()],
  build: {
    outDir: "public",
    emptyOutDir: true,
  },
  define: {
    "process.platform": JSON.stringify("win32"),
    "process.env": {},
    "process.versions": {},
  },
});
