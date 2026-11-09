import js from '@eslint/js';
import { FlatCompat } from '@eslint/eslintrc';
import nextVitals from 'eslint-config-next/core-web-vitals.js';
import tseslint from 'typescript-eslint';

const compat = new FlatCompat();

const config = [
  js.configs.recommended,
  ...tseslint.configs.recommended,
  ...compat.config(nextVitals),
  { ignores: ['.next/**', 'out/**', 'playwright-report/**'] }
];

export default config;
