const defaultPresets = [
  ["@babel/preset-typescript", { allowNamespaces: true }],
];

const defaultIgnores = [
  /.*\/(.*\.|)test\.tsx?/,
  /bundle\.ts/,
  /node_modules/,
  /lib/,
];

const presetsForESM = [
  [
    "@babel/preset-env",
    {
      modules: false,
    },
  ],
  ...defaultPresets,
];
const presetsForCJS = [
  [
    "@babel/preset-env",
    {
      modules: "cjs",
    },
  ],
  ...defaultPresets,
];
const plugins = [
  [
    "module-resolver",
    {
      root: ["."],
    },
  ],
  "@babel/plugin-transform-runtime",
];

module.exports = {
  env: {
    cjs: {
      presets: presetsForCJS,
    },
    esm: {
      presets: presetsForESM,
    },
  },
  ignore: defaultIgnores,
  plugins,
};
