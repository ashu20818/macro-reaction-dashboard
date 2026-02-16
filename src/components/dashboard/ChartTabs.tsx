import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ScatterChart, BarChart3, TrendingUp, BarChart2, Info } from "lucide-react";
import { cn } from "@/lib/utils";

const tabs = [
  { id: "scatter", label: "Surprise vs Reaction", icon: ScatterChart },
  { id: "conditional", label: "Above vs Below", icon: BarChart3 },
  { id: "path", label: "Reaction Path", icon: TrendingUp },
  { id: "histogram", label: "Surprise Distribution", icon: BarChart2 },
];

interface ChartTabsProps {
  config: { indicator: string; market: string; horizon: string } | null;
}

const MockChart = ({ tabId, config }: { tabId: string; config: { indicator: string; market: string; horizon: string } }) => {
  const descriptions: Record<string, { title: string; howToRead: string; whyMatters: string }> = {
    scatter: {
      title: "Surprise Size vs Market Reaction",
      howToRead: "Each dot is one release. X-axis = how much the actual number beat or missed expectations. Y-axis = how the market moved that day.",
      whyMatters: "If dots trend upward, bigger surprises tend to cause bigger moves — the market is listening to this data.",
    },
    conditional: {
      title: "Average Reaction: Above vs Below Expectations",
      howToRead: "Bars show the average market move when the data came in higher (above) vs lower (below) than expected.",
      whyMatters: "Tells you the typical market direction depending on whether the number was good or bad news.",
    },
    path: {
      title: "Reaction Path Over Time",
      howToRead: "Lines show the average cumulative market move from day 0 (release) through day 5, split by surprise direction.",
      whyMatters: "Shows whether the initial reaction sticks, reverses, or keeps building — crucial for understanding market digestion.",
    },
    histogram: {
      title: "Distribution of Surprises",
      howToRead: "Shows how often each size of surprise has occurred historically. Taller bars = more common outcomes.",
      whyMatters: "Helps you understand whether extreme surprises are rare or routine for this indicator.",
    },
  };

  const desc = descriptions[tabId];

  return (
    <div className="space-y-4">
      <div className="chart-container flex items-center justify-center">
        <div className="text-center space-y-3">
          <div className="mx-auto h-48 w-full max-w-md rounded-md bg-secondary/30 border border-border flex items-center justify-center">
            <div className="space-y-2 text-center px-4">
              <p className="text-base font-medium text-foreground">
                {desc.title}
              </p>
              <p className="text-sm text-muted-foreground">
                {config.indicator} → {config.market} ({config.horizon})
              </p>
              <p className="text-xs text-muted-foreground/60 font-mono">
                Connect your Python backend to render live Plotly charts here
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* How to read + Why this matters */}
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="rounded-lg bg-secondary/40 border border-border p-4 space-y-1.5">
          <div className="flex items-center gap-2">
            <Info className="h-4 w-4 text-primary" />
            <span className="text-xs font-semibold uppercase tracking-wider text-primary">How to read</span>
          </div>
          <p className="text-sm text-foreground/80 leading-relaxed">{desc.howToRead}</p>
        </div>
        <div className="rounded-lg bg-secondary/40 border border-border p-4 space-y-1.5">
          <div className="flex items-center gap-2">
            <Info className="h-4 w-4 text-accent-amber" />
            <span className="text-xs font-semibold uppercase tracking-wider text-accent-amber">Why this matters</span>
          </div>
          <p className="text-sm text-foreground/80 leading-relaxed">{desc.whyMatters}</p>
        </div>
      </div>
    </div>
  );
};

const ChartTabs = ({ config }: ChartTabsProps) => {
  const [activeTab, setActiveTab] = useState("scatter");

  if (!config) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
      className="space-y-4"
    >
      {/* Tab bar */}
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

      {/* Chart content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -4 }}
          transition={{ duration: 0.2 }}
        >
          <MockChart tabId={activeTab} config={config} />
        </motion.div>
      </AnimatePresence>

      {/* Example interpretation */}
      <div className="rounded-lg border border-dashed border-border bg-secondary/25 p-4">
        <p className="text-sm text-foreground/80">
          <span className="font-semibold text-foreground">Example interpretation:</span>{" "}
          "When {config.indicator} comes in above expectations, {config.market} has historically moved +0.3% on {config.horizon.toLowerCase()}, 
          suggesting the market treats this as a meaningful signal."
        </p>
      </div>
    </motion.div>
  );
};

export default ChartTabs;
