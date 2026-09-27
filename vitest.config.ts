import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

// Unit tests do not need the application server or prerender plugins.
export default defineConfig({
  resolve: {
    alias: { "@": fileURLToPath(new URL("./src", import.meta.url)) },
  },
  test: {
    environment: "node",
    include: ["tests/**/*.test.ts"],
  },
});
