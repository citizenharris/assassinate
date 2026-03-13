// @ts-check
import js from "@eslint/js";
import tseslint from "typescript-eslint";

export default tseslint.config(
  js.configs.recommended,
  ...tseslint.configs.strictTypeChecked,
  {
    languageOptions: {
      parserOptions: {
        project: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
    rules: {
      "@typescript-eslint/explicit-function-return-type": "error",
      "@typescript-eslint/consistent-type-imports": [
        "error",
        { prefer: "type-imports", fixStyle: "inline-type-imports" },
      ],
      "@typescript-eslint/no-import-type-side-effects": "error",
      "@typescript-eslint/restrict-template-expressions": [
        "error",
        { allowNumber: true, allowBoolean: true },
      ],
    },
  },
  {
    // Relax rules for config files that can't use project-level type-checking
    files: ["eslint.config.js", "vite.config.ts"],
    extends: [tseslint.configs.disableTypeChecked],
  },
  {
    // Non-null assertions are acceptable in unit tests when the contract of the
    // function under test guarantees a value exists
    files: ["tests/*.ts"],
    rules: {
      "@typescript-eslint/no-non-null-assertion": "off",
    },
  },
  {
    // e2e tests use @playwright/test types and a separate tsconfig — disable
    // type-aware rules that require the main project's type information
    files: ["tests/e2e/**"],
    extends: [tseslint.configs.disableTypeChecked],
    rules: {
      "@typescript-eslint/explicit-function-return-type": "off",
    },
  },
);
