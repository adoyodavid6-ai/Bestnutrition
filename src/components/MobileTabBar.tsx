"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Icon } from "./Icon";

const tabs = [
  { href: "/", label: "Home", icon: "home" },
  { href: "/search", label: "Search", icon: "search" },
  { href: "/recipes", label: "Recipes", icon: "bowl" },
  { href: "/meal-planner", label: "Planner", icon: "calendar" },
  { href: "/dashboard", label: "Saved", icon: "heart" },
];

export function MobileTabBar() {
  const pathname = usePathname();
  return (
    <nav className="tabbar no-print" aria-label="Quick access">
      {tabs.map((t) => {
        const active = t.href === "/" ? pathname === "/" : pathname.startsWith(t.href);
        return (
          <Link key={t.href} href={t.href} aria-current={active ? "page" : undefined}>
            <Icon name={t.icon} size={22} />
            {t.label}
          </Link>
        );
      })}
    </nav>
  );
}
