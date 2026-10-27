import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Calculadora de Sueldos" },
      { name: "description", content: "Calculá tu sueldo: básico, geográfico, presentismo y horas por tramo." },
      { property: "og:title", content: "Calculadora de Sueldos" },
      { property: "og:description", content: "Calculá tu sueldo: básico, geográfico, presentismo y horas por tramo." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Index,
});

const fmt = (n: number) =>
  n.toLocaleString("es-AR", { style: "currency", currency: "ARS", maximumFractionDigits: 2 });
const num = (s: string) => {
  const n = parseFloat(s.replace(",", "."));
  return isNaN(n) ? 0 : n;
};

const tramos = [
  { key: "t1", label: "Horas de 45 a 60" },
  { key: "t2", label: "Horas de 61 a 75" },
  { key: "t3", label: "Horas de 76 a 120" },
] as const;

function Field({ label, value, onChange, prefix, placeholder = "0" }: {
  label?: string; value: string; onChange: (v: string) => void; prefix?: string; placeholder?: string;
}) {
  return (
    <label className="block">
      {label && <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-muted-foreground">{label}</span>}
      <div className="flex items-center rounded-lg border border-input bg-background px-3 transition focus-within:border-ring focus-within:ring-2 focus-within:ring-ring/30">
        {prefix && <span className="mr-1 text-sm text-muted-foreground">{prefix}</span>}
        <input
          inputMode="decimal"
          value={value}
          placeholder={placeholder}
          onChange={(e) => onChange(e.target.value)}
          className="w-full bg-transparent py-2.5 text-base font-medium outline-none placeholder:text-muted-foreground/50"
        />
      </div>
    </label>
  );
}

function Index() {
  const [basico, setBasico] = useState("");
  const [geo, setGeo] = useState("");
  const [pres, setPres] = useState("");
  const [presModo, setPresModo] = useState<"monto" | "pct">("monto");
  const [horas, setHoras] = useState<Record<string, { cant: string; valor: string }>>({
    t1: { cant: "", valor: "" }, t2: { cant: "", valor: "" }, t3: { cant: "", valor: "" },
  });

  const vBasico = num(basico);
  const vGeo = num(geo);
  const vPres = presModo === "pct" ? ((vBasico + vGeo) * num(pres)) / 100 : num(pres);
  const vTramos = tramos.map((t) => num(horas[t.key].cant) * num(horas[t.key].valor));
  const total = vBasico + vGeo + vPres + vTramos.reduce((a, b) => a + b, 0);

  const filas = [
    ["Sueldo básico", vBasico],
    ["Sueldo geográfico", vGeo],
    ["Presentismo", vPres],
    ...tramos.map((t, i) => [t.label, vTramos[i]] as [string, number]),
  ] as [string, number][];

  const setH = (k: string, f: "cant" | "valor", v: string) =>
    setHoras((h) => ({ ...h, [k]: { ...h[k], [f]: v } }));

  const reset = () => {
    setBasico(""); setGeo(""); setPres("");
    setHoras({ t1: { cant: "", valor: "" }, t2: { cant: "", valor: "" }, t3: { cant: "", valor: "" } });
  };

  return (
    <main className="min-h-screen px-4 py-10 md:py-16">
      <div className="mx-auto max-w-5xl">
        <header className="mb-10">
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-accent">Liquidación mensual</p>
          <h1 className="mt-2 font-display text-4xl font-bold md:text-6xl">Calculadora de sueldos</h1>
        </header>

        <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
          <div className="space-y-6">
            <section className="rounded-2xl border bg-card p-6 shadow-soft">
              <h2 className="mb-5 font-display text-xl font-semibold">Haberes fijos</h2>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Sueldo básico" prefix="$" value={basico} onChange={setBasico} />
                <Field label="Sueldo geográfico" prefix="$" value={geo} onChange={setGeo} />
              </div>
              <div className="mt-4">
                <div className="mb-1.5 flex items-center justify-between">
                  <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Presentismo</span>
                  <div className="flex rounded-full bg-muted p-0.5 text-xs font-semibold">
                    {(["monto", "pct"] as const).map((m) => (
                      <button key={m} onClick={() => setPresModo(m)}
                        className={`rounded-full px-3 py-1 transition ${presModo === m ? "bg-primary text-primary-foreground" : "text-muted-foreground"}`}>
                        {m === "monto" ? "$ Monto" : "% Porcentaje"}
                      </button>
                    ))}
                  </div>
                </div>
                <Field prefix={presModo === "monto" ? "$" : "%"} value={pres} onChange={setPres} />
                {presModo === "pct" && (
                  <p className="mt-1.5 text-xs text-muted-foreground">Se calcula sobre básico + geográfico = {fmt(vPres)}</p>
                )}
              </div>
            </section>

            <section className="rounded-2xl border bg-card p-6 shadow-soft">
              <h2 className="mb-5 font-display text-xl font-semibold">Horas por tramo</h2>
              <div className="space-y-4">
                {tramos.map((t, i) => (
                  <div key={t.key} className="grid items-end gap-3 rounded-xl bg-muted/60 p-4 sm:grid-cols-[1fr_1fr_auto]">
                    <div className="sm:col-span-3 -mb-1 text-sm font-semibold text-secondary-foreground">{t.label}</div>
                    <Field label="Cantidad" value={horas[t.key].cant} onChange={(v) => setH(t.key, "cant", v)} />
                    <Field label="Valor hora" prefix="$" value={horas[t.key].valor} onChange={(v) => setH(t.key, "valor", v)} />
                    <div className="pb-2.5 text-right text-sm font-semibold tabular-nums sm:min-w-28">{fmt(vTramos[i])}</div>
                  </div>
                ))}
              </div>
            </section>
          </div>

          <aside className="lg:sticky lg:top-8 lg:self-start">
            <div className="rounded-2xl bg-primary p-6 text-primary-foreground shadow-soft">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] opacity-70">Total bruto</p>
              <p className="mt-2 font-display text-4xl font-bold tabular-nums break-words">{fmt(total)}</p>
              <div className="my-6 h-px bg-primary-foreground/20" />
              <ul className="space-y-2.5 text-sm">
                {filas.map(([l, v]) => (
                  <li key={l} className="flex justify-between gap-4">
                    <span className="opacity-75">{l}</span>
                    <span className="font-semibold tabular-nums">{fmt(v)}</span>
                  </li>
                ))}
              </ul>
              <button onClick={reset}
                className="mt-6 w-full rounded-lg bg-accent py-2.5 text-sm font-bold text-accent-foreground transition hover:opacity-90">
                Limpiar todo
              </button>
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}
