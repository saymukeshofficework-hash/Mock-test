"use client";

import { useState } from "react";
import { Upload } from "lucide-react";
import { adminCall } from "@/lib/checkout";

/** Admin: upload paid mock-test papers (a .zip or several NN.json files) into the private bucket. */
const SERIES = [
  { id: "pcgd", label: "MP Police Constable GD (pcgd)" },
  { id: "asi", label: "MP Police Subedar / ASI (asi)" },
  { id: "ag3", label: "MP High Court AG-3 (ag3)" },
];
const JSZIP = "https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js";

function loadScript(src: string) {
  return new Promise<void>((res, rej) => {
    if (document.querySelector(`script[src="${src}"]`)) return res();
    const s = document.createElement("script");
    s.src = src;
    s.onload = () => res();
    s.onerror = () => rej(new Error("script"));
    document.body.appendChild(s);
  });
}

export function UploadTests({ pw }: { pw: string }) {
  const [series, setSeries] = useState("pcgd");
  const [log, setLog] = useState<string[]>([]);
  const [busy, setBusy] = useState(false);
  const add = (l: string) => setLog((x) => [...x, l]);

  const run = async (files: FileList | null) => {
    if (!files?.length) return;
    setBusy(true);
    setLog([]);
    const items: { n: number; text: string }[] = [];
    try {
      for (const f of Array.from(files)) {
        if (f.name.toLowerCase().endsWith(".zip")) {
          await loadScript(JSZIP);
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const zip = await (window as any).JSZip.loadAsync(f);
          for (const name of Object.keys(zip.files)) {
            const m = name.match(/(\d{1,2})\.json$/);
            if (m && !zip.files[name].dir) items.push({ n: +m[1], text: await zip.files[name].async("string") });
          }
        } else {
          const m = f.name.match(/(\d{1,2})\.json$/);
          if (m) items.push({ n: +m[1], text: await f.text() });
          else add(`Skipped ${f.name} (name must end with a test number, e.g. 03.json)`);
        }
      }
      items.sort((a, b) => a.n - b.n);
      add(`Found ${items.length} test file(s). Uploading to ${series}/ …`);
      let ok = 0;
      for (const it of items) {
        let data: unknown;
        try {
          data = JSON.parse(it.text);
        } catch {
          add(`Test ${it.n}: not valid JSON ✗`);
          continue;
        }
        const r = await adminCall<{ ok: boolean; questions: number }>({ action: "upload_test", password: pw, series, n: it.n, data });
        if (r.ok) {
          ok++;
          add(`Test ${it.n}: uploaded (${r.questions} questions) ✓`);
        } else add(`Test ${it.n}: failed — ${r.error ?? "error"} ✗`);
      }
      const l = await adminCall<{ tests: number[] }>({ action: "list_tests", password: pw, series });
      add(`Done: ${ok}/${items.length} uploaded. Now stored for ${series}: ${(l.tests ?? []).join(", ") || "none"}`);
    } catch {
      add("Could not read the file(s). Try again.");
    }
    setBusy(false);
  };

  return (
    <section className="card mt-8 p-5" aria-labelledby="up-h">
      <h2 id="up-h" className="flex items-center gap-2 font-bold text-ink-900">
        <Upload className="h-5 w-5 text-brand-700" aria-hidden="true" /> Upload paid test papers
      </h2>
      <p className="mt-1 text-sm text-ink-600">Choose the series, then pick the .zip (or the NN.json files). Files go to private storage — buyers only.</p>
      <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:items-center">
        <select value={series} onChange={(e) => setSeries(e.target.value)} className="rounded-lg border border-ink-200 px-3 py-2" aria-label="Series">
          {SERIES.map((s) => (
            <option key={s.id} value={s.id}>{s.label}</option>
          ))}
        </select>
        <input type="file" accept=".zip,.json,application/zip,application/json" multiple disabled={busy}
          onChange={(e) => run(e.target.files)} className="text-sm" aria-label="Test files" />
      </div>
      {log.length ? (
        <pre className="mt-3 max-h-64 overflow-auto whitespace-pre-wrap rounded-lg bg-canvas p-3 text-xs text-ink-800">{log.join("\n")}</pre>
      ) : null}
    </section>
  );
}
