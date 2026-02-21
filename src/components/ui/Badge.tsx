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
    urgent: "bg-red-500 text-gray-900",
    news: "bg-blue-500 text-gray-900",
    other: "bg-gray-500 text-gray-900",
    day1: "bg-secondary text-gray-900",
    day2: "bg-purple-600 text-gray-900",
    both: "bg-secondary text-gray-900",
    room: "bg-green-500 text-gray-900",
    stage: "bg-orange-500 text-gray-900",
    special: "bg-pink-500 text-gray-900",
  };

  return <span className={cn(baseStyles, variantStyles[variant], className)}>{label}</span>;
}
