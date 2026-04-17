import pluginRouter from "@tanstack/eslint-plugin-router";
import { defineConfig } from "eslint/config";

import { baseConfig, restrictEnvAccess } from "@stepsnaps/eslint-config/base";
import { reactConfig } from "@stepsnaps/eslint-config/react";

export default defineConfig(
  {
    ignores: [".nitro/**", ".output/**", ".tanstack/**"],
  },
  baseConfig,
  reactConfig,
  pluginRouter.configs["flat/recommended"],
  {
    rules: {
      "@typescript-eslint/only-throw-error": [
        "error",
        {
          allow: [
            {
              from: "package",
              package: "@tanstack/router-core",
              name: "Redirect",
            },
            {
              from: "package",
              package: "@tanstack/router-core",
              name: "NotFoundError",
            },
          ],
        },
      ],
    },
  },
  restrictEnvAccess,
);
