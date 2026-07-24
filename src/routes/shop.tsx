import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { ProductCard } from "@/components/product-card";
import {
  useProducts,
  useCategories,
  productsQueryOptions,
  categoriesQueryOptions,
} from "@/lib/store";
import { z } from "zod";

const searchSchema = z.object({
  filter: z.string().catch("all"),
});

export const Route = createFileRoute("/shop")({
  validateSearch: searchSchema,
  loader: async ({ context }) => {
    await Promise.all([
      context.queryClient.ensureQueryData(productsQueryOptions),
      context.queryClient.ensureQueryData(categoriesQueryOptions),
    ]);
  },
  head: () => ({
    meta: [
      { title: "Dyqani — Aulonaclothing" },
      {
        name: "description",
        content: "Të gjithë koleksionin: fustane, sete, denim dhe bluza nga Aulonaclothing.",
      },
      { property: "og:title", content: "Dyqani — Aulonaclothing" },
      { property: "og:description", content: "Shiko koleksionin e plotë." },
    ],
  }),
  component: Shop,
});

function Shop() {
  const initial = Route.useSearch().filter;
  const [active, setActive] = useState<string>(initial);

  const products = useProducts();
  const categories = useCategories();

  const filters = [
    { key: "all", label: "Të Gjitha" },
    { key: "new", label: "Të Reja" },
    { key: "nen10", label: "Nën 10 €" },
    ...categories.map((c) => ({ key: c.toLowerCase(), label: c })),
    { key: "sale", label: "Zbritje" },
  ];

  const filtered = products.filter((p) => {
    if (active === "all") return true;
    if (active === "new") return p.isNew;
    if (active === "nen10") return p.price < 10;
    if (active === "sale") return p.onSale;
    return p.category.toLowerCase() === active.toLowerCase();
  });

  return (
    <>
      <SiteHeader />
      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-12">
        <div className="text-center mb-10">
          <p className="text-[11px] tracking-[0.3em] uppercase text-muted-foreground">Koleksioni</p>
          <h1 className="font-serif text-4xl sm:text-5xl md:text-6xl mt-2">
            <span className="font-script text-caramel">Aulona</span> Atelier
          </h1>
        </div>

        <div className="flex flex-nowrap sm:flex-wrap justify-start sm:justify-center gap-2 mb-10 sm:mb-12 border-y border-border py-3 sm:py-4 overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0">
          {filters.map((f) => (
            <button
              key={f.key}
              onClick={() => setActive(f.key)}
              className={`px-3 sm:px-4 py-2 text-[11px] sm:text-xs tracking-widest uppercase whitespace-nowrap transition-colors ${
                active === f.key ? "bg-foreground text-background" : "hover:text-caramel"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        <p className="text-xs text-muted-foreground mb-6">{filtered.length} produkte</p>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-4 gap-y-10">
          {filtered.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-20 text-muted-foreground">
            Asnjë produkt për këtë kategori.
          </div>
        )}

        <div className="mt-16 text-center">
          <Link
            to="/"
            className="text-xs tracking-widest uppercase border-b border-foreground pb-1 hover:text-caramel hover:border-caramel"
          >
            ← Kryefaqja
          </Link>
        </div>
      </div>
      <SiteFooter />
    </>
  );
}
