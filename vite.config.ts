import { defineConfig } from "vitest/config";

export default defineConfig({
  base: "./",
  build: {
    outDir: "dist",
  },
  test: {
    environment: "node",
    globals: false,
    include: ["tests/*.test.ts"],
  },
});
