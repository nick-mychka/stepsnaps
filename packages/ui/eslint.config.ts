import { defineConfig } from "eslint/config";

import { baseConfig } from "@stepsnaps/eslint-config/base";
import { reactConfig } from "@stepsnaps/eslint-config/react";

export default defineConfig(
  {
    ignores: ["dist/**"],
  },
  baseConfig,
  reactConfig,
);
