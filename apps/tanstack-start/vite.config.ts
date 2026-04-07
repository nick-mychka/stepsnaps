import tailwindcss from "@tailwindcss/vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import viteReact from "@vitejs/plugin-react";
import { nitro } from "nitro/vite";
import { defineConfig } from "vite";

export default defineConfig({
  resolve: {
    tsconfigPaths: true,
    // Force tslib to use its ESM entry instead of CJS.
    // Rolldown's Linux binary produces a broken CJS-to-ESM wrapper for tslib,
    // causing "__extends of '__toESM$1(...).default' is undefined" at runtime.
    alias: {
      tslib: "tslib/tslib.es6.mjs",
    },
  },
  server: {
    port: 3001,
  },
  plugins: [nitro(), tanstackStart(), viteReact(), tailwindcss()],
});
