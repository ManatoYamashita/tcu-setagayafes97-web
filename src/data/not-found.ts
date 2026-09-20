export const notFoundPageContent = {
  metadataTitle: "ページが見つかりません",
  code: "404",
  title: "ページが見つかりませんでした。",
  description:
    "お探しのページは移動または削除された可能性があります。ホームからもう一度お探しください。",
  illustration: {
    src: "/images/illustrations/404.avif",
    alt: "",
    width: 896,
    height: 896,
  },
  cta: {
    label: "ホームに戻る",
    href: "/",
  },
} as const;
