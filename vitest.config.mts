import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    // DOM を使うテストはここでは書きません。盤面が 0px に潰れていないことのような
    // レイアウトの検証は、レイアウトエンジンを持つ実ブラウザでしか成立しません
    // （jsdom は getBoundingClientRect() が常に 0 を返すため #148 を検出できません）。
    // node に固定して、「DOM があるように見えて実際には何も測れていない」テストを
    // 書けないようにしています。
    environment: "node",

    // src 配下に限定します。この指定により e2e のテストは対象外になります。
    include: ["src/**/*.test.ts"],

    // vi.stubEnv() の効果をテストごとに巻き戻します。
    unstubEnvs: true,
  },
  resolve: {
    // tsconfig の paths（"@/*" → "./src/*"）に対応させます。
    //
    // 文字列キーの "@" にしてはいけません。Vite の alias は前方一致で置換するため、
    // "@hookform/resolvers" のようなスコープ付きパッケージ名まで書き換わります。
    // 正規表現で "@/" だけに限定します。
    alias: [{ find: /^@\//, replacement: fileURLToPath(new URL("./src/", import.meta.url)) }],
  },
});
