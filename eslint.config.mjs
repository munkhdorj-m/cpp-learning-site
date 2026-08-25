import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  {
    ignores: [
      "node_modules/**",
      ".next/**",
      "out/**",
      "build/**",
      "next-env.d.ts",
      // Vendor output, copied out of node_modules on every build by
      // scripts/copy-monaco.mjs and scripts/copy-sqljs.mjs. Linting 6 MB of
      // minified Monaco produced 47 of the project's 55 errors and more than
      // ten thousand warnings — all of them about code we do not write and
      // cannot change, which drowned out the handful that were ours.
      "public/monaco/**",
      "public/sql-wasm/**",
    ],
  },
  {
    // The Passenger entry point is CommonJS on purpose: cPanel loads it with
    // require(), so it cannot be an ES module.
    files: ["server.js"],
    rules: { "@typescript-eslint/no-require-imports": "off" },
  },
  {
    // A test double for the go-judge sandbox. It records whatever JSON the
    // judge sends and asserts on it — `body.cmd[0].copyIn["main.cpp"].content`
    // and a dozen more like it. Writing a type for a request shape we do not
    // own would either be a wall of casts or a fiction that goes stale
    // silently; `any` is the honest description of "arbitrary parsed JSON".
    files: ["scripts/test-go-judge.mts"],
    rules: { "@typescript-eslint/no-explicit-any": "off" },
  },
];

export default eslintConfig;
