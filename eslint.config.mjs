import nextConfig from "eslint-config-next";
import prettierConfig from "eslint-config-prettier";

/** @type {import('eslint').Linter.Config[]} */
const config = [
  ...nextConfig,
  prettierConfig,
  {
    ignores: ["node_modules/", ".next/", "out/"],
  },
];

export default config;
