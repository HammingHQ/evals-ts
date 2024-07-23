import type { Options } from "tsup";

const env = process.env.NODE_ENV;

const isProd = env === "production";

export const tsup: Options = {
  entry: ["src/index.ts"],
  outDir: "dist",
  sourcemap: isProd,
  clean: true,
  format: ["cjs", "esm"],
  dts: {
    compilerOptions: {
      module: "commonjs",
    },
  },
  minify: isProd,
};
