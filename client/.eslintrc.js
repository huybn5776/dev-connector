module.exports = {
  extends: ['../.eslintrc.js', 'airbnb/hooks'],
  env: {
    browser: true,
    es2020: true,
  },
  plugins: ['react'],
  rules: {
    'react/jsx-props-no-spreading': 0,
    'react/no-unused-prop-types': 1,
    'react/no-unused-state': 1,
    'react/require-default-props': 0,
  },
};
