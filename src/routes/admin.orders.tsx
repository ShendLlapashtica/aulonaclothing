import { createFileRoute } from "@tanstack/react-router";
import { useOrders, useShippingRates, useUpdateOrderStatus, useRemoveOrder } from "@/lib/store";
import { Flag } from "@/components/flag";
import { useState } from "react";
import { ChevronDown, Phone, MapPin, MessageSquare, Package, Trash2 } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/orders")({
  component: AdminOrders,
});

const statusColor: Record<string, string> = {
  Dërguar: "bg-secondary text-foreground",
  "Në transit": "bg-caramel/20 text-caramel",
  "Në përgatitje": "bg-burgundy/10 text-burgundy",
  Anuluar: "bg-muted text-muted-foreground",
};

const STATUSES = ["Në përgatitje", "Në transit", "Dërguar", "Anuluar"];

function AdminOrders() {
  const orders = useOrders();
  const shippingRates = useShippingRates();
  const updateOrderStatus = useUpdateOrderStatus();
  const removeOrder = useRemoveOrder();
  const [expanded, setExpanded] = useState<string | null>(null);

  const remove = async (id: string) => {
    if (!window.confirm(`Të fshihet porosia ${id}? Ky veprim nuk kthehet mbrapsht.`)) return;
    try {
      await removeOrder.mutateAsync(id);
      toast("Porosia u fshi");
    } catch {
      toast("Fshirja dështoi");
    }
  };

  const groups = STATUSES.map((status) => ({
    status,
    orders: orders.filter((o) => o.status === status),
  })).filter((g) => g.orders.length > 0);

  return (
    <div className="p-4 sm:p-6 md:p-10 space-y-6 sm:space-y-8">
      <div>
        <p className="text-[11px] tracking-[0.3em] uppercase text-muted-foreground">Menaxhimi</p>
        <h1 className="font-serif text-3xl sm:text-4xl mt-2">
          <span className="font-script text-caramel">Porositë</span> e klientëve
        </h1>
        <p className="text-sm text-muted-foreground mt-2">
          {orders.length === 0 ? "Ende asnjë porosi." : `Gjithsej ${orders.length} porosi.`}
        </p>
      </div>

      {groups.map((group) => (
        <div key={group.status} className="space-y-2">
          <div className="flex items-center gap-2">
            <h2 className="text-[11px] tracking-[0.3em] uppercase text-muted-foreground">
              {group.status}
            </h2>
            <span className="text-[10px] text-muted-foreground">({group.orders.length})</span>
          </div>
          <div className="bg-card border border-border divide-y divide-border">
            {group.orders.map((o) => {
              const isOpen = expanded === o.id;
              return (
                <div key={o.id}>
                  <div className="w-full grid grid-cols-[auto_1fr_auto_auto] sm:grid-cols-[auto_1fr_auto_auto_auto_auto] gap-3 sm:gap-5 items-center px-4 sm:px-5 py-4 hover:bg-secondary/40 transition-colors">
                    <button
                      onClick={() => setExpanded(isOpen ? null : o.id)}
                      className="contents text-left"
                    >
                      <ChevronDown
                        className={`h-4 w-4 text-muted-foreground transition-transform ${isOpen ? "rotate-180" : ""}`}
                      />
                      <div className="min-w-0">
                        <p className="font-medium text-sm truncate">{o.customer}</p>
                        <p className="text-[11px] text-muted-foreground tracking-widest uppercase mt-0.5">
                          {o.id} · {o.date} ·{" "}
                          {o.paymentMethod === "cod"
                            ? "Pagesë në dorëzim"
                            : o.paymentMethod === "whatsapp"
                              ? "WhatsApp"
                              : "—"}
                        </p>
                      </div>
                      <div className="hidden sm:flex items-center gap-2 text-xs text-muted-foreground">
                        <Flag code={o.country} className="h-3 w-5" />
                        <span>{shippingRates[o.country].label}</span>
                      </div>
                      <div className="hidden sm:block text-sm font-medium text-right w-24">
                        {o.total.toFixed(2)} €
                      </div>
                      <span
                        className={`inline-block px-2.5 py-1 text-[10px] tracking-widest uppercase ${statusColor[o.status] || "bg-secondary"}`}
                      >
                        {o.status}
                      </span>
                    </button>
                    <button
                      onClick={() => remove(o.id)}
                      aria-label="Fshi porosinë"
                      className="p-1.5 text-muted-foreground hover:bg-burgundy hover:text-background transition-colors justify-self-end"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>

                  {isOpen && (
                    <div className="px-4 sm:px-5 pb-5 pt-1 grid gap-5 md:grid-cols-2 bg-secondary/20">
                      <div className="space-y-3 text-sm">
                        <h3 className="text-[11px] tracking-[0.3em] uppercase text-muted-foreground">
                          Të dhënat e klientit
                        </h3>
                        <div className="flex items-start gap-2">
                          <Phone className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                          {o.phone ? (
                            <a href={`tel:${o.phone}`} className="hover:underline">
                              {o.phone}
                            </a>
                          ) : (
                            <span className="text-muted-foreground">—</span>
                          )}
                        </div>
                        <div className="flex items-start gap-2">
                          <MapPin className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                          <div>
                            <p>{o.address || "—"}</p>
                            <p className="text-muted-foreground">
                              {o.city ? `${o.city}, ` : ""}
                              {shippingRates[o.country].label}
                            </p>
                          </div>
                        </div>
                        {o.notes && (
                          <div className="flex items-start gap-2">
                            <MessageSquare className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                            <p className="text-muted-foreground italic">"{o.notes}"</p>
                          </div>
                        )}
                        <div>
                          <label className="text-[11px] tracking-[0.3em] uppercase text-muted-foreground block mb-1.5">
                            Statusi
                          </label>
                          <select
                            value={o.status}
                            onChange={(e) =>
                              updateOrderStatus.mutate({ id: o.id, status: e.target.value })
                            }
                            className="border border-border bg-background px-3 py-2 text-sm"
                          >
                            {STATUSES.map((s) => (
                              <option key={s} value={s}>
                                {s}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>

                      <div className="space-y-3 text-sm">
                        <h3 className="text-[11px] tracking-[0.3em] uppercase text-muted-foreground flex items-center gap-2">
                          <Package className="h-3.5 w-3.5" /> Artikujt ({o.items})
                        </h3>
                        {o.lineItems && o.lineItems.length > 0 ? (
                          <ul className="divide-y divide-border border border-border bg-background">
                            {o.lineItems.map((li, idx) => (
                              <li key={idx} className="flex justify-between px-3 py-2">
                                <span className="min-w-0 truncate mr-2">
                                  {li.name}{" "}
                                  <span className="text-muted-foreground">
                                    · Masa {li.size} · x{li.qty}
                                  </span>
                                </span>
                                <span className="shrink-0">{(li.price * li.qty).toFixed(2)} €</span>
                              </li>
                            ))}
                          </ul>
                        ) : (
                          <p className="text-muted-foreground">Nuk ka detaje artikujsh.</p>
                        )}
                        <div className="border border-border bg-background p-3 space-y-1">
                          <div className="flex justify-between text-muted-foreground">
                            <span>Nëntotali</span>
                            <span>{o.subtotal.toFixed(2)} €</span>
                          </div>
                          <div className="flex justify-between text-muted-foreground">
                            <span>Transporti</span>
                            <span>{o.shipping === 0 ? "Falas" : `${o.shipping.toFixed(2)} €`}</span>
                          </div>
                          <div className="flex justify-between font-serif text-base pt-1.5 border-t border-border">
                            <span>Totali</span>
                            <span>{o.total.toFixed(2)} €</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
