/**
 * About（委員会について）情報
 */
export const aboutConfig = {
  // Aboutページ ヒーロー（ミニマルデザイン）
  hero: {
    title: "第97回世田谷祭実行委員会",
    description: "東京都市大学",
    scrollIndicator: "( scroll down )",
  },

  // トップページ用Aboutセクション
  topSection: {
    label: "東京都市大学 第97回 世田谷祭",
    heading: "カラクリ",
    tagline: "2026年10月31日(土)〜11月1日(日)",
    paragraphs: [
      "第97回東京都市大学世田谷祭のキャンパステーマは『カラクリ』です。",
      "このテーマには、精緻な仕掛けが連鎖して大きな動きを生み出す「カラクリ細工」のように、一人ひとりの個性や想いが結びつき、世田谷祭という大きな舞台を創り上げていくという意味が込められています。",
      "一つでも欠けてしまっては成立しないカラクリのように、参加団体、ご来場者、そして歴史をつないできた先達の皆様など、学園祭に関わるすべての存在が欠かせない要素です。",
      "多くの人の力が重なり合い、知的好奇心と前向きなエネルギーが共鳴する特別な空間となることを願っています。",
    ],
    cta: { label: "委員会について", href: "/about" },
    image: { src: "/images/photos/setagayafe97-image.webp", alt: "世田谷祭の様子" },
  },

  // 共通テーマの解説 + 委員長挨拶（同一セクション内の2ブロック構成）
  chairpersonMessage: {
    // テーマブロック（themeLabel + heading + briefDescription）
    themeLabel: "THEME",
    heading: "期待を超える瞬間へ、\nともに進もう",
    briefDescription:
      "東京都市大学学園祭共通テーマには、これまで両キャンパスが積み上げてきた歴史や伝統を大切に受け継ぎながら、さらにその先へ挑戦し続けるという想いが込められています。\n「期待を超える瞬間へ」には、来場者の想像を超える感動や体験を届けるため、現状に満足することなく学園祭の可能性を追求し続けるという決意があります。これまでの成功にとどまることなく、新たな挑戦を重ねることで、学園祭だからこそ生み出せる特別な瞬間を目指します。\nまた、「ともに進もう」には、キャンパスや立場を越えて協力し合い、多くの人とのつながりを広げながら、学園祭を創り上げていくという意味があります。学生同士はもちろん、地域の皆様やご来場いただく方々とともに、誰にとっても心に残る学園祭を築いていきます。\n関わるすべての人にとって特別な瞬間となるように。東京都市大学の結束と熱量を体現する学園祭を目指します。",
    // 挨拶ブロック（messageLabel + messageHeading + 署名 + message）
    messageLabel: "MESSAGE",
    messageHeading: "委員長挨拶",
    name: "髙野雄司",
    position: "第97回東京都市大学世田谷祭実行委員会 実行委員長",
    image: "/images/photos/setagayafe97-image.webp",
    subImage: "/images/photos/setagayafes97-leader.webp",
    imageAlt: "世田谷祭の様子",
    message: `
第97回東京都市大学世田谷祭にご来場いただき、誠にありがとうございます。実行委員一同、皆様をこの世田谷キャンパスでお迎えできる今日という日を、心待ちにしておりました。

今年度の世田谷祭のテーマは「カラクリ」です。 多様な個性が緻密に組み合わさり、一つの大きなものを動かしていく、そんな美しさと調和を表現したいという想いを込めています。

今年度は有り難いことに参加団体や模擬店の数が増加し、世田谷キャンパス全体を舞台としてお楽しみいただけるよう、キャンパスの隅々まで多彩な装飾を施しました。活気あふれるステージから各所の個性豊かな模擬店まで、一つひとつの企画がまるで「カラクリ」の精緻な仕掛けのように学内の至る所で連鎖し、心地よく響き合っています。この日のために学生たちが情熱を注いで準備した、創意工夫に満ちた企画の数々をぜひ肌で感じてください。

また、本学園祭の開催にあたり、日頃より温かいご理解をいただいている地域の皆様、多大なるご支援を賜りました協賛企業の皆様、そして開催を支えてくださった大学関係者の皆様に、この場をお借りして厚く御礼申し上げます。

すべての想いが「カラクリ」のように動き出す今日という日が、皆様にとって驚きと感動に満ちた、忘れられない一日となりますように。 どうぞ最後まで、第97回世田谷祭を存分にお楽しみください。
    `.trim(),
  },

  // 理念・ビジョン
  vision: {
    theme: "期待を超える瞬間へ、ともに進もう",
    description:
      "東京都市大学学園祭共通テーマには、これまで両キャンパスが積み上げてきた歴史や伝統を大切に受け継ぎながら、さらにその先へ挑戦し続けるという想いが込められています。\n「期待を超える瞬間へ」には、来場者の想像を超える感動や体験を届けるため、現状に満足することなく学園祭の可能性を追求し続けるという決意があります。これまでの成功にとどまることなく、新たな挑戦を重ねることで、学園祭だからこそ生み出せる特別な瞬間を目指します。\nまた、「ともに進もう」には、キャンパスや立場を越えて協力し合い、多くの人とのつながりを広げながら、学園祭を創り上げていくという意味があります。学生同士はもちろん、地域の皆様やご来場いただく方々とともに、誰にとっても心に残る学園祭を築いていきます。\n関わるすべての人にとって特別な瞬間となるように。東京都市大学の結束と熱量を体現する学園祭を目指します。",
    values: [
      {
        title: "学生主体",
        description: "学生一人ひとりが主役となり、自主性と創造性を発揮できる場を提供します。",
        icon: "👨‍🎓",
      },
      {
        title: "地域連携",
        description: "地域の皆様と共に、地域社会に貢献する学園祭を実現します。",
        icon: "🤝",
      },
      {
        title: "多様性",
        description:
          "多様な価値観・文化・アイデアを尊重し、すべての人が楽しめるイベントを創造します。",
        icon: "🌈",
      },
      {
        title: "持続可能性",
        description: "環境に配慮し、次世代につながる持続可能な学園祭を目指します。",
        icon: "🌱",
      },
    ],
  },

  // 実行委員会について
  committee: {
    name: "東京都市大学 世田谷祭実行委員会",
    establishedYear: 1929, // 第1回開催年（仮）
    memberCount: 150, // 実行委員数（仮）
    description:
      "世田谷祭実行委員会は、東京都市大学の学生によって組織され、学園祭の企画・運営を行う団体です。毎年10月末〜11月初旬に開催される世田谷祭を通じて、学生の自主性・創造性を育み、地域社会との交流を深めることを目的としています。",
    departments: [
      "総務局",
      "渉外局",
      "企画局",
      "広報局",
      "制作局",
      "会場局",
      "ステージ局",
      "システム局",
    ],
  },

  // SNSリンク
  social: [
    {
      name: "X (Twitter)",
      url: "https://x.com/setagayafes_tcu?s=11",
      icon: "twitter",
    },
    {
      name: "Instagram",
      url: "https://www.instagram.com/setagayafes_sfa?igsh=bWpzYWpqOGozZ3Nr&utm_source=qr",
      icon: "instagram",
    },
    {
      name: "YouTube",
      url: "https://youtube.com/@setagayafes?si=WvB8ya5RrqvHg0Vj",
      icon: "youtube",
    },
  ],

  // 開催概要
  overview: {
    items: [
      { label: "名称", value: "第97回東京都市大学世田谷祭" },
      {
        label: "共通テーマ\nキャンパステーマ",
        value: "「期待を超える瞬間へ、ともに進もう」\n「カラクリ」",
      },
      {
        label: "日時",
        value: "2026年10月31日(土)\n2026年11月1日(日)",
      },
      {
        label: "場所",
        value: "東京都市大学 世田谷キャンパス\n〒158-8557 東京都世田谷区玉堤1丁目28-1",
      },
      {
        label: "主催・後援",
        value:
          "主催：東京都市大学 学園祭運営委員会、第97回東京都市大学世田谷祭実行委員会\n後援：東京都市大学、東京都市大学 後援会",
      },
      {
        label: "公式SNS",
        value:
          "Website：setagayafes.org\nX (Twitter)：@setagayafes_tcu\nInstagram：@setagayafes_sfa",
      },
      {
        label: "問い合わせ先",
        value:
          "東京都市大学世田谷祭実行委員会\n〒158-8557 東京都世田谷区玉堤1丁目28-1\n東京都市大学世田谷祭実行委員会室\nTel：03-3703-8423（直通）\nE-mail：sfa@setagayafes.org",
      },
    ],
  },
} as const;

/**
 * About情報の型定義
 */
export type AboutConfig = typeof aboutConfig;

/**
 * 「世田谷祭とは」セクションの表示文言
 *
 * 開催日・会場・主催は `siteConfig` から描画側で組み立てる。ここにはラベルと
 * 本文だけを置き、事実の一次定義を二重に持たない。
 *
 * `accessPageContent` / `accessPageContents` と同じ `Record<Locale, Content>`
 * パターンで4言語を持つ。`/about` の既存セクション（AboutHero・
 * ChairpersonSection・EventOverviewTable）は4ロケールとも日本語本文を配信して
 * おり、hreflang だけが相互宣言されている状態にある（2026-09-03 実測）。
 * 新設分で同じ状態を増やさないため、最初から翻訳を持たせる。
 */
export interface FestivalIntroContent {
  label: string;
  heading: string;
  /** 定義文。検索結果のスニペットに抜かれることを想定した1文で書く */
  lead: string;
  paragraphs: readonly string[];
  factsHeading: string;
  factLabels: {
    name: string;
    date: string;
    venue: string;
    admission: string;
    organizer: string;
  };
  admissionValue: string;
  /**
   * 固有名詞のロケール別表記
   *
   * `siteConfig` は日本語のみを持つ。省略したロケールは `siteConfig` の値を
   * そのまま使う（＝日本語ロケールでは書かない）。
   */
  festivalName?: string;
  venueName?: string;
  venueAddress?: string;
  organizerName?: string;
  committeeHeading: string;
  committeeParagraphs: readonly string[];
  departmentsLabel: string;
  departments: readonly string[];
  linksHeading: string;
  links: readonly { label: string; href: string }[];
}

export const festivalIntroContent = {
  label: "About the Festival",
  heading: "世田谷祭とは",
  lead: "世田谷祭（せたがやさい）は、東京都市大学 世田谷キャンパスで毎年秋に開催される学園祭です。",
  paragraphs: [
    // TODO(委員会確認): 「1929年に創立された武蔵高等工科学校の時代から続く」は
    // 第96回サイトの掲載文をそのまま引き継いだ表現。1929年は学校の創立年であって
    // 第1回の開催年ではないため、第1回開催年を書き足す場合は必ず事実確認すること。
    "1929年に創立された武蔵高等工科学校の時代から続く伝統ある学園祭で、今回で第97回を迎えます。",
    "学生団体による教室企画や模擬店、体育館・講堂ホールでのステージ企画、著名人をお招きするスペシャル企画まで、キャンパス全体が会場になります。在学生や卒業生はもちろん、地域の皆様、ご家族連れ、受験生の方まで、どなたでもご来場いただけます。",
  ],
  factsHeading: "開催情報",
  factLabels: {
    name: "名称",
    date: "会期",
    venue: "会場",
    admission: "入場料",
    organizer: "主催",
  },
  admissionValue: "無料",
  committeeHeading: "世田谷祭実行委員会とは",
  committeeParagraphs: [
    "世田谷祭実行委員会は、東京都市大学の学生によって組織され、世田谷祭の企画・運営を行う団体です。学生の自主性と創造性を育み、地域社会との交流を深めることを目的に、1年をかけて準備を進めています。",
  ],
  departmentsLabel: "組織構成",
  departments: aboutConfig.committee.departments,
  linksHeading: "関連ページ",
  links: [
    { label: "会場とアクセス", href: "/access" },
    { label: "ご来場の方へ", href: "/info/guide" },
    { label: "よくある質問", href: "/info/faq" },
  ],
} as const satisfies FestivalIntroContent;

export const festivalIntroContents = {
  ja: festivalIntroContent,
  en: {
    label: "About the Festival",
    heading: "What is Setagaya Festival?",
    lead: "Setagaya Festival (Setagaya-sai) is the annual autumn campus festival held at Tokyo City University Setagaya Campus.",
    paragraphs: [
      "It is a long-standing festival whose roots go back to Musashi High School of Technology, founded in 1929. This year marks the 97th edition.",
      "Classroom projects and food stalls run by student groups, stage programmes in the gymnasium and the auditorium hall, and a special programme with an invited guest artist take place across the whole campus. Students, alumni, local residents, families and prospective students are all welcome.",
    ],
    factsHeading: "Event information",
    factLabels: {
      name: "Name",
      date: "Dates",
      venue: "Venue",
      admission: "Admission",
      organizer: "Organizer",
    },
    admissionValue: "Free",
    festivalName: "The 97th Setagaya Festival, Tokyo City University",
    venueName: "Tokyo City University Setagaya Campus",
    venueAddress: "1-28-1 Tamatsutsumi, Setagaya-ku, Tokyo 158-8557, Japan",
    organizerName: "The 97th Tokyo City University Setagaya Festival Organizing Committee",
    committeeHeading: "About the organizing committee",
    committeeParagraphs: [
      "The Setagaya Festival Organizing Committee is a student body of Tokyo City University that plans and runs the festival. It prepares throughout the year with the aim of fostering student initiative and creativity while deepening ties with the local community.",
    ],
    departmentsLabel: "Departments",
    departments: [
      "General Affairs",
      "External Relations",
      "Programme Planning",
      "Public Relations",
      "Production",
      "Venue",
      "Stage",
      "Systems",
    ],
    linksHeading: "Related pages",
    links: [
      { label: "Venue and access", href: "/access" },
      { label: "Visitor guide", href: "/info/guide" },
      { label: "FAQ", href: "/info/faq" },
    ],
  },
  zh: {
    label: "About the Festival",
    heading: "什么是世田谷祭",
    lead: "世田谷祭是东京都市大学世田谷校区每年秋季举办的校园文化节。",
    paragraphs: [
      "它承袭自1929年创立的武藏高等工科学校时代，是一项历史悠久的校园文化节，本届为第97届。",
      "从学生团体的教室企划与美食摊位，到体育馆和礼堂舞台的演出企划，再到邀请知名人士参与的特别企划，整个校区都是会场。无论是在校生、毕业生，还是当地居民、亲子家庭与考生，都欢迎前来参观。",
    ],
    factsHeading: "举办信息",
    factLabels: {
      name: "名称",
      date: "会期",
      venue: "会场",
      admission: "入场费",
      organizer: "主办",
    },
    admissionValue: "免费",
    festivalName: "东京都市大学 第97届 世田谷祭",
    venueName: "东京都市大学 世田谷校区",
    venueAddress: "〒158-8557 东京都世田谷区玉堤1-28-1",
    organizerName: "第97届东京都市大学世田谷祭执行委员会",
    committeeHeading: "关于世田谷祭执行委员会",
    committeeParagraphs: [
      "世田谷祭执行委员会由东京都市大学的学生组成，负责本文化节的策划与运营。以培养学生的自主性与创造力、加深与当地社会的交流为目标，用一整年的时间进行筹备。",
    ],
    departmentsLabel: "组织构成",
    departments: ["总务局", "涉外局", "企划局", "宣传局", "制作局", "会场局", "舞台局", "系统局"],
    linksHeading: "相关页面",
    links: [
      { label: "会场与交通", href: "/access" },
      { label: "参观指南", href: "/info/guide" },
      { label: "常见问题", href: "/info/faq" },
    ],
  },
  ko: {
    label: "About the Festival",
    heading: "세타가야사이란",
    lead: "세타가야사이는 도쿄도시대학 세타가야 캠퍼스에서 매년 가을에 열리는 대학 축제입니다.",
    paragraphs: [
      "1929년에 창립된 무사시고등공과학교 시절부터 이어져 온 전통 있는 축제로, 이번이 제97회입니다.",
      "학생 단체의 교실 기획과 먹거리 부스, 체육관과 강당 홀의 무대 기획, 유명인을 초청하는 스페셜 기획까지 캠퍼스 전체가 행사장이 됩니다. 재학생과 졸업생은 물론 지역 주민, 가족 단위 방문객, 수험생까지 누구나 방문하실 수 있습니다.",
    ],
    factsHeading: "개최 정보",
    factLabels: {
      name: "명칭",
      date: "회기",
      venue: "장소",
      admission: "입장료",
      organizer: "주최",
    },
    admissionValue: "무료",
    festivalName: "도쿄도시대학 제97회 세타가야사이",
    venueName: "도쿄도시대학 세타가야 캠퍼스",
    venueAddress: "〒158-8557 도쿄도 세타가야구 다마쓰쓰미 1-28-1",
    organizerName: "제97회 도쿄도시대학 세타가야사이 실행위원회",
    committeeHeading: "세타가야사이 실행위원회란",
    committeeParagraphs: [
      "세타가야사이 실행위원회는 도쿄도시대학 학생들로 구성되어 축제의 기획과 운영을 담당하는 단체입니다. 학생의 자주성과 창의성을 기르고 지역 사회와의 교류를 넓히는 것을 목표로 1년에 걸쳐 준비를 진행합니다.",
    ],
    departmentsLabel: "조직 구성",
    departments: [
      "총무국",
      "섭외국",
      "기획국",
      "홍보국",
      "제작국",
      "회장국",
      "스테이지국",
      "시스템국",
    ],
    linksHeading: "관련 페이지",
    links: [
      { label: "장소와 오시는 길", href: "/access" },
      { label: "방문객 안내", href: "/info/guide" },
      { label: "자주 묻는 질문", href: "/info/faq" },
    ],
  },
} as const satisfies Record<string, FestivalIntroContent>;
