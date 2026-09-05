import { cn } from "@/lib/utils";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline";
  size?: "sm" | "md" | "lg";
  fullWidth?: boolean;
  children: React.ReactNode;
}

/**
 * ボタンコンポーネント
 * アクセシビリティとバリエーションに対応
 */
export function Button({
  variant = "primary",
  size = "md",
  fullWidth = false,
  className,
  children,
  disabled,
  ...props
}: ButtonProps) {
  const baseStyles =
    "inline-flex items-center justify-center rounded-lg font-semibold focus-visible:outline-3 focus-visible:outline-offset-3 focus-visible:outline-primary-600 disabled:cursor-not-allowed disabled:opacity-50";

  const variantStyles = {
    primary: "bg-white text-primary hover:opacity-90",
    secondary: "bg-white/20 text-gray-900 hover:opacity-90",
    outline: "border-2 border-gray-200 text-gray-900 hover:bg-white hover:text-primary",
  };

  const sizeStyles = {
    sm: "px-4 py-2 text-sm",
    md: "px-6 py-3 text-base",
    lg: "px-8 py-4 text-lg",
  };

  return (
    <button
      className={cn(
        baseStyles,
        variantStyles[variant],
        sizeStyles[size],
        fullWidth && "w-full",
        className
      )}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
}
