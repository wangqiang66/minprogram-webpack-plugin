module.exports = {
  root: true,
  env: {
    node: true,
    "browser": true,
    "es6": true,
    "mocha": true,
    "jest": true
  },
  'extends': [
    'plugin:vue/essential',
    '@vue/standard'
  ],
  rules: {
    'no-console': process.env.NODE_ENV === 'production' ? 'error' : 'off',
    'no-debugger': process.env.NODE_ENV === 'production' ? 'error' : 'off',
    'space-before-function-paren': [0],
    'brace-style': [1]
  },
  parserOptions: {
    parser: 'babel-eslint'
  },
  globals: {
    "__DEV__": true,
    "App": true,
    "Page": true,
    "Component": true,
    "wx": true,
    "getApp": true
  }
}
