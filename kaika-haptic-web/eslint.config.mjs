// eslint.config.mjs (ファイル名が .mjs でもこの内容でOK)
import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";
import typescriptParser from "@typescript-eslint/parser";
import typescriptPlugin from "@typescript-eslint/eslint-plugin";

const __filename = fileURLToPath(import.meta.url); // MJS形式でのパス取得
const __dirname = dirname(__filename);            // MJS形式でのパス取得

const compat = new FlatCompat({
  baseDirectory: __dirname,
  // resolvePluginsRelativeTo: __dirname,
});

const eslintConfig = [
  // 元々の Next.js 推奨設定
  ...compat.extends("next/core-web-vitals", "next/typescript"),

  // ルールの上書き設定
  {
    files: ["**/*.ts", "**/*.tsx"],
    languageOptions: {
        parser: typescriptParser,
        parserOptions: {
            // project: "./tsconfig.json" // 必要に応じてパスを確認
        }
    },
    plugins: {
        "@typescript-eslint": typescriptPlugin
    },
    rules: {
        // anyルールを警告(warn)に変更
        "@typescript-eslint/no-explicit-any": "warn",
    }
  }
];

export default eslintConfig; // MJS形式でのエクスポート