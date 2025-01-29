import js from "@eslint/js";
import pluginVue from "eslint-plugin-vue";
import pluginVitest from "@vitest/eslint-plugin";
import pluginCypress from "eslint-plugin-cypress/flat";
import skipFormatting from "@vue/eslint-config-prettier/skip-formatting";

export default [
  {
    name: "app/files-to-lint",
    files: ["**/*.{js,mjs,jsx,vue}"]
  },

  {
    name: "app/files-to-ignore",
    ignores: ["**/dist/**", "**/dev-dist/**", "**/dist-ssr/**", "**/coverage/**"]
  },

  js.configs.recommended,
  ...pluginVue.configs["flat/essential"],
  {
    languageOptions: {
      ecmaVersion: 2020,
      parserOptions: {
        "ecmaVersion": 2020
      },
      sourceType: "module",
      globals: {
        browser: true,
        node: true,
        "cypress/globals": true,
        global: true
      }
    }
  },
  {
    ...pluginVitest.configs.recommended,
    files: ["src/**/__tests__/*"]
  },

  {
    ...pluginCypress.configs.recommended,
    files: [
      "cypress/e2e/**/*.{cy,spec}.{js,ts,jsx,tsx}",
      "cypress/support/**/*.{js,ts,jsx,tsx}"
    ]
  },
  skipFormatting,
  pluginCypress.configs.globals
];