import type { Locale } from "@/i18n/routing";

/**
 * About（委員会について）情報
 */
export const aboutConfig = {
  // Aboutページ ヒーロー（ミニマルデザイン）
  hero: {
    // 見出しは「第97回 / 東京都市大学 / 世田谷祭実行委員会」の3段で描く（AboutHero）
    university: "東京都市大学",
    scrollIndicator: "( scroll down )",
  },

  // トップページ用Aboutセクション
  topSection: {
    label: "第97回東京都市大学世田谷祭",
    heading: "カラクリ",
    tagline: "2026年10月31日(土)〜11月1日(日)",
    paragraphs: [
      "第97回東京都市大学世田谷祭のキャンパステーマは『カラクリ』です。",
      "このテーマには、精緻な仕掛けが連鎖して大きな動きを生み出す「からくり細工」のように、一人ひとりの個性や想いが結びつき、世田谷祭という大きな舞台を創り上げていくという意味が込められています。",
      "一つでも欠けてしまっては成立しないカラクリのように、参加団体、ご来場者、そして歴史をつないできた先達の皆様など、学園祭に関わるすべての存在が欠かせない要素です。",
      "多くの人の力が重なり合い、知的好奇心と前向きなエネルギーが共鳴する特別な空間となることを願っています。",
    ],
    cta: { label: "委員会について", href: "/about" },
    image: { src: "/images/photos/setagayafe97-image.avif", alt: "世田谷祭の様子" },
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
    image: "/images/photos/setagayafe97-image.avif",
    subImage: "/images/photos/setagayafes97-leader.avif",
    imageAlt: "世田谷祭の様子",
    message: `
第97回東京都市大学世田谷祭にご来場いただき、誠にありがとうございます。実行委員一同、皆様をこの世田谷キャンパスでお迎えできる今日という日を、心待ちにしておりました。

今年度の世田谷祭のテーマは「カラクリ」です。 多様な個性が緻密に組み合わさり、一つの大きなものを動かしていく、そんな美しさと調和を表現したいという想いを込めています。

今年度は有り難いことに参加団体や模擬店の数が増加し、世田谷キャンパス全体を舞台としてお楽しみいただけるよう、キャンパスの隅々まで多彩な装飾を施しました。活気あふれるステージから各所の個性豊かな模擬店まで、一つひとつの企画がまるで「カラクリ」の精緻な仕掛けのように学内の至る所で連鎖し、心地よく響き合っています。この日のために学生たちが情熱を注いで準備した、創意工夫に満ちた企画の数々をぜひ肌で感じてください。

また、本学園祭の開催にあたり、日頃より温かいご理解をいただいている地域の皆様、多大なるご支援を賜りました協賛企業の皆様、そして開催を支えてくださった大学関係者の皆様に、この場をお借りして厚く御礼申し上げます。

すべての想いが「カラクリ」のように動き出す今日という日が、皆様にとって驚きと感動に満ちた、忘れられない一日となりますように。 どうぞ最後まで、第97回東京都市大学世田谷祭を存分にお楽しみください。
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
    departments: ["広報部", "管理部", "企画部"],
  },

  // 委員会の写真コラージュ（CommitteePhotoCollage）。左・中央・右の3列×2枚。
  // 写真ごとの縦横比はそのまま見せる（集合写真を縦長に切ると人が切れるため）。
  // width / height は public/ の AVIF の実寸で、縦横比を決めるためだけに使う。
  // alt は言語ごとに `festivalIntroContents[*].collageAlts` が同じ並びで持つ
  committeeCollage: {
    columns: [
      [
        { src: "/images/committee/committee-kids-event.avif", width: 460, height: 613 },
        { src: "/images/committee/committee-sparklers.avif", width: 460, height: 307 },
      ],
      [
        { src: "/images/committee/committee-beach.avif", width: 680, height: 453 },
        { src: "/images/committee/committee-yakisoba.avif", width: 680, height: 907 },
      ],
      [
        { src: "/images/committee/committee-school-event.avif", width: 460, height: 345 },
        { src: "/images/committee/committee-meeting.avif", width: 460, height: 345 },
      ],
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
        value: "X (Twitter)：@setagayafes_tcu\nInstagram：@setagayafes_sfa\nYouTube：@setagayafes",
      },
      {
        label: "問い合わせ先",
        value: "Tel：03-3703-8423（直通）\nE-mail：sfa@setagayafes.org",
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
 * パターンで4言語を持つ。`/about` の残り3セクション（AboutHero・
 * ChairpersonSection・EventOverviewTable）の文言は `aboutPageContents` が持つ（#361）。
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
  /** 写真コラージュの名前（画面には出さず aria-label に使う） */
  collageLabel: string;
  /** 写真コラージュの alt。`aboutConfig.committeeCollage` の左列の上から順に6枚分 */
  collageAlts: readonly string[];
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
  collageLabel: "実行委員会の活動風景",
  collageAlts: [
    "地域のイベントで子どもたちにメダルを手渡す実行委員",
    "花火で「97」の文字を描く実行委員",
    "海辺で撮影した実行委員の集合写真",
    "湯気の立つ鉄板で焼きそばを焼く実行委員",
    "小学校の校庭で撮影した実行委員の集合写真",
    "教室に集まって会議をする実行委員",
  ],
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
    festivalName: "The 97th Tokyo City University Setagaya Festival",
    venueName: "Tokyo City University Setagaya Campus",
    venueAddress: "1-28-1 Tamatsutsumi, Setagaya-ku, Tokyo 158-8557, Japan",
    organizerName: "The 97th Tokyo City University Setagaya Festival Organizing Committee",
    committeeHeading: "About the organizing committee",
    committeeParagraphs: [
      "The Setagaya Festival Organizing Committee is a student body of Tokyo City University that plans and runs the festival. It prepares throughout the year with the aim of fostering student initiative and creativity while deepening ties with the local community.",
    ],
    departmentsLabel: "Departments",
    departments: ["Public Relations", "Administration", "Planning"],
    collageLabel: "The organizing committee at work",
    collageAlts: [
      "Committee members handing out medals to children at a local event",
      "Committee members drawing the number 97 with sparklers",
      "Group photo of the organizing committee on a beach",
      "Committee members cooking yakisoba on a steaming griddle",
      "Group photo of committee members in an elementary school playground",
      "Committee members gathered in a classroom for a meeting",
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
    festivalName: "第97届东京都市大学世田谷祭",
    venueName: "东京都市大学 世田谷校区",
    venueAddress: "〒158-8557 东京都世田谷区玉堤1-28-1",
    organizerName: "第97届东京都市大学世田谷祭执行委员会",
    committeeHeading: "关于世田谷祭执行委员会",
    committeeParagraphs: [
      "世田谷祭执行委员会由东京都市大学的学生组成，负责本文化节的策划与运营。以培养学生的自主性与创造力、加深与当地社会的交流为目标，用一整年的时间进行筹备。",
    ],
    departmentsLabel: "组织构成",
    departments: ["宣传部", "管理部", "企划部"],
    collageLabel: "执行委员会的活动风景",
    collageAlts: [
      "在社区活动中为孩子们颁发奖牌的执行委员",
      "用烟花写出“97”字样的执行委员",
      "在海边拍摄的执行委员会合影",
      "在冒着热气的铁板上炒面的执行委员",
      "在小学操场拍摄的执行委员合影",
      "聚集在教室里开会的执行委员",
    ],
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
    festivalName: "제97회 도쿄도시대학 세타가야사이",
    venueName: "도쿄도시대학 세타가야 캠퍼스",
    venueAddress: "〒158-8557 도쿄도 세타가야구 다마쓰쓰미 1-28-1",
    organizerName: "제97회 도쿄도시대학 세타가야사이 실행위원회",
    committeeHeading: "세타가야사이 실행위원회란",
    committeeParagraphs: [
      "세타가야사이 실행위원회는 도쿄도시대학 학생들로 구성되어 축제의 기획과 운영을 담당하는 단체입니다. 학생의 자주성과 창의성을 기르고 지역 사회와의 교류를 넓히는 것을 목표로 1년에 걸쳐 준비를 진행합니다.",
    ],
    departmentsLabel: "조직 구성",
    departments: ["홍보부", "관리부", "기획부"],
    collageLabel: "실행위원회의 활동 풍경",
    collageAlts: [
      "지역 행사에서 아이들에게 메달을 건네는 실행위원",
      "불꽃으로 숫자 97을 그리는 실행위원",
      "바닷가에서 찍은 실행위원회 단체 사진",
      "김이 오르는 철판에서 야키소바를 굽는 실행위원",
      "초등학교 운동장에서 찍은 실행위원 단체 사진",
      "교실에 모여 회의하는 실행위원",
    ],
    linksHeading: "관련 페이지",
    links: [
      { label: "장소와 오시는 길", href: "/access" },
      { label: "방문객 안내", href: "/info/guide" },
      { label: "자주 묻는 질문", href: "/info/faq" },
    ],
  },
} as const satisfies Record<string, FestivalIntroContent>;

/**
 * `/about` のヒーロー・共通テーマと委員長挨拶・開催概要の表示文言（#361）
 *
 * `festivalIntroContents` と同じ `Record<Locale, Content>` パターンで4言語を持つ。
 * ja は `aboutConfig` の値をそのまま参照し、一次定義を二重に持たない。
 * 画像パスなど言語に依存しない値は `aboutConfig.chairpersonMessage` に残す。
 *
 * TODO(委員会確認): en / zh / ko は機械翻訳相当のドラフトで、委員会・留学生の確認前。
 * 要確認項目は Issue #361 の末尾を参照（委員長氏名の読み、「カラクリ」の扱い、
 * 組織名の公式訳、ko 標語の語尾、繁体字の要否、改行位置）。
 */
export interface AboutPageContent {
  hero: {
    /** 「第」「The 」など、序数の数字の前に置く語。空白が要るなら末尾に含める */
    ordinalPrefix: string;
    /** 「回」「th」など、序数の数字の後ろに置く語 */
    ordinalSuffix: string;
    /** 数字と接尾辞の間に余白を置くか（CJK は true、「97th」は false） */
    ordinalSuffixGap: boolean;
    university: string;
    committee: string;
    scrollIndicator: string;
  };
  theme: {
    label: string;
    /** `\n` で改行する */
    heading: string;
    /** `\n` で段落を分ける */
    description: string;
  };
  message: {
    label: string;
    heading: string;
    name: string;
    position: string;
    imageAlt: string;
    /** 空行で段落を分ける */
    body: string;
  };
  overview: {
    heading: string;
    items: readonly { label: string; value: string }[];
  };
}

const { chairpersonMessage, overview: jaOverview, hero: jaHero } = aboutConfig;

export const aboutPageContents = {
  ja: {
    hero: {
      ordinalPrefix: "第",
      ordinalSuffix: "回",
      ordinalSuffixGap: true,
      university: jaHero.university,
      committee: "世田谷祭実行委員会",
      scrollIndicator: jaHero.scrollIndicator,
    },
    theme: {
      label: chairpersonMessage.themeLabel,
      heading: chairpersonMessage.heading,
      description: chairpersonMessage.briefDescription,
    },
    message: {
      label: chairpersonMessage.messageLabel,
      heading: chairpersonMessage.messageHeading,
      name: chairpersonMessage.name,
      position: chairpersonMessage.position,
      imageAlt: chairpersonMessage.imageAlt,
      body: chairpersonMessage.message,
    },
    overview: { heading: "開催概要", items: jaOverview.items },
  },
  en: {
    hero: {
      ordinalPrefix: "The ",
      ordinalSuffix: "th",
      ordinalSuffixGap: false,
      university: "Tokyo City University",
      committee: "Setagaya Festival Organizing Committee",
      scrollIndicator: "( scroll down )",
    },
    theme: {
      label: "THEME",
      heading: "Toward Moments That Exceed Expectations,\nLet's Move Forward Together",
      description:
        'The shared theme of the Tokyo City University festivals carries the spirit of cherishing the history and traditions that both campuses have built up, while continuing to take on new challenges beyond them.\n"Toward Moments That Exceed Expectations" expresses our determination to keep pursuing the festival\'s potential without settling for the present, so that we can deliver experiences that go beyond what visitors imagine. Rather than resting on past successes, we take on new challenges to create moments that only a festival can produce.\n"Let\'s Move Forward Together" means building the festival by cooperating across campuses and roles, widening our connections with many people. Together with fellow students, local residents and everyone who visits, we will create a festival that stays in everyone\'s heart.\nMay it be a special moment for everyone involved. We aim for a festival that embodies the unity and energy of Tokyo City University.',
    },
    message: {
      label: "MESSAGE",
      heading: "Message from the Chairperson",
      // TODO(委員会確認): 氏名の読み・ローマ字表記が確定するまで漢字のまま出す
      name: chairpersonMessage.name,
      position:
        "Chairperson, The 97th Tokyo City University Setagaya Festival Organizing Committee",
      imageAlt: "Scenes from the Setagaya Festival",
      body: `
Thank you very much for visiting the 97th Tokyo City University Setagaya Festival. All of us on the organizing committee have been looking forward to today, when we can welcome you to the Setagaya Campus.

This year's theme is "Karakuri" (mechanical ingenuity). We wanted to express the beauty and harmony of diverse personalities fitting together with precision to set something large in motion.

We are grateful that the number of participating groups and food stalls has grown this year. To let you enjoy the entire Setagaya Campus as a stage, we have decorated every corner of it. From lively stages to distinctive food stalls, each project links up across the campus like the intricate mechanism of a "karakuri" and resonates pleasantly together. Please feel for yourself the many creative projects that students have prepared with such passion for this day.

We would also like to take this opportunity to express our deepest thanks to the local residents for their kind understanding, to our corporate sponsors for their generous support, and to everyone at the university who made this festival possible.

May today, when every wish sets out in motion like a "karakuri", be an unforgettable day full of surprise and delight for you. Please enjoy the 97th Tokyo City University Setagaya Festival to the very end.
      `.trim(),
    },
    overview: {
      heading: "Event Overview",
      items: [
        { label: "Name", value: "The 97th Tokyo City University Setagaya Festival" },
        {
          label: "Shared theme\nCampus theme",
          value:
            '"Toward Moments That Exceed Expectations, Let\'s Move Forward Together"\n"Karakuri"',
        },
        { label: "Dates", value: "Saturday, October 31, 2026\nSunday, November 1, 2026" },
        {
          label: "Venue",
          value:
            "Tokyo City University Setagaya Campus\n1-28-1 Tamatsutsumi, Setagaya-ku, Tokyo 158-8557",
        },
        {
          label: "Organizers and supporters",
          value:
            "Organizers: Tokyo City University Festival Steering Committee, The 97th Tokyo City University Setagaya Festival Organizing Committee\nSupporters: Tokyo City University, Tokyo City University Supporters' Association",
        },
        {
          label: "Official social media",
          value:
            "Website: setagayafes.org\nX (Twitter): @setagayafes_tcu\nInstagram: @setagayafes_sfa",
        },
        {
          label: "Contact",
          value:
            "The 97th Tokyo City University Setagaya Festival Organizing Committee\n1-28-1 Tamatsutsumi, Setagaya-ku, Tokyo 158-8557\nOrganizing Committee Office, Tokyo City University Setagaya Festival\nTel: 03-3703-8423 (direct)\nE-mail: sfa@setagayafes.org",
        },
      ],
    },
  },
  zh: {
    hero: {
      ordinalPrefix: "第",
      ordinalSuffix: "届",
      ordinalSuffixGap: true,
      university: "东京都市大学",
      committee: "世田谷祭执行委员会",
      scrollIndicator: "( scroll down )",
    },
    theme: {
      label: "THEME",
      heading: "迈向超越期待的瞬间，\n携手前行",
      description:
        "东京都市大学校园文化节的共同主题，承载着珍视两个校区一路积累的历史与传统，并继续挑战更远处的心愿。\n“迈向超越期待的瞬间”，体现了我们不满足于现状、不断探索校园文化节可能性的决心，以便为来访者带来超出想象的感动与体验。我们不会停留在过去的成功上，而是不断迎接新的挑战，创造只有校园文化节才能诞生的特别瞬间。\n“携手前行”，则意味着跨越校区与立场彼此协作，拓展与更多人的联系，共同打造这场校园文化节。与同学们、当地居民以及前来参观的各位一起，创造一场让所有人都难以忘怀的校园文化节。\n愿它成为每一位参与者的特别时刻。我们致力于举办一场体现东京都市大学凝聚力与热情的校园文化节。",
    },
    message: {
      label: "MESSAGE",
      heading: "执行委员长致辞",
      // TODO(委员会确认): 姓名的读音和表记确定前，保持汉字原样
      name: chairpersonMessage.name,
      position: "第97届东京都市大学世田谷祭执行委员会 执行委员长",
      imageAlt: "世田谷祭现场",
      body: `
衷心感谢您光临第97届东京都市大学世田谷祭。全体执行委员都在期待着今天，能在世田谷校区迎接各位的到来。

今年世田谷祭的主题是“机关（からくり）”。我们希望表现出多样的个性精密地组合在一起、共同推动一件大事的那种美感与和谐。

今年很荣幸，参与团体与摊位的数量有所增加。为了让大家能把整个世田谷校区当作舞台尽情游玩，我们在校园的每个角落都做了丰富的装饰。从热闹的舞台到各处个性十足的摊位，每一项企划都像“机关”的精巧装置一样在校内各处相互连动、愉快地共鸣。请您务必亲身感受学生们为这一天倾注热情、充满巧思的各种企划。

此外，在本次文化节的举办过程中，我们也借此机会，向平日里给予温暖理解的当地居民、提供大力支持的赞助企业，以及支持文化节举办的学校相关人士，致以衷心的感谢。

愿所有心意都像“机关”一样运转起来的今天，成为让各位充满惊喜与感动、难以忘怀的一天。请您尽情享受第97届东京都市大学世田谷祭，直到最后。
      `.trim(),
    },
    overview: {
      heading: "举办概要",
      items: [
        { label: "名称", value: "第97届东京都市大学世田谷祭" },
        {
          label: "共同主题\n校区主题",
          value: "“迈向超越期待的瞬间，携手前行”\n“机关（からくり）”",
        },
        { label: "日期", value: "2026年10月31日（周六）\n2026年11月1日（周日）" },
        {
          label: "会场",
          value: "东京都市大学 世田谷校区\n〒158-8557 东京都世田谷区玉堤1-28-1",
        },
        {
          label: "主办·支持",
          value:
            "主办：东京都市大学 校园文化节运营委员会、第97届东京都市大学世田谷祭执行委员会\n支持：东京都市大学、东京都市大学 后援会",
        },
        {
          label: "官方社交媒体",
          value:
            "Website：setagayafes.org\nX (Twitter)：@setagayafes_tcu\nInstagram：@setagayafes_sfa",
        },
        {
          label: "联系方式",
          value:
            "东京都市大学世田谷祭执行委员会\n〒158-8557 东京都世田谷区玉堤1-28-1\n东京都市大学世田谷祭执行委员会室\n电话：03-3703-8423（直拨）\n电子邮件：sfa@setagayafes.org",
        },
      ],
    },
  },
  ko: {
    hero: {
      ordinalPrefix: "제",
      ordinalSuffix: "회",
      ordinalSuffixGap: true,
      university: "도쿄도시대학",
      committee: "세타가야사이 실행위원회",
      scrollIndicator: "( scroll down )",
    },
    theme: {
      label: "THEME",
      heading: "기대를 뛰어넘는 순간을 향해,\n함께 나아갑시다",
      description:
        "도쿄도시대학 학원제 공통 테마에는 두 캠퍼스가 쌓아 온 역사와 전통을 소중히 이어 가면서, 그 너머로 계속 도전하겠다는 마음이 담겨 있습니다.\n‘기대를 뛰어넘는 순간을 향해’에는 방문하시는 분들의 상상을 뛰어넘는 감동과 경험을 전하기 위해, 현재에 만족하지 않고 학원제의 가능성을 계속 추구하겠다는 결의가 있습니다. 지금까지의 성공에 머무르지 않고 새로운 도전을 거듭하여, 학원제이기에 만들어 낼 수 있는 특별한 순간을 목표로 합니다.\n또한 ‘함께 나아갑시다’에는 캠퍼스와 입장을 넘어 서로 협력하고 더 많은 사람과의 인연을 넓히며 학원제를 만들어 간다는 뜻이 있습니다. 학생들은 물론 지역 주민과 방문해 주시는 분들과 함께, 모두의 마음에 남는 학원제를 만들겠습니다.\n관련된 모든 분에게 특별한 순간이 되도록. 도쿄도시대학의 결속과 열기를 구현하는 학원제를 지향합니다.",
    },
    message: {
      label: "MESSAGE",
      heading: "실행위원장 인사말",
      // TODO(위원회 확인): 이름의 읽기와 표기가 확정될 때까지 한자 그대로 표시
      name: chairpersonMessage.name,
      position: "제97회 도쿄도시대학 세타가야사이 실행위원회 실행위원장",
      imageAlt: "세타가야사이 현장",
      body: `
제97회 도쿄도시대학 세타가야사이에 방문해 주셔서 진심으로 감사드립니다. 실행위원 일동은 오늘 이곳 세타가야 캠퍼스에서 여러분을 맞이할 수 있기를 손꼽아 기다려 왔습니다.

올해 세타가야사이의 테마는 ‘카라쿠리(からくり)’입니다. 다양한 개성이 정교하게 맞물려 하나의 큰 것을 움직여 가는, 그런 아름다움과 조화를 표현하고 싶다는 마음을 담았습니다.

올해는 감사하게도 참가 단체와 노점의 수가 늘어, 세타가야 캠퍼스 전체를 무대로 즐기실 수 있도록 캠퍼스 구석구석을 다채롭게 장식했습니다. 활기찬 무대부터 곳곳의 개성 넘치는 노점까지, 하나하나의 기획이 마치 ‘카라쿠리’의 정교한 장치처럼 교내 곳곳에서 이어지며 기분 좋게 어우러지고 있습니다. 이날을 위해 학생들이 열정을 쏟아 준비한 아이디어 가득한 기획들을 꼭 직접 느껴 보시기 바랍니다.

또한 이번 학원제를 개최하면서 평소 따뜻하게 이해해 주시는 지역 주민 여러분, 크나큰 후원을 해 주신 협찬 기업 여러분, 그리고 개최를 뒷받침해 주신 대학 관계자 여러분께 이 자리를 빌려 깊이 감사드립니다.

모든 마음이 ‘카라쿠리’처럼 움직이기 시작하는 오늘이, 여러분께 놀라움과 감동으로 가득한 잊지 못할 하루가 되기를 바랍니다. 부디 끝까지 제97회 도쿄도시대학 세타가야사이를 마음껏 즐겨 주세요.
      `.trim(),
    },
    overview: {
      heading: "개최 개요",
      items: [
        { label: "명칭", value: "제97회 도쿄도시대학 세타가야사이" },
        {
          label: "공통 테마\n캠퍼스 테마",
          value: "‘기대를 뛰어넘는 순간을 향해, 함께 나아갑시다’\n‘카라쿠리(からくり)’",
        },
        { label: "일시", value: "2026년 10월 31일(토)\n2026년 11월 1일(일)" },
        {
          label: "장소",
          value: "도쿄도시대학 세타가야 캠퍼스\n〒158-8557 도쿄도 세타가야구 다마쓰쓰미 1-28-1",
        },
        {
          label: "주최·후원",
          value:
            "주최: 도쿄도시대학 학원제 운영위원회, 제97회 도쿄도시대학 세타가야사이 실행위원회\n후원: 도쿄도시대학, 도쿄도시대학 후원회",
        },
        {
          label: "공식 SNS",
          value:
            "Website: setagayafes.org\nX (Twitter): @setagayafes_tcu\nInstagram: @setagayafes_sfa",
        },
        {
          label: "문의처",
          value:
            "제97회 도쿄도시대학 세타가야사이 실행위원회\n〒158-8557 도쿄도 세타가야구 다마쓰쓰미 1-28-1\n도쿄도시대학 세타가야사이 실행위원회실\n전화: 03-3703-8423(직통)\n이메일: sfa@setagayafes.org",
        },
      ],
    },
  },
} as const satisfies Record<Locale, AboutPageContent>;
