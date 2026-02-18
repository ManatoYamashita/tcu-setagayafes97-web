# Vercel デプロイ設定

## 概要

本プロジェクトではVercelを使用し、複数のブランチを異なる環境にデプロイしています。
カウントダウンページと通常版を並行開発し、適切なタイミングで本番を切り替えられる構成です。

## 環境構成

### Production（本番環境）

- **ブランチ**: `countdown`
- **URL**: `tcu-setagayafes97-web.vercel.app`
- **デプロイトリガー**: `countdown`ブランチへのpush時に自動デプロイ
- **備考**: 現在はカウントダウンページを本番公開中

### Preview（委員会共有用）

#### dev（通常版の開発進捗）

- **ブランチ**: `dev`
- **Preview URL**: `tcu-setagayafes97-web-git-dev-mnprz.vercel.app`
- **デプロイトリガー**: `dev`ブランチへのpush時に自動でPreviewデプロイが更新
- **用途**: 通常版（フル機能版）の開発進捗確認・委員会共有

#### countdown（カウントダウンの開発進捗）

- **ブランチ**: `countdown`
- **Preview URL**: `tcu-setagayafes97-web-git-countdown-mnprz.vercel.app`
- **デプロイトリガー**: `countdown`ブランチへのpush時に自動更新
- **注意**: 現在`countdown`はProductionブランチでもあるため、pushすると本番にも同時に反映されます

## 本番環境の切り替え手順

カウントダウン期間終了後、通常版（`dev`ブランチ）に本番を切り替える手順：

1. Vercel Dashboardにアクセス
2. プロジェクト設定を開く
3. **Settings** → **Environments** → **Production** に移動
4. **Branch Tracking** を `countdown` → `dev` に変更
5. 保存後、`dev`ブランチへのpushが本番デプロイとして反映されるようになります

## Deploy Hook

手動でデプロイをトリガーしたい場合に使用できるDeploy Hookが設定されています。

- **名称**: `dev-deploy`
- **対象ブランチ**: `dev`
- **用途**: 手動でdevブランチのデプロイをトリガー

## デプロイフロー

```
┌─────────────┐
│   本番環境   │
│  (Production)│
├─────────────┤
│ countdown   │ ← 現在の本番ブランチ
│ ブランチ     │
└─────────────┘
       ↓
  [push時に自動デプロイ]
       ↓
tcu-setagayafes97-web.vercel.app

┌─────────────┐
│ Preview環境  │
│   (dev)     │
├─────────────┤
│ dev ブランチ │ ← 通常版の開発進捗
└─────────────┘
       ↓
  [push時に自動デプロイ]
       ↓
tcu-setagayafes97-web-git-dev-mnprz.vercel.app

┌─────────────┐
│ Preview環境  │
│ (countdown) │
├─────────────┤
│countdown    │ ← カウントダウンの開発進捗
│ ブランチ     │    ※本番にも反映される
└─────────────┘
       ↓
  [push時に自動デプロイ]
       ↓
tcu-setagayafes97-web-git-countdown-mnprz.vercel.app
```

## 運用上の注意点

1. **countdownブランチの二重デプロイ**
   - 現在`countdown`は本番ブランチとPreviewブランチの両方として機能しています
   - `countdown`へのpushは本番環境とPreview環境の両方に反映されます

2. **本番切り替えのタイミング**
   - カウントダウン期間終了後、またはイベント開始時に`dev`ブランチへの切り替えを推奨
   - 切り替え前に`dev`ブランチの動作確認をPreview URLで実施

3. **緊急時のロールバック**
   - Vercel Dashboard の Deployments タブから以前のデプロイに簡単にロールバック可能
   - 本番ブランチを元に戻したい場合も同様の手順で対応できます

## 関連ドキュメント

- [git.md](./git.md) - ブランチ戦略とCI/CDワークフロー
- [require.md](../requires/require.md) - プロジェクト要件定義書

---

**最終更新日**: 2026-02-14
