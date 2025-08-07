module.exports = {
  parser: '@typescript-eslint/parser',
  plugins: ['@typescript-eslint'],
  extends: ['eslint:recommended', '@typescript-eslint/recommended'],
  rules: {
    '@typescript-eslint/no-unused-vars': 'error',
    '@typescript-eslint/no-unused-expressions': 'error',
    'no-unused-vars': 'off', // Turn off base rule
  },
  parserOptions: {
    ecmaVersion: 2020,
    sourceType: 'module',
  },
};
