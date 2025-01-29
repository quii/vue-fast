/* eslint-env node */
require('@rushstack/eslint-patch/modern-module-resolution')

module.exports = {
  root: true,
  'extends': [
    'plugin:vue/vue3-essential',
    'eslint:recommended',
    '@vue/eslint-config-prettier/skip-formatting'
  ],
  "env": {
    "browser": true,
    "node": true,
    "cypress/globals": true
  },
  overrides: [
    {
      files: ["**/*.js", "**/*.vue"],
      rules: {
        // Add any specific rules for these files here
      }
    },
    {
      files: [
        'cypress/e2e/**/*.{cy,spec}.{js,ts,jsx,tsx}'
      ],
      'extends': [
        'plugin:cypress/recommended'
      ]
    }
  ],
  parserOptions: {
    ecmaVersion: 'latest'
  },
  "ignorePatterns": ["**/dev-dist/*.js"],
}
