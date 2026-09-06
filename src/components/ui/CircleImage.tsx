import Image from "next/image";

interface CircleImageProps {
  src: string;
  alt: string;
  size?: "sm" | "md" | "lg" | "xl";
}

/**
 * 円形画像コンポーネント
 * サムネイル画像を円形で表示
 */
export function CircleImage({ src, alt, size = "md" }: CircleImageProps) {
  const sizeClasses = {
    sm: "h-16 w-16",
    md: "h-24 w-24",
    lg: "h-32 w-32",
    xl: "h-40 w-40",
  };

  // レスポンシブ可変を持たない固定pxのボックスなので、ブレークポイント無しの
  // 単一値で十分。ボックスの実測px（Tailwindのスペーシングスケール由来）と揃える。
  const sizePx = {
    sm: 64,
    md: 96,
    lg: 128,
    xl: 160,
  };

  return (
    <div className={`relative overflow-hidden rounded-full ${sizeClasses[size]}`}>
      <Image src={src} alt={alt} fill sizes={`${sizePx[size]}px`} className="object-cover" />
    </div>
  );
}
