import eslint from '@eslint/js';
import pluginN from 'eslint-plugin-n';
import pluginUnicorn from 'eslint-plugin-unicorn';
import pluginPerfectionist from 'eslint-plugin-perfectionist';
import prettier from 'eslint-config-prettier';

export default [
  eslint.configs.recommended,
  pluginN.configs['flat/recommended'],
  pluginUnicorn.configs['flat/recommended'],
  prettier,
  {
    plugins: {
      perfectionist: pluginPerfectionist
    },
    rules: {
      'unicorn/prevent-abbreviations': 'off',
      'unicorn/no-null': 'off',
      'unicorn/prefer-module': 'off',
      'unicorn/filename-case': 'off',
      'unicorn/no-process-exit': 'off',
      'n/no-process-exit': 'off',
      'unicorn/prefer-top-level-await': 'off',
      'perfectionist/sort-imports': [
        'error',
        {
          type: 'natural',
          order: 'asc'
        }
      ],
      'perfectionist/sort-objects': [
        'error',
        {
          type: 'natural',
          order: 'asc'
        }
      ]
    }
  },
  {
    files: ['**/__tests__/**/*.js', '**/*.test.js', '**/*.spec.js'],
    languageOptions: {
      globals: {
        describe: 'readonly',
        it: 'readonly',
        expect: 'readonly',
        test: 'readonly',
        beforeEach: 'readonly',
        afterEach: 'readonly',
        beforeAll: 'readonly',
        afterAll: 'readonly',
        jest: 'readonly'
      }
    },
    rules: {
      'n/no-unpublished-require': 'off'
    }
  }
];
