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
  const baseStyles = "rounded-lg border bg-white shadow-sm transition-all duration-300";

  const variantStyles = {
    default: "border-gray-200 hover:shadow-md",
    featured:
      "border-primary bg-gradient-to-br from-white to-primary/5 hover:shadow-lg hover:shadow-primary/20",
  };

  const combinedStyles = cn(
    baseStyles,
    variantStyles[variant],
    href && "cursor-pointer hover:-translate-y-1",
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
