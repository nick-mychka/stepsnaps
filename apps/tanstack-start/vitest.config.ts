import { defineConfig } from "vitest/config";

// Standalone config so vitest doesn't load the TanStack Start vite plugins;
// only pure modules are tested, no DOM or app server needed.
export default defineConfig({
  test: {
    include: ["src/**/*.test.ts"],
  },
});
