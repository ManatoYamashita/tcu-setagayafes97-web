import { cn } from "@/lib/utils";

export type BadgeVariant =
  | "urgent"
  | "news"
  | "other"
  | "day1"
  | "day2"
  | "both"
  | "room"
  | "stage"
  | "special";

export interface BadgeProps {
  variant: BadgeVariant;
  label: string;
  className?: string;
}

/**
 * バッジコンポーネント
 * カテゴリやタイプを視覚的に表示
 */
export function Badge({ variant, label, className }: BadgeProps) {
  const baseStyles = "inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold";

  const variantStyles: Record<BadgeVariant, string> = {
    urgent: "bg-red-500 text-white",
    news: "bg-blue-500 text-white",
    other: "bg-gray-500 text-white",
    day1: "bg-primary text-white",
    day2: "bg-purple-600 text-white",
    both: "bg-gradient-to-r from-primary to-purple-600 text-white",
    room: "bg-green-500 text-white",
    stage: "bg-orange-500 text-white",
    special: "bg-pink-500 text-white",
  };

  return <span className={cn(baseStyles, variantStyles[variant], className)}>{label}</span>;
}
