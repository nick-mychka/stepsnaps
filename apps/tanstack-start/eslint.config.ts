import { defineConfig } from "eslint/config";

import { baseConfig, restrictEnvAccess } from "@stepsnaps/eslint-config/base";
import { reactConfig } from "@stepsnaps/eslint-config/react";

export default defineConfig(
  {
    ignores: [".nitro/**", ".output/**", ".tanstack/**"],
  },
  baseConfig,
  reactConfig,
  restrictEnvAccess,
);
