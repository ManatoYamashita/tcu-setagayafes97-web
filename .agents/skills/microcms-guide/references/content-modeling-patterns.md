# microCMS コンテンツモデルの変更・設計例

最終確認: 2026-09-08

仕様の根拠は末尾の公式情報を参照する。設計上の推奨・コード例は本Skillの提案であり、唯一の公式推奨構成を意味しない。

基本事項は [content-modeling.md](content-modeling.md) を参照する。

## 目次

- [スキーマ変更に強い設計](#スキーマ変更に強い設計)
- [典型パターン](#典型パターン)
- [避けたい設計](#避けたい設計)
- [提案時のチェックリスト](#提案時のチェックリスト)
- [表示用の日時を選ぶ](#表示用の日時を選ぶ)
- [公式情報](#公式情報)

## スキーマ変更に強い設計

本番運用後のスキーマ変更は、既存コンテンツとフロントエンドの両方へ影響する。

そのため、変更時は次の順序を基本とする。

1. 変更対象のフィールドを利用しているコンテンツ・コードを確認する。
2. 互換性を保ったまま新しいフィールドを追加できるか検討する。
3. 必要なら既存データを移行する。
4. フロントエンドを新フィールドへ切り替える。
5. 利用されなくなった旧フィールドを最後に整理する。

APIレスポンスの破壊的変更を伴う削除・名称変更などを、管理画面だけを見て即座に行わない。

スキーマ変更は即時反映される。変更前のスキーマをエクスポートし、利用可能なら複数環境で検証する。公式ヘルプでは、既存APIのスキーマをファイルのインポートで上書き・ロールバックする方法は提供されていないと案内されている。エクスポートを自動復元手段とはみなさず、実際の復旧手順も用意する。複数環境の利用条件・本番反映方法は最新仕様を確認する。[公式ヘルプ：運用中のスキーマ変更](https://help.microcms.io/ja/knowledge/change-api-schema-in-operation)

## 典型パターン

### ブログ

```text
articles (list)
├─ title
├─ body
├─ eyecatch
├─ category -> categories
├─ tags -> tags[]
└─ author -> authors

categories (list)
└─ name

tags (list)
└─ name

authors (list)
├─ name
├─ image
├─ description
├─ xUrl
└─ githubUrl
```

記事URLのslugをコンテンツIDでまかなえる要件なら、専用slugフィールドを増やさずコンテンツIDを利用する選択肢もある。

### コーポレートサイト

```text
news (list)
case-studies (list)
members (list)
site-settings (object)
company (object)
```

固定ページをすべて1つの巨大なオブジェクトAPIへ詰め込むか、ページごとに分けるかは、編集権限・更新頻度・担当者・データの独立性で判断する。

### LP / 柔軟なページ

```text
pages (list)
├─ title
├─ seo
└─ sections[] (repeat)
    ├─ hero
    ├─ text
    ├─ imageText
    └─ cta
```

自由度が必要な場合だけ採用する。固定レイアウトなら通常フィールドの方が編集者にも実装者にも分かりやすい。

## 避けたい設計

- 画面ごとに同じカテゴリ名・著者名を重複入力する。
- 1件しか存在しない設定を、理由なくリスト形式で管理する。
- フロントエンドの一時的なレイアウト都合だけでフィールドを命名する。
- 参照を深く連鎖させ、取得のために常に最大 `depth` を要求する。
- 柔軟性を理由にすべてを繰り返しフィールドへする。
- APIを細分化しすぎて編集者が複数画面を行き来しないと1ページを更新できない。
- 既存コンテンツへの影響を確認せず、フィールド削除などの破壊的変更を行う。

## 提案時のチェックリスト

コンテンツモデルを提案する前に、少なくとも以下を確認する。

- そのコンテンツは1件か複数件か。
- 一覧・詳細ページが必要か。
- 他コンテンツから再利用されるか。
- カテゴリやタグを独立して管理・表示するか。
- 編集者がレイアウト順を変更する必要があるか。
- 参照先の情報をどこまで取得する必要があるか。
- APIレスポンスが大きくなりすぎないか。
- 繰り返しで使うカスタムフィールドの種類・項目数・入れ子が過剰でないか。
- 複雑な構造を提案する場合、想定スキーマと代表コンテンツで保存・公開・取得まで検証できているか。
- 既存の編集運用を不必要に複雑化しないか。
- 将来要件ではなく現在の具体的な要件から設計しているか。

ユーザー要件が十分に分かっている場合は、不要な追加質問を挟まず、推奨スキーマとその理由を具体的に提示する。

## 表示用の日時を選ぶ

公開日は `publishedAt`、公開内容の更新日は `revisedAt` を基本にする。`updatedAt` は下書き保存でも変わるため、公開ページの日付や並び順へ使うと編集途中の操作が反映される。`createdAt` は作成日時であり公開日ではない。任意の編集上の日付が必要なら独自の日時フィールドを設ける。[公式ヘルプ：日時の使い分け](https://help.microcms.io/ja/knowledge/how-to-setup-date)

APIの日時はUTCのISO 8601形式。表示時に対象タイムゾーンへ変換し、日付範囲の `filters` もUTCで組み立てる。JSTの日付境界をUTCの同じ日付の0時に置き換えない。[公式ヘルプ：UTCの扱い](https://help.microcms.io/ja/knowledge/specification-of-utc-time)

## 公式情報

- [APIの作成・管理](https://document.microcms.io/manual/create-api)
- [カスタムフィールド](https://document.microcms.io/manual/custom-field)
- [繰り返しフィールド](https://document.microcms.io/manual/repeat-field)
- [セレクトフィールド](https://document.microcms.io/manual/select-field)
- [レスポンス形式と空値](https://document.microcms.io/content-api/get-api-field-responses)
- [depth・fields・filters](https://document.microcms.io/content-api/get-list-contents)
- [制限事項／注意事項](https://document.microcms.io/manual/limitations)
