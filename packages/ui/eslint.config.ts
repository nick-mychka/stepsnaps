import { baseConfig } from "@stepsnaps/eslint-config/base";
import { reactConfig } from "@stepsnaps/eslint-config/react";
import { defineConfig } from "eslint/config";

export default defineConfig(
  {
    ignores: ["dist/**"],
  },
  baseConfig,
  reactConfig,
);
