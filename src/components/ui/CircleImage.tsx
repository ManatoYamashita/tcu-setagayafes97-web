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

  return (
    <div className={`relative overflow-hidden rounded-full ${sizeClasses[size]}`}>
      <Image src={src} alt={alt} fill className="object-cover" />
    </div>
  );
}
