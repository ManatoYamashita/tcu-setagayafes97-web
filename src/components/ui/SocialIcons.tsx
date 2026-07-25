import { Instagram, Youtube } from "lucide-react";
import { siteConfig } from "@/data/site";

export interface SocialIconsProps {
  layout?: "horizontal" | "vertical";
  size?: "sm" | "md" | "lg";
  showLabel?: boolean;
  variant?: "minimal" | "circle" | "bordered";
  className?: string;
}

export function SocialIcons({
  layout = "horizontal",
  size = "md",
  showLabel = false,
  variant = "minimal",
  className = "",
}: SocialIconsProps) {
  const iconSizes = {
    sm: "h-4 w-4",
    md: "h-5 w-5",
    lg: "h-6 w-6",
  };

  const containerStyles = {
    horizontal: "flex items-center gap-4",
    vertical: "flex flex-col gap-3",
  };

  const linkBase =
    "inline-flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 rounded-full";
  const iconWrapperVariants = {
    minimal: "",
    circle: "w-10 h-10 text-gray-900/70 group-hover:text-gray-900",
    bordered:
      "w-10 h-10 border border-current text-gray-900/70 group-hover:border-gray-200 group-hover:text-gray-900",
  };

  const socialLinks = [
    {
      name: "X (Twitter)",
      url: siteConfig.sns.twitter,
      icon: (
        <svg className={iconSizes[size]} fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
        </svg>
      ),
    },
    {
      name: "Instagram",
      url: siteConfig.sns.instagram,
      icon: <Instagram className={iconSizes[size]} />,
    },
    {
      name: "YouTube",
      url: siteConfig.sns.youtube,
      icon: <Youtube className={iconSizes[size]} />,
    },
  ];

  return (
    <div className={`${containerStyles[layout]} ${className}`}>
      {showLabel && layout === "horizontal" && (
        <span className="text-sm font-semibold uppercase tracking-wider">Official SNS</span>
      )}
      {socialLinks.map((social) => {
        const iconEl =
          variant === "minimal" ? (
            social.icon
          ) : (
            <span
              className={`inline-flex items-center justify-center shrink-0 rounded-full ${iconWrapperVariants[variant]}`}
            >
              {social.icon}
            </span>
          );
        return (
          <a
            key={social.name}
            href={social.url}
            target="_blank"
            rel="noopener noreferrer"
            className={`${linkBase} ${variant === "minimal" ? "hover:text-gray-900 hover:scale-110" : "group flex items-center gap-2"} ${variant !== "minimal" ? "shrink-0" : ""}`}
            aria-label={`${social.name}で世田谷祭をフォロー`}
          >
            {iconEl}
            {showLabel && layout === "vertical" && <span className="text-sm">{social.name}</span>}
          </a>
        );
      })}
    </div>
  );
}
