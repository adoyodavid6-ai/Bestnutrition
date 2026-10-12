"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Icon, Logo } from "./Icon";
import { primaryNav } from "@/lib/site";
import { KEYS, useStored } from "@/lib/storage";

export function SiteHeader() {
  const pathname = usePathname();
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [q, setQ] = useState("");
  const searchRef = useRef<HTMLInputElement>(null);
  const [saved] = useStored<string[]>(KEYS.savedRecipes, []);
  const [savedArticles] = useStored<string[]>(KEYS.savedArticles, []);
  const savedCount = saved.length + savedArticles.length;

  useEffect(() => {
    setMenuOpen(false);
    setSearchOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (searchOpen) searchRef.current?.focus();
  }, [searchOpen]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setMenuOpen(false);
        setSearchOpen(false);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  const isActive = (href: string) => pathname === href || pathname.startsWith(href + "/");

  return (
    <header className="site-header">
      <div className="container header-inner">
        <Link href="/" className="logo" aria-label="NourishWell home">
          <Logo />
        </Link>


        <div className="header-actions">
          <button type="button" className="icon-btn" aria-label="Search" aria-expanded={searchOpen} aria-controls="site-search" onClick={() => setSearchOpen((v) => !v)}>
            <Icon name="search" />
          </button>
          <Link href="/dashboard#saved" className="icon-btn hide-sm" aria-label={`Saved items${savedCount ? ` (${savedCount})` : ""}`}>
            <Icon name="heart" />
            {savedCount > 0 && <span className="count" aria-hidden="true">{savedCount}</span>}
          </Link>
          <Link href="/account" className="icon-btn hide-sm" aria-label="Account and preferences">
            <Icon name="user" />
          </Link>
          <Link href="/meal-planner" className="btn btn-primary btn-sm header-cta">
            Build My Meal Plan
          </Link>
          <button type="button" className="icon-btn menu-toggle" aria-label={menuOpen ? "Close menu" : "Open menu"} aria-expanded={menuOpen} aria-controls="mobile-menu" onClick={() => setMenuOpen((v) => !v)}>
            <Icon name={menuOpen ? "close" : "menu"} />
          </button>
        </div>
      </div>

      <nav className="main-nav" aria-label="Primary">
        <div className="container">
          <ul>
            {primaryNav.map((item) => (
              <li key={item.href}>
                <Link href={item.href} aria-current={isActive(item.href) ? "page" : undefined}>
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </nav>

      {searchOpen && (
        <div className="search-panel" id="site-search">
          <form
            className="container search-form"
            role="search"
            onSubmit={(e) => {
              e.preventDefault();
              router.push(`/search?q=${encodeURIComponent(q.trim())}`);
            }}
          >
            <label htmlFor="header-search" className="sr-only">
              Search recipes, guides and more
            </label>
            <input ref={searchRef} id="header-search" className="input" type="search" placeholder="Search recipes, ingredients, health topics…" value={q} onChange={(e) => setQ(e.target.value)} />
            <button className="btn btn-primary" type="submit">
              Search
            </button>
          </form>
        </div>
      )}

      {menuOpen && (
        <div className="mobile-drawer" id="mobile-menu">
          <nav aria-label="Mobile">
            <ul>
              {primaryNav.map((item) => (
                <li key={item.href}>
                  <Link href={item.href} aria-current={isActive(item.href) ? "page" : undefined}>
                    {item.label}
                  </Link>
                </li>
              ))}
              <li>
                <Link href="/dashboard">My dashboard</Link>
              </li>
              <li>
                <Link href="/shopping-list">Shopping list</Link>
              </li>
              <li>
                <Link href="/pricing">Free &amp; Premium</Link>
              </li>
              <li>
                <Link href="/account">Account &amp; preferences</Link>
              </li>
            </ul>
          </nav>
          <Link href="/meal-planner" className="btn btn-primary" style={{ width: "100%" }}>
            Build My Meal Plan
          </Link>
        </div>
      )}
    </header>
  );
}
