import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { WHATSAPP_DISPLAY } from "@/lib/store";

export const Route = createFileRoute("/politikat")({
  head: () => ({
    meta: [
      { title: "Politikat tona — Aulonaclothing" },
      {
        name: "description",
        content: "Transporti, kthimet, pagesa dhe privatësia në Aulonaclothing.",
      },
    ],
  }),
  component: Politikat,
});

const sections = [
  {
    title: "Transporti",
    body: [
      "Dërgesa brenda Kosovës është falas. Për Shqipëri dhe Maqedoninë e Veriut tarifa është 5€.",
      "Koha e dërgesës zakonisht është 2–4 ditë pune nga konfirmimi i porosisë.",
    ],
  },
  {
    title: "Kthimet",
    body: [
      "Pranojmë kthime brenda 14 ditësh nga marrja e porosisë, për artikuj të papërdorur dhe me etiketë.",
      "Për të filluar një kthim, na shkruaj në WhatsApp ose email me numrin e porosisë.",
    ],
  },
  {
    title: "Pagesa",
    body: [
      "Pagesa bëhet në dorëzim (cash) ose konfirmohet përmes WhatsApp. Nuk kërkohen të dhëna karte online.",
    ],
  },
  {
    title: "Privatësia",
    body: [
      "Të dhënat e porosisë (emri, adresa, telefoni) përdoren vetëm për përpunimin dhe dërgesën e porosisë suaj dhe nuk ndahen me palë të treta.",
    ],
  },
  {
    title: "Kushtet e Përdorimit",
    body: [
      "Përmbajtja e këtij faqeje (emri, logoja, teksti) i përket Aulonaclothing. Çmimet dhe disponueshmëria e produkteve mund të ndryshojnë pa njoftim paraprak.",
    ],
  },
];

function Politikat() {
  return (
    <>
      <SiteHeader />
      <div className="mx-auto max-w-3xl px-4 sm:px-6 py-16 sm:py-20">
        <p className="text-[11px] tracking-[0.3em] uppercase text-muted-foreground text-center">
          Informacion
        </p>
        <h1 className="font-serif text-4xl sm:text-5xl mt-2 text-center">
          <span className="font-script text-caramel">Politikat</span> tona
        </h1>

        <div className="mt-14 space-y-12">
          {sections.map((s) => (
            <section key={s.title}>
              <h2 className="font-serif text-2xl">{s.title}</h2>
              <div className="mt-3 space-y-2 text-sm text-muted-foreground leading-relaxed">
                {s.body.map((p, i) => (
                  <p key={i}>{p}</p>
                ))}
              </div>
            </section>
          ))}
        </div>

        <div className="mt-14 pt-8 border-t border-border text-center text-sm text-muted-foreground">
          Pyetje? Na shkruaj në WhatsApp:{" "}
          <span className="text-foreground">{WHATSAPP_DISPLAY}</span>
        </div>

        <div className="mt-10 text-center">
          <Link
            to="/"
            className="text-xs tracking-widest uppercase border-b border-foreground pb-1 hover:text-caramel hover:border-caramel"
          >
            ← Kryefaqja
          </Link>
        </div>
      </div>
      <SiteFooter />
    </>
  );
}
