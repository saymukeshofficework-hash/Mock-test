"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { ChevronDown, LogOut } from "lucide-react";

type U = { id?: string; name?: string };

/** Shared account menu shown on every Exam Hub page for signed-in students. */
export function LoginChip({ className }: { className: string }) {
  const pathname = usePathname();
  const isCataloguePage = /\/(?:courses|exams)\/?$/.test(pathname);
  const [u, setU] = useState<U | null>(null);
  const [open, setOpen] = useState(false);
  useEffect(() => {
    try {
      const sess = localStorage.getItem("sb-ovaubhekxjtkodkhsybg-auth-token");
      if (!sess) return;
      const cached = JSON.parse(localStorage.getItem("tth_user") || "null") as U | null;
      const meta = JSON.parse(sess)?.user?.user_metadata ?? {};
      setU({ id: cached?.id, name: cached?.name || meta.full_name });
    } catch {
      /* ignore malformed cached session */
    }
  }, []);

  async function signOut() {
    try {
      const key = "sb-ovaubhekxjtkodkhsybg-auth-token";
      const raw = localStorage.getItem(key);
      const session = raw ? JSON.parse(raw) : null;
      const token = session?.access_token;
      if (token) {
        await fetch("https://ovaubhekxjtkodkhsybg.supabase.co/auth/v1/logout", {
          method: "POST",
          headers: {
            apikey: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im92YXViaGVreGp0a29ka2hzeWJnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODc4NTk4NDMsImV4cCI6MjEwMzQzNTg0M30.KKDmp6mt2YEIKxI0BP5I7BvAgMAStNXJiwgUy3X4b2s",
            Authorization: `Bearer ${token}`,
          },
        });
      }
    } catch {
      /* Clear this browser session even if the network is unavailable. */
    } finally {
      try {
        localStorage.removeItem("sb-ovaubhekxjtkodkhsybg-auth-token");
        localStorage.removeItem("tth_user");
      } catch { /* ignore unavailable storage */ }
      window.location.href = "/login.html";
    }
  }

  if (!u) return <a href="/login.html" aria-label="लॉगिन या रजिस्टर" className={className}>लॉगिन / रजिस्टर</a>;
  if (isCataloguePage) {
    return (
      <button type="button" onClick={signOut} aria-label="Logout" title="Logout" className={className}>
        <LogOut className="h-4 w-4 shrink-0" aria-hidden="true" /> <span>Logout</span>
      </button>
    );
  }
  const first = (u.name || u.id || "").trim().split(/\s+/)[0];
  return (
    <div className="relative">
      <button
        type="button"
        aria-expanded={open}
        aria-haspopup="menu"
        onClick={() => setOpen((value) => !value)}
        className={className}
      >
        <span className="text-left leading-tight">
          <span className="block text-[10px] font-medium opacity-80">स्वागत है 👋</span>
          <span className="block truncate max-w-full">{first || "मेरा खाता"}{u.id ? ` · ${u.id}` : ""}</span>
        </span>
        <ChevronDown className={`ml-1 h-4 w-4 shrink-0 transition-transform ${open ? "rotate-180" : ""}`} aria-hidden="true" />
      </button>
      {open && (
        <div role="menu" className="card absolute right-0 top-full z-[70] mt-2 min-w-36 p-1.5 shadow-lg">
          <a role="menuitem" href="/dashboard.html" className="block rounded-lg px-3 py-2 text-sm text-ink-700 hover:bg-brand-50">
            डैशबोर्ड / Dashboard
          </a>
          <button role="menuitem" type="button" onClick={signOut} className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm font-semibold text-red-700 hover:bg-red-50">
            <LogOut className="h-4 w-4" aria-hidden="true" /> लॉगआउट / Logout
          </button>
        </div>
      )}
    </div>
  );
}
