import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  siteTextsQueryOptions,
  useUpdateSiteText,
  SITE_TEXT_KEYS,
  type SiteTextKey,
} from "@/lib/store";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/tekste")({
  component: AdminTekste,
});

const FIELDS: { key: SiteTextKey; label: string; multiline?: boolean }[] = [
  { key: "hero_eyebrow", label: "Ballina — mbishkrimi mbi titull" },
  { key: "hero_line1", label: "Ballina — rreshti i parë" },
  { key: "hero_accent", label: "Ballina — fjalia theksuese" },
  { key: "hero_line3", label: "Ballina — rreshti i fundit" },
  { key: "editorial_heading", label: "Seksioni editorial — titulli" },
  { key: "editorial_body", label: "Seksioni editorial — teksti", multiline: true },
  { key: "footer_tagline", label: "Footer — slogani" },
];

function AdminTekste() {
  const { data } = useQuery(siteTextsQueryOptions);
  const updateText = useUpdateSiteText();
  const [texts, setTexts] = useState<Record<SiteTextKey, string> | null>(null);

  // Load the draft exactly once from the server, then let local edits win
  // until "Save" is pressed — a background refetch shouldn't clobber typing.
  useEffect(() => {
    if (data && !texts) {
      const record = {} as Record<SiteTextKey, string>;
      for (const key of SITE_TEXT_KEYS) record[key] = data[key] ?? "";
      setTexts(record);
    }
  }, [data, texts]);

  const save = async () => {
    if (!texts) return;
    try {
      await Promise.all(
        SITE_TEXT_KEYS.map((key) => updateText.mutateAsync({ key, value: texts[key] })),
      );
      toast("Tekstet u ruajtën");
    } catch {
      toast("Ndodhi një gabim, provoni përsëri");
    }
  };

  return (
    <div className="p-4 sm:p-6 md:p-10 space-y-6 sm:space-y-8 max-w-2xl">
      <div>
        <p className="text-[11px] tracking-[0.3em] uppercase text-muted-foreground">Përmbajtja</p>
        <h1 className="font-serif text-3xl sm:text-4xl mt-2">
          <span className="font-script text-caramel">Tekstet</span> e faqes
        </h1>
        <p className="mt-3 text-sm sm:text-base text-muted-foreground">
          Ndrysho mottot dhe tekstet kryesore të ballinës. Ndryshimet shfaqen menjëherë në sajt.
        </p>
      </div>

      {texts && (
        <div className="bg-card border border-border divide-y divide-border">
          {FIELDS.map((f) => (
            <div key={f.key} className="p-4 sm:p-5 space-y-2">
              <label className="text-[11px] tracking-widest uppercase text-muted-foreground block">
                {f.label}
              </label>
              {f.multiline ? (
                <textarea
                  value={texts[f.key]}
                  onChange={(e) => setTexts({ ...texts, [f.key]: e.target.value })}
                  rows={3}
                  className="w-full bg-transparent border border-border px-3 py-2 text-sm focus:outline-none focus:border-foreground"
                />
              ) : (
                <input
                  value={texts[f.key]}
                  onChange={(e) => setTexts({ ...texts, [f.key]: e.target.value })}
                  className="w-full bg-transparent border border-border px-3 py-2 text-sm focus:outline-none focus:border-foreground"
                />
              )}
            </div>
          ))}
        </div>
      )}

      <button
        onClick={save}
        disabled={!texts || updateText.isPending}
        className="bg-foreground text-background px-8 py-3 text-xs tracking-widest uppercase hover:bg-caramel transition-colors disabled:opacity-50"
      >
        {updateText.isPending ? "Duke ruajtur..." : "Ruaj Ndryshimet"}
      </button>
    </div>
  );
}
