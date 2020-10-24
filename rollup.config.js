import path from "path";
import babel from "@rollup/plugin-babel";
import commonjs from "@rollup/plugin-commonjs";
import postcss from "rollup-plugin-postcss";
import pkg from "./package.json";

export default [
  {
    input: "src/index.js",
    output: {
      file: pkg.module,
      format: "esm",
      sourcemap: true,
    },
    plugins: [
      babel({
        babelHelpers: "runtime",
        configFile: path.resolve(__dirname, "babel.config.json"),
      }),
      commonjs(),
      postcss(),
    ],
  },
  {
    input: "src/index.js",
    output: {
      file: pkg.main,
      format: "cjs",
      exports: "named",
      sourcemap: true,
    },
    plugins: [
      babel({
        babelHelpers: "runtime",
        configFile: path.resolve(__dirname, "babel.config.commonjs.json"),
      }),
      commonjs(),
      postcss(),
    ],
  },
];
