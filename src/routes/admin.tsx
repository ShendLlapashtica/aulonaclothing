import { createFileRoute, Link, Outlet, useLocation } from "@tanstack/react-router";
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Truck,
  Type,
  ArrowLeft,
  Lock,
  LogOut,
} from "lucide-react";
import { BrandMark } from "@/components/brand-mark";
import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { supabase, ADMIN_EMAIL } from "@/lib/supabase";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title: "Admin — Aulonaclothing" },
      { name: "description", content: "Paneli i administrimit të Aulonaclothing." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AdminLayout,
});

const links = [
  { to: "/admin", label: "Përmbledhja", icon: LayoutDashboard, exact: true },
  { to: "/admin/products", label: "Produktet", icon: Package },
  { to: "/admin/orders", label: "Porositë", icon: ShoppingCart },
  { to: "/admin/shipping", label: "Tarifat e Transportit", icon: Truck },
  { to: "/admin/tekste", label: "Tekstet", icon: Type },
];

function AdminLayout() {
  const { pathname } = useLocation();
  const [authed, setAuthed] = useState(false);
  const [checking, setChecking] = useState(true);
  const [pw, setPw] = useState("");
  const [err, setErr] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setAuthed(!!data.session);
      setChecking(false);
    });
    const { data: subscription } = supabase.auth.onAuthStateChange((_event, session) => {
      setAuthed(!!session);
    });
    return () => subscription.subscription.unsubscribe();
  }, []);

  const login = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr(false);
    setSubmitting(true);
    const { error } = await supabase.auth.signInWithPassword({ email: ADMIN_EMAIL, password: pw });
    setSubmitting(false);
    if (error) {
      setErr(true);
      return;
    }
    setPw("");
  };

  if (checking) {
    return <div className="min-h-screen bg-background" />;
  }

  if (!authed) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-6">
        <form
          onSubmit={login}
          className="w-full max-w-sm border border-border bg-card p-8 space-y-5"
        >
          <div className="text-center space-y-2">
            <Lock className="h-6 w-6 mx-auto text-muted-foreground" />
            <BrandMark className="text-2xl" />
            <p className="text-[10px] tracking-widest uppercase text-muted-foreground">
              Admin Panel
            </p>
          </div>
          <div className="space-y-2">
            <label className="text-xs tracking-widest uppercase text-muted-foreground">
              Fjalëkalimi
            </label>
            <Input type="password" value={pw} onChange={(e) => setPw(e.target.value)} autoFocus />
            {err && <p className="text-xs text-destructive">Fjalëkalim i pasaktë.</p>}
          </div>
          <Button type="submit" disabled={submitting} className="w-full">
            {submitting ? "Duke hyrë..." : "Hyr"}
          </Button>
          <Link
            to="/"
            className="flex items-center justify-center gap-1 text-[10px] tracking-widest uppercase text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-3 w-3" /> Kthehu në dyqan
          </Link>
        </form>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col md:flex-row">
      <aside className="md:w-64 md:min-h-screen md:sticky md:top-0 border-b md:border-b-0 md:border-r border-border bg-sidebar shrink-0 md:flex md:flex-col">
        <div className="p-4 sm:p-6 border-b border-sidebar-border flex items-center justify-between md:block">
          <Link to="/" className="block min-w-0">
            <BrandMark className="text-2xl truncate" />
            <p className="text-[10px] tracking-widest uppercase text-muted-foreground mt-1">
              Admin Panel
            </p>
          </Link>
          <Link
            to="/"
            className="md:hidden flex items-center gap-1 text-[10px] tracking-widest uppercase text-muted-foreground shrink-0 ml-3"
          >
            <ArrowLeft className="h-3 w-3" /> Dyqani
          </Link>
        </div>
        <nav className="p-2 md:p-3 flex md:block overflow-x-auto gap-1 md:gap-0">
          {links.map((l) => {
            const active = l.exact ? pathname === l.to : pathname.startsWith(l.to);
            const Icon = l.icon;
            return (
              <Link
                key={l.to}
                to={l.to}
                className={`flex items-center gap-2 md:gap-3 px-3 md:px-4 py-2.5 md:py-3 text-xs md:text-sm whitespace-nowrap transition-colors ${
                  active
                    ? "bg-foreground text-background"
                    : "hover:bg-sidebar-accent text-sidebar-foreground"
                }`}
              >
                <Icon className="h-4 w-4 shrink-0" />
                <span>{l.label}</span>
              </Link>
            );
          })}
        </nav>
        <div className="hidden md:block mt-auto p-6 space-y-3">
          <button
            onClick={() => {
              supabase.auth.signOut();
              setPw("");
            }}
            className="flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground"
          >
            <LogOut className="h-3 w-3" /> Dil
          </button>
          <Link
            to="/"
            className="flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-3 w-3" /> Kthehu në dyqan
          </Link>
        </div>
      </aside>
      <main className="flex-1 min-w-0">
        <Outlet />
      </main>
    </div>
  );
}
