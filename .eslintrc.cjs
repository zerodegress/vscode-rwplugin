/** @type {import('eslint').Linter.Config} */
module.exports = {
  env: {
    es2021: true,
    node: true
  },
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended'
  ],
  overrides: [
    {
      env: {
        'node': true
      },
      files: [
        '.eslintrc.{js,cjs}'
      ],
      parserOptions: {
        sourceType: 'script'
      }
    }
  ],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module'
  },
  plugins: [
    'prettier',
    '@typescript-eslint'
  ],
  rules: {
    indent: [
      'error',
      2,
      { SwitchCase: 1 }
    ],
    quotes: [
      'error',
      'single'
    ],
    semi: [
      'error',
      'never'
    ]
  }
}
