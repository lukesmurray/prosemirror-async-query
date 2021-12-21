import typescript from "@rollup/plugin-typescript";
import react from "@vitejs/plugin-react";
import path from "path";
import { defineConfig } from "vite";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  define: {
    "process.platform": JSON.stringify("win32"),
    "process.env": {},
  },
  build: {
    lib: {
      entry: path.resolve(__dirname, "lib/main.ts"),
      name: "prosemirror-async-query",
      fileName: (format) => `prosemirror-async-query.${format}.js`,
    },
    rollupOptions: {
      // make sure to externalize deps that shouldn't be bundled
      // into your library
      external: ["prosemirror-state", "prosemirror-view"],
      output: {
        // Provide global variables to use in the UMD build
        // for externalized deps
        globals: {
          ["prosemirror-state"]: "prosemirror-state",
          ["prosemirror-view"]: "prosemirror-view",
        },
      },
      plugins: [
        typescript({
          declaration: true,
          declarationDir: path.resolve(__dirname, "dist"),
          include: ["./lib/**/*"],
        }),
      ],
    },
  },
});
