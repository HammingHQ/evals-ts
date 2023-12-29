import type { Options } from "tsup";

const env = process.env.NODE_ENV;

const isDev = env === "development";
const isProd = env === "production";

export const tsup: Options = {
  sourcemap: isProd,
  splitting: true,
  clean: true,
  format: ["cjs", "esm"],
  entryPoints: ["src/index.ts"],
  dts: true,
  minify: isProd,
  target: "es2020",
  outDir: isProd ? "dist" : "lib",
  watch: isDev,
  entry: ["src/**/*.ts"],
};
