import type { Locale } from "@/i18n/routing";

/**
 * プライバシーポリシー
 *
 * 文言は `Record<Locale, PrivacyPolicyContent>` で4言語を持つ（`about.ts` / `access.ts` と同じ形）。
 * ロケールによらない値（URL・年）は `privacyPolicyShared` に分けてある。
 *
 * > [!IMPORTANT]
 * > **法的文書なので、en / zh / ko は日本語版の逐語訳であって別内容ではない。**
 * > 日本語版を直したら4言語を同じコミットで直すこと。
 * > `thirdParty.externalServices` は、実際に外部へ送信しているものを具体的に書く欄で、
 * > 送信先を増やしたら4言語すべてへ足す。企画検索の第4段は来場者が入力した文字列を
 * > 米国の TypeSafe, Inc. へ送信しており、ゼロデータ保持（ZDR）はエンタープライズ契約でのみ
 * > 提供されるため、送信内容は保持される。
 */

/** ロケールによらない値 */
export const privacyPolicyShared = {
  /** 最終更新日（ISO 形式。表示はロケール別に整形する） */
  updateDate: "2026-02-01",
  contactUrl: "/info/contact",
  optOutUrl: "https://tools.google.com/dlpage/gaoptout",
  copyrightYear: 2026,
} as const;

export interface PrivacyPolicyContent {
  organizationName: string;
  /** 基本方針の導入文。`{organization}` は `organizationName` へ置き換えて表示する */
  intro: string;
  /** 利用目的 */
  purposesLead: string;
  purposes: readonly string[];
  /** 収集する情報 */
  collectedInfoLead: string;
  collectedInfo: readonly string[];
  securityDescription: string;
  thirdParty: {
    policy: string;
    exceptions: readonly string[];
    externalServices: readonly { purpose: string; provider: string; sent: string }[];
  };
  cookies: {
    description: string;
    analytics: string;
    optOut: string;
  };
  contactDescription: string;
  disclaimer: readonly string[];
  copyrightDescription: string;
  /** 著作権表記の保持者名 */
  copyrightHolder: string;
}

export const privacyPolicyContents = {
  ja: {
    organizationName: "東京都市大学 世田谷祭実行委員会",
    intro:
      "{organization}（以下「当委員会」）は、お客様の個人情報保護の重要性について認識し、個人情報の保護に関する法律（個人情報保護法）を遵守すると共に、以下のプライバシーポリシーに従って、個人情報を適切に取り扱います。",
    purposesLead: "当委員会は、お客様からお預かりした個人情報を以下の目的で利用いたします。",
    purposes: [
      "お問い合わせへの対応",
      "イベント参加申し込みの受付・管理",
      "各種お知らせの配信",
      "統計データの作成（個人を特定できない形式で集計）",
    ],
    collectedInfoLead: "当サイトでは、以下の情報を収集する場合があります。",
    collectedInfo: [
      "お名前",
      "メールアドレス",
      "お問い合わせ内容",
      "閲覧履歴（アクセス解析のため）",
    ],
    securityDescription:
      "お預かりした個人情報は、適切な管理体制のもとで厳重に管理し、不正アクセス、紛失、破壊、改ざん、漏洩などを防止するために必要な措置を講じます。",
    thirdParty: {
      policy: "原則として第三者への提供は行いません。",
      exceptions: [
        "ご本人の同意がある場合",
        "法令に基づく場合",
        "人の生命、身体または財産の保護のために必要がある場合",
      ],
      externalServices: [
        {
          purpose: "企画検索（キーワードに近い内容の企画を探す機能）",
          provider: "TypeSafe, Inc.（米国）",
          sent: "検索欄に入力されたキーワードのみ。お名前・連絡先などの個人情報は含みません。",
        },
      ],
    },
    cookies: {
      description:
        "当サイトでは、サービスの向上を目的として、Google Analyticsを使用してアクセス解析を行っています。",
      analytics: "Google Analytics",
      optOut: "Google Analyticsのオプトアウトは、以下のページから設定できます。",
    },
    contactDescription:
      "個人情報の取り扱いに関するご質問・ご相談は、お問い合わせフォームからご連絡ください。",
    disclaimer: [
      "当サイトのコンテンツは、予告なく内容を変更・削除する場合がございます。",
      "当サイトに掲載された情報の正確性については万全を期しておりますが、利用者が当サイトの情報を用いて行う一切の行為について、当委員会は一切の責任を負いません。",
      "当サイトからリンクやバナーなどによって他のサイトに移動した場合、移動先サイトで提供される情報、サービス等について一切の責任を負いません。",
    ],
    copyrightDescription:
      "当サイトに掲載されている全てのコンテンツ（文章、画像、動画等）の著作権は、東京都市大学 世田谷祭実行委員会に帰属します。無断転載・複製を禁止します。",
    copyrightHolder: "東京都市大学 世田谷祭実行委員会",
  },

  en: {
    organizationName: "Tokyo City University Setagaya Festival Executive Committee",
    intro:
      '{organization} (hereinafter "the Committee") recognizes the importance of protecting your personal information. We comply with the Act on the Protection of Personal Information and handle personal information appropriately in accordance with this Privacy Policy.',
    purposesLead:
      "The Committee uses the personal information you provide for the following purposes.",
    purposes: [
      "Responding to inquiries",
      "Accepting and managing event participation applications",
      "Sending various announcements",
      "Compiling statistical data (aggregated in a form that does not identify individuals)",
    ],
    collectedInfoLead: "This website may collect the following information.",
    collectedInfo: [
      "Name",
      "Email address",
      "Content of inquiries",
      "Browsing history (for access analysis)",
    ],
    securityDescription:
      "We manage the personal information entrusted to us strictly under an appropriate management system, and take the necessary measures to prevent unauthorized access, loss, destruction, falsification, and leakage.",
    thirdParty: {
      policy: "In principle, we do not provide personal information to third parties.",
      exceptions: [
        "When you have given your consent",
        "When required by law",
        "When necessary to protect a person's life, body, or property",
      ],
      externalServices: [
        {
          purpose: "Event search (a feature that finds events related to your keywords)",
          provider: "TypeSafe, Inc. (United States)",
          sent: "Only the keywords entered in the search box. Personal information such as your name and contact details is not included.",
        },
      ],
    },
    cookies: {
      description:
        "To improve our services, this website uses Google Analytics for access analysis.",
      analytics: "Google Analytics",
      optOut: "You can opt out of Google Analytics from the following page.",
    },
    contactDescription:
      "For questions or concerns about the handling of personal information, please contact us through the contact form.",
    disclaimer: [
      "The content of this website may be changed or deleted without prior notice.",
      "We make every effort to ensure the accuracy of the information on this website, but the Committee accepts no responsibility whatsoever for any action taken by users based on this information.",
      "The Committee accepts no responsibility whatsoever for the information, services, and so on provided by other websites that you reach through links or banners on this website.",
    ],
    copyrightDescription:
      "The copyright of all content on this website (text, images, videos, etc.) belongs to the Tokyo City University Setagaya Festival Executive Committee. Unauthorized reproduction is prohibited.",
    copyrightHolder: "Tokyo City University Setagaya Festival Executive Committee",
  },

  zh: {
    organizationName: "东京都市大学 世田谷祭执行委员会",
    intro:
      "{organization}（以下简称“本委员会”）深知保护个人信息的重要性，将遵守《个人信息保护法》，并按照以下隐私政策妥善处理个人信息。",
    purposesLead: "本委员会将为以下目的使用您提供的个人信息。",
    purposes: [
      "回复咨询",
      "受理和管理活动参与申请",
      "发送各类通知",
      "制作统计数据（以无法识别个人的形式汇总）",
    ],
    collectedInfoLead: "本网站可能收集以下信息。",
    collectedInfo: ["姓名", "电子邮件地址", "咨询内容", "浏览记录（用于访问分析）"],
    securityDescription:
      "对于您提供的个人信息，我们将在适当的管理体制下严格管理，并采取必要措施，防止未经授权的访问、丢失、破坏、篡改及泄露。",
    thirdParty: {
      policy: "原则上，我们不会向第三方提供个人信息。",
      exceptions: [
        "经本人同意的情况",
        "依据法律法规的情况",
        "为保护他人生命、身体或财产所必需的情况",
      ],
      externalServices: [
        {
          purpose: "企划搜索（查找与关键词相近的企划的功能）",
          provider: "TypeSafe, Inc.（美国）",
          sent: "仅限在搜索栏中输入的关键词。不包含姓名、联系方式等个人信息。",
        },
      ],
    },
    cookies: {
      description: "为改善服务，本网站使用 Google Analytics 进行访问分析。",
      analytics: "Google Analytics",
      optOut: "您可以通过以下页面设置退出 Google Analytics。",
    },
    contactDescription: "如对个人信息的处理有任何疑问或咨询，请通过联系表单与我们联系。",
    disclaimer: [
      "本网站的内容可能在不另行通知的情况下变更或删除。",
      "我们已尽力确保本网站所载信息的准确性，但对于用户利用本网站信息所采取的一切行为，本委员会概不负责。",
      "通过本网站的链接或横幅跳转至其他网站时，对于跳转目标网站提供的信息、服务等，本委员会概不负责。",
    ],
    copyrightDescription:
      "本网站所载全部内容（文字、图片、视频等）的著作权均归东京都市大学 世田谷祭执行委员会所有。禁止未经许可的转载和复制。",
    copyrightHolder: "东京都市大学 世田谷祭执行委员会",
  },

  ko: {
    organizationName: "도쿄도시대학 세타가야제 실행위원회",
    intro:
      "{organization}(이하 '본 위원회')는 고객님의 개인정보 보호의 중요성을 인식하고, 개인정보 보호에 관한 법률(개인정보보호법)을 준수하며, 아래의 개인정보 처리방침에 따라 개인정보를 적절하게 취급합니다.",
    purposesLead: "본 위원회는 고객님께서 제공하신 개인정보를 다음의 목적으로 이용합니다.",
    purposes: [
      "문의에 대한 대응",
      "이벤트 참가 신청의 접수·관리",
      "각종 안내 발송",
      "통계 데이터 작성 (개인을 식별할 수 없는 형태로 집계)",
    ],
    collectedInfoLead: "본 사이트에서는 다음의 정보를 수집할 수 있습니다.",
    collectedInfo: ["성함", "이메일 주소", "문의 내용", "열람 이력 (접속 분석을 위해)"],
    securityDescription:
      "제공받은 개인정보는 적절한 관리 체제 아래 엄중히 관리하며, 부정 접속, 분실, 파괴, 위조, 유출 등을 방지하기 위해 필요한 조치를 취합니다.",
    thirdParty: {
      policy: "원칙적으로 제3자에게 개인정보를 제공하지 않습니다.",
      exceptions: [
        "본인의 동의가 있는 경우",
        "법령에 근거한 경우",
        "사람의 생명, 신체 또는 재산의 보호를 위해 필요한 경우",
      ],
      externalServices: [
        {
          purpose: "기획 검색 (키워드와 가까운 내용의 기획을 찾는 기능)",
          provider: "TypeSafe, Inc. (미국)",
          sent: "검색창에 입력된 키워드만 해당됩니다. 성함·연락처 등의 개인정보는 포함되지 않습니다.",
        },
      ],
    },
    cookies: {
      description:
        "본 사이트에서는 서비스 향상을 목적으로 Google Analytics를 사용하여 접속 분석을 하고 있습니다.",
      analytics: "Google Analytics",
      optOut: "Google Analytics의 수집 거부(옵트아웃)는 아래 페이지에서 설정할 수 있습니다.",
    },
    contactDescription: "개인정보 취급에 관한 질문·상담은 문의 양식을 통해 연락해 주시기 바랍니다.",
    disclaimer: [
      "본 사이트의 콘텐츠는 예고 없이 내용이 변경·삭제될 수 있습니다.",
      "본 사이트에 게재된 정보의 정확성에는 만전을 기하고 있으나, 이용자가 본 사이트의 정보를 이용하여 행하는 모든 행위에 대해 본 위원회는 일절 책임을 지지 않습니다.",
      "본 사이트의 링크나 배너 등을 통해 다른 사이트로 이동한 경우, 이동한 사이트에서 제공되는 정보, 서비스 등에 대해 일절 책임을 지지 않습니다.",
    ],
    copyrightDescription:
      "본 사이트에 게재된 모든 콘텐츠(문장, 이미지, 동영상 등)의 저작권은 도쿄도시대학 세타가야제 실행위원회에 귀속됩니다. 무단 전재 및 복제를 금지합니다.",
    copyrightHolder: "도쿄도시대학 세타가야제 실행위원회",
  },
} as const satisfies Record<Locale, PrivacyPolicyContent>;

/** 未対応のロケールが渡された場合は日本語へフォールバックする */
export function resolvePrivacyPolicy(locale: Locale): PrivacyPolicyContent {
  return privacyPolicyContents[locale] ?? privacyPolicyContents.ja;
}
