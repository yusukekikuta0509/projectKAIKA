// eslint.config.mjs
import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";
import typescriptParser from "@typescript-eslint/parser";
import typescriptPlugin from "@typescript-eslint/eslint-plugin";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

export default [
  // Next.js の基本設定を適用
  ...compat.extends("next/core-web-vitals"),
  ...compat.extends("next/typescript"), // これには TypeScript パーサーやプラグインの推奨設定が含まれます

  // カスタムルールの上書き/追加
  {
    files: ["**/*.ts", "**/*.tsx"], // TypeScript ファイルに適用
    // "next/typescript" でパーサーやプラグインは設定されているはずですが、
    // 明示的に指定することで意図を明確にします。
    languageOptions: {
        parser: typescriptParser,
        parserOptions: {
            // project: "./tsconfig.json", // 型情報を使った Lint を行う場合は有効化
        }
    },
    plugins: {
        "@typescript-eslint": typescriptPlugin
    },
    rules: {
      // 既存の "next/typescript" のルール設定に対して、以下のルールを上書き・追加します。

      // any の使用は警告 (warn) に設定 (既存の通り)
      "@typescript-eslint/no-explicit-any": "warn",

      // 未使用変数のルールをカスタマイズ
      "@typescript-eslint/no-unused-vars": [
        "error", // 未使用変数はエラーとする (ビルド失敗の原因)
        {
          "vars": "all", // ローカル変数、グローバル変数すべてをチェック
          "args": "after-used", // 最後の使用された引数以降の未使用引数をチェック
          "ignoreRestSiblings": true, // 分割代入の残りの未使用プロパティを無視 (例: const { a, ...rest } = obj;)
          "argsIgnorePattern": "^_",    // アンダースコアで始まる引数を無視
          "varsIgnorePattern": "^_",    // アンダースコアで始まる変数を無視
          "caughtErrorsIgnorePattern": "^_" // アンダースコアで始まるcatch節のエラー変数を無視
        }
      ]
      // 他に "next/typescript" のルールで変更したいものがあればここに追加
    }
  }
];