# ステージングの規約とマージ前の検証

コミットに何を入れるか、マージで何が起きるかを確かめる手順。
**このリポジトリでは複数のエージェント・セッションが同じ作業ツリーを触る**ため、
ここにある規約はどれも実際の事故から来ている。ブランチ運用とコミット規約は [git.md](./git.md)。

## ステージングの規約

### `git add -A` / `git add .` は使わない

> [!CAUTION]
> **必ずパスを明示してステージングしてください。** ワイルドカードのステージングは、作業ツリーに残っている**別作業の未コミット変更や生成物を無差別に取り込みます。**

```bash
# NG
git add -A
git add .

# OK
git status --short                     # まず全体を見る
git add src/app/globals.css src/components/layout/SponsorBanner.tsx
git diff --cached --name-only          # ステージした内容を確認してからコミット
```

**Why:** 2026-08-29、UIフィードバック対応の PR で `git add -A` を使ったところ、次の3つを巻き込んだ。

| 巻き込んだもの                                          | 実害                                         |
| ------------------------------------------------------- | -------------------------------------------- |
| `home-dev.html`（dev サーバのHTMLダンプ 100KB）         | Prettier の `format:check` が落ち、CI が失敗 |
| Kaisei Opti サブセットの自前配信（`@font-face`＋woff2） | 未レビューの別作業が PR に混入               |
| `--font-serif` 等の `var()` フォールバック追加          | 同上（2回目は検知して回避）                  |

**このリポジトリでは複数のエージェント・セッションが同じ作業ツリーを触ることがある。** 自分が編集していないファイルが `git status` に現れるのは異常ではなく通常であり、**ワイルドカードのステージングはそれを黙って取り込む。**

### コミット前のチェックリスト

1. `git status --short` — 身に覚えのないファイルが無いか
2. `git diff --cached --stat` — ステージした差分が意図どおりか
3. `git diff origin/main...HEAD --stat` — PR 全体のスコープが説明と一致しているか

3 は特に重要で、**PR の説明と実体が食い違っていないか**を最後に必ず見る。

### 巻き込んでしまった場合の復旧

**他人の作業を消してはいけない。** まず別ブランチへ退避して git 履歴に残し、そのうえで自分の PR から取り除く。

```bash
# 1. 現在の HEAD から退避ブランチを作り、未コミット分も含めて保全
git switch -c feature/<退避先>
git add <該当パス> && git commit -m "..."
git push -u origin feature/<退避先>

# 2. 元のブランチへ戻り、対象ファイルを main の状態に戻してから自分の変更だけ再適用
git switch <元のブランチ>
git rm --cached <巻き込んだ資産>
git checkout origin/main -- <巻き込まれたファイル>
# → エディタで自分の変更だけを入れ直す
```

## マージ前の検証

### diff ではなく「実マージ結果」を見る

> [!CAUTION]
> **GitHub の `mergeStateStatus=CLEAN` は「競合が無い」ことしか意味しません。マージによってファイルが消えないことは保証しません。**

`git diff` は two-dot でも three-dot でもこれを検知できません。**実際にマージした結果のツリーを作って確認します。**

```bash
git fetch origin

# 結果ツリーを作る（作業ツリーは変更されない）
git merge-tree --write-tree origin/main origin/<ブランチ> > /tmp/mt.txt \
  && echo "クリーンにマージ可能" || { echo "競合あり"; head /tmp/mt.txt; }

TREE=$(head -1 /tmp/mt.txt)

# 消えるファイルが無いか（ここが本題）
git diff --diff-filter=D --name-only origin/main "$TREE"

# 変わるファイル全体
git diff --stat origin/main "$TREE"
```

**Why:** 2026-08-29、退避ブランチ（PR #116）は GitHub 上で `CLEAN` だったが、実際にマージすると
`public/fonts/kaisei-opti-hero-700.woff2` と `@font-face` 宣言の**両方が無言で消えた。**
残るのは存在しないフォントを参照する `.font-hero-display` だけで、エラーも警告も出ず静かに
フォールバックする状態になっていた。

原因は git の3-wayマージの正常な挙動である。**マージベースに存在し、片方で削除され、
もう片方で未変更なら、削除が採用される。** この PR ではマージベースにファイルがあり、
`main` 側で削除されていた（別 PR のスコープ整理）ため、こうなった。

### アセットを含む PR は worktree で実際に動かす

結果ツリーの検査で足りない場合（本当に動くかを見たい場合）は、**worktree を切る。**
本体の作業ツリーを汚さず、他のセッションの未コミット作業とも衝突しない。

```bash
W=/tmp/wt-review
git worktree add "$W" <ブランチ>
cd "$W" && git merge origin/main        # ここで削除・競合が可視化される
pnpm install --frozen-lockfile --prefer-offline
PORT=3456 pnpm dev                       # 使用中のポートを避ける
# 確認後
git worktree remove --force "$W"
```

> [!WARNING]
> **`node_modules` をシンボリックリンクで済ませない。** Turbopack が
> `Symlink node_modules is invalid, it points out of the filesystem root` で panic する。
> worktree 内で `pnpm install` すること（pnpm のストアが効くので数秒で終わる）。

### 検証で分かることと分からないこと

**アニメーションに依存する描画は自動操作では判定できない。** オープナー演出は自動操作下で
t=0 のまま固まり、ヒーロー SVG が 0×0 のまま発火しないことがある。
`document.fonts.load()` のような**明示的な API で「素材が正しいこと」までは確認できる**が、
「実際に描画されるか」は実ブラウザでの目視が要る。詳細は
[browser-verification-pitfalls.md](../frontend/browser-verification-pitfalls.md)。

### マージ前チェックリスト

1. `git merge-tree --write-tree` の結果ツリーで `--diff-filter=D` を確認 — **消えるファイルは無いか**
2. `git diff --stat origin/main "$TREE"` — 変更範囲が PR の説明と一致しているか
3. **その作業が既に `main` へ別経路で入っていないか** — 入っていればマージは巻き戻しになる
4. **PR が閉じる Issue を GitHub が認識しているか** — `gh pr view <N> --json closingIssuesReferences --jq '.closingIssuesReferences[].number'`
5. **ブランチを切った後に `main` 側でも同じファイルが変わっていないか** — 変わっていたら、マージ結果を手元に作って検査を流す（下記）

3 も実際に起きた。PR #116 の内容は別コミット（`bf56d1a`）で `main` へ入っており、
しかも `main` 側の実装のほうが後発で改善を含んでいた。**マージしていれば改善を打ち消していた。**

4 は 2026-09-30 に起きた。#306 の本文に `Closes #287` と書いたが認識されず、マージ後も Issue が
開いたまま残った（原因は未調査）。空ならマージ前に本文を直すか、マージ後に手で閉じる。

5 が要るのは、**PR の CI が検証したのは「その時点の `main`」へマージした結果**だからである。
CI の後に `main` が進むと、実際にマージされる組み合わせは誰も検証していない。
競合が無くても、`main` 側で足された文章が、この PR で移したセクションを古い場所で指していることがある
（2026-09-30 の #311 で、`main` 側でも `.claude/CLAUDE.md` と `docs/INDEX.md` が変わっていた。
このときは問題なかったが、確かめるまで分からなかった）。

```bash
git fetch origin
B=$(git merge-base origin/main HEAD)

# 両側で変わったファイル。空なら 5 は通過
comm -12 <(git diff --name-only "$B" HEAD | sort) <(git diff --name-only "$B" origin/main | sort)

# 出力があれば、マージ結果を作って検査する（worktree で行う。コミットはしない）
git merge --no-commit --no-ff origin/main
pnpm check:doc-links && pnpm format:check   # コードも触っているなら lint / type-check / test も
git merge --abort
```

> [!CAUTION]
> **マージ後に `main` の状態を測るときは、先に `git fetch` すること。** 取得していない
> `origin/main` は古いままで、#311 の直後に分割前の行数（569行）を読んで誤認しかけた。

### マージ後の確認

1. **リモートのブランチが消えたか** — `git ls-remote --heads origin <branch>` が空であること
2. **閉じるはずの Issue が閉じたか** — `gh issue view <N> --json state --jq .state`（上の 4 の取りこぼし）
3. **本番デプロイが作られたか** — `main` の `Production Deploy Guard` が success であること（[vercel-production-deploy.md](./vercel-production-deploy.md)）

1 は 2026-10-04 に起きた。detached HEAD のツリーで `gh pr merge --delete-branch` を実行すると、
マージは成功するが、ローカルの後始末で `could not determine current branch` を出して止まり、
**リモートのブランチ削除まで届かない**（#394）。
`--delete-branch` を付けずにマージし、`git push origin --delete <branch>` で消してから 1 を確かめる。

## 関連ドキュメント

- [git.md](./git.md) - ブランチ戦略・CI・コミット規約
- [browser-verification-pitfalls.md](../frontend/browser-verification-pitfalls.md) - 自動操作で判定できないこと

---

**最終更新日**: 2026-10-04（マージ後の確認を追加。リモートブランチの削除漏れ、#394）
