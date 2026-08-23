import Image from "next/image";
import type { GoodsItem } from "@/types/events";
import { specialGoods } from "@/data/special";

interface GoodsTableProps {
  goods?: GoodsItem[];
  /** 物販の補足（リッチエディタHTML） */
  note?: string;
  /**
   * 物販明細の公開フラグ（SPECIAL_GOODS_VISIBLE）
   * 渡し忘れを型エラーで検出するため必須にしています。
   */
  isVisible: boolean;
}

/**
 * 物販商品テーブル
 *
 * isVisible が false の間は商品テーブルも補足も出力せず、
 * 「グッズ販売予定」のプレースホルダーだけを表示します。
 * 商品名・価格を HTML に残さないため、解禁前に値が漏れることはありません。
 *
 * 列は「その列に値を持つ商品が1つでもあるか」で出し分けます。
 * 全商品でカラー・サイズが未入力なら、その列ごと表示しません。
 *
 * 商品が1件も無い場合はセクションごと出力しません（物販を行わない企画のため）。
 * この分岐は補足（note）の描画より前にあるため、商品が空で補足だけある場合も
 * セクションは出力されません。
 *
 * 375px では 5 列すべては収まらないため、横スクロールのコンテナに入れています。
 */
export function GoodsTable({ goods, note, isVisible }: GoodsTableProps) {
  if (!isVisible) {
    return (
      <section aria-labelledby="special-goods" className="py-8">
        <h2 id="special-goods" className="mb-4 text-xl font-bold text-gray-900 md:text-2xl">
          {specialGoods.heading}
        </h2>

        <div className="rounded-xl border border-dashed border-gray-300 bg-gray-50 px-6 py-8 text-center">
          <p className="text-base font-semibold text-gray-900">{specialGoods.placeholder.title}</p>
          <p className="mt-2 text-sm text-gray-900/80">{specialGoods.placeholder.description}</p>
        </div>
      </section>
    );
  }

  if (!goods || goods.length === 0) return null;

  const hasImage = goods.some((item) => item.image);
  const hasColor = goods.some((item) => item.color);
  const hasSize = goods.some((item) => item.size);
  const hasPrice = goods.some((item) => item.price);
  const hasNote = goods.some((item) => item.note);

  return (
    <section aria-labelledby="special-goods" className="py-8">
      <h2 id="special-goods" className="mb-4 text-xl font-bold text-gray-900 md:text-2xl">
        {specialGoods.heading}
      </h2>

      <div className="overflow-x-auto rounded-xl border border-gray-200">
        <table className="w-full border-collapse text-sm">
          <caption className="sr-only">{specialGoods.tableCaption}</caption>
          <thead className="bg-gray-50">
            <tr>
              {hasImage && (
                <th scope="col" className="px-4 py-3 text-left font-semibold text-gray-900">
                  <span className="sr-only">商品画像</span>
                </th>
              )}
              <th
                scope="col"
                className="whitespace-nowrap px-4 py-3 text-left font-semibold text-gray-900"
              >
                商品名
              </th>
              {hasColor && (
                <th
                  scope="col"
                  className="whitespace-nowrap px-4 py-3 text-left font-semibold text-gray-900"
                >
                  カラー
                </th>
              )}
              {hasSize && (
                <th
                  scope="col"
                  className="whitespace-nowrap px-4 py-3 text-left font-semibold text-gray-900"
                >
                  サイズ
                </th>
              )}
              {hasPrice && (
                <th
                  scope="col"
                  className="whitespace-nowrap px-4 py-3 text-left font-semibold text-gray-900"
                >
                  販売価格
                </th>
              )}
              {hasNote && (
                <th
                  scope="col"
                  className="whitespace-nowrap px-4 py-3 text-left font-semibold text-gray-900"
                >
                  備考
                </th>
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {goods.map((item, index) => (
              <tr key={`${item.name}-${index}`}>
                {hasImage && (
                  <td className="px-4 py-3">
                    {item.image && (
                      <Image
                        src={item.image.url}
                        alt=""
                        width={64}
                        height={64}
                        className="h-16 w-16 rounded object-cover"
                      />
                    )}
                  </td>
                )}
                <th scope="row" className="px-4 py-3 text-left font-medium text-gray-900">
                  <span className="flex flex-wrap items-center gap-2">
                    {item.name}
                    {item.isNew && (
                      <span className="inline-flex items-center rounded-full bg-pink-500 px-2 py-0.5 text-xs font-semibold text-white">
                        NEW
                      </span>
                    )}
                  </span>
                </th>
                {hasColor && <td className="px-4 py-3 text-gray-900/80">{item.color}</td>}
                {hasSize && <td className="px-4 py-3 text-gray-900/80">{item.size}</td>}
                {hasPrice && (
                  <td className="whitespace-nowrap px-4 py-3 text-gray-900/80">{item.price}</td>
                )}
                {hasNote && (
                  <td className="whitespace-pre-line px-4 py-3 text-gray-900/80">{item.note}</td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {note && (
        <div
          className="prose prose-sm mt-4 max-w-none prose-p:text-gray-900/80"
          dangerouslySetInnerHTML={{ __html: note }}
        />
      )}
    </section>
  );
}
