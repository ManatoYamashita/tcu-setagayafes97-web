import Link from "next/link";
import { ArrowRight } from "lucide-react";

export interface CircularButtonProps {
  href: string;
  text?: string;
  size?: "md" | "lg";
  className?: string;
}

export function CircularButton({
  href,
  text = "VIEW MORE",
  size = "lg",
  className = "",
}: CircularButtonProps) {
  const sizeClasses = {
    md: "h-28 w-28 text-sm",
    lg: "h-36 w-36 text-base md:h-40 md:w-40",
  };

  return (
    <Link
      href={href}
      className={`
        ${sizeClasses[size]}
        flex flex-col items-center justify-center
        rounded-full border border-gray-200/30 bg-white/10
        transition-colors hover:bg-white/20
        focus-visible:outline-3 focus-visible:outline-offset-3 focus-visible:outline-white
        ${className}
      `}
    >
      <span className="font-semibold uppercase tracking-wider text-gray-900">{text}</span>
      <ArrowRight className="mt-2 h-5 w-5 text-gray-900" />
    </Link>
  );
}
