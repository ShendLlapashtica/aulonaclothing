// Vercel Cron target (see vercel.json). Runs once a day and makes one real
// request to Supabase's REST API so the free-tier project never accumulates
// 7 days of inactivity and gets auto-paused. Deliberately independent of the
// TanStack Start app/router so it can't be broken by app-routing changes.
export function GET(request: Request): Response {
  const cronSecret = process.env.CRON_SECRET;
  if (cronSecret) {
    const auth = request.headers.get("authorization");
    if (auth !== `Bearer ${cronSecret}`) {
      return new Response("Unauthorized", { status: 401 });
    }
  }

  const supabaseUrl = process.env.VITE_SUPABASE_URL;
  const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;
  if (!supabaseUrl || !supabaseAnonKey) {
    return new Response("Missing VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY", { status: 500 });
  }

  return fetch(`${supabaseUrl}/rest/v1/shipping_rates?select=country&limit=1`, {
    headers: { apikey: supabaseAnonKey, authorization: `Bearer ${supabaseAnonKey}` },
  }).then((res) =>
    res.ok
      ? new Response("ok", { status: 200 })
      : new Response(`Supabase ping failed: ${res.status}`, { status: 502 }),
  );
}
