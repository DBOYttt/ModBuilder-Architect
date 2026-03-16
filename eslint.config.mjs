import js from '@eslint/js';
import tsPlugin from '@typescript-eslint/eslint-plugin';
import tsParser from '@typescript-eslint/parser';
import reactPlugin from 'eslint-plugin-react';
import reactHooksPlugin from 'eslint-plugin-react-hooks';

/** @type {import('eslint').Linter.Config[]} */
export default [
  // Base JS recommended rules
  js.configs.recommended,

  // TypeScript files
  {
    files: ['**/*.ts', '**/*.tsx'],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        ecmaVersion: 2022,
        sourceType: 'module',
        ecmaFeatures: { jsx: true },
      },
    },
    plugins: {
      '@typescript-eslint': tsPlugin,
      react: reactPlugin,
      'react-hooks': reactHooksPlugin,
    },
    settings: {
      react: { version: 'detect' },
    },
    rules: {
      // ─── TypeScript baseline ───────────────────────────────────────────────
      // Warn on explicit `any` but don't error — too many to fix in one pass
      '@typescript-eslint/no-explicit-any': 'warn',
      // Unused variables are real bugs; error on them (ignores `_`-prefixed)
      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_', caughtErrorsIgnorePattern: '^_' },
      ],

      // ─── React ────────────────────────────────────────────────────────────
      'react/react-in-jsx-scope': 'off', // React 17+ JSX transform, not needed
      'react/prop-types': 'off',          // TypeScript handles this
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'warn',

      // ─── General JS ───────────────────────────────────────────────────────
      'no-unused-vars': 'off', // Superseded by @typescript-eslint/no-unused-vars
      'no-console': 'warn',
      'no-debugger': 'error',
      'no-undef': 'off', // TypeScript handles this better
    },
  },

  // Ignore generated and build output
  {
    ignores: [
      'dist/**',
      'node_modules/**',
      'src/generated-blocks.ts',      // auto-generated block definitions
      'scripts/**',                   // build/asset scripts (CommonJS)
      '**/*.cjs',
    ],
  },
];
