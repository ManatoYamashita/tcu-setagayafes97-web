import type { Metadata } from "next";
import { Mail, Phone, MapPin } from "lucide-react";
import { ContactForm } from "./ContactForm";

/**
 * メタデータ
 */
export const metadata: Metadata = {
  title: "お問い合わせ | 東京都市大学 第97回 世田谷祭",
  description:
    "東京都市大学 第97回 世田谷祭に関するお問い合わせフォーム。一般・来場者向け、取材・メディア向け、落とし物のお問い合わせに対応しています。",
  openGraph: {
    title: "お問い合わせ | 東京都市大学 第97回 世田谷祭",
    description:
      "東京都市大学 第97回 世田谷祭に関するお問い合わせフォーム。一般・来場者向け、取材・メディア向け、落とし物のお問い合わせに対応しています。",
    type: "website",
  },
};

/**
 * お問い合わせページ
 */
export default function ContactPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* ページヘッダー */}
      <div className="bg-primary py-16 text-white">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-center gap-3">
            <Mail className="h-10 w-10 md:h-12 md:w-12" />
            <h1 className="text-4xl font-bold md:text-5xl">お問い合わせ</h1>
          </div>
          <p className="mt-4 text-center text-lg opacity-90">
            第97回 世田谷祭に関するご質問・ご相談
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        {/* お問い合わせ種別説明 */}
        <section className="mx-auto mb-12 max-w-4xl">
          <div className="grid gap-6 md:grid-cols-3">
            <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
              <div className="mb-3 flex items-center gap-2">
                <Mail className="h-5 w-5 text-blue-500" />
                <h3 className="font-bold text-gray-900">一般・来場者向け</h3>
              </div>
              <p className="text-sm text-gray-700">
                企画内容、開催時間、会場案内など、来場に関するお問い合わせ
              </p>
            </div>

            <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
              <div className="mb-3 flex items-center gap-2">
                <Phone className="h-5 w-5 text-green-500" />
                <h3 className="font-bold text-gray-900">取材・メディア向け</h3>
              </div>
              <p className="text-sm text-gray-700">
                取材申し込み、プレスリリース、メディア掲載に関するお問い合わせ
              </p>
            </div>

            <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
              <div className="mb-3 flex items-center gap-2">
                <MapPin className="h-5 w-5 text-orange-500" />
                <h3 className="font-bold text-gray-900">落とし物</h3>
              </div>
              <p className="text-sm text-gray-700">
                世田谷祭会場で紛失された物品に関するお問い合わせ
              </p>
            </div>
          </div>
        </section>

        {/* お問い合わせフォーム */}
        <section className="mx-auto mb-12 max-w-4xl rounded-lg border border-gray-200 bg-white p-6 shadow-sm md:p-8">
          <h2 className="mb-6 text-2xl font-bold text-gray-900">お問い合わせフォーム</h2>
          <ContactForm />
        </section>

        {/* よくある質問へのリンク */}
        <section className="mx-auto max-w-4xl rounded-lg border border-blue-200 bg-blue-50 p-6">
          <div className="flex items-start gap-3">
            <Mail className="mt-0.5 h-5 w-5 flex-shrink-0 text-blue-600" />
            <div>
              <p className="font-semibold text-blue-900">お問い合わせの前に</p>
              <p className="mt-1 text-sm text-blue-700">
                よくいただくご質問は
                <a href="/info/faq" className="underline hover:text-blue-900">
                  FAQページ
                </a>
                にまとめております。まずはそちらをご確認ください。
              </p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
