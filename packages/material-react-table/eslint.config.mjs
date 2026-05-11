import js from '@eslint/js';
import globals from 'globals';
import tsEslintPlugin from '@typescript-eslint/eslint-plugin';
import tsEslintParser from '@typescript-eslint/parser';
import muiPathImportsPlugin from 'eslint-plugin-mui-path-imports';
import perfectionistPlugin from 'eslint-plugin-perfectionist';
import storybookPlugin from 'eslint-plugin-storybook';

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
    },
    rules: {
      'no-console': ['error', { allow: ['warn', 'error', 'info'] }],
      '@typescript-eslint/ban-ts-comment': 'off',
      '@typescript-eslint/ban-types': 'off',
      '@typescript-eslint/no-explicit-any': 'error',
      'no-unused-vars': 'off',
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          args: 'all',
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          caughtErrorsIgnorePattern: '^_',
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
