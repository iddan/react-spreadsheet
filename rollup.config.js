/* eslint-disable import/no-anonymous-default-export */

import typescript from "rollup-plugin-typescript2";
import postcss from "rollup-plugin-postcss";
import pkg from "./package.json";

const input = "src/index.ts";
const external = [
  "react",
  ...Object.keys(pkg.dependencies).flatMap(
    (dependency) => new RegExp(`^${dependency}(\\/.+)?`)
  ),
];

export default [
  {
    input,
    output: {
      dir: "dist",
      format: "cjs",
      exports: "named",
      sourcemap: true,
    },
    plugins: [typescript(), postcss()],
    external,
  },
  {
    input,
    output: {
      dir: "dist/es",
      format: "es",
      exports: "named",
      sourcemap: true,
    },
    plugins: [typescript(), postcss()],
    external,
  },
];
