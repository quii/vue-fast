import js from "@eslint/js";
import pluginVue from "eslint-plugin-vue";
import pluginVitest from "@vitest/eslint-plugin";
import pluginCypress from "eslint-plugin-cypress/flat";
import vueParser from "vue-eslint-parser";
import tsParser from "@typescript-eslint/parser";

// Create a compatibility instance

export default [
  // Base configuration for all files
  {
    ignores: ["**/dist/**", "**/dev-dist/**", "**/dist-ssr/**", "**/coverage/**", "**/node_modules/**"]
  },

  // JavaScript files
  {
    files: ["**/*.{js,mjs,jsx}"],
    ...js.configs.recommended
  },

  // TypeScript files
  {
    files: ["**/*.{ts,tsx}"],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        ecmaVersion: 2020,
        sourceType: "module"
      }
    },
    rules: {
      // Add TypeScript-specific rules here
    }
  },

  // Vue files
  {
    files: ["**/*.vue"],
    languageOptions: {
      parser: vueParser,
      parserOptions: {
        ecmaVersion: 2020,
        sourceType: "module",
        parser: tsParser
      }
    },
    plugins: {
      vue: pluginVue
    },
    rules: {
      ...pluginVue.configs["flat/essential"].rules
    }
  },

  // Common settings for all files
  {
    languageOptions: {
      ecmaVersion: 2020,
      sourceType: "module",
      globals: {
        browser: true,
        node: true
      }
    }
  },

  // Vitest files
  {
    files: ["src/**/__tests__/**/*.{js,ts,jsx,tsx}"],
    plugins: {
      vitest: pluginVitest
    },
    rules: {
      ...pluginVitest.configs.recommended.rules
    }
  },

  // Cypress files
  {
    files: [
      "cypress/e2e/**/*.{cy,spec}.{js,ts,jsx,tsx}",
      "cypress/support/**/*.{js,ts,jsx,tsx}"
    ],
    plugins: {
      cypress: pluginCypress
    },
    rules: {
      ...pluginCypress.configs.recommended.rules
    },
    languageOptions: {
      globals: {
        ...pluginCypress.configs.globals.languageOptions.globals
      }
    }
  },

  // Docker test files
  {
    files: ['tests/docker/**/*.{js,ts}'],
    languageOptions: {
      globals: {
        console: 'readonly',
        process: 'readonly',
        setTimeout: 'readonly',
        clearTimeout: 'readonly',
        __dirname: 'readonly',
        __filename: 'readonly',
        module: 'readonly',
        require: 'readonly',
        Buffer: 'readonly'
      }
    }
  },

  // Node.js scripts
  {
    files: ['scripts/**/*.{js,mjs}'],
    languageOptions: {
      globals: {
        console: 'readonly',
        process: 'readonly',
        setTimeout: 'readonly',
        clearTimeout: 'readonly',
        __dirname: 'readonly',
        __filename: 'readonly',
        module: 'readonly',
        require: 'readonly',
        Buffer: 'readonly'
      }
    }
  }
];
