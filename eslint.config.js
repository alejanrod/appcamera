const tsParser = require('@typescript-eslint/parser');
const angular = require('@angular-eslint/eslint-plugin');
const template = require('@angular-eslint/eslint-plugin-template');
const templateParser = require('@angular-eslint/template-parser');
module.exports = [
  { ignores: ['node_modules/**', 'www/**', 'android/**', '.angular/**'] },
  { files: ['src/**/*.ts'], languageOptions: { parser: tsParser },
    plugins: { '@angular-eslint': angular },
    rules: { ...angular.configs.recommended.rules, '@angular-eslint/prefer-standalone': 'off', '@angular-eslint/prefer-inject': 'off',
      '@angular-eslint/component-class-suffix': ['error', { suffixes: ['Page', 'Component'] }] } },
  { files: ['src/**/*.html'], languageOptions: { parser: templateParser },
    plugins: { '@angular-eslint/template': template }, rules: template.configs.recommended.rules }
];
