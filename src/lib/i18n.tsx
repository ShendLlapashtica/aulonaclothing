import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

export type Lang = "sq" | "en";

type Dict = Record<string, { sq: string; en: string }>;

export const dict = {
  "nav.new": { sq: "Të Reja", en: "New In" },
  "nav.dresses": { sq: "Fustane", en: "Dresses" },
  "nav.sets": { sq: "Sete", en: "Sets" },
  "nav.denim": { sq: "Denim", en: "Denim" },
  "nav.sale": { sq: "Zbritje", en: "Sale" },
  "aria.favorites": { sq: "Të preferuarat", en: "Favorites" },
  "aria.cart": { sq: "Shporta", en: "Cart" },
  "aria.clear": { sq: "Pastro", en: "Clear" },
  "aria.search": { sq: "Kërko produkte", en: "Search products" },
  "search.placeholder": { sq: "Kërko fustane, sete, denim…", en: "Search dresses, sets, denim…" },
  "search.empty": { sq: "Asnjë rezultat për", en: "No results for" },
  "banner.long": {
    sq: "Transporti në 🇽🇰 falas · Transporti në 🇦🇱 5 € · Transporti në 🇲🇰 5 €",
    en: "Free shipping to 🇽🇰 · Shipping to 🇦🇱 €5 · Shipping to 🇲🇰 €5",
  },
  "banner.short": {
    sq: "🇽🇰 Falas · 🇦🇱 5€ · 🇲🇰 5€",
    en: "🇽🇰 Free · 🇦🇱 €5 · 🇲🇰 €5",
  },
  "lang.toggleLabel": { sq: "Ndrysho gjuhën", en: "Change language" },
} satisfies Dict;

type Key = keyof typeof dict;

const Ctx = createContext<{ lang: Lang; setLang: (l: Lang) => void; t: (k: Key) => string }>({
  lang: "sq",
  setLang: () => {},
  t: (k) => dict[k].sq,
});

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>("sq");

  useEffect(() => {
    const stored = typeof window !== "undefined" ? (localStorage.getItem("aul.lang") as Lang | null) : null;
    if (stored === "sq" || stored === "en") setLangState(stored);
  }, []);

  const setLang = (l: Lang) => {
    setLangState(l);
    if (typeof window !== "undefined") localStorage.setItem("aul.lang", l);
    if (typeof document !== "undefined") document.documentElement.lang = l;
  };

  const t = (k: Key) => dict[k][lang];

  return <Ctx.Provider value={{ lang, setLang, t }}>{children}</Ctx.Provider>;
}

export function useLang() {
  return useContext(Ctx);
}
