import { FlatCompat } from "@eslint/eslintrc"
import { fileURLToPath } from "node:url"
const compat = new FlatCompat({ baseDirectory: fileURLToPath(new URL(".", import.meta.url)) })
const config = [
  { ignores: ["node_modules/**", ".next/**", "out/**", "build/**"] },
  ...compat.extends("next/core-web-vitals"),
]
export default config
