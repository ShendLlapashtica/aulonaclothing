import { createFileRoute, Link, notFound, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import {
  Heart,
  Truck,
  RotateCcw,
  ArrowLeft,
  ChevronRight,
  ShoppingBag,
  Shield,
  Sparkles,
  Ruler,
  MessageCircle,
} from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { useProducts, productsQueryOptions } from "@/lib/store";
import { useCart } from "@/lib/cart-store";
import { toast } from "sonner";

export const Route = createFileRoute("/product/$id")({
  loader: async ({ context, params }) => {
    const products = await context.queryClient.ensureQueryData(productsQueryOptions);
    const p = products.find((product) => product.id === params.id);
    if (!p) throw notFound();
    return { product: p };
  },
  head: ({ loaderData }) => {
    if (!loaderData) {
      return {
        meta: [
          { title: "Produkt i pagjetur — Aulonaclothing" },
          { name: "robots", content: "noindex" },
        ],
      };
    }
    const { product } = loaderData;
    const title = `${product.name} — Aulonaclothing`;
    const desc = `${product.category} · ${product.price.toFixed(2)} € — nga koleksioni Aulonaclothing.`;
    return {
      meta: [
        { title },
        { name: "description", content: desc },
        { property: "og:title", content: title },
        { property: "og:description", content: desc },
        { property: "og:image", content: product.images[0] },
        { name: "twitter:image", content: product.images[0] },
        { name: "twitter:card", content: "summary_large_image" },
        { property: "og:type", content: "product" },
      ],
    };
  },
  notFoundComponent: () => (
    <>
      <SiteHeader />
      <div className="mx-auto max-w-3xl px-6 py-24 text-center">
        <p className="text-[11px] tracking-[0.3em] uppercase text-muted-foreground">404</p>
        <h1 className="font-serif text-4xl mt-3">Produkti nuk u gjet</h1>
        <Link
          to="/shop"
          className="inline-block mt-8 text-xs tracking-widest uppercase border-b border-foreground pb-1 hover:text-caramel"
        >
          ← Kthehu në dyqan
        </Link>
      </div>
    </>
  ),
  errorComponent: ({ reset }) => (
    <>
      <SiteHeader />
      <div className="mx-auto max-w-3xl px-6 py-24 text-center">
        <h1 className="font-serif text-3xl">Diçka nuk shkoi</h1>
        <button
          onClick={() => reset()}
          className="mt-6 text-xs tracking-widest uppercase border-b border-foreground pb-1"
        >
          Provo përsëri
        </button>
      </div>
    </>
  ),
  component: ProductPage,
});

function ProductPage() {
  const { product } = Route.useLoaderData();
  const allProducts = useProducts();
  const { add } = useCart();
  const navigate = useNavigate();
  const [size, setSize] = useState<string | null>(
    product.sizes.length === 1 ? product.sizes[0] : null,
  );
  const [activeImage, setActiveImage] = useState(0);

  const related = allProducts
    .filter((p) => p.id !== product.id && p.category === product.category)
    .concat(allProducts.filter((p) => p.id !== product.id && p.category !== product.category))
    .slice(0, 8);

  const handleAdd = () => {
    if (!size) {
      toast("Ju lutem zgjidhni një masë");
      return;
    }
    add(product.id, size);
    toast("U shtua në shportë");
  };

  return (
    <>
      <SiteHeader />
      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-6 sm:py-10">
        {/* Breadcrumbs */}
        <nav className="flex items-center gap-1.5 text-[11px] tracking-widest uppercase text-muted-foreground mb-6">
          <Link to="/" className="hover:text-foreground">
            Kryefaqja
          </Link>
          <ChevronRight className="h-3 w-3" />
          <Link to="/shop" className="hover:text-foreground">
            Dyqani
          </Link>
          <ChevronRight className="h-3 w-3" />
          <span className="text-foreground truncate">{product.category}</span>
        </nav>

        <div className="grid md:grid-cols-2 gap-6 md:gap-12">
          {/* Images */}
          <div>
            <div className="aspect-[3/4] bg-secondary overflow-hidden">
              <img
                src={product.images[activeImage] ?? product.images[0]}
                alt={product.name}
                className="w-full h-full object-cover"
              />
            </div>
            {product.images.length > 1 && (
              <div className="mt-3 grid grid-cols-5 gap-2">
                {product.images.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveImage(i)}
                    aria-label={`Foto ${i + 1}`}
                    className={`aspect-[3/4] bg-secondary overflow-hidden border transition-colors ${
                      i === activeImage
                        ? "border-foreground"
                        : "border-transparent hover:border-border"
                    }`}
                  >
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Details */}
          <div className="space-y-6 md:sticky md:top-32 md:self-start">
            <div>
              <p className="text-[10px] tracking-[0.3em] uppercase text-muted-foreground">
                {product.category}
              </p>
              <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl mt-2 leading-tight">
                {product.name}
              </h1>
              <div className="flex items-baseline gap-3 mt-4">
                <span className={`text-xl ${product.onSale ? "text-burgundy font-medium" : ""}`}>
                  {product.price.toFixed(2)} €
                </span>
                {product.originalPrice && (
                  <span className="text-sm text-muted-foreground line-through">
                    {product.originalPrice.toFixed(2)} €
                  </span>
                )}
              </div>
            </div>

            <p className="text-sm text-muted-foreground leading-relaxed">
              Copë e përzgjedhur me kujdes nga atelieja Aulonaclothing. Pëlhurë e butë, prerje e
              menduar dhe detaje që dallohen — për një pamje elegante në çdo rast.
            </p>

            <div>
              <p className="text-[10px] tracking-widest uppercase text-muted-foreground mb-2">
                Masa
              </p>
              <div className="flex flex-wrap gap-2">
                {product.sizes.map((s: string) => (
                  <button
                    key={s}
                    onClick={() => setSize(s)}
                    className={`min-w-11 px-3 h-11 text-xs border transition-colors ${
                      size === s
                        ? "border-foreground bg-foreground text-background"
                        : "border-border hover:border-foreground/60"
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={handleAdd}
                disabled={product.stock === 0}
                className="flex-1 bg-foreground text-background py-4 text-xs tracking-widest uppercase hover:bg-caramel transition-colors disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center justify-center gap-2"
              >
                <ShoppingBag className="h-4 w-4" />
                {product.stock === 0 ? "Shitur" : "Shto në Shportë"}
              </button>
              <button
                aria-label="Shto tek të preferuarat"
                className="h-14 w-14 grid place-items-center border border-border hover:border-foreground transition-colors"
              >
                <Heart className="h-4 w-4" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-4 border-t border-border">
              <div className="flex items-start gap-2">
                <Truck className="h-4 w-4 mt-0.5 text-caramel shrink-0" />
                <div>
                  <p className="text-xs">Transport i shpejtë</p>
                  <p className="text-[10px] text-muted-foreground">Kosovë falas</p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <RotateCcw className="h-4 w-4 mt-0.5 text-caramel shrink-0" />
                <div>
                  <p className="text-xs">Kthim 14 ditë</p>
                  <p className="text-[10px] text-muted-foreground">pa telashe</p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <Shield className="h-4 w-4 mt-0.5 text-caramel shrink-0" />
                <div>
                  <p className="text-xs">Pagesë e sigurt</p>
                  <p className="text-[10px] text-muted-foreground">në dorëzim</p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <Sparkles className="h-4 w-4 mt-0.5 text-caramel shrink-0" />
                <div>
                  <p className="text-xs">Cilësi premium</p>
                  <p className="text-[10px] text-muted-foreground">e përzgjedhur</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Details sections — scroll-friendly */}
        <section className="mt-16 sm:mt-24 grid md:grid-cols-3 gap-8 sm:gap-12 border-t border-border pt-10 sm:pt-14">
          <div>
            <p className="text-[11px] tracking-[0.3em] uppercase text-muted-foreground">Detajet</p>
            <h3 className="font-serif text-2xl mt-2">Për këtë copë</h3>
            <p className="mt-4 text-sm text-muted-foreground leading-relaxed">
              {product.name} është pjesë e koleksionit tonë të përzgjedhur me kujdes. Prerja
              skulpturon në mënyrë të natyrshme, ndërsa pëlhura sillet e butë mbi lëkurë. Ideale për
              mbrëmje, dasma, darka romantike ose momente të veçanta ku dëshiron të ndihesh me
              elegancë pa përpjekje.
            </p>
            <ul className="mt-4 text-sm text-muted-foreground space-y-1.5 list-disc pl-4">
              <li>Pëlhurë premium, e butë në prekje</li>
              <li>Prerje që zgjatë siluetën</li>
              <li>Detaje të punuara me dorë</li>
              <li>Kategori: {product.category}</li>
            </ul>
          </div>

          <div>
            <p className="text-[11px] tracking-[0.3em] uppercase text-muted-foreground">Kujdesi</p>
            <h3 className="font-serif text-2xl mt-2">Si të mbahet</h3>
            <ul className="mt-4 text-sm text-muted-foreground space-y-2">
              <li>· Lani me dorë ose në makinë në 30°C, program delikat</li>
              <li>· Mos përdorni zbardhues</li>
              <li>· Hekurosje në temperaturë të ulët, nga ana e brendshme</li>
              <li>· Thani në hije, jo direkt në diell</li>
              <li>· Ruani të varur për të ruajtur formën</li>
            </ul>
          </div>

          <div>
            <p className="text-[11px] tracking-[0.3em] uppercase text-muted-foreground">Masat</p>
            <h3 className="font-serif text-2xl mt-2 flex items-center gap-2">
              <Ruler className="h-5 w-5 text-caramel" /> Udhëzues
            </h3>
            <div className="mt-4 text-sm text-muted-foreground">
              <div className="grid grid-cols-3 gap-2 border-b border-border pb-2 font-medium text-foreground text-xs uppercase tracking-widest">
                <span>Masë</span>
                <span>Gjoks</span>
                <span>Bel</span>
              </div>
              {[
                ["XS / 36", "80 cm", "60 cm"],
                ["S / 38", "84 cm", "64 cm"],
                ["M / 40", "88 cm", "68 cm"],
                ["L / 42", "92 cm", "72 cm"],
                ["XL / 44", "96 cm", "76 cm"],
              ].map(([s, b, w]) => (
                <div key={s} className="grid grid-cols-3 gap-2 py-1.5 border-b border-border/60">
                  <span>{s}</span>
                  <span>{b}</span>
                  <span>{w}</span>
                </div>
              ))}
              <p className="mt-3 text-[11px]">
                Nëse je mes dy masave, zgjidh më të madhen për një pamje më të rehatshme.
              </p>
            </div>
          </div>
        </section>

        {/* Shipping / promise strip */}
        <section className="mt-14 bg-sand rounded-sm p-6 sm:p-10 grid sm:grid-cols-3 gap-6 text-center">
          <div>
            <Truck className="h-5 w-5 mx-auto text-caramel" />
            <p className="mt-2 text-xs tracking-widest uppercase">Transport i shpejtë</p>
            <p className="text-xs text-muted-foreground mt-1">Kosovë falas · 🇦🇱 5€ · 🇲🇰 5€</p>
          </div>
          <div>
            <RotateCcw className="h-5 w-5 mx-auto text-caramel" />
            <p className="mt-2 text-xs tracking-widest uppercase">Kthim brenda 14 ditësh</p>
            <p className="text-xs text-muted-foreground mt-1">Pa pyetje shtesë</p>
          </div>
          <div>
            <MessageCircle className="h-5 w-5 mx-auto text-caramel" />
            <p className="mt-2 text-xs tracking-widest uppercase">Këshillim personal</p>
            <p className="text-xs text-muted-foreground mt-1">Na shkruaj në WhatsApp</p>
          </div>
        </section>

        {/* Related — scrollable strip */}
        <section className="mt-16 sm:mt-24 border-t border-border pt-10">
          <div className="flex items-baseline justify-between mb-6">
            <div>
              <p className="text-[11px] tracking-[0.3em] uppercase text-muted-foreground">
                Ju gjithashtu mund të pëlqeni
              </p>
              <h2 className="font-serif text-2xl sm:text-3xl mt-2">
                <span className="font-script text-caramel">Zgjedhur</span> për ju
              </h2>
            </div>
            <Link
              to="/shop"
              search={{ filter: "all" }}
              className="text-[11px] tracking-widest uppercase hover:text-caramel"
            >
              Të gjitha →
            </Link>
          </div>
          <div className="flex gap-4 overflow-x-auto -mx-4 sm:-mx-6 px-4 sm:px-6 pb-4 snap-x">
            {related.map((r) => (
              <button
                key={r.id}
                onClick={() => navigate({ to: "/product/$id", params: { id: r.id } })}
                className="shrink-0 w-40 sm:w-52 text-left snap-start group"
              >
                <div className="aspect-[3/4] bg-secondary overflow-hidden">
                  <img
                    src={r.images[0]}
                    alt={r.name}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                </div>
                <p className="text-[10px] tracking-widest uppercase text-muted-foreground mt-3">
                  {r.category}
                </p>
                <p className="font-serif text-sm sm:text-base mt-1 line-clamp-2 group-hover:text-caramel transition-colors">
                  {r.name}
                </p>
                <p className="text-xs mt-1">{r.price.toFixed(2)} €</p>
              </button>
            ))}
          </div>
        </section>

        <div className="mt-12 text-center">
          <Link
            to="/shop"
            search={{ filter: "all" }}
            className="inline-flex items-center gap-2 text-xs tracking-widest uppercase border-b border-foreground pb-1 hover:text-caramel hover:border-caramel"
          >
            <ArrowLeft className="h-3 w-3" /> Kthehu në dyqan
          </Link>
        </div>
      </div>

      <SiteFooter />
    </>
  );
}
