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
    <Link href={href}>
      <div
        className={`
          ${sizeClasses[size]}
          flex flex-col items-center justify-center
          rounded-full bg-white border border-gray-200
          transition-colors duration-300
          hover:border-primary
          focus:outline-none focus:ring-4 focus:ring-primary focus:ring-offset-2
          ${className}
        `}
      >
        <span className="font-semibold uppercase tracking-wider text-gray-900">{text}</span>
        <ArrowRight className="mt-2 h-5 w-5 text-primary" />
      </div>
    </Link>
  );
}
