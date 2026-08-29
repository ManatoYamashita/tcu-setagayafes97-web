import Image from "next/image";
import type { MicroCMSImage } from "microcms-js-sdk";

interface SpecialProfileProps {
  /** 紹介文（Event.content のリッチエディタHTML） */
  content?: string;
  /** 追加のアーティスト写真 */
  photos?: MicroCMSImage[];
}

/**
 * アーティスト紹介文と追加写真
 *
 * HTML は microCMS のリッチエディタ出力をそのまま描画します。
 * 入稿者が実行委員会に限られる前提の既存方針（EventDetail と同様）に揃えています。
 *
 * 紹介文も写真も無い場合はセクションごと出力しません。
 */
export function SpecialProfile({ content, photos }: SpecialProfileProps) {
  const hasPhotos = Boolean(photos && photos.length > 0);
  if (!content && !hasPhotos) return null;

  return (
    <section aria-labelledby="special-profile" className="py-8" data-special-reveal="up">
      <h2 id="special-profile" className="mb-4 text-xl font-bold text-gray-900 md:text-2xl">
        出演者情報
      </h2>

      {content && (
        <div
          className="prose max-w-none prose-headings:text-gray-900 prose-p:text-gray-900/80 prose-a:text-primary"
          dangerouslySetInnerHTML={{ __html: content }}
        />
      )}

      {/* grid だと枚数が奇数のとき最後の1枚が左カラムに固定されるため、
          中央寄せできる flex-wrap を使う */}
      {hasPhotos && (
        <ul className="mt-6 flex flex-wrap justify-center gap-4" data-special-stagger>
          {/* 同じ画像を複数枚選べるため、URL だけでは key が衝突する */}
          {photos?.map((photo, index) => (
            <li
              key={`${photo.url}-${index}`}
              className="w-full overflow-hidden rounded-xl border border-gray-200 shadow-lg sm:w-[calc(50%-0.5rem)]"
            >
              {/*
                縦長の写真が入稿されるとモバイルのスクロール量が跳ね上がるため、
                高さの上限を 70dvh とし、超過分は中心を基準にクロップする。
                アスペクト比は object-cover が維持する。
              */}
              <Image
                src={photo.url}
                alt=""
                width={photo.width ?? 800}
                height={photo.height ?? 600}
                sizes="(min-width: 640px) 50vw, 100vw"
                className="max-h-[70dvh] w-full object-cover object-center"
              />
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
