"use client";

import { useEffect, useState } from "react";
import { FireboyIcon, WatergirlIcon } from "./icons";

const API = "https://roomify.overunderdev.com/config";

type Color = "red" | "blue";

type Config = {
  min_bright: number;
  max_bright: number;
  rssi_far: number;
  rssi_near: number;
  smoothing: number;
};

type Field = {
  key: keyof Config;
  label: string;
  hint: string;
  min: number;
  max: number;
  step: number;
};

const FIELDS: Field[] = [
  { key: "min_bright", label: "Min brightness", hint: "0–255, when far apart", min: 0, max: 255, step: 1 },
  { key: "max_bright", label: "Max brightness", hint: "0–255, when close", min: 0, max: 255, step: 1 },
  { key: "rssi_far", label: "Far cutoff (dBm)", hint: "At/below this → min brightness", min: -100, max: 0, step: 1 },
  { key: "rssi_near", label: "Near cutoff (dBm)", hint: "At/above this → max brightness", min: -100, max: 0, step: 1 },
  { key: "smoothing", label: "Smoothing", hint: "Lower = smoother but slower", min: 0.001, max: 1, step: 0.001 },
];

const THEME: Record<
  Color,
  { name: string; Icon: typeof FireboyIcon; title: string; accent: string; ring: string; button: string }
> = {
  red: {
    name: "Fireboy",
    Icon: FireboyIcon,
    title: "text-orange-300",
    accent: "accent-red-500",
    ring: "border-red-600",
    button: "bg-red-600 active:bg-red-700",
  },
  blue: {
    name: "Watergirl",
    Icon: WatergirlIcon,
    title: "text-sky-300",
    accent: "accent-sky-500",
    ring: "border-sky-600",
    button: "bg-sky-600 active:bg-sky-700",
  },
};

function validate(c: Config): string | null {
  if (c.max_bright < c.min_bright) return "Max brightness must be ≥ min brightness.";
  if (c.rssi_near <= c.rssi_far) return "Near cutoff must be greater than far cutoff.";
  if (!(c.smoothing > 0 && c.smoothing <= 1)) return "Smoothing must be between 0 and 1.";
  return null;
}

function ColorSection({ color, initial }: { color: Color; initial: Config }) {
  const [config, setConfig] = useState<Config>(initial);
  const [saved, setSaved] = useState<Config>(initial);
  const [status, setStatus] = useState<{ kind: "ok" | "error"; text: string } | null>(null);
  const [busy, setBusy] = useState(false);
  const theme = THEME[color];

  const dirty = FIELDS.some((f) => config[f.key] !== saved[f.key]);
  const invalid = validate(config);

  function set(key: keyof Config, raw: string) {
    const value = Number(raw);
    if (Number.isNaN(value)) return;
    setConfig((c) => ({ ...c, [key]: value }));
    setStatus(null);
  }

  async function send(path: string, method: "PUT" | "POST", body?: Config) {
    setBusy(true);
    setStatus(null);
    try {
      const res = await fetch(`${API}/${color}${path}`, {
        method,
        headers: body ? { "Content-Type": "application/json" } : undefined,
        body: body ? JSON.stringify(body) : undefined,
      });
      const data = await res.json().catch(() => null);
      if (!res.ok) {
        const detail = typeof data?.detail === "string" ? data.detail : `HTTP ${res.status}`;
        throw new Error(detail);
      }
      setConfig(data);
      setSaved(data);
      setStatus({ kind: "ok", text: method === "PUT" ? "Saved. Press RESET on the board to apply." : "Reset to defaults." });
    } catch (e) {
      setStatus({ kind: "error", text: e instanceof Error ? e.message : "Request failed" });
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className={`stone-panel rounded-2xl border-2 ${theme.ring} p-4`}>
      <h2 className={`mb-3 flex items-center gap-2 font-temple text-xl font-bold ${theme.title}`}>
        <theme.Icon className="h-12 w-auto shrink-0" />
        {theme.name} <span className="text-sm font-normal opacity-70">({color})</span>
      </h2>

      <form
        className="flex flex-col gap-4"
        onSubmit={(e) => {
          e.preventDefault();
          if (!invalid) send("", "PUT", config);
        }}
      >
        {FIELDS.map((f) => (
          <label key={f.key} className="flex flex-col gap-1">
            <span className="flex items-baseline justify-between">
              <span className="font-medium">{f.label}</span>
              <span className="text-xs opacity-70">{f.hint}</span>
            </span>
            <div className="flex items-center gap-3">
              <input
                type="range"
                min={f.min}
                max={f.max}
                step={f.step}
                value={config[f.key]}
                onChange={(e) => set(f.key, e.target.value)}
                className={`h-8 flex-1 ${theme.accent}`}
              />
              <input
                type="number"
                inputMode={f.key === "smoothing" ? "decimal" : "numeric"}
                min={f.min}
                max={f.max}
                step={f.step}
                value={config[f.key]}
                onChange={(e) => set(f.key, e.target.value)}
                className="w-20 rounded-lg stone-input border px-2 py-2 text-right text-base tabular-nums"
              />
            </div>
          </label>
        ))}

        {invalid && <p className="text-sm text-amber-300">{invalid}</p>}
        {status && (
          <p className={`text-sm ${status.kind === "ok" ? "text-green-300" : "text-red-300"}`}>{status.text}</p>
        )}

        <div className="flex gap-3">
          <button
            type="submit"
            disabled={busy || !dirty || !!invalid}
            className={`flex-1 rounded-xl py-3 font-semibold text-white disabled:opacity-40 ${theme.button}`}
          >
            {busy ? "Saving…" : "Save"}
          </button>
          <button
            type="button"
            disabled={busy}
            onClick={() => send("/reset", "POST")}
            className="rounded-xl stone-input border px-4 py-3 font-medium disabled:opacity-40"
          >
            Reset
          </button>
        </div>
      </form>
    </section>
  );
}

export default function ConfigForm() {
  const [configs, setConfigs] = useState<Record<Color, Config> | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch(API)
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then(setConfigs)
      .catch((e) => setError(e instanceof Error ? e.message : "Failed to load"));
  }, []);

  if (error) return <p className="text-red-300">Couldn&apos;t load config: {error}</p>;
  if (!configs) return <p className="opacity-70">Loading…</p>;

  return (
    <div className="flex flex-col gap-6">
      <ColorSection color="red" initial={configs.red} />
      <ColorSection color="blue" initial={configs.blue} />
    </div>
  );
}
