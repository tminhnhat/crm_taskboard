import { FlatCompat } from "@eslint/eslintrc";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const compat = new FlatCompat({
  baseDirectory: __dirname,
  recommendedConfig: true
});

export default [
  {
    files: ["**/*.{js,jsx,ts,tsx}"],
    ...compat.config({
      extends: ["next/core-web-vitals"],
      parserOptions: {
        project: "./tsconfig.json"
      }
    })
  }
];
