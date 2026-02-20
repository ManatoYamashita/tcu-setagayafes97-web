import Link from "next/link";
import { cn } from "@/lib/utils";

export interface CardProps {
  variant?: "default" | "featured";
  className?: string;
  children: React.ReactNode;
  href?: string;
}

/**
 * カードコンポーネント
 * コンテンツを包むカードレイアウトを提供
 */
export function Card({ variant = "default", className, children, href }: CardProps) {
  const baseStyles = "rounded-2xl border bg-white/10";

  const variantStyles = {
    default: "border-white/20 hover:border-white/40",
    featured: "border-white",
  };

  const combinedStyles = cn(
    baseStyles,
    variantStyles[variant],
    href && "cursor-pointer",
    className
  );

  if (href) {
    return (
      <Link href={href} className={combinedStyles}>
        {children}
      </Link>
    );
  }

  return <div className={combinedStyles}>{children}</div>;
}
