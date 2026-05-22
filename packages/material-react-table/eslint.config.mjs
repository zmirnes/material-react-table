import js from '@eslint/js';
import tsEslintPlugin from '@typescript-eslint/eslint-plugin';
import tsEslintParser from '@typescript-eslint/parser';
import muiPathImportsPlugin from 'eslint-plugin-mui-path-imports';
import perfectionistPlugin from 'eslint-plugin-perfectionist';
import storybookPlugin from 'eslint-plugin-storybook';
import unusedImportsPlugin from 'eslint-plugin-unused-imports';
import globals from 'globals';

export default [
  {
    ignores: ['dist/**', 'locales/**', 'node_modules/**', '.yalc/**'],
  },
  js.configs.recommended,
  ...storybookPlugin.configs['flat/recommended'],
  {
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      parser: tsEslintParser,
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: {
        ...globals.browser,
        console: 'readonly',
        alert: 'readonly',
        setTimeout: 'readonly',
        btoa: 'readonly',
      },
    },
    plugins: {
      '@typescript-eslint': tsEslintPlugin,
      'mui-path-imports': muiPathImportsPlugin,
      perfectionist: perfectionistPlugin,
      'unused-imports': unusedImportsPlugin,
    },
    rules: {
      'no-console': ['error', { allow: ['warn', 'error', 'info'] }],
      '@typescript-eslint/ban-ts-comment': 'off',
      '@typescript-eslint/ban-types': 'off',
      '@typescript-eslint/no-explicit-any': 'error',
      'no-unused-vars': 'off',
      '@typescript-eslint/no-unused-vars': 'off',

      'unused-imports/no-unused-imports': 'error',

      'unused-imports/no-unused-vars': [
        'warn',
        {
          vars: 'all',
          varsIgnorePattern: '^_',
          args: 'after-used',
          argsIgnorePattern: '^_',
        },
      ],
      '@typescript-eslint/consistent-type-imports': [
        'warn',
        {
          prefer: 'type-imports',
          disallowTypeAnnotations: true,
          fixStyle: 'inline-type-imports',
        },
      ],
      'mui-path-imports/mui-path-imports': 'warn',
      'perfectionist/sort-imports': [
        'warn',
        {
          type: 'natural',
          order: 'asc',
          groups: [
            'react',
            'tanstack',
            'mui',
            'mrt',
            'sibling',
            'sibling-type',
            'parent',
            'parent-type',
            'index',
            'index-type',
            'object',
            'unknown',
          ],
          customGroups: {
            value: {
              react: ['^react$', '^react-'],
              storybook: ['^@storybook/'],
              tanstack: '^@tanstack/',
              mui: '^@mui/',
              mrt: ['^\\./MRT_', '^\\.\\./.*MRT_', '^\\.\\./\\.\\./src$'],
              faker: '^@faker/',
            },
            type: {
              react: '^react$',
            },
          },
          newlinesBetween: 'never',
        },
      ],
    },
  },
];
