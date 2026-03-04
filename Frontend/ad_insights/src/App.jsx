import { useMemo } from "react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, LineChart, Line, Cell,
} from "recharts";

import platformRaw from "../src/assets/data/platform.json";
import industryRaw from "../src/assets/data/industry.json";
import campaignRaw from "../src/assets/data/campaign.json";
import countryRaw from "../src/assets/data/country.json";
import platformIndustry from "../src/assets/data/platform_industry.json";

// --- Colour palette --------
const C = {
  lime:"#a3e635",
  emerald:"#34d399",
  sky:"#38bdf8",
  rose:"#fb7185",
  amber:"#fbbf24",
  violet:"#a78bfa",
  grid:"#1e293b",
  muted:"#475569",
  card:"#0f172a",
};

function roasColor(value, min = 1, max = 6) {
  const t = Math.max(0, Math.min(1, (value - min) / (max - min)));
  const r = Math.round(30  + t * (163 - 30));
  const g = Math.round(41  + t * (230 - 41));
  const b = Math.round(59  + t * (53  - 59));
  return `rgb(${r},${g},${b})`;
}

// --Shared Recharts tooltip style ------------------------
const TT = {
  contentStyle: {
    backgroundColor: "#020617",
    border: "1px solid #1e293b",
    borderRadius: 10,
    fontSize: 12,
    color: "#e2e8f0",
    fontFamily: "monospace",
  },
  itemStyle:  { color: "#a3e635" },
  labelStyle:{ color: "#94a3b8", marginBottom: 4 },
  cursor:{ fill: "rgba(163,230,53,0.05)" },
};

const axisProps = {
  tick:     { fill: "#475569", fontSize: 11, fontFamily: "monospace" },
  axisLine: false,
  tickLine: false,
};

// --- Formatters ----------------------------
const fmtM  = (n) => n >= 1_000_000 ? `$${(n / 1_000_000).toFixed(1)}M` : n >= 1_000 ? `$${(n / 1_000).toFixed(0)}K` : `$${n}`;
const fmtN  = (n) => n >= 1_000_000 ? `${(n / 1_000_000).toFixed(1)}M`  : n >= 1_000 ? `${(n / 1_000).toFixed(0)}K`  : String(n);
const fmtPc = (n) => `${Number(n).toFixed(2)}%`;
const fmtX  = (n) => `${Number(n).toFixed(2)}x`;

// --- Sub-components --------------------------

function Pill({ children, positive }) {
  return (
    <span
      className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full ${
        positive ? "bg-lime-400/10 text-lime-400" : "bg-rose-400/10 text-rose-400"
      }`}
    >
      {positive ? "▲" : "▼"} {children}
    </span>
  );
}

function KPICard({ label, value, sub, accent = C.lime }) {
  return (
    <div className="relative bg-slate-900 rounded-2xl p-5 shadow-xl overflow-hidden group">
      {/* animated top border */}
      <div
        className="absolute inset-x-0 top-0 h-[2px] transition-opacity duration-300 opacity-50 group-hover:opacity-100"
        style={{ background: `linear-gradient(90deg, transparent, ${accent}, transparent)` }}
      />
      {/* dot-grid texture */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.025]"
        style={{
          backgroundImage: "radial-gradient(circle, #fff 1px, transparent 1px)",
          backgroundSize: "18px 18px",
        }}
      />
      <p className="text-[10px] font-bold tracking-[0.18em] uppercase text-slate-500 mb-3">{label}</p>
      <p className="text-3xl font-black tracking-tight text-white leading-none mb-3">{value}</p>
      {sub}
    </div>
  );
}

function ChartCard({ title, badge, children }) {
  return (
    <div className="bg-slate-900 rounded-2xl p-5 shadow-xl">
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2.5">
          <span className="w-[3px] h-5 rounded-full bg-lime-400" />
          <h2 className="text-[11px] font-bold tracking-[0.16em] uppercase text-slate-300">{title}</h2>
        </div>
        {badge && (
          <span className="text-[10px] font-mono text-slate-500 bg-slate-800 px-2 py-0.5 rounded-md">
            {badge}
          </span>
        )}
      </div>
      {children}
    </div>
  );
}

// --- Gradient defs helper ---------------------------
function GradDef({ id, top, bottom }) {
  return (
    <defs>
      <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%"   stopColor={top}    stopOpacity={0.95} />
        <stop offset="100%" stopColor={bottom} stopOpacity={0.55} />
      </linearGradient>
    </defs>
  );
}

// --- Heatmap -----------------------------------------------------
function Heatmap({ data }) {
  const platforms  = [...new Set(data.map((d) => d.platform))];
  const industries = [...new Set(data.map((d) => d.industry))];

  // build lookup map
  const lookup = {};
  data.forEach((d) => { lookup[`${d.platform}||${d.industry}`] = d; });

  const allRoas = data.map((d) => d.ROAS);
  const minR = Math.min(...allRoas);
  const maxR = Math.max(...allRoas);

  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse text-[11px] font-mono">
        <thead>
          <tr>
            <th className="text-left text-slate-500 pb-3 pr-4 font-semibold tracking-widest uppercase text-[9px] w-28">
              Platform
            </th>
            {industries.map((ind) => (
              <th key={ind} className="text-center text-slate-400 pb-3 px-1 font-semibold tracking-wide text-[9px] uppercase whitespace-nowrap">
                {ind}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {platforms.map((plat) => (
            <tr key={plat}>
              <td className="text-slate-400 pr-4 py-1 font-semibold text-[10px] whitespace-nowrap">{plat}</td>
              {industries.map((ind) => {
                const cell = lookup[`${plat}||${ind}`];
                const roas = cell?.ROAS ?? null;
                const bg   = roas !== null ? roasColor(roas, minR, maxR) : "#1e293b";
                const isHigh = roas !== null && roas > (minR + maxR) / 2;
                return (
                  <td key={ind} className="px-1 py-1 text-center">
                    <div
                      className="rounded-lg mx-auto flex flex-col items-center justify-center transition-transform duration-150 hover:scale-110 cursor-default"
                      style={{ backgroundColor: bg, width: 56, height: 40 }}
                      title={cell ? `${plat} × ${ind}\nROAS: ${roas}x\nSpend: ${fmtM(cell.ad_spend)}` : "No data"}
                    >
                      {roas !== null && (
                        <span
                          className="font-black text-[13px] leading-none"
                          style={{ color: isHigh ? "#020617" : "#e2e8f0" }}
                        >
                          {roas.toFixed(1)}
                        </span>
                      )}
                      {roas !== null && (
                        <span
                          className="text-[9px] leading-none mt-0.5 font-semibold opacity-70"
                          style={{ color: isHigh ? "#020617" : "#94a3b8" }}
                        >
                          ROAS
                        </span>
                      )}
                    </div>
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
      {/* Legend */}
      <div className="flex items-center gap-3 mt-4">
        <span className="text-[9px] text-slate-500 uppercase tracking-widest">Low</span>
        <div
          className="flex-1 h-2 rounded-full"
          style={{ background: `linear-gradient(90deg, ${roasColor(minR, minR, maxR)}, ${roasColor(maxR, minR, maxR)})` }}
        />
        <span className="text-[9px] text-slate-500 uppercase tracking-widest">High ROAS</span>
      </div>
    </div>
  );
}

// --- Dashboard ----------------------------
export default function Dashboard() {
  // -- KPIs ----------------------------------------------
  const kpis = useMemo(() => {
    const totalSpend       = platformRaw.reduce((s, r) => s + (r.ad_spend       ?? 0), 0);
    const totalClicks      = platformRaw.reduce((s, r) => s + (r.clicks         ?? 0), 0);
    const totalConversions = platformRaw.reduce((s, r) => s + (r.conversions    ?? 0), 0);
    const avgCVR           = totalConversions / totalClicks;
    return { totalSpend, totalClicks, totalConversions, avgCVR };
  }, []);

  // -- Chart data normalisations ----------------------------------------------------
  const platformChart = useMemo(() =>
    platformRaw.map((r) => ({ name: r.platform, Conversions: r.conversions ?? 0 })),
  []);

  const industryChart = useMemo(() =>
    industryRaw.map((r) => ({ name: r.industry, Revenue: r.revenue ?? 0 })),
  []);

  const campaignChart = useMemo(() =>
    campaignRaw.map((r) => ({ name: r.campaign_type, "Conv. Rate": r.conversion_rate ?? 0 })),
  []);

  const countryChart = useMemo(() =>
    countryRaw.map((r) => ({ name: r.country, ROAS: r.ROAS ?? 0 })),
  []);

  // -- Bar colours ---------------------------------------
  const BAR_PALETTE = [C.lime, C.emerald, C.sky, C.rose, C.amber, C.violet];

  return (
    <div
      className="min-h-screen bg-slate-950 p-6 md:p-8 lg:p-10"
      style={{ fontFamily: "'Syne', 'DM Mono', sans-serif" }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Mono:wght@400;500&display=swap');
        * { box-sizing: border-box; }
        ::-webkit-scrollbar { width: 6px; height: 6px; }
        ::-webkit-scrollbar-track { background: #020617; }
        ::-webkit-scrollbar-thumb { background: #1e293b; border-radius: 99px; }
      `}</style>

      {/* ── Header ── */}
      <header className="flex items-start justify-between mb-10">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2 h-2 rounded-full bg-lime-400 animate-pulse" />
            <span className="text-lime-400 text-[10px] font-bold tracking-[0.25em] uppercase font-mono">
              Live · All Platforms
            </span>
          </div>
          <h1 className="text-white text-3xl font-extrabold tracking-tight leading-none">
            Ad<span className="text-lime-400">Insight</span>
          </h1>
          <p className="text-slate-500 text-sm mt-1">Marketing Performance Dashboard</p>
        </div>
        <div className="hidden md:flex items-center gap-3 text-[11px] font-mono text-slate-500">
          <span className="bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5">
            {platformRaw.length} Platforms
          </span>
          <span className="bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5">
            {industryRaw.length} Industries
          </span>
          <span className="bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5">
            {countryRaw.length} Countries
          </span>
        </div>
      </header>

      {/* ── KPI Cards ── */}
      <section className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <KPICard
          label="Total Ad Spend"
          value={fmtM(kpis.totalSpend)}
          accent={C.lime}
          sub={<Pill positive>{fmtM(kpis.totalSpend / platformRaw.length)} avg/platform</Pill>}
        />
        <KPICard
          label="Total Clicks"
          value={fmtN(kpis.totalClicks)}
          accent={C.sky}
          sub={<Pill positive>{fmtN(kpis.totalClicks / platformRaw.length)} avg/platform</Pill>}
        />
        <KPICard
          label="Total Conversions"
          value={fmtN(kpis.totalConversions)}
          accent={C.emerald}
          sub={<Pill positive>{((kpis.totalConversions / kpis.totalClicks) * 100).toFixed(2)}% overall rate</Pill>}
        />
        <KPICard
          label="Avg Conversion Rate"
          value={fmtPc(kpis.avgCVR*100)}
          accent={C.amber}
          sub={<Pill positive>Across {platformRaw.length} platforms</Pill>}
        />
      </section>

      {/* ── Charts Row 1 ── */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">

        {/* Platform Conversions */}
        <ChartCard title="Platform Conversions" badge={`n=${platformRaw.length}`}>
          <ResponsiveContainer width="100%" height={230}>
            <BarChart data={platformChart} barSize={28} margin={{ top: 4, right: 8, bottom: 0, left: 0 }}>
              <GradDef id="gA" top={C.lime} bottom="#4d7c0f" />
              <CartesianGrid strokeDasharray="3 3" stroke={C.grid} vertical={false} />
              <XAxis dataKey="name" {...axisProps} />
              <YAxis {...axisProps} tickFormatter={fmtN} width={52} />
              <Tooltip
                contentStyle={TT.contentStyle}
                itemStyle={TT.itemStyle}
                labelStyle={TT.labelStyle}
                cursor={TT.cursor}
                formatter={(v) => [fmtN(v), "Conversions"]}
              />
              <Bar dataKey="Conversions" fill="url(#gA)" radius={[6, 6, 0, 0]}>
                {platformChart.map((_, i) => (
                  <Cell key={i} fill={BAR_PALETTE[i % BAR_PALETTE.length]} fillOpacity={0.85} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Industry Revenue */}
        <ChartCard title="Industry Revenue" badge={`n=${industryRaw.length}`}>
          <ResponsiveContainer width="100%" height={230}>
            <BarChart data={industryChart} barSize={28} margin={{ top: 4, right: 8, bottom: 0, left: 0 }}>
              <GradDef id="gB" top={C.sky} bottom="#0369a1" />
              <CartesianGrid strokeDasharray="3 3" stroke={C.grid} vertical={false} />
              <XAxis dataKey="name" {...axisProps} />
              <YAxis {...axisProps} tickFormatter={fmtM} width={56} />
              <Tooltip
                contentStyle={TT.contentStyle}
                itemStyle={{ color: C.sky }}
                labelStyle={TT.labelStyle}
                cursor={TT.cursor}
                formatter={(v) => [fmtM(v), "Revenue"]}
              />
              <Bar dataKey="Revenue" radius={[6, 6, 0, 0]}>
                {industryChart.map((_, i) => (
                  <Cell key={i} fill={BAR_PALETTE[(i + 2) % BAR_PALETTE.length]} fillOpacity={0.85} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </section>

      {/* ── Charts Row 2 ── */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">

        {/* Campaign Conversion Rate */}
        <ChartCard title="Campaign Type — Conversion Rate" badge={`n=${campaignRaw.length}`}>
          <ResponsiveContainer width="100%" height={230}>
            <BarChart data={campaignChart} barSize={28} margin={{ top: 4, right: 8, bottom: 0, left: 0 }}>
              <GradDef id="gC" top={C.amber} bottom="#92400e" />
              <CartesianGrid strokeDasharray="3 3" stroke={C.grid} vertical={false} />
              <XAxis dataKey="name" {...axisProps} />
              <YAxis {...axisProps} tickFormatter={(v) => `${(v *100).toFixed(1)}%`} width={44} />
              <Tooltip
                contentStyle={TT.contentStyle}
                itemStyle={{ color: C.amber }}
                labelStyle={TT.labelStyle}
                cursor={TT.cursor}
                formatter={(v) => [`${(v * 100).toFixed(2)}%`, "Conv. Rate"]}
              />
              <Bar dataKey="Conv. Rate" radius={[6, 6, 0, 0]}>
                {campaignChart.map((_, i) => (
                  <Cell key={i} fill={BAR_PALETTE[(i + 3) % BAR_PALETTE.length]} fillOpacity={0.85} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Country ROAS Line */}
        <ChartCard title="Country ROAS" badge={`n=${countryRaw.length}`}>
          <ResponsiveContainer width="100%" height={230}>
            <LineChart data={countryChart} margin={{ top: 4, right: 16, bottom: 0, left: 0 }}>
              <defs>
                <linearGradient id="lineGrad" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%"   stopColor={C.lime} />
                  <stop offset="100%" stopColor={C.sky}  />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke={C.grid} />
              <XAxis dataKey="name" {...axisProps} />
              <YAxis
                {...axisProps}
                tickFormatter={fmtX}
                domain={["auto", "auto"]}
                width={44}
              />
              <Tooltip
                contentStyle={TT.contentStyle}
                itemStyle={{ color: C.lime }}
                labelStyle={TT.labelStyle}
                cursor={{ stroke: "#334155" }}
                formatter={(v) => [fmtX(v), "ROAS"]}
              />
              <Line
                type="monotone"
                dataKey="ROAS"
                stroke="url(#lineGrad)"
                strokeWidth={2.5}
                dot={{ fill: C.lime, r: 4, strokeWidth: 2, stroke: "#020617" }}
                activeDot={{ r: 6, fill: C.lime, stroke: "#020617", strokeWidth: 2 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>
      </section>

      {/* -- Heatmap (full width) -- */}
      <section>
        <ChartCard
          title="Platform × Industry ROAS Heatmap"
          badge={`${platformIndustry.length} combos`}
        >
          <Heatmap data={platformIndustry} />
        </ChartCard>
      </section>

      {/* Footer */}
      <footer className="mt-8 flex items-center justify-between text-[15px] font-mono text-slate-700">
        <span>Data Source: Kaggle – Global Ads Performance (Google, Meta, TikTok) (CC0)</span>
      </footer>
    </div>
  );
}