import { playwright } from "@vitest/browser-playwright";
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    passWithNoTests: false,
    coverage: {
      provider: "v8",
      include: ["src/**/*.ts"],
      exclude: [
        "src/test/**",
        "src/Types.ts",
        "src/_module.ts",
        "src/_script.ts",
      ],
      reporter: ["text", "json-summary", "html"],
      thresholds: {
        statements: 97,
        branches: 86,
        functions: 99,
        lines: 97,
      },
    },
    projects: [
      {
        extends: true,
        test: {
          name: "node",
          include: ["src/test/**/*.spec.ts"],
          exclude: ["src/test/browser/**"],
          environment: "node",
          mockReset: true,
          restoreMocks: true,
          unstubGlobals: true,
        },
      },
      {
        extends: true,
        test: {
          name: "browser",
          include: ["src/test/browser/**/*.spec.ts"],
          browser: {
            enabled: true,
            provider: playwright(),
            headless: true,
            instances: [{ browser: "chromium" }],
          },
          mockReset: true,
          restoreMocks: true,
          unstubGlobals: true,
        },
      },
    ],
  },
});
