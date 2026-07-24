import { Link } from "@tanstack/react-router";
import { BrandMark } from "@/components/brand-mark";
import { Instagram, Mail, MessageCircle } from "lucide-react";
import { WHATSAPP_DISPLAY, WHATSAPP_NUMBER, useSiteTexts } from "@/lib/store";

export function SiteFooter() {
  const texts = useSiteTexts();
  return (
    <footer className="border-t border-border bg-background mt-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-12 sm:py-14 grid grid-cols-2 md:grid-cols-4 gap-8">
        <div className="col-span-2 md:col-span-1">
          <BrandMark className="text-3xl" />
          <p className="mt-3 text-sm text-muted-foreground">{texts.footer_tagline}</p>
          <div className="flex items-center gap-3 mt-4">
            <a
              href={`https://wa.me/${WHATSAPP_NUMBER}`}
              target="_blank"
              rel="noreferrer"
              aria-label="WhatsApp"
              className="h-9 w-9 grid place-items-center border border-border hover:border-foreground transition-colors"
            >
              <MessageCircle className="h-4 w-4" />
            </a>
            <a
              href="https://instagram.com"
              target="_blank"
              rel="noreferrer"
              aria-label="Instagram"
              className="h-9 w-9 grid place-items-center border border-border hover:border-foreground transition-colors"
            >
              <Instagram className="h-4 w-4" />
            </a>
            <a
              href="mailto:info@aulonaclothing.com"
              aria-label="Email"
              className="h-9 w-9 grid place-items-center border border-border hover:border-foreground transition-colors"
            >
              <Mail className="h-4 w-4" />
            </a>
          </div>
        </div>
        <div>
          <p className="text-[11px] tracking-widest uppercase mb-3">Dyqani</p>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>
              <Link to="/shop" search={{ filter: "all" }} className="hover:text-caramel">
                Të gjitha
              </Link>
            </li>
            <li>
              <Link to="/shop" search={{ filter: "fustane" }} className="hover:text-caramel">
                Fustane
              </Link>
            </li>
            <li>
              <Link to="/shop" search={{ filter: "sete" }} className="hover:text-caramel">
                Sete
              </Link>
            </li>
            <li>
              <Link to="/shop" search={{ filter: "denim" }} className="hover:text-caramel">
                Denim
              </Link>
            </li>
            <li>
              <Link to="/shop" search={{ filter: "kombinezone" }} className="hover:text-caramel">
                Kombinezone
              </Link>
            </li>
          </ul>
        </div>
        <div>
          <p className="text-[11px] tracking-widest uppercase mb-3">Ndihmë</p>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>Transporti</li>
            <li>Kthimet</li>
            <li>Tabela e Masave</li>
            <li>Na Kontaktoni</li>
            <li>{WHATSAPP_DISPLAY}</li>
          </ul>
        </div>
        <div className="col-span-2 md:col-span-1">
          <p className="text-[11px] tracking-widest uppercase mb-3">Newsletter</p>
          <p className="text-sm text-muted-foreground mb-3">Regjistrohu për 10% zbritje.</p>
          <div className="flex">
            <input
              type="email"
              placeholder="Email"
              className="min-w-0 flex-1 bg-transparent border border-border px-3 py-2 text-sm focus:outline-none focus:border-foreground"
            />
            <button className="bg-foreground text-background px-4 text-xs tracking-widest uppercase hover:bg-caramel transition-colors shrink-0">
              Nis
            </button>
          </div>
        </div>
      </div>
      <div className="border-t border-border py-5 text-center text-xs text-muted-foreground">
        © 2026 Aulonaclothing ·{" "}
        <Link to="/politikat" className="hover:text-caramel">
          Politikat tona
        </Link>{" "}
        ·{" "}
        <Link to="/admin" className="hover:text-caramel">
          Admin
        </Link>
      </div>
    </footer>
  );
}
