import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { ProductCard } from "@/components/product-card";
import {
  useProducts,
  useCategories,
  productsQueryOptions,
  categoriesQueryOptions,
} from "@/lib/store";
import heroImage from "@/assets/hero-blue-dress.png";

export const Route = createFileRoute("/")({
  loader: async ({ context }) => {
    await Promise.all([
      context.queryClient.ensureQueryData(productsQueryOptions),
      context.queryClient.ensureQueryData(categoriesQueryOptions),
    ]);
  },
  head: () => ({
    meta: [
      { title: "Aulonaclothing — Koleksioni i Ri i Verës" },
      {
        name: "description",
        content:
          "Zbulo koleksionin editorial të Aulonaclothing: fustane sateni, sete elegante dhe denim me stil luksoz-minimalist.",
      },
      { property: "og:title", content: "Aulonaclothing — Koleksioni i Ri i Verës" },
      {
        property: "og:description",
        content:
          "Zbulo koleksionin editorial të Aulonaclothing: fustane sateni, sete elegante dhe denim me stil luksoz-minimalist.",
      },
    ],
  }),
  component: Home,
});

function Home() {
  const products = useProducts();
  const categories = useCategories();
  const featured = products.slice(0, 8);

  const editorial = products[4] ?? products[0];

  return (
    <>
      <SiteHeader />

      {/* Hero */}
      <section className="relative">
        <div className="grid md:grid-cols-2 md:min-h-[80vh]">
          <div className="order-2 md:order-1 flex items-center justify-center p-6 sm:p-10 md:p-20 bg-sand">
            <div className="max-w-md">
              <p className="text-[11px] tracking-[0.3em] uppercase text-muted-foreground mb-4 sm:mb-6">
                Koleksioni i Verës · 2026
              </p>
              <h1 className="font-serif text-4xl sm:text-5xl md:text-6xl leading-[1.05]">
                Plans for tonight?
                <span className="font-script text-caramel block text-5xl sm:text-6xl md:text-7xl mt-2">
                  Find your perfect outfit
                </span>
                <span className="block mt-2">with us.</span>
              </h1>
              <p className="mt-5 sm:mt-6 text-sm sm:text-base text-muted-foreground leading-relaxed">
                Copa të përzgjedhura me kujdes — nga saten i pastër te draperi që rrjedh si valë,
                për një pamje elegante në çdo rast.
              </p>
              <div className="mt-6 sm:mt-8 flex flex-wrap gap-3">
                <Link
                  to="/shop"
                  className="bg-foreground text-background px-6 sm:px-8 py-3 sm:py-4 text-xs tracking-widest uppercase hover:bg-caramel transition-colors"
                >
                  Shiko Koleksionin
                </Link>
                <Link
                  to="/shop"
                  search={{ filter: "fustane" }}
                  className="border border-foreground px-6 sm:px-8 py-3 sm:py-4 text-xs tracking-widest uppercase hover:bg-foreground hover:text-background transition-colors"
                >
                  Fustanet
                </Link>
              </div>
            </div>
          </div>
          <div className="order-1 md:order-2 relative aspect-[4/5] md:aspect-auto md:min-h-full bg-taupe overflow-hidden">
            <img
              src={heroImage}
              alt="Fustan blu i qetë me çarje anësore — koleksioni i verës"
              className="absolute inset-0 h-full w-full object-cover object-top"
            />
            {/* Bottom gradient morph into sand section */}
            <div className="pointer-events-none absolute inset-x-0 bottom-0 h-40 sm:h-56 bg-gradient-to-b from-transparent via-sand/60 to-sand" />
            {/* Left gradient morph on desktop into the sand copy panel */}
            <div className="pointer-events-none hidden md:block absolute inset-y-0 left-0 w-40 bg-gradient-to-r from-sand via-sand/40 to-transparent" />
            <span className="absolute bottom-6 right-6 font-script text-foreground/80 text-2xl">
              Aulona
            </span>
          </div>
        </div>
      </section>

      {/* Quick picks */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 pt-10 sm:pt-14">
        <div className="grid grid-cols-2 gap-3 sm:gap-4">
          <Link
            to="/shop"
            search={{ filter: "nen10" }}
            className="group bg-secondary aspect-[16/9] sm:aspect-[2/1] flex items-end justify-between p-4 sm:p-6 relative overflow-hidden"
          >
            <span className="font-serif text-xl sm:text-2xl md:text-3xl relative z-10 group-hover:text-caramel transition-colors">
              Nën 10 €
            </span>
            <span className="text-[9px] sm:text-[10px] tracking-widest uppercase text-muted-foreground">
              Shiko →
            </span>
          </Link>
          <Link
            to="/shop"
            search={{ filter: "new" }}
            className="group bg-secondary aspect-[16/9] sm:aspect-[2/1] flex items-end justify-between p-4 sm:p-6 relative overflow-hidden"
          >
            <span className="font-serif text-xl sm:text-2xl md:text-3xl relative z-10 group-hover:text-caramel transition-colors">
              Arritje të reja
            </span>
            <span className="text-[9px] sm:text-[10px] tracking-widest uppercase text-muted-foreground">
              Shiko →
            </span>
          </Link>
        </div>
      </section>

      {/* Categories */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 py-10 sm:py-14">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-3">
          {categories.map((c) => (
            <Link
              key={c}
              to="/shop"
              search={{ filter: c.toLowerCase() }}
              className="group bg-secondary aspect-[5/4] sm:aspect-[4/3] flex items-end justify-between p-3 sm:p-4 relative overflow-hidden"
            >
              <span className="font-serif text-base sm:text-lg relative z-10 group-hover:text-caramel transition-colors">
                {c}
              </span>
              <span className="text-[9px] sm:text-[10px] tracking-widest uppercase text-muted-foreground">
                Shiko →
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* Featured */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 pb-20">
        <div className="text-center mb-12">
          <p className="text-[11px] tracking-[0.3em] uppercase text-muted-foreground">
            Zgjedhur për ju
          </p>
          <h2 className="font-serif text-4xl md:text-5xl mt-3">
            <span className="font-script text-caramel">Favoritet</span> e sezonit
          </h2>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-4 gap-y-10">
          {featured.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      </section>

      {/* Editorial banner */}
      {editorial && (
        <section className="bg-taupe">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 py-20 grid md:grid-cols-2 gap-12 items-center">
            <img src={editorial.image} alt="" className="aspect-[3/4] object-cover w-full" />
            <div>
              <p className="text-[11px] tracking-[0.3em] uppercase text-muted-foreground">
                Editoriale
              </p>
              <h2 className="font-serif text-4xl md:text-5xl mt-3 leading-tight">
                Elegancë e <span className="font-script text-caramel">artizanuar</span> pa
                përpjekje.
              </h2>
              <p className="mt-6 text-muted-foreground leading-relaxed">
                Çdo copë kalon nëpër duart tona përpara se të mbërrijë tek ju. Pëlhurat e zgjedhura,
                prerjet e menduara dhe detajet e vogla janë ato që bëjnë Aulonaclothing.
              </p>
              <Link
                to="/shop"
                className="inline-block mt-8 border-b border-foreground pb-1 text-xs tracking-widest uppercase hover:text-caramel hover:border-caramel transition-colors"
              >
                Zbulo Historinë
              </Link>
            </div>
          </div>
        </section>
      )}

      <SiteFooter />
    </>
  );
}
