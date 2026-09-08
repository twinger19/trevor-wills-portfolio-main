/* ==========================================================================
   Site password gate — Netlify Edge Function
   Every request passes through here first. Without a valid cookie the
   visitor gets the password screen; nothing else is served.
   Change the password in Netlify → Site configuration → Environment
   variables → SITE_PASSWORD (falls back to the default below).
   ========================================================================== */

import type { Context } from "https://edge.netlify.com";

const PASSWORD = Deno.env.get("SITE_PASSWORD") ?? "TMW26";
const COOKIE = "tw_gate";
const MAX_AGE = 60 * 60 * 24 * 30; // 30 days

async function tokenFor(pw: string): Promise<string> {
  const bytes = new TextEncoder().encode(`tw-gate::v1::${pw}`);
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

function safePath(raw: string): string {
  if (!raw.startsWith("/") || raw.startsWith("//")) return "/";
  return raw;
}

function gatePage(next: string, failed: boolean): Response {
  const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex, nofollow">
<title>Trevor Wills — Portfolio</title>
<link rel="icon" type="image/svg+xml" href="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'%3E%3Crect width='32' height='32' rx='7' fill='%23C0492A'/%3E%3Ctext x='16' y='22' font-family='Georgia,serif' font-size='17' font-weight='700' fill='%23FBF5E9' text-anchor='middle'%3ETW%3C/text%3E%3C/svg%3E">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,500..800&family=Inter:wght@400;500;600&family=Space+Grotesk:wght@500;600&display=swap" rel="stylesheet">
<style>
  :root{
    --paper:#FBF5E9; --paper-2:#F4E7D2; --ink:#221C15; --ink-soft:#564B3D;
    --ink-mute:#857a68; --line:#E2D2B6; --clay:#C0492A; --clay-deep:#9C3A20;
    --display:'Fraunces',Georgia,serif; --sans:'Inter',-apple-system,sans-serif;
    --label:'Space Grotesk','Inter',sans-serif;
  }
  *,*::before,*::after{box-sizing:border-box;}
  body{
    margin:0; min-height:100vh; background:var(--paper); color:var(--ink);
    font-family:var(--sans);
    display:flex; align-items:center; justify-content:center; padding:2rem 1.25rem;
    background-image:radial-gradient(circle at 15% 12%, rgba(240,166,56,.16), transparent 42%),
                     radial-gradient(circle at 85% 88%, rgba(42,60,208,.10), transparent 45%);
  }
  .card{
    width:100%; max-width:430px; background:var(--paper);
    border:1px solid var(--line); border-radius:28px;
    padding:clamp(2rem,5vw,3rem); box-shadow:0 26px 60px rgba(34,28,21,.14);
  }
  .eyebrow{
    font-family:var(--label); font-size:.7rem; font-weight:600;
    letter-spacing:.18em; text-transform:uppercase; color:var(--clay); margin:0 0 1.25rem;
  }
  h1{
    font-family:var(--display); font-weight:700; font-size:clamp(1.9rem,5vw,2.5rem);
    line-height:1.08; letter-spacing:-.02em; margin:0 0 .85rem;
  }
  p.lede{ font-size:.97rem; line-height:1.6; color:var(--ink-soft); margin:0 0 1.9rem; }
  label{
    display:block; font-family:var(--label); font-size:.7rem; font-weight:600;
    letter-spacing:.14em; text-transform:uppercase; color:var(--ink-mute); margin-bottom:.55rem;
  }
  input{
    width:100%; font-family:var(--sans); font-size:1.05rem; letter-spacing:.06em;
    padding:.9rem 1.05rem; color:var(--ink); background:#fff;
    border:1.5px solid var(--line); border-radius:12px; transition:border-color .18s ease, box-shadow .18s ease;
  }
  input:focus{ outline:none; border-color:var(--clay); box-shadow:0 0 0 4px rgba(192,73,42,.14); }
  button{
    width:100%; margin-top:1rem; font-family:var(--label); font-size:.82rem; font-weight:600;
    letter-spacing:.12em; text-transform:uppercase; color:var(--paper);
    background:var(--clay); border:none; border-radius:100px; padding:1rem 1.25rem;
    cursor:pointer; transition:background .18s ease, transform .18s ease;
  }
  button:hover{ background:var(--clay-deep); transform:translateY(-1px); }
  button:focus-visible{ outline:3px solid var(--clay-deep); outline-offset:3px; }
  .error{
    margin:0 0 1.1rem; padding:.7rem .9rem; border-radius:10px;
    background:#F3DCCB; border:1px solid rgba(192,73,42,.35);
    color:var(--clay-deep); font-size:.87rem; font-weight:500;
  }
  footer{ margin-top:1.9rem; font-size:.8rem; color:var(--ink-mute); line-height:1.55; }
  footer a{ color:var(--clay); text-decoration:underline; text-underline-offset:2px; }
</style>
</head>
<body>
  <main class="card">
    <p class="eyebrow">Private Portfolio</p>
    <h1>Trevor Wills</h1>
    <p class="lede">This portfolio is shared by invitation. Enter the access code included with my resume to view the work.</p>
    ${failed ? '<p class="error">That code didn&rsquo;t match. Please try again.</p>' : ""}
    <form method="POST" action="/__unlock">
      <input type="hidden" name="next" value="${next.replace(/"/g, "&quot;")}">
      <label for="password">Access code</label>
      <input id="password" name="password" type="password" autocomplete="current-password"
             autocapitalize="off" autocorrect="off" spellcheck="false" autofocus required>
      <button type="submit">Enter Portfolio</button>
    </form>
    <footer>Don&rsquo;t have a code? Email <a href="mailto:trevorwills@outlook.com">trevorwills@outlook.com</a>.</footer>
  </main>
</body>
</html>`;

  return new Response(html, {
    status: failed ? 401 : 401,
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Cache-Control": "no-store, must-revalidate",
      "X-Robots-Tag": "noindex, nofollow",
    },
  });
}

export default async function handler(request: Request, context: Context) {
  const expected = await tokenFor(PASSWORD);
  const url = new URL(request.url);

  // Password submission
  if (request.method === "POST" && url.pathname === "/__unlock") {
    const form = await request.formData();
    const supplied = String(form.get("password") ?? "").trim();
    const next = safePath(String(form.get("next") ?? "/"));

    if (supplied === PASSWORD) {
      return new Response(null, {
        status: 303,
        headers: {
          Location: next,
          "Set-Cookie": `${COOKIE}=${expected}; Path=/; Max-Age=${MAX_AGE}; HttpOnly; Secure; SameSite=Lax`,
          "Cache-Control": "no-store",
        },
      });
    }
    return gatePage(next, true);
  }

  // Sign out
  if (url.pathname === "/__lock") {
    return new Response(null, {
      status: 303,
      headers: {
        Location: "/",
        "Set-Cookie": `${COOKIE}=; Path=/; Max-Age=0; HttpOnly; Secure; SameSite=Lax`,
        "Cache-Control": "no-store",
      },
    });
  }

  // Already unlocked?
  const cookies = (request.headers.get("cookie") ?? "").split(";");
  if (cookies.some((c) => c.trim() === `${COOKIE}=${expected}`)) {
    return context.next();
  }

  return gatePage(safePath(url.pathname + url.search), false);
}
