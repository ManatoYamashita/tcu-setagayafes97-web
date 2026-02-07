import { Facebook, Instagram } from "lucide-react";
import { siteConfig } from "@/data/site";

export interface SocialIconsProps {
  layout?: "horizontal" | "vertical";
  size?: "sm" | "md" | "lg";
  showLabel?: boolean;
  className?: string;
}

export function SocialIcons({
  layout = "horizontal",
  size = "md",
  showLabel = false,
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
      name: "Facebook",
      url: siteConfig.sns.facebook,
      icon: <Facebook className={iconSizes[size]} />,
    },
  ];

  return (
    <div className={`${containerStyles[layout]} ${className}`}>
      {showLabel && layout === "horizontal" && (
        <span className="text-sm font-semibold uppercase tracking-wider">Official SNS</span>
      )}
      {socialLinks.map((social) => (
        <a
          key={social.name}
          href={social.url}
          target="_blank"
          rel="noopener noreferrer"
          className="transition-colors hover:text-primary focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
          aria-label={`${social.name}で世田谷祭をフォロー`}
        >
          {social.icon}
          {showLabel && layout === "vertical" && (
            <span className="ml-2 text-sm">{social.name}</span>
          )}
        </a>
      ))}
    </div>
  );
}
