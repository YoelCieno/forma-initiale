module.exports = {
  root: true,
  extends: ["@repo/eslint-config/vue.js"],
  rules: {
    // WA custom elements (fe-*) use native slot attr (not Vue virtual slots)
    "vue/no-deprecated-slot-attribute": "off",
    // fe-* elements are web components — explicit closing tags needed for Vite template compat
    "vue/html-self-closing": ["warn", {
      html: {
        void: "never",
        normal: "always",
        component: "always",
      },
      svg: "always",
      math: "always",
    }],
    // Allow inline attributes on custom elements
    "vue/max-attributes-per-line": "off",
    "vue/singleline-html-element-content-newline": "off",
  },
};
