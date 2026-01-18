import Link from "next/link";
import { siteConfig } from "@/data/site";
import { navigationConfig } from "@/data/navigation";

export function Header() {
  return (
    <header className="sticky top-0 z-50 border-b bg-white shadow-md">
      <div className="container mx-auto flex items-center justify-between px-4 py-4">
        <Link href="/" className="text-2xl font-bold text-primary">
          {siteConfig.shortName}
        </Link>

        <nav>
          <ul className="flex gap-6">
            {navigationConfig.header.map((item) => (
              <li key={item.href}>
                <Link href={item.href} className="text-gray-700 hover:text-primary">
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </header>
  );
}
