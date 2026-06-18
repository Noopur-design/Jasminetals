import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
  {
    rules: {
      // These components intentionally sync to external systems on mount /
      // prop change (IntersectionObserver, route changes, one-time intro,
      // detecting already-cached images). The heuristic flags those valid
      // uses, so keep it advisory rather than an error.
      "react-hooks/set-state-in-effect": "warn",
    },
  },
]);

export default eslintConfig;
