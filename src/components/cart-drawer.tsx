import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { useCart } from "@/lib/cart-store";
import { type ShippingCountry } from "@/lib/products";
import { useProducts, useShippingRates } from "@/lib/store";
import { Minus, Plus, X } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Flag } from "@/components/flag";
import { CheckoutDialog } from "@/components/checkout-dialog";

export function CartDrawer() {
  const { isOpen, close, items, updateQty, remove, subtotal, count } = useCart();
  const products = useProducts();
  const shippingRates = useShippingRates();
  const [country, setCountry] = useState<ShippingCountry>("XK");
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const shipping = shippingRates[country].price;
  const total = subtotal + (items.length ? shipping : 0);

  return (
    <Sheet open={isOpen} onOpenChange={(o) => (o ? null : close())}>
      <SheetContent className="w-full sm:max-w-md bg-background flex flex-col p-0">
        <SheetHeader className="px-6 py-5 border-b border-border">
          <SheetTitle className="font-serif text-2xl font-normal">Shporta ({count})</SheetTitle>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto px-6 py-4">
          {items.length === 0 ? (
            <p className="text-muted-foreground text-sm text-center py-16">
              Shporta juaj është bosh.
            </p>
          ) : (
            <ul className="space-y-5">
              {items.map((i) => {
                const p = products.find((product) => product.id === i.productId);
                if (!p) return null;
                return (
                  <li key={`${i.productId}-${i.size}`} className="flex gap-4">
                    <img
                      src={p.images[0]}
                      alt={p.name}
                      className="w-20 h-28 object-cover bg-secondary"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between gap-2">
                        <p className="text-sm font-medium truncate">{p.name}</p>
                        <button
                          onClick={() => remove(i.productId, i.size)}
                          className="text-muted-foreground hover:text-foreground shrink-0"
                          aria-label="Hiq"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">Masa: {i.size}</p>
                      <div className="flex items-center justify-between mt-3">
                        <div className="flex items-center border border-border">
                          <button
                            className="px-2 py-1 hover:bg-secondary"
                            onClick={() => updateQty(i.productId, i.size, i.qty - 1)}
                          >
                            <Minus className="h-3 w-3" />
                          </button>
                          <span className="px-3 text-sm">{i.qty}</span>
                          <button
                            className="px-2 py-1 hover:bg-secondary"
                            onClick={() => updateQty(i.productId, i.size, i.qty + 1)}
                          >
                            <Plus className="h-3 w-3" />
                          </button>
                        </div>
                        <p className="text-sm">{(p.price * i.qty).toFixed(2)} €</p>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        {items.length > 0 && (
          <div className="border-t border-border px-6 py-5 space-y-4 bg-secondary/40">
            <div>
              <p className="text-xs uppercase tracking-widest text-muted-foreground mb-2">
                Vendi i dërgesës
              </p>
              <div className="grid grid-cols-3 gap-2">
                {(Object.keys(shippingRates) as ShippingCountry[]).map((c) => (
                  <button
                    key={c}
                    onClick={() => setCountry(c)}
                    className={`text-xs py-2 border transition-colors flex items-center justify-center gap-1.5 ${
                      country === c
                        ? "border-foreground bg-foreground text-background"
                        : "border-border hover:border-foreground/50"
                    }`}
                  >
                    <Flag code={c} className="h-3 w-4" />
                    <span>{shippingRates[c].label}</span>
                  </button>
                ))}
              </div>
            </div>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between text-muted-foreground">
                <span>Nëntotali</span>
                <span>{subtotal.toFixed(2)} €</span>
              </div>
              <div className="flex justify-between text-muted-foreground">
                <span>Transporti</span>
                <span>{shipping === 0 ? "Falas" : `${shipping.toFixed(2)} €`}</span>
              </div>
              <div className="flex justify-between font-serif text-lg pt-2 border-t border-border">
                <span>Totali</span>
                <span>{total.toFixed(2)} €</span>
              </div>
            </div>
            <Button
              onClick={() => setCheckoutOpen(true)}
              className="w-full rounded-none bg-foreground text-background hover:bg-foreground/90 h-11 tracking-widest uppercase text-[11px]"
            >
              Vazhdo në Pagesë
            </Button>
            <p className="text-[10px] text-center text-muted-foreground">
              Pagesa bëhet në dorëzim (cash).
            </p>
          </div>
        )}
      </SheetContent>
      <CheckoutDialog
        open={checkoutOpen}
        onOpenChange={setCheckoutOpen}
        country={country}
        onDone={close}
      />
    </Sheet>
  );
}
