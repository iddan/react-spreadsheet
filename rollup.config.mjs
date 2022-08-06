/* eslint-disable import/no-anonymous-default-export */

import typescript from "rollup-plugin-typescript2";
import postcss from "rollup-plugin-postcss";
import dts from "rollup-plugin-dts";
import pkg from "./package.json" assert { type: "json" };

function createExternal(dependencies) {
  return Object.keys(dependencies).flatMap(
    (dependency) => new RegExp(`^${dependency}(\\/.+)?`)
  );
}

const input = "src/index.ts";

const external = [
  ...createExternal(pkg.dependencies),
  ...createExternal(pkg.peerDependencies),
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
  {
    input,
    output: {
      file: "dist/index.d.ts",
      format: "es",
    },
    plugins: [dts()],
    external: [...external, /\.css$/],
  },
];
