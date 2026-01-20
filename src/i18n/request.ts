import { getRequestConfig } from "next-intl/server";

export default getRequestConfig(async () => {
  // デフォルトロケールとして日本語を使用
  const locale = "ja";

  return {
    locale,
    messages: (await import(`../messages/${locale}.json`)).default,
  };
});
