import { Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Search, Heart, ShoppingBag, X } from "lucide-react";
import { useCart } from "@/lib/cart-store";
import { useProducts, useCategories } from "@/lib/store";
import { BrandMark } from "@/components/brand-mark";
import { useLang } from "@/lib/i18n";

export function SiteHeader() {
  const { open, count } = useCart();
  const { t, lang, setLang } = useLang();
  const navigate = useNavigate();
  const [q, setQ] = useState("");
  const [focused, setFocused] = useState(false);

  const categories = useCategories();

  // Build nav: New + dynamic categories + Sale
  type NavItem = { key: string; label: string; filter: string };
  const navItems: NavItem[] = [
    { key: "new", label: t("nav.new"), filter: "new" },
    ...categories.map((c) => ({ key: c, label: c, filter: c.toLowerCase() })),
    { key: "sale", label: t("nav.sale"), filter: "sale" },
  ];

  // Split roughly in half for left/right desktop nav
  const half = Math.ceil(navItems.length / 2);
  const leftNav = navItems.slice(0, half);
  const rightNav = navItems.slice(half);

  const products = useProducts();
  const results = q.trim().length > 0
    ? products.filter((p) =>
        p.name.toLowerCase().includes(q.toLowerCase()) ||
        p.category.toLowerCase().includes(q.toLowerCase())
      ).slice(0, 6)
    : [];

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!q.trim()) return;
    navigate({ to: "/shop" });
    setFocused(false);
  };

  const LangToggle = ({ className = "" }: { className?: string }) => (
    <div
      role="group"
      aria-label={t("lang.toggleLabel")}
      className={`inline-flex items-center border border-border text-[10px] tracking-widest uppercase ${className}`}
    >
      {(["sq", "en"] as const).map((l) => (
        <button
          key={l}
          onClick={() => setLang(l)}
          aria-pressed={lang === l}
          className={`px-1.5 py-[3px] transition-colors ${
            lang === l ? "bg-foreground text-background" : "hover:text-caramel"
          }`}
        >
          {l.toUpperCase()}
        </button>
      ))}
    </div>
  );

  return (
    <header className="sticky top-0 z-40 bg-background/95 backdrop-blur border-b border-border">
      <div className="bg-foreground text-background text-[10px] sm:text-[11px] tracking-widest uppercase text-center py-2 px-3 leading-relaxed">
        <span className="hidden sm:inline">{t("banner.long")}</span>
        <span className="sm:hidden">{t("banner.short")}</span>
      </div>
      <div className="mx-auto max-w-7xl px-3 sm:px-6 grid grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-2 sm:gap-4 py-3 sm:py-5">
        <div className="hidden md:flex items-center gap-6 text-[13px] tracking-wide uppercase">
          {leftNav.map((l) => (
            <Link key={l.key} to="/shop" search={{ filter: l.filter }} className="hover:text-caramel transition-colors">
              {l.label}
            </Link>
          ))}
        </div>
        <Link to="/" className="text-center min-w-0">
          <BrandMark className="text-2xl sm:text-4xl truncate" />
        </Link>
        <div className="flex items-center justify-end gap-3 sm:gap-5">
          <div className="hidden md:flex items-center gap-6 text-[13px] tracking-wide uppercase mr-2">
            {rightNav.map((l) => (
              <Link key={l.key} to="/shop" search={{ filter: l.filter }} className="hover:text-caramel transition-colors">
                {l.label}
              </Link>
            ))}
          </div>
          <LangToggle className="hidden sm:inline-flex" />
          <button aria-label={t("aria.favorites")} className="hover:text-caramel transition-colors">
            <Heart className="h-[18px] w-[18px]" />
          </button>
          <button
            aria-label={t("aria.cart")}
            onClick={open}
            className="relative hover:text-caramel transition-colors"
          >
            <ShoppingBag className="h-[18px] w-[18px]" />
            {count > 0 && (
              <span className="absolute -top-2 -right-2 bg-burgundy text-background text-[10px] rounded-full h-4 w-4 grid place-items-center">
                {count}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Search bar */}
      <div className="mx-auto max-w-7xl px-3 sm:px-6 pb-3 relative">
        <form onSubmit={submit} className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
          <input
            type="search"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            onFocus={() => setFocused(true)}
            onBlur={() => setTimeout(() => setFocused(false), 200)}
            placeholder={t("search.placeholder")}
            aria-label={t("aria.search")}
            className="w-full bg-secondary/60 border border-border pl-9 pr-9 py-2.5 text-sm placeholder:text-muted-foreground focus:outline-none focus:border-foreground focus:bg-background transition-colors"
          />
          {q && (
            <button
              type="button"
              onClick={() => setQ("")}
              aria-label={t("aria.clear")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </form>

        {focused && results.length > 0 && (
          <div className="absolute left-3 right-3 sm:left-6 sm:right-6 top-full mt-1 bg-background border border-border shadow-lg z-50 max-h-[70vh] overflow-y-auto">
            {results.map((p) => (
              <button
                key={p.id}
                onMouseDown={(e) => {
                  e.preventDefault();
                  navigate({ to: "/product/$id", params: { id: p.id } });
                  setFocused(false);
                  setQ("");
                }}
                className="w-full flex items-center gap-3 p-2 hover:bg-secondary/60 text-left transition-colors"
              >
                <img src={p.image} alt="" className="w-12 h-16 object-cover bg-secondary shrink-0" />
                <div className="min-w-0 flex-1">
                  <p className="font-serif text-sm truncate">{p.name}</p>
                  <p className="text-[11px] text-muted-foreground">
                    {p.category} · {p.price.toFixed(2)} €
                  </p>
                </div>
              </button>
            ))}
          </div>
        )}
        {focused && q.trim() && results.length === 0 && (
          <div className="absolute left-3 right-3 sm:left-6 sm:right-6 top-full mt-1 bg-background border border-border shadow-lg z-50 p-4 text-sm text-muted-foreground">
            {t("search.empty")} “{q}”.
          </div>
        )}
      </div>

      <nav className="md:hidden flex items-center justify-center gap-4 pb-3 text-[10px] sm:text-[11px] tracking-widest uppercase overflow-x-auto px-3">
        {navItems.map((l) => (
          <Link key={l.key} to="/shop" search={{ filter: l.filter }} className="hover:text-caramel transition-colors whitespace-nowrap">
            {l.label}
          </Link>
        ))}
        <LangToggle className="sm:hidden ml-2 shrink-0" />
      </nav>
    </header>
  );
}
