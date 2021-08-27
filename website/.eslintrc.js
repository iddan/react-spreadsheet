module.exports = {
  root: true,
  env: {
    browser: true,
    commonjs: true,
    jest: true,
    node: true,
  },
  parser: "@babel/eslint-parser",
  parserOptions: {
    allowImportExportEverywhere: true,
  },
  extends: ["airbnb", "prettier", "prettier/react"],
  plugins: ["react-hooks"],
  rules: {
    // Ignore certain webpack alias because it can't be resolved
    "import/no-unresolved": [
      "error",
      { ignore: ["^@theme", "^@docusaurus", "^@generated"] },
    ],
    "import/extensions": "off",
    "react/jsx-closing-bracket-location": "off", // Conflicts with Prettier.
    "react/jsx-filename-extension": "off",
    "react-hooks/rules-of-hooks": "error",
    "react-hooks/exhaustive-deps": "error",
    "react/prop-types": "off", // PropTypes aren't used much these days.
  },
};
