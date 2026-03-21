import Link from "next/link";
import { Clock } from "lucide-react";

/**
 * 準備中コンポーネント
 * データ非公開時に各ページのコンテンツ部分に表示する
 */
export function ComingSoon() {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <Clock className="mb-6 h-16 w-16 text-gray-400" />
      <h2 className="mb-4 text-3xl font-bold text-gray-900">準備中</h2>
      <p className="mb-8 max-w-md text-gray-600">
        現在コンテンツを準備中です。
        <br />
        公開までしばらくお待ちください。
      </p>
      <Link
        href="/"
        className="inline-flex items-center gap-2 rounded-lg bg-primary px-6 py-3 font-semibold text-white transition-colors hover:bg-primary-dark"
      >
        トップページへ戻る
      </Link>
    </div>
  );
}
