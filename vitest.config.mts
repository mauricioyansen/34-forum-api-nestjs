import { resolve } from "path";
import swc from "unplugin-swc";
import { defineConfig } from "vitest/config";
import tsConfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  test: {
    globals: true,
    root: "./",
    include: ["**/*.spec.ts"],
    exclude: ["**/*.e2e-spec.ts", "node_modules", "dist", "build"],
  },
  plugins: [
    tsConfigPaths(),
    swc.vite({
      module: { type: "es6" },
    }),
  ],
  resolve: {
    alias: {
      src: resolve(__dirname, "./src"),
    },
  },
});
