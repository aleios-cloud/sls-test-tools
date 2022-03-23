module.exports = {
  extends: [
    "eslint:recommended",
    "plugin:import/recommended",
    "plugin:prettier/recommended",
  ],
  rules: {
    curly: ["error", "all"],
    eqeqeq: ["error", "smart"],
    "import/no-duplicates": "off",
    "import/no-extraneous-dependencies": [
      "error",
      {
        devDependencies: true,
        optionalDependencies: false,
        peerDependencies: false,
      },
    ],
    "no-shadow": [
      "error",
      {
        hoist: "all",
      },
    ],
    "prefer-const": "error",
    "sort-imports": [
      "error",
      {
        ignoreCase: true,
        ignoreDeclarationSort: true,
        ignoreMemberSort: false,
        memberSyntaxSortOrder: ["none", "all", "multiple", "single"],
      },
    ],
    "padding-line-between-statements": [
      "error",
      {
        blankLine: "always",
        prev: "*",
        next: "return",
      },
    ],
    complexity: ["error", 8],
    "max-lines": ["error", 300],
    "max-depth": ["error", 3],
    "max-params": ["error", 2],
  },

  root: true,
  plugins: ["import"],
  env: {
    es6: true,
    node: true,
  },
  parserOptions: { ecmaVersion: 2021 },
  overrides: [
    {
      files: ["**/*.ts?(x)"],
      settings: { "import/resolver": { typescript: {} } },
      extends: [
        "plugin:@typescript-eslint/recommended",
        "plugin:@typescript-eslint/recommended-requiring-type-checking",
        "plugin:import/typescript",
        "plugin:prettier/recommended",
      ],
      parser: "@typescript-eslint/parser",
      parserOptions: {
        project: "tsconfig.json",
      },
      rules: {
        "@typescript-eslint/explicit-module-boundary-types": "error",
        "@typescript-eslint/prefer-optional-chain": "error",
        "no-shadow": "off",
        "@typescript-eslint/no-shadow": "error",
        "@typescript-eslint/prefer-nullish-coalescing": "error",
        "@typescript-eslint/strict-boolean-expressions": "error",
        "@typescript-eslint/no-unnecessary-boolean-literal-compare": "error",
        "@typescript-eslint/no-unnecessary-condition": "error",
        "@typescript-eslint/no-unnecessary-type-arguments": "error",
        "no-unused-vars": "off",
        "@typescript-eslint/no-unused-vars": [
          "error",
          { argsIgnorePattern: "^_$", varsIgnorePattern: "^_$" },
        ],
        "@typescript-eslint/prefer-string-starts-ends-with": "error",
        "@typescript-eslint/switch-exhaustiveness-check": "error",
        "@typescript-eslint/ban-ts-comment": [
          "error",
          {
            "ts-ignore": "allow-with-description",
            minimumDescriptionLength: 10,
          },
        ],
      },
    },
  ],
};
