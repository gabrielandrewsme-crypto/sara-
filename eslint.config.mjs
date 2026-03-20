import js from "@eslint/js";
import nextPlugin from "@next/eslint-plugin-next";
import tsEslintPlugin from "@typescript-eslint/eslint-plugin";
import tsParser from "@typescript-eslint/parser";
import globals from "globals";
import reactHooks from "eslint-plugin-react-hooks";
import { defineConfig, globalIgnores } from "eslint/config";

export default defineConfig([
  globalIgnores([".next/**", "dist/**", "node_modules/**"]),
  {
    files: ["**/*.{js,mjs,cjs,jsx,ts,tsx}"],
    extends: [
      js.configs.recommended,
      nextPlugin.configs["core-web-vitals"],
      reactHooks.configs.flat.recommended
    ],
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
      parser: tsParser,
      globals: {
        ...globals.browser,
        ...globals.node
      },
      parserOptions: {
        ecmaFeatures: { jsx: true }
      }
    },
    rules: {
      "no-unused-vars": "off",
      "@typescript-eslint/no-unused-vars": [
        "error",
        {
          argsIgnorePattern: "^_",
          varsIgnorePattern: "^[A-Z_]"
        }
      ]
    },
    plugins: {
      "@typescript-eslint": tsEslintPlugin
    }
  }
]);
