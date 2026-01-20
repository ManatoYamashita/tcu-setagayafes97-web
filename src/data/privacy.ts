/**
 * プライバシーポリシー
 */
export const privacyPolicyConfig = {
  // 基本情報
  info: {
    organizationName: "東京都市大学 世田谷祭実行委員会",
    updateDate: "2026年2月1日",
  },

  // 個人情報の利用目的
  purposes: [
    "お問い合わせへの対応",
    "イベント参加申し込みの受付・管理",
    "各種お知らせの配信",
    "統計データの作成（個人を特定できない形式で集計）",
  ],

  // 収集する情報
  collectedInfo: ["お名前", "メールアドレス", "お問い合わせ内容", "閲覧履歴（アクセス解析のため）"],

  // セキュリティ
  security: {
    description:
      "お預かりした個人情報は、適切な管理体制のもとで厳重に管理し、不正アクセス、紛失、破壊、改ざん、漏洩などを防止するために必要な措置を講じます。",
  },

  // 第三者提供
  thirdParty: {
    policy: "原則として第三者への提供は行いません。",
    exceptions: [
      "ご本人の同意がある場合",
      "法令に基づく場合",
      "人の生命、身体または財産の保護のために必要がある場合",
    ],
  },

  // Cookie・アクセス解析
  cookies: {
    description:
      "当サイトでは、サービスの向上を目的として、Google Analyticsを使用してアクセス解析を行っています。",
    analytics: "Google Analytics",
    optOut: "Google Analyticsのオプトアウトは、以下のページから設定できます。",
    optOutUrl: "https://tools.google.com/dlpage/gaoptout",
  },

  // お問い合わせ窓口
  contact: {
    method: "お問い合わせフォーム",
    url: "/about/contact",
    description:
      "個人情報の取り扱いに関するご質問・ご相談は、お問い合わせフォームからご連絡ください。",
  },

  // 免責事項
  disclaimer: [
    "当サイトのコンテンツは、予告なく内容を変更・削除する場合がございます。",
    "当サイトに掲載された情報の正確性については万全を期しておりますが、利用者が当サイトの情報を用いて行う一切の行為について、当委員会は一切の責任を負いません。",
    "当サイトからリンクやバナーなどによって他のサイトに移動した場合、移動先サイトで提供される情報、サービス等について一切の責任を負いません。",
  ],

  // 著作権
  copyright: {
    holder: "東京都市大学 世田谷祭実行委員会",
    year: 2026,
    description:
      "当サイトに掲載されている全てのコンテンツ（文章、画像、動画等）の著作権は、東京都市大学 世田谷祭実行委員会に帰属します。無断転載・複製を禁止します。",
  },
} as const;

/**
 * プライバシーポリシーの型定義
 */
export type PrivacyPolicyConfig = typeof privacyPolicyConfig;
