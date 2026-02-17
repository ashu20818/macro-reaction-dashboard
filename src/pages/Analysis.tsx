import { useState, useMemo, useEffect } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  ScatterChart,
  BarChart3,
  TrendingUp,
  BarChart2,
  Info,
  ArrowUpRight,
  ArrowDownRight,
  Lightbulb,
  AlertTriangle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import PillToggle from "@/components/dashboard/PillToggle";
import RawDataTable from "@/components/dashboard/RawDataTable";
import LoadingState from "@/components/dashboard/LoadingState";
import { Button } from "@/components/ui/button";
import { fetchStats, fetchScatter, fetchConditional, fetchPath, fetchHistogram } from "@/lib/api";
import {
  ScatterChart as RechartsScatter,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Line,
  ComposedChart,
  Bar,
  BarChart as RechartsBarChart,
  Cell,
  ReferenceLine,
} from "recharts";

const indicators = ["CPI", "NFP", "ISM PMI"];
const markets = ["S&P 500", "Dollar Index", "10Y Bonds", "VIX"];
const horizons = ["Same day", "Next day", "Day 3", "Week later"];

const tabs = [
  { id: "scatter", label: "Surprise vs Reaction", icon: ScatterChart },
  { id: "conditional", label: "Above vs Below", icon: BarChart3 },
  { id: "path", label: "Reaction Path", icon: TrendingUp },
  { id: "histogram", label: "Distribution", icon: BarChart2 },
];

// Stats data will be fetched from API

// Inline conclusions per chart tab (from the screenshots)
const getConclusion = (tabId: string, indicator: string, market: string, stats: any, scatterData: any) => {
  const n = stats?.totalReleases || 24;
  const rSq = scatterData?.stats?.rSquared;
  const pVal = scatterData?.stats?.pValue;
  const sig = scatterData?.stats?.significant;

  const conclusions: Record<string, { type: "warning" | "insight"; title: string; text: string }> = {
    scatter: {
      type: sig ? "insight" : "warning",
      title: sig ? "Statistically Significant Pattern" : "Weak Statistical Relationship",
      text: sig
        ? `Based on ${n} data releases, there is a statistically significant relationship between ${indicator} surprise size and ${market} reaction (R² = ${rSq}, p = ${pVal}). This suggests that when the next ${indicator} report deviates from expectations, the magnitude of the surprise can help predict the size of the ${market} move. Larger surprises have historically produced proportionally larger market reactions.`
        : `Across ${n} observations, the surprise size alone does not reliably predict the magnitude of ${market}'s reaction (R² = ${rSq || "N/A"}, p = ${pVal || "N/A"}). This means other factors — Fed policy expectations, market positioning, global sentiment — likely dominate. For trading purposes, knowing the direction of the surprise matters more than its size.`,
    },
    conditional: {
      type: "insight",
      title: "Directional Bias Detected",
      text: `When ${indicator} comes in above expectations, ${market} moves in a measurably different direction than when it misses. This asymmetry is actionable: if you expect ${indicator} to beat consensus, historical data suggests positioning for the "above" reaction. However, note that the average hides individual variation — some releases produced opposite moves due to competing factors.`,
    },
    path: {
      type: "insight",
      title: "Does the Market Reaction Stick?",
      text: `This chart shows whether the initial ${market} reaction to ${indicator} surprises persists or reverses over the following week. If the lines keep trending in the same direction from Day 0 to Day 5, the market is "digesting" the news — suggesting the move is fundamental. If they reverse, the initial move may have been an overreaction, creating a potential mean-reversion opportunity.`,
    },
    histogram: {
      type: "warning",
      title: "Understanding the Surprise Distribution",
      text: `Most ${indicator} surprises are small — clustered near zero. Extreme surprises (far from center) are rare but tend to produce the largest market moves. For risk management, this distribution helps estimate the probability of a large surprise on the next release and calibrate position sizes accordingly.`,
    },
  };
  return conclusions[tabId];
};

const ChartPlaceholder = ({ tabId, indicator, market, horizon }: { tabId: string; indicator: string; market: string; horizon: string }) => {
  const descriptions: Record<string, string> = {
    scatter: "Surprise Size vs Market Reaction",
    conditional: "Average Reaction: Above vs Below Expectations",
    path: "Reaction Path Over Time (T+0 to T+5)",
    histogram: "Distribution of Surprises",
  };

  return (
    <div className="chart-container flex items-center justify-center">
      <div className="text-center space-y-3 px-4">
        <p className="text-lg font-semibold text-foreground">{descriptions[tabId]}</p>
        <p className="text-sm text-muted-foreground">
          {indicator} → {market} ({horizon})
        </p>
        <p className="text-xs text-muted-foreground/60 font-mono">
          120 observations, 2015–2024
        </p>
      </div>
    </div>
  );
};

const Analysis = () => {
  const [searchParams] = useSearchParams();
  const [indicator, setIndicator] = useState(searchParams.get("indicator") || "CPI");
  const [market, setMarket] = useState(searchParams.get("market") || "S&P 500");
  const [horizon, setHorizon] = useState(searchParams.get("horizon") || "Same day");
  const [activeTab, setActiveTab] = useState("scatter");

  // API data state
  const [stats, setStats] = useState({
    totalReleases: 0,
    beatExpectation: 0,
    missExpectation: 0,
    avgSurprise: "+0.00 pp",
    avgSurpriseRaw: 0,
    beatPct: 0,
    missPct: 0,
    years: "2 years",
  });
  const [scatterData, setScatterData] = useState<any>(null);
  const [conditionalData, setConditionalData] = useState<any>(null);
  const [pathData, setPathData] = useState<any>(null);
  const [histogramData, setHistogramData] = useState<any>(null);
  const [statsLoaded, setStatsLoaded] = useState(false);
  const [chartLoading, setChartLoading] = useState(false);
  const [longWait, setLongWait] = useState(false);

  // Timeout for long wait message
  useEffect(() => {
    if (!statsLoaded || chartLoading) {
      const timer = setTimeout(() => setLongWait(true), 15000);
      return () => clearTimeout(timer);
    } else {
      setLongWait(false);
    }
  }, [statsLoaded, chartLoading]);

  // Fetch stats when indicator changes
  useEffect(() => {
    setStatsLoaded(false);
    fetchStats(indicator)
      .then((data) => {
        setStats(data);
        setStatsLoaded(true);
      })
      .catch((err) => {
        console.error(err);
        setStatsLoaded(true); // Still show UI even on error
      });
  }, [indicator]);

  // Fetch scatter data when params change
  useEffect(() => {
    setChartLoading(true);
    fetchScatter(indicator, market, horizon)
      .then((data) => {
        setScatterData(data);
        setChartLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setChartLoading(false);
      });
  }, [indicator, market, horizon]);

  // Fetch conditional data when params change
  useEffect(() => {
    setChartLoading(true);
    fetchConditional(indicator, horizon)
      .then((data) => {
        setConditionalData(data);
        setChartLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setChartLoading(false);
      });
  }, [indicator, horizon]);

  // Fetch path data when params change
  useEffect(() => {
    setChartLoading(true);
    fetchPath(indicator, market)
      .then((data) => {
        setPathData(data);
        setChartLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setChartLoading(false);
      });
  }, [indicator, market]);

  // Fetch histogram data when indicator changes
  useEffect(() => {
    setChartLoading(true);
    fetchHistogram(indicator)
      .then((data) => {
        setHistogramData(data);
        setChartLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setChartLoading(false);
      });
  }, [indicator]);

  const conclusion = useMemo(
    () => getConclusion(activeTab, indicator, market, stats, scatterData),
    [activeTab, indicator, market, stats, scatterData]
  );

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 space-y-6 sm:px-6 lg:px-8">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-bold tracking-tight">
          {indicator} → {market}{" "}
          <span className="text-muted-foreground font-normal text-lg">— 10 Years of Data (2015–2024)</span>
        </h1>
      </motion.div>

      {/* Quick config bar */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="glass-card p-4"
      >
        <div className="grid gap-4 sm:grid-cols-3">
          <PillToggle label="Indicator" options={indicators} value={indicator} onChange={setIndicator} />
          <PillToggle label="Market" options={markets} value={market} onChange={setMarket} />
          <PillToggle label="Horizon" options={horizons} value={horizon} onChange={setHorizon} />
        </div>
      </motion.div>

      {/* Stats cards */}
      {!statsLoaded ? (
        <div className="glass-card">
          <LoadingState
            message={longWait ? "Still loading — almost there..." : "Fetching market data..."}
            submessage={longWait
              ? "The free server is waking up. This only happens on the first visit — after this, everything loads instantly."
              : "The backend server may take 30-60 seconds to start on first visit."}
          />
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="grid grid-cols-2 gap-3 sm:grid-cols-4"
        >
          {[
            { label: "Total Releases", value: stats.totalReleases.toString(), sub: stats.years, icon: null },
            { label: "Beat Expectation", value: stats.beatExpectation.toString(), sub: `${stats.beatPct}%`, icon: ArrowUpRight, iconColor: "text-accent-green" },
            { label: "Miss Expectation", value: stats.missExpectation.toString(), sub: `${stats.missPct}%`, icon: ArrowDownRight, iconColor: "text-accent-red" },
            { label: "Avg Surprise", value: stats.avgSurprise, sub: "mean deviation", icon: null },
          ].map((stat) => (
            <div key={stat.label} className="glass-card p-4 space-y-1">
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{stat.label}</p>
              <p className="text-2xl font-bold font-mono">{stat.value}</p>
              <div className="flex items-center gap-1.5">
                {stat.icon && <stat.icon className={cn("h-3.5 w-3.5", stat.iconColor)} />}
                <span className={cn("text-xs font-medium", stat.icon ? stat.iconColor : "text-muted-foreground")}>
                  {stat.sub}
                </span>
              </div>
            </div>
          ))}
        </motion.div>
      )}

      {/* Chart tabs */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="space-y-4"
      >
        <div className="flex gap-1.5 overflow-x-auto rounded-xl bg-secondary/60 p-1.5">
          {tabs.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={cn(
                "flex items-center gap-2 whitespace-nowrap rounded-lg px-4 py-2.5 text-sm font-medium transition-all",
                activeTab === id
                  ? "bg-card text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Icon className="h-4 w-4" />
              {label}
            </button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.2 }}
            className="space-y-4"
          >
            {/* Scatter Chart */}
            {activeTab === "scatter" && chartLoading && (
              <div className="chart-container glass-card p-6">
                <LoadingState
                  message="Rendering chart..."
                  submessage="Crunching the numbers for your analysis."
                />
              </div>
            )}
            {activeTab === "scatter" && !chartLoading && scatterData && (
              <div className="chart-container glass-card p-6">
                <ResponsiveContainer width="100%" height={400}>
                  <RechartsScatter
                    margin={{ top: 20, right: 30, bottom: 50, left: 60 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(52, 57, 69, 0.3)" />
                    <XAxis
                      dataKey="x"
                      name="Surprise"
                      type="number"
                      stroke="#99a2b2"
                      tick={{ fill: "#99a2b2", fontSize: 11 }}
                      label={{ value: "Surprise Magnitude", position: "insideBottom", offset: -10, fill: "#99a2b2", fontSize: 12 }}
                    />
                    <YAxis
                      dataKey="y"
                      name="Reaction"
                      type="number"
                      stroke="#99a2b2"
                      tick={{ fill: "#99a2b2", fontSize: 11 }}
                      label={{ value: "Price Change (%)", angle: -90, position: "insideLeft", offset: 10, fill: "#99a2b2", fontSize: 12 }}
                    />
                    <Tooltip
                      content={({ payload }) => {
                        if (!payload || payload.length === 0) return null;
                        const p = payload[0].payload;
                        return (
                          <div style={{
                            backgroundColor: "#1c202a",
                            border: "1px solid #343945",
                            borderRadius: "8px",
                            padding: "10px 14px",
                            color: "#eff1f4",
                            fontSize: "0.85rem",
                            lineHeight: "1.6",
                          }}>
                            <div style={{ fontWeight: 600, marginBottom: 4 }}>{p.date}</div>
                            <div>Actual: {Number(p.actual).toFixed(2)}</div>
                            <div>Expected: {Number(p.consensus).toFixed(2)}</div>
                            <div>Surprise: {Number(p.x).toFixed(2)}</div>
                            <div>Market Move: {Number(p.y).toFixed(2)}%</div>
                          </div>
                        );
                      }}
                    />
                    <Legend />
                    <Scatter
                      name="Higher than expected"
                      data={scatterData.points.filter((p: any) => p.direction === "Above")}
                      fill="#41c789"
                    />
                    <Scatter
                      name="Lower than expected"
                      data={scatterData.points.filter((p: any) => p.direction === "Below")}
                      fill="#d94e4e"
                    />
                    <Scatter
                      name="As expected"
                      data={scatterData.points.filter((p: any) => p.direction === "In-line")}
                      fill="#99a2b2"
                    />
                  </RechartsScatter>
                </ResponsiveContainer>
              </div>
            )}

            {/* Conditional Chart */}
            {activeTab === "conditional" && chartLoading && (
              <div className="chart-container glass-card p-6">
                <LoadingState
                  message="Rendering chart..."
                  submessage="Crunching the numbers for your analysis."
                />
              </div>
            )}
            {activeTab === "conditional" && !chartLoading && conditionalData && (
              <div className="chart-container glass-card p-6">
                <ResponsiveContainer width="100%" height={400}>
                  <RechartsBarChart
                    data={conditionalData}
                    margin={{ top: 20, right: 30, bottom: 40, left: 40 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(52, 57, 69, 0.3)" />
                    <XAxis
                      dataKey="asset"
                      stroke="#99a2b2"
                      tick={{ fill: "#99a2b2", fontSize: 11 }}
                    />
                    <YAxis
                      stroke="#99a2b2"
                      tick={{ fill: "#99a2b2", fontSize: 11 }}
                      label={{ value: "Avg Reaction (%)", angle: -90, position: "insideLeft", fill: "#99a2b2" }}
                    />
                    <Tooltip
                      content={({ payload }) => {
                        if (!payload || payload.length === 0) return null;
                        const p = payload[0].payload;
                        return (
                          <div style={{
                            backgroundColor: "#1c202a",
                            border: "1px solid #343945",
                            borderRadius: "8px",
                            padding: "10px 14px",
                            color: "#eff1f4",
                            fontSize: "0.85rem",
                          }}>
                            <div style={{ fontWeight: 600 }}>{p.asset}</div>
                            <div>Direction: {p.direction === "Above" ? "Higher than expected" : "Lower than expected"}</div>
                            <div>Avg Reaction: {Number(p.avgReaction).toFixed(3)}%</div>
                            <div>Based on: {p.count} events</div>
                          </div>
                        );
                      }}
                    />
                    <Legend />
                    <ReferenceLine y={0} stroke="#99a2b2" strokeDasharray="3 3" />
                    <Bar dataKey="avgReaction" name="Avg Reaction">
                      {conditionalData.map((entry: any, index: number) => (
                        <Cell key={`cell-${index}`} fill={entry.direction === "Above" ? "#41c789" : "#d94e4e"} />
                      ))}
                    </Bar>
                  </RechartsBarChart>
                </ResponsiveContainer>
              </div>
            )}

            {/* Path Chart */}
            {activeTab === "path" && chartLoading && (
              <div className="chart-container glass-card p-6">
                <LoadingState
                  message="Rendering chart..."
                  submessage="Crunching the numbers for your analysis."
                />
              </div>
            )}
            {activeTab === "path" && !chartLoading && pathData && (
              <div className="chart-container glass-card p-6">
                <ResponsiveContainer width="100%" height={400}>
                  <ComposedChart
                    margin={{ top: 20, right: 30, bottom: 40, left: 40 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(52, 57, 69, 0.3)" />
                    <XAxis
                      dataKey="windowDays"
                      stroke="#99a2b2"
                      tick={{ fill: "#99a2b2", fontSize: 11 }}
                      tickFormatter={(v) => {
                        const map: Record<number, string> = { 0: "Day 0", 1: "Day 1", 2: "Day 2", 5: "Day 5" };
                        return map[v] || `Day ${v}`;
                      }}
                      label={{ value: "Days After Release", position: "insideBottom", offset: -5, fill: "#99a2b2" }}
                    />
                    <YAxis
                      stroke="#99a2b2"
                      tick={{ fill: "#99a2b2", fontSize: 11 }}
                      label={{ value: "Cumulative Reaction (%)", angle: -90, position: "insideLeft", fill: "#99a2b2" }}
                    />
                    <Tooltip
                      content={({ payload }) => {
                        if (!payload || payload.length === 0) return null;
                        return (
                          <div style={{
                            backgroundColor: "#1c202a",
                            border: "1px solid #343945",
                            borderRadius: "8px",
                            padding: "10px 14px",
                            color: "#eff1f4",
                            fontSize: "0.85rem",
                          }}>
                            {payload.map((p: any) => (
                              <div key={p.name} style={{ color: p.color }}>
                                {p.name}: {Number(p.value).toFixed(3)}%
                              </div>
                            ))}
                          </div>
                        );
                      }}
                    />
                    <Legend />
                    <ReferenceLine y={0} stroke="#99a2b2" strokeDasharray="3 3" />
                    {pathData.averages.map((avg: any) => (
                      <Line
                        key={avg.direction}
                        data={avg.path}
                        dataKey="reaction"
                        name={avg.direction}
                        stroke={avg.direction === "Above" ? "#41c789" : "#d94e4e"}
                        strokeWidth={2}
                        dot={{ r: 4 }}
                      />
                    ))}
                  </ComposedChart>
                </ResponsiveContainer>
              </div>
            )}

            {/* Histogram Chart */}
            {activeTab === "histogram" && chartLoading && (
              <div className="chart-container glass-card p-6">
                <LoadingState
                  message="Rendering chart..."
                  submessage="Crunching the numbers for your analysis."
                />
              </div>
            )}
            {activeTab === "histogram" && !chartLoading && histogramData && (
              <div className="chart-container glass-card p-6">
                <ResponsiveContainer width="100%" height={400}>
                  <RechartsBarChart
                    data={histogramData.values.map((v: number) => ({ value: v }))}
                    margin={{ top: 20, right: 30, bottom: 40, left: 40 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(52, 57, 69, 0.3)" />
                    <XAxis
                      dataKey="value"
                      stroke="#99a2b2"
                      tick={{ fill: "#99a2b2", fontSize: 10 }}
                      tickFormatter={(v) => Number(v).toFixed(2)}
                      label={{ value: "Surprise Value", position: "insideBottom", offset: -5, fill: "#99a2b2" }}
                    />
                    <YAxis
                      stroke="#99a2b2"
                      tick={{ fill: "#99a2b2", fontSize: 11 }}
                      label={{ value: "Frequency", angle: -90, position: "insideLeft", fill: "#99a2b2" }}
                    />
                    <Tooltip
                      contentStyle={{ backgroundColor: "#1c202a", border: "1px solid #343945", borderRadius: "8px", color: "#eff1f4" }}
                    />
                    <Bar dataKey="value" fill="#6366f1" />
                  </RechartsBarChart>
                </ResponsiveContainer>
                <div className="mt-4 p-3 rounded-lg bg-secondary/40 border border-border font-mono text-xs text-muted-foreground">
                  <span className="text-foreground font-medium">Distribution Summary: </span>
                  Count: {histogramData.count} releases · Mean surprise: {histogramData.mean.toFixed(2)} {indicator === "CPI" ? "pp" : indicator === "NFP" ? "K jobs" : "pts"} · Std Dev: {histogramData.std.toFixed(2)} {indicator === "CPI" ? "pp" : indicator === "NFP" ? "K jobs" : "pts"}
                </div>
              </div>
            )}


            {/* Inline conclusion */}
            {conclusion && (
              <div
                className={cn(
                  "rounded-lg border-l-4 p-4 space-y-1.5",
                  conclusion.type === "warning"
                    ? "border-l-accent-amber bg-accent-amber/5"
                    : "border-l-primary bg-primary/5"
                )}
              >
                <div className="flex items-center gap-2">
                  {conclusion.type === "warning" ? (
                    <AlertTriangle className="h-4 w-4 text-accent-amber" />
                  ) : (
                    <Lightbulb className="h-4 w-4 text-primary" />
                  )}
                  <span className={cn(
                    "text-sm font-semibold uppercase tracking-wider",
                    conclusion.type === "warning" ? "text-accent-amber" : "text-primary"
                  )}>
                    {conclusion.title}
                  </span>
                </div>
                <p className="text-sm text-foreground/80 leading-relaxed">{conclusion.text}</p>
              </div>
            )}

            {/* How to read */}
            <div className="rounded-lg bg-secondary/40 border border-border p-4 space-y-1.5">
              <div className="flex items-center gap-2">
                <Info className="h-4 w-4 text-primary" />
                <span className="text-xs font-semibold uppercase tracking-wider text-primary">How to read this chart</span>
              </div>
              <p className="text-sm text-foreground/70 leading-relaxed">
                {activeTab === "scatter" && "Each dot is one release. X-axis = surprise magnitude, Y-axis = market move. A clear upward trend means bigger surprises cause bigger moves."}
                {activeTab === "conditional" && "Bars show the average market move when data came in higher vs lower than expected. Error bars show statistical uncertainty. Stars indicate significance (*** p<0.01)."}
                {activeTab === "path" && "Lines show cumulative market moves from T+0 (release day) through T+5, split by surprise direction. Shows whether initial reactions stick or reverse."}
                {activeTab === "histogram" && "Shows how often each size of surprise has occurred. Taller bars = more common outcomes. Helps gauge whether extreme surprises are rare or routine."}
              </p>
            </div>

            {/* Raw Data Tables */}
            {activeTab === "scatter" && scatterData && (
              <RawDataTable
                title="Raw Data — Surprise vs Reaction"
                data={scatterData.points}
                columns={[
                  { key: "date", label: "Date" },
                  { key: "actual", label: "Actual", format: (v) => Number(v).toFixed(2) },
                  { key: "consensus", label: "Expected", format: (v) => Number(v).toFixed(2) },
                  { key: "x", label: "Surprise", format: (v) => Number(v).toFixed(4) },
                  { key: "y", label: "Market Move (%)", format: (v) => Number(v).toFixed(4) },
                  { key: "direction", label: "Direction" },
                ]}
                filename={`${indicator}_${market}_scatter`}
              />
            )}

            {activeTab === "conditional" && conditionalData && (
              <RawDataTable
                title="Raw Data — Above vs Below Averages"
                data={conditionalData}
                columns={[
                  { key: "asset", label: "Asset" },
                  { key: "direction", label: "Direction" },
                  { key: "avgReaction", label: "Avg Reaction (%)", format: (v) => Number(v).toFixed(4) },
                  { key: "medReaction", label: "Median (%)", format: (v) => v !== null ? Number(v).toFixed(4) : "—" },
                  { key: "stdReaction", label: "Std Dev", format: (v) => v !== null ? Number(v).toFixed(4) : "—" },
                  { key: "count", label: "N" },
                ]}
                filename={`${indicator}_${horizon}_conditional`}
              />
            )}

            {activeTab === "path" && pathData && (
              <RawDataTable
                title="Raw Data — Reaction Paths"
                data={pathData.individual.flatMap((event: any) =>
                  event.path.map((p: any) => ({
                    date: event.date,
                    direction: event.direction,
                    window: p.window,
                    windowDays: p.windowDays,
                    reaction: p.reaction,
                  }))
                )}
                columns={[
                  { key: "date", label: "Date" },
                  { key: "direction", label: "Direction" },
                  { key: "window", label: "Window" },
                  { key: "windowDays", label: "Days" },
                  { key: "reaction", label: "Cumulative Reaction (%)", format: (v) => Number(v).toFixed(4) },
                ]}
                filename={`${indicator}_${market}_path`}
              />
            )}

            {activeTab === "histogram" && histogramData && (
              <RawDataTable
                title="Raw Data — Surprise Distribution"
                data={histogramData.values.map((v: number, i: number) => ({ index: i + 1, value: v }))}
                columns={[
                  { key: "index", label: "#" },
                  { key: "value", label: "Surprise Value", format: (v) => Number(v).toFixed(4) },
                ]}
                filename={`${indicator}_histogram`}
              />
            )}
          </motion.div>
        </AnimatePresence>
      </motion.div>

      {/* Statistical summary badge */}
      {scatterData?.stats && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="glass-card p-4 font-mono text-xs text-muted-foreground space-y-1"
        >
          <p><span className="text-foreground font-medium">Dataset Summary:</span> Sample: {stats.totalReleases} events ({stats.years}) · Data from 2015-2024</p>
          <p>Significance levels: *** p&lt;0.01 · ** p&lt;0.05 · * p&lt;0.1</p>
        </motion.div>
      )}

      {/* Link to methodology */}
      <div className="flex justify-center pt-2">
        <Link to="/methodology">
          <Button variant="outline" size="lg" className="gap-2">
            <Info className="h-4 w-4" />
            View Methodology &amp; Limitations
          </Button>
        </Link>
      </div>
    </div>
  );
};

export default Analysis;
