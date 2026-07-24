import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { Heart, Eye, ShoppingBag } from "lucide-react";
import { useCart } from "@/lib/cart-store";
import type { Product } from "@/lib/products";
import { toast } from "sonner";

export function ProductCard({ product }: { product: Product }) {
  const { add } = useCart();
  const [size, setSize] = useState<string | null>(
    product.sizes.length === 1 ? product.sizes[0] : null,
  );
  const [wished, setWished] = useState(false);

  const handleAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!size) {
      toast("Ju lutem zgjidhni një masë");
      return;
    }
    add(product.id, size);
  };

  const toggleWish = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setWished((w) => !w);
    toast(wished ? "Hequr nga të preferuarat" : "Shtuar tek të preferuarat");
  };

  const discount = product.originalPrice
    ? Math.round((1 - product.price / product.originalPrice) * 100)
    : 0;

  return (
    <article className="group relative">
      {/* Media */}
      <div className="relative overflow-hidden bg-secondary aspect-[3/4] rounded-sm">
        <Link
          to="/product/$id"
          params={{ id: product.id }}
          aria-label={`Shiko ${product.name}`}
          className="absolute inset-0 z-0 block"
        >
          <img
            src={product.images[0]}
            alt={product.name}
            loading="lazy"
            className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.06]"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-foreground/25 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        </Link>

        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-1 pointer-events-none">
          {product.isNew && (
            <span className="bg-background/95 backdrop-blur text-foreground text-[10px] tracking-[0.2em] uppercase px-2.5 py-1 rounded-sm shadow-sm">
              E Re
            </span>
          )}
          {product.onSale && (
            <span className="bg-burgundy text-background text-[10px] tracking-[0.2em] uppercase px-2.5 py-1 rounded-sm shadow-sm">
              {discount > 0 ? `-${discount}%` : "Zbritje"}
            </span>
          )}
          {product.stock > 0 && product.stock < 6 && (
            <span className="bg-caramel text-background text-[10px] tracking-[0.2em] uppercase px-2.5 py-1 rounded-sm shadow-sm">
              Vetëm {product.stock}
            </span>
          )}
        </div>

        {/* Actions column */}
        <div className="absolute top-3 right-3 flex flex-col gap-2 z-10">
          <button
            onClick={toggleWish}
            aria-label="Shto tek të preferuarat"
            className="h-9 w-9 grid place-items-center bg-background/95 backdrop-blur hover:bg-foreground hover:text-background transition-colors rounded-full shadow-sm"
          >
            <Heart className={`h-4 w-4 ${wished ? "fill-burgundy text-burgundy" : ""}`} />
          </button>
          <Link
            to="/product/$id"
            params={{ id: product.id }}
            aria-label="Shiko produktin"
            className="h-9 w-9 grid place-items-center bg-background/95 backdrop-blur hover:bg-foreground hover:text-background transition-colors rounded-full shadow-sm sm:opacity-0 sm:group-hover:opacity-100 sm:-translate-y-1 sm:group-hover:translate-y-0 duration-300"
          >
            <Eye className="h-4 w-4" />
          </Link>
        </div>

        {/* Add to cart CTA */}
        <div className="absolute inset-x-3 bottom-3 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-all sm:translate-y-3 sm:group-hover:translate-y-0 duration-300 z-10">
          <button
            onClick={handleAdd}
            className="w-full bg-foreground text-background text-[11px] tracking-[0.2em] uppercase py-3 hover:bg-caramel transition-colors inline-flex items-center justify-center gap-2 rounded-sm shadow-lg"
          >
            <ShoppingBag className="h-3.5 w-3.5" />
            Shto në Shportë
          </button>
        </div>

        {product.stock === 0 && (
          <div className="absolute inset-0 grid place-items-center bg-background/70 backdrop-blur-sm pointer-events-none">
            <span className="text-[11px] tracking-[0.3em] uppercase bg-foreground text-background px-4 py-2">
              Shitur
            </span>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="pt-4 space-y-2">
        <p className="text-[10px] tracking-[0.25em] uppercase text-muted-foreground">
          {product.category}
        </p>
        <Link to="/product/$id" params={{ id: product.id }} className="text-left w-full block">
          <h3 className="font-serif text-base sm:text-lg leading-tight line-clamp-2 hover:text-caramel transition-colors">
            {product.name}
          </h3>
        </Link>
        <div className="flex items-baseline gap-2">
          <span
            className={`text-sm ${product.onSale ? "text-burgundy font-medium" : "font-medium"}`}
          >
            {product.price.toFixed(2)} €
          </span>
          {product.originalPrice && (
            <span className="text-xs text-muted-foreground line-through">
              {product.originalPrice.toFixed(2)} €
            </span>
          )}
        </div>
        <div className="flex flex-wrap gap-1.5 pt-1">
          {product.sizes.map((s) => (
            <button
              key={s}
              onClick={(e) => {
                e.preventDefault();
                setSize(s);
              }}
              className={`min-w-8 px-2 h-7 text-[11px] border rounded-sm transition-colors ${
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
    </article>
  );
}
