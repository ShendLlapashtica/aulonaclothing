import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";

import appCss from "../styles.css?url";
import { reportLovableError } from "../lib/lovable-error-reporting";
import { CartProvider } from "@/lib/cart-store";
import { CartDrawer } from "@/components/cart-drawer";
import { Toaster } from "@/components/ui/sonner";
import { LanguageProvider } from "@/lib/i18n";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="font-script text-7xl text-foreground">Ups</h1>
        <h2 className="mt-4 font-serif text-xl">Faqja nuk u gjet</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Faqja që kërkoni nuk ekziston ose është zhvendosur.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center bg-foreground px-6 py-3 text-xs tracking-widest uppercase text-background transition-colors hover:bg-caramel"
          >
            Kthehu në kryefaqe
          </Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();
  useEffect(() => {
    reportLovableError(error, { boundary: "tanstack_root_error_component" });
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="font-serif text-2xl text-foreground">Diçka shkoi keq</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Provoni të rifreskoni faqen ose kthehuni në kryefaqe.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="bg-foreground px-6 py-3 text-xs tracking-widest uppercase text-background hover:bg-caramel transition-colors"
          >
            Provo Përsëri
          </button>
          <a
            href="/"
            className="border border-foreground px-6 py-3 text-xs tracking-widest uppercase hover:bg-foreground hover:text-background transition-colors"
          >
            Kryefaqja
          </a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "Aulonaclothing — Koleksioni i Ri i Verës" },
      { name: "description", content: "Zbulo koleksionin editorial të Aulonaclothing: fustane sateni, sete elegante dhe denim me stil luksoz-minimalist." },
      { name: "author", content: "Aulonaclothing" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { property: "og:title", content: "Aulonaclothing — Koleksioni i Ri i Verës" },
      { name: "twitter:title", content: "Aulonaclothing — Koleksioni i Ri i Verës" },
      { property: "og:description", content: "Zbulo koleksionin editorial të Aulonaclothing: fustane sateni, sete elegante dhe denim me stil luksoz-minimalist." },
      { name: "twitter:description", content: "Zbulo koleksionin editorial të Aulonaclothing: fustane sateni, sete elegante dhe denim me stil luksoz-minimalist." },
      { property: "og:image", content: "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/b92b2e16-ab5f-4ca1-ab0b-db9e869ff8ba/id-preview-098e5dbe--23a19d46-d0aa-4522-8b7c-b6bb447df52d.lovable.app-1784754397729.png" },
      { name: "twitter:image", content: "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/b92b2e16-ab5f-4ca1-ab0b-db9e869ff8ba/id-preview-098e5dbe--23a19d46-d0aa-4522-8b7c-b6bb447df52d.lovable.app-1784754397729.png" },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@300;400;500;600&family=Great+Vibes&family=Inter:wght@300;400;500;600&display=swap",
      },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="sq">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();

  return (
    <QueryClientProvider client={queryClient}>
      <LanguageProvider>
        <CartProvider>
          <Outlet />
          <CartDrawer />
          <Toaster position="bottom-right" />
        </CartProvider>
      </LanguageProvider>
    </QueryClientProvider>
  );
}
