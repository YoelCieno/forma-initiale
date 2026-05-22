import { defineConfig } from "vitest/config";
import vue from "@vitejs/plugin-vue";
import AutoImport from "unplugin-auto-import/vite";

export default defineConfig({
  plugins: [
    vue(),
    AutoImport({
      imports: ["vue"],
      dirs: ["./src/composables"],
      dts: "./src/auto-imports.d.ts",
    }),
  ],
  test: {
    environment: "jsdom",
    include: ["src/**/*.spec.ts"],
  },
});
