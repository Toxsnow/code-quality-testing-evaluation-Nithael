module.exports = {
  root: true,
  env: {
    node: true,
    es2021: true,
  },
  parserOptions: {
    ecmaVersion: 2021,
    sourceType: 'module',
  },
  extends: ['eslint:recommended', 'plugin:n/recommended', 'plugin:unicorn/recommended', 'prettier'],
  plugins: ['n', 'unicorn', 'perfectionist'],
  rules: {
    'n/no-path-concat': 'off',
    'unicorn/prevent-abbreviations': 'off',
    'perfectionist/sort': 'warn'
  }
};
