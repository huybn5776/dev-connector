module.exports = {
  extends: ['../../.eslintrc.js', 'plugin:security/recommended'],
  parserOptions: {
    project: '../tsconfig.json',
    tsconfigRootDir: '../',
  },
};
