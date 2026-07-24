import { createFileRoute } from "@tanstack/react-router";
import { useProducts, useOrders, useShippingRates } from "@/lib/store";
import { Package, ShoppingBag, Euro } from "lucide-react";
import { Flag } from "@/components/flag";

export const Route = createFileRoute("/admin/")({
  component: Overview,
});

function Overview() {
  const products = useProducts();
  const mockOrders = useOrders();
  const shippingRates = useShippingRates();
  const revenue = mockOrders.reduce((s, o) => s + o.total, 0);
  const orders = mockOrders.length;
  const activeProducts = products.filter((p) => p.stock > 0).length;
  const lowStock = products.filter((p) => p.stock < 6);

  const cards = [
    { label: "Të Ardhurat Totale", value: `${revenue.toFixed(2)} €`, icon: Euro, trend: "+12.4%" },
    { label: "Porositë Totale", value: orders, icon: ShoppingBag, trend: "+3 sot" },
    {
      label: "Produkte Aktive",
      value: activeProducts,
      icon: Package,
      trend: `${products.length} total`,
    },
  ];

  return (
    <div className="p-4 sm:p-6 md:p-10 space-y-6 sm:space-y-8">
      <div>
        <p className="text-[11px] tracking-[0.3em] uppercase text-muted-foreground">Përshëndetje</p>
        <h1 className="font-serif text-3xl sm:text-4xl mt-2">
          <span className="font-script text-caramel">Përmbledhja</span> e sotme
        </h1>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
        {cards.map((c) => {
          const Icon = c.icon;
          return (
            <div key={c.label} className="bg-card border border-border p-4 sm:p-5">
              <div className="flex items-center justify-between mb-3 sm:mb-4 gap-2">
                <Icon className="h-4 w-4 sm:h-5 sm:w-5 text-caramel shrink-0" />
                <span className="text-[9px] sm:text-[10px] tracking-widest uppercase text-muted-foreground truncate">
                  {c.trend}
                </span>
              </div>
              <p className="font-serif text-2xl sm:text-3xl">{c.value}</p>
              <p className="text-[11px] sm:text-xs text-muted-foreground mt-1">{c.label}</p>
            </div>
          );
        })}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-card border border-border">
          <div className="px-5 py-4 border-b border-border flex items-center justify-between">
            <h2 className="font-serif text-xl">Porositë e Fundit</h2>
            <span className="text-[10px] tracking-widest uppercase text-muted-foreground">
              5 më të fundit
            </span>
          </div>
          <div className="divide-y divide-border">
            {mockOrders.map((o) => (
              <div key={o.id} className="px-5 py-4 flex items-center justify-between gap-4">
                <div className="min-w-0">
                  <p className="text-sm font-medium">{o.id}</p>
                  <p className="text-xs text-muted-foreground truncate flex items-center gap-1.5">
                    <span>{o.customer} ·</span>
                    <Flag code={o.country} className="h-2.5 w-4" />
                    <span>{shippingRates[o.country].label}</span>
                  </p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-sm">{o.total.toFixed(2)} €</p>
                  <p className="text-[10px] tracking-widest uppercase text-muted-foreground">
                    {o.status}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-card border border-border">
          <div className="px-5 py-4 border-b border-border">
            <h2 className="font-serif text-xl">Stok i Ulët</h2>
          </div>
          <div className="divide-y divide-border">
            {lowStock.length === 0 && (
              <p className="px-5 py-4 text-sm text-muted-foreground">
                Të gjitha produktet me stok të mirë.
              </p>
            )}
            {lowStock.map((p) => (
              <div key={p.id} className="px-5 py-3 flex items-center gap-3">
                <img
                  src={p.images[0]}
                  alt=""
                  className="w-10 h-14 object-cover bg-secondary shrink-0"
                />
                <div className="min-w-0 flex-1">
                  <p className="text-sm truncate">{p.name}</p>
                  <p className="text-xs text-burgundy">Vetëm {p.stock} copë</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
