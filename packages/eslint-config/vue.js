module.exports = {
  extends: [
    "./index.js",
    "plugin:vue/vue3-recommended",
  ],
  parser: "vue-eslint-parser",
  parserOptions: {
    parser: "@typescript-eslint/parser",
    sourceType: "module",
    ecmaVersion: 2020,
  },
  rules: {
    // Vue 3 + TypeScript compatibility
    "vue/multi-word-component-names": "off",
    // no-undef conflicts with vue-eslint-parser scope analysis
    // unplugin-auto-import provides Vue APIs globally
    "no-undef": "off",
  },
};
