export default {
  extends: ["stylelint-config-standard"],
  ignoreFiles: ["dist/**", "node_modules/**", "public/lib/**"],
  rules: {
    "at-rule-no-unknown": [
      true,
      {
        ignoreAtRules: ["apply", "config", "custom-variant", "layer", "plugin", "theme"],
      },
    ],
    "import-notation": null,
    "no-descending-specificity": null,
    "property-no-vendor-prefix": null,
    "value-keyword-case": null,
  },
};
