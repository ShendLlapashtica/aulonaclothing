import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useCart } from "@/lib/cart-store";
import { type ShippingCountry } from "@/lib/products";
import { useProducts, useShippingRates, useAddOrder } from "@/lib/store";
import { Flag } from "@/components/flag";
import { Check } from "lucide-react";

type Props = {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  country: ShippingCountry;
  onDone: () => void;
};

export function CheckoutDialog({ open, onOpenChange, country, onDone }: Props) {
  const { items, subtotal, clear } = useCart();
  const products = useProducts();
  const shippingRates = useShippingRates();
  const addOrder = useAddOrder();
  const shipping = shippingRates[country].price;
  const total = subtotal + (items.length ? shipping : 0);

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [notes, setNotes] = useState("");
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const reset = () => {
    setName("");
    setPhone("");
    setAddress("");
    setCity("");
    setNotes("");
    setSuccess(null);
    setError(null);
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!name.trim() || !phone.trim() || !address.trim() || !city.trim()) {
      setError("Ju lutem plotësoni të gjitha fushat e detyrueshme.");
      return;
    }
    if (items.length === 0) {
      setError("Shporta është bosh.");
      return;
    }
    const orderId = `AUL-${Date.now().toString().slice(-5)}`;
    try {
      await addOrder.mutateAsync({
        id: orderId,
        customer: name.trim(),
        country,
        items: items.reduce((s, i) => s + i.qty, 0),
        subtotal,
        shipping,
        total,
        status: "Në përgatitje",
        date: new Date().toISOString().slice(0, 10),
        phone: phone.trim(),
        address: address.trim(),
        city: city.trim(),
        notes: notes.trim() || undefined,
        paymentMethod: "cod",
        lineItems: items.map((i) => {
          const p = products.find((product) => product.id === i.productId);
          return {
            name: p?.name ?? i.productId,
            size: i.size,
            qty: i.qty,
            price: p?.price ?? 0,
          };
        }),
      });
      setSuccess(orderId);
      clear();
    } catch {
      setError("Porosia nuk u regjistrua. Ju lutem provoni përsëri.");
    }
  };

  const handleClose = (o: boolean) => {
    if (!o) {
      if (success) onDone();
      reset();
    }
    onOpenChange(o);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-lg bg-background max-h-[92vh] overflow-y-auto">
        {success ? (
          <div className="text-center py-6 space-y-4">
            <div className="mx-auto w-14 h-14 rounded-full bg-caramel/15 text-caramel flex items-center justify-center">
              <Check className="h-7 w-7" />
            </div>
            <DialogHeader>
              <DialogTitle className="font-serif text-2xl font-normal text-center">
                Faleminderit,{" "}
                <span className="font-script text-caramel">{name.split(" ")[0] || "e dashur"}</span>
                !
              </DialogTitle>
              <DialogDescription className="text-center">
                Porosia <span className="font-medium text-foreground">{success}</span> u regjistrua
                me sukses. Do t'ju kontaktojmë së shpejti për konfirmim dhe dërgesë.
              </DialogDescription>
            </DialogHeader>
            <Button
              className="rounded-none bg-foreground text-background hover:bg-foreground/90 tracking-widest uppercase text-[11px] h-11 px-8"
              onClick={() => handleClose(false)}
            >
              Mbyll
            </Button>
          </div>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle className="font-serif text-2xl font-normal">
                Përfundo <span className="font-script text-caramel">porosinë</span>
              </DialogTitle>
              <DialogDescription>
                Pagesa në dorëzim (Cash on Delivery). Plotësoni të dhënat për dërgesë.
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={submit} className="space-y-4 mt-2">
              <div className="grid gap-2">
                <Label htmlFor="co-name">Emri i plotë *</Label>
                <Input
                  id="co-name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="p.sh. Filan Fisteku"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="co-phone">Numri i telefonit *</Label>
                <Input
                  id="co-phone"
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+383 44 000 000"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="co-address">Adresa *</Label>
                <Input
                  id="co-address"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Rruga, numri, banesa"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="grid gap-2">
                  <Label htmlFor="co-city">Qyteti *</Label>
                  <Input
                    id="co-city"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="Prishtinë"
                  />
                </div>
                <div className="grid gap-2">
                  <Label>Vendi</Label>
                  <div className="h-10 border border-input px-3 flex items-center gap-2 bg-secondary/40 text-sm">
                    <Flag code={country} className="h-3 w-5" />
                    <span>{shippingRates[country].label}</span>
                  </div>
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="co-notes">Shënim (opsional)</Label>
                <Textarea
                  id="co-notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Detaje shtesë për dërgesë..."
                  rows={3}
                />
              </div>

              <div className="border-t border-border pt-4 space-y-1 text-sm">
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

              {error && <p className="text-xs text-burgundy">{error}</p>}

              <Button
                type="submit"
                disabled={addOrder.isPending}
                className="w-full rounded-none bg-foreground text-background hover:bg-foreground/90 h-12 tracking-widest uppercase text-[11px] disabled:opacity-50"
              >
                {addOrder.isPending ? "Duke dërguar..." : "Konfirmo Porosinë"}
              </Button>
              <p className="text-[10px] text-center text-muted-foreground">
                Pagesa bëhet në dorëzim (cash). Nuk kërkohen të dhëna karte.
              </p>
            </form>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
