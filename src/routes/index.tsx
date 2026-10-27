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

const haberesTripulantes = {
  basico: 1_011_830.24,
  geografico: 466_998.96,
  presentismo: 150_477.5,
} as const;

const valorHoraTripulantes: Record<"t1" | "t2" | "t3", number> = {
  t1: 22_855.22,
  t2: 27_426.27,
  t3: 29_711.79,
};

const noDutyTripulantes = 23_362.28;
const viaticosTripulantes = 83_081.03;
const alicuotaImpuestos = 0.17;
const aCentavos = (n: number) => Math.round(n * 100) / 100;

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
  const [horas, setHoras] = useState<Record<"t1" | "t2" | "t3", string>>({ t1: "", t2: "", t3: "" });
  const [noDuty, setNoDuty] = useState("");
  const [viaticos, setViaticos] = useState("");

  const vBasico = haberesTripulantes.basico;
  const vGeo = haberesTripulantes.geografico;
  const vPres = haberesTripulantes.presentismo;
  const vTramos = tramos.map((t) => num(horas[t.key]) * valorHoraTripulantes[t.key]);
  const vNoDuty = num(noDuty) * noDutyTripulantes;
  const total = vBasico + vGeo + vPres + vTramos.reduce((a, b) => a + b, 0) + vNoDuty;
  const impuestos = aCentavos(total * alicuotaImpuestos);
  const vViaticos = aCentavos(num(viaticos) * viaticosTripulantes);
  const neto = aCentavos(total - impuestos + vViaticos);

  const filas = [
    ["Sueldo básico", vBasico],
    ["Sueldo geográfico", vGeo],
    ["Presentismo", vPres],
    ...tramos.map((t, i) => [t.label, vTramos[i] ?? 0] as [string, number]),
    ["No duty Activado / Exception", vNoDuty],
  ] as [string, number][];

  const reset = () => {
    setHoras({ t1: "", t2: "", t3: "" });
    setNoDuty("");
    setViaticos("");
  };

  return (
    <main className="min-h-screen px-4 py-10 md:py-16">
      <div className="mx-auto max-w-5xl">
        <header className="mb-10">
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-accent">Liquidación mensual</p>
          <h1 className="mt-2 font-display text-4xl font-bold md:text-6xl">Calculadora de sueldos</h1>
          <p className="mt-3 text-lg font-semibold">Tripulantes de cabina</p>
        </header>

        <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
          <div className="space-y-6">
            <section className="rounded-2xl border bg-card p-6 shadow-soft">
              <h2 className="mb-5 font-display text-xl font-semibold">Haberes fijos</h2>
              <ul className="divide-y divide-border">
                {(
                  [
                    ["Sueldo básico", haberesTripulantes.basico],
                    ["Sueldo geográfico", haberesTripulantes.geografico],
                    ["Presentismo", haberesTripulantes.presentismo],
                  ] as const
                ).map(([label, valor]) => (
                  <li key={label} className="flex items-center justify-between gap-4 py-3 first:pt-0 last:pb-0">
                    <span className="text-sm font-semibold">{label}</span>
                    <span className="font-semibold tabular-nums">{fmt(valor)}</span>
                  </li>
                ))}
              </ul>
            </section>

            <section className="rounded-2xl border bg-card p-6 shadow-soft">
              <h2 className="mb-5 font-display text-xl font-semibold">Horas por tramo</h2>
              <div className="space-y-4">
                {tramos.map((t, i) => (
                  <div key={t.key} className="grid items-end gap-3 rounded-xl bg-muted/60 p-4 sm:grid-cols-[1fr_1fr_auto]">
                    <div className="sm:col-span-3 -mb-1 text-sm font-semibold text-secondary-foreground">{t.label}</div>
                    <Field label="Cantidad" value={horas[t.key]} onChange={(v) => setHoras((h) => ({ ...h, [t.key]: v }))} />
                    <div>
                      <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-muted-foreground">Valor hora</span>
                      <p className="py-2.5 text-base font-semibold tabular-nums">{fmt(valorHoraTripulantes[t.key])}</p>
                    </div>
                    <div className="pb-2.5 text-right text-sm font-semibold tabular-nums sm:min-w-28">{fmt(vTramos[i] ?? 0)}</div>
                  </div>
                ))}
                <div className="grid items-end gap-3 rounded-xl bg-muted/60 p-4 sm:grid-cols-[1fr_1fr_auto]">
                  <div className="sm:col-span-3 -mb-1 text-sm font-semibold text-secondary-foreground">No duty Activado / Exception</div>
                  <Field label="Cantidad" value={noDuty} onChange={setNoDuty} />
                  <div>
                    <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-muted-foreground">Valor</span>
                    <p className="py-2.5 text-base font-semibold tabular-nums">{fmt(noDutyTripulantes)}</p>
                  </div>
                  <div className="pb-2.5 text-right text-sm font-semibold tabular-nums sm:min-w-28">{fmt(vNoDuty)}</div>
                </div>
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
                <li className="flex justify-between gap-4 border-t border-primary-foreground/20 pt-2.5">
                  <span className="opacity-75">Impuestos (17%)</span>
                  <span className="font-semibold tabular-nums">− {fmt(impuestos)}</span>
                </li>
                <li className="flex justify-between gap-4">
                  <span className="opacity-75">Viáticos</span>
                  <span className="font-semibold tabular-nums">+ {fmt(vViaticos)}</span>
                </li>
              </ul>
              <div className="mt-6 rounded-xl bg-accent px-4 py-4 text-accent-foreground">
                <p className="text-xs font-semibold uppercase tracking-[0.2em]">Total neto</p>
                <p className="mt-1 font-display text-3xl font-bold tabular-nums break-words">{fmt(neto)}</p>
              </div>
              <button onClick={reset}
                className="mt-6 w-full rounded-lg bg-accent py-2.5 text-sm font-bold text-accent-foreground transition hover:opacity-90">
                Limpiar todo
              </button>
            </div>
          </aside>
        </div>

        <section className="mt-6 rounded-2xl border bg-card p-6 shadow-soft">
          <h2 className="font-display text-xl font-semibold">Viáticos</h2>
          <p className="mb-5 mt-1 text-sm text-muted-foreground">Van por fuera del recibo y se suman al total neto.</p>
          <div className="grid items-end gap-3 rounded-xl bg-muted/60 p-4 sm:grid-cols-[1fr_1fr_auto]">
            <Field label="Cantidad" value={viaticos} onChange={setViaticos} />
            <div>
              <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-muted-foreground">Valor</span>
              <p className="py-2.5 text-base font-semibold tabular-nums">{fmt(viaticosTripulantes)}</p>
            </div>
            <div className="pb-2.5 text-right text-sm font-semibold tabular-nums sm:min-w-28">{fmt(vViaticos)}</div>
          </div>
        </section>
      </div>
    </main>
  );
}
