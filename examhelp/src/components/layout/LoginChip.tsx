"use client";

import { useEffect, useState } from "react";

type U = { id?: string; name?: string };

/** Shows "Welcome, <name>" (links to the dashboard) when the student is logged in on the main site, else the login button. */
export function LoginChip({ className }: { className: string }) {
  const [u, setU] = useState<U | null>(null);
  useEffect(() => {
    try {
      const sess = localStorage.getItem("sb-ovaubhekxjtkodkhsybg-auth-token");
      if (!sess) return;
      const cached = JSON.parse(localStorage.getItem("tth_user") || "null") as U | null;
      const meta = JSON.parse(sess)?.user?.user_metadata ?? {};
      setU({ id: cached?.id, name: cached?.name || meta.full_name });
    } catch {
      /* ignore */
    }
  }, []);
  if (!u) return <a href="/login.html" aria-label="लॉगिन या रजिस्टर" className={className}>लॉगिन / रजिस्टर</a>;
  const first = (u.name || u.id || "").trim().split(/\s+/)[0];
  return (
    <a href="/dashboard.html" title={u.id ? `${u.name ?? ""} (${u.id})` : u.name} className={`${className} max-w-[11rem] flex-col !items-start justify-center leading-tight`}>
      <span className="text-[10px] font-medium opacity-80">स्वागत है 👋</span>
      <span className="truncate max-w-full">{first || "मेरा खाता"}{u.id ? ` · ${u.id}` : ""}</span>
    </a>
  );
}
