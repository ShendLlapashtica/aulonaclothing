import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { type ShippingCountry, type ShippingRate } from "@/lib/products";
import { shippingRatesQueryOptions, useUpdateShippingRate } from "@/lib/store";
import { Flag } from "@/components/flag";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/shipping")({
  component: AdminShipping,
});

function AdminShipping() {
  const { data } = useQuery(shippingRatesQueryOptions);
  const updateRate = useUpdateShippingRate();
  const [rates, setRates] = useState<Record<ShippingCountry, ShippingRate> | null>(null);

  // Load the draft exactly once from the server, then let local edits win
  // until "Save" is pressed — a background refetch shouldn't clobber typing.
  useEffect(() => {
    if (data && data.length > 0 && !rates) {
      const record = {} as Record<ShippingCountry, ShippingRate>;
      for (const r of data) record[r.country] = r;
      setRates(record);
    }
  }, [data, rates]);

  const save = async () => {
    if (!rates) return;
    try {
      await Promise.all(
        (Object.keys(rates) as ShippingCountry[]).map((c) =>
          updateRate.mutateAsync({ country: c, price: rates[c].price }),
        ),
      );
      toast("Tarifat u ruajtën");
    } catch {
      toast("Ndodhi një gabim, provoni përsëri");
    }
  };

  return (
    <div className="p-4 sm:p-6 md:p-10 space-y-6 sm:space-y-8 max-w-3xl">
      <div>
        <p className="text-[11px] tracking-[0.3em] uppercase text-muted-foreground">Konfigurime</p>
        <h1 className="font-serif text-3xl sm:text-4xl mt-2">
          Tarifat e <span className="font-script text-caramel">Transportit</span>
        </h1>
        <p className="mt-3 text-sm sm:text-base text-muted-foreground">
          Menaxho tarifat e transportit sipas vendit. Ndryshimet aplikohen menjëherë në shportë.
        </p>
      </div>

      {rates && (
        <div className="bg-card border border-border divide-y divide-border">
          {(Object.keys(rates) as ShippingCountry[]).map((c) => (
            <div key={c} className="p-4 sm:p-5 flex flex-wrap items-center gap-3 sm:gap-4">
              <Flag code={c} className="h-6 w-9 sm:h-7 sm:w-10" />
              <div className="flex-1 min-w-0">
                <p className="font-serif text-lg sm:text-xl truncate">{rates[c].label}</p>
                <p className="text-[10px] sm:text-xs text-muted-foreground uppercase tracking-widest">
                  {c}
                </p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <input
                  type="number"
                  step="0.5"
                  min="0"
                  value={rates[c].price}
                  onChange={(e) =>
                    setRates({
                      ...rates,
                      [c]: { ...rates[c], price: parseFloat(e.target.value) || 0 },
                    })
                  }
                  className="w-20 sm:w-24 bg-transparent border border-border px-3 py-2 text-right focus:outline-none focus:border-foreground"
                />
                <span className="text-muted-foreground">€</span>
              </div>
              {rates[c].price === 0 && (
                <span className="text-[10px] tracking-widest uppercase bg-caramel/20 text-caramel px-2 py-1">
                  Falas
                </span>
              )}
            </div>
          ))}
        </div>
      )}

      <button
        onClick={save}
        disabled={!rates || updateRate.isPending}
        className="bg-foreground text-background px-8 py-3 text-xs tracking-widest uppercase hover:bg-caramel transition-colors disabled:opacity-50"
      >
        {updateRate.isPending ? "Duke ruajtur..." : "Ruaj Ndryshimet"}
      </button>
    </div>
  );
}
