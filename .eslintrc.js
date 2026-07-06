module.exports = {
  root: true,
  env: {
    browser: true,
    es2021: true,
    node: true,
  },
  parser: '@typescript-eslint/parser',
  plugins: [
    '@typescript-eslint',
    'jest',
    'jest-dom',
    'jsx-a11y',
    'prettier',
    'react-hooks',
  ],
  extends: [
    'airbnb',
    'airbnb-typescript',
    'plugin:jest/recommended',
    'prettier',
    'plugin:@typescript-eslint/recommended',
  ],
  parserOptions: {
    ecmaFeatures: {
      jsx: true,
    },
    ecmaVersion: 12,
    sourceType: 'module',
    project: ['./tsconfig.json'],
  },
  rules: {
    'prettier/prettier': 'warn',
    'no-use-before-define': 'off',
    '@typescript-eslint/no-use-before-define': 'off',
    '@typescript-eslint/naming-convention': 'off',
    'no-shadow': 'off',
    '@typescript-eslint/no-shadow': ['error'],
    'no-console': ['warn', { allow: ['warn', 'error'] }],
    'react/function-component-definition': [
      2,
      { namedComponents: 'arrow-function' },
    ],
    'react/prop-types': 'off',
    'react/require-default-props': 'off',
    'react-hooks/rules-of-hooks': 'error',
    'react-hooks/exhaustive-deps': 'warn',
    'import/no-extraneous-dependencies': ['error', { devDependencies: true }],
  },
  settings: {
    jest: {
      version: 'latest',
    },
  },
};
