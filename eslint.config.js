// https://docs.expo.dev/guides/using-eslint/
const { defineConfig } = require('eslint/config');
const expoConfig = require("eslint-config-expo/flat");

module.exports = defineConfig([
  {
    ignores: [".expo/**", "dist/**"],
  },
  expoConfig,
  {
    languageOptions: {
      globals: {
        __dirname: "readonly",
      },
    },
  }
]);
