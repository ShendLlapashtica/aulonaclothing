import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { useCart } from "@/lib/cart-store";
import { type ShippingCountry } from "@/lib/products";
import { useProducts, useShippingRates, useAddOrder, WHATSAPP_NUMBER } from "@/lib/store";
import { Minus, Plus, X } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Flag } from "@/components/flag";
import { CheckoutDialog } from "@/components/checkout-dialog";
import { toast } from "sonner";

export function CartDrawer() {
  const { isOpen, close, items, updateQty, remove, subtotal, count, clear } = useCart();
  const products = useProducts();
  const shippingRates = useShippingRates();
  const addOrder = useAddOrder();
  const [country, setCountry] = useState<ShippingCountry>("XK");
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const shipping = shippingRates[country].price;
  const total = subtotal + (items.length ? shipping : 0);

  const sendWhatsApp = async () => {
    if (items.length === 0) return;
    const lines = items
      .map((i) => {
        const p = products.find((product) => product.id === i.productId);
        if (!p) return "";
        return `• ${p.name} (Masa ${i.size}) x${i.qty} — ${(p.price * i.qty).toFixed(2)} €`;
      })
      .filter(Boolean);
    const msg =
      `Përshëndetje Aulonaclothing! 👗\n\nDëshiroj të porosis:\n\n${lines.join("\n")}\n\n` +
      `Nëntotali: ${subtotal.toFixed(2)} €\n` +
      `Transporti (${shippingRates[country].label}): ${shipping === 0 ? "Falas" : shipping.toFixed(2) + " €"}\n` +
      `*Totali: ${total.toFixed(2)} €*\n\n` +
      `Ju lutem më konfirmoni disponueshmërinë dhe detajet e dërgesës. Faleminderit!`;
    const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(msg)}`;

    const orderId = `AUL-${Date.now().toString().slice(-4)}`;
    try {
      await addOrder.mutateAsync({
        id: orderId,
        customer: "WhatsApp klient",
        country,
        items: items.reduce((s, i) => s + i.qty, 0),
        subtotal,
        shipping,
        total,
        status: "Në përgatitje",
        date: new Date().toISOString().slice(0, 10),
        paymentMethod: "whatsapp",
      });
    } catch {
      toast("Porosia nuk u regjistrua, por mund të vazhdoni në WhatsApp");
    }

    window.open(url, "_blank", "noopener,noreferrer");
    clear();
    close();
  };

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
            <button
              onClick={sendWhatsApp}
              className="w-full h-12 bg-[#25D366] text-white hover:bg-[#1ebe5a] transition-colors tracking-widest uppercase text-xs inline-flex items-center justify-center gap-2"
            >
              <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor" aria-hidden="true">
                <path d="M20.52 3.48A11.87 11.87 0 0012.05 0C5.5 0 .17 5.33.17 11.88c0 2.09.55 4.13 1.6 5.93L0 24l6.34-1.66a11.86 11.86 0 005.7 1.45h.01c6.55 0 11.88-5.33 11.88-11.88 0-3.17-1.24-6.15-3.41-8.43zM12.05 21.3h-.01a9.4 9.4 0 01-4.79-1.31l-.34-.2-3.76.99 1-3.66-.22-.37a9.4 9.4 0 01-1.44-5.02c0-5.2 4.24-9.43 9.44-9.43 2.52 0 4.89.98 6.67 2.77a9.36 9.36 0 012.77 6.67c0 5.2-4.24 9.43-9.44 9.43zm5.16-7.05c-.28-.14-1.67-.82-1.93-.92-.26-.1-.45-.14-.63.14-.19.28-.72.92-.89 1.11-.16.19-.33.21-.61.07-.28-.14-1.19-.44-2.27-1.4-.84-.75-1.4-1.67-1.57-1.95-.16-.28-.02-.43.12-.57.13-.13.28-.33.42-.5.14-.16.19-.28.28-.47.09-.19.05-.35-.02-.5-.07-.14-.63-1.52-.86-2.08-.23-.55-.46-.48-.63-.49l-.54-.01c-.19 0-.5.07-.76.35s-1 .98-1 2.38 1.02 2.76 1.16 2.95c.14.19 2.01 3.07 4.87 4.31.68.29 1.21.46 1.63.59.68.22 1.31.19 1.8.11.55-.08 1.67-.68 1.9-1.34.24-.66.24-1.22.16-1.34-.07-.13-.26-.2-.54-.34z" />
              </svg>
              Porosit përmes WhatsApp
            </button>
            <Button
              onClick={() => setCheckoutOpen(true)}
              className="w-full rounded-none bg-foreground text-background hover:bg-foreground/90 h-11 tracking-widest uppercase text-[11px]"
            >
              Vazhdo në Pagesë
            </Button>
            <p className="text-[10px] text-center text-muted-foreground">
              Pagesa në dorëzim ose konfirmim përmes WhatsApp brenda 30 minutash.
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
