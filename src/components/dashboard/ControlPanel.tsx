import { useState } from "react";
import { motion } from "framer-motion";
import { Play, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import PillToggle from "./PillToggle";

const indicators = ["CPI", "NFP", "ISM PMI"];
const markets = ["S&P 500", "Dollar Index", "10Y Bonds", "VIX"];
const horizons = ["Same day", "Next day", "Day 3", "Week later"];

interface ControlPanelProps {
  onAnalyze: (config: { indicator: string; market: string; horizon: string }) => void;
  isLoading: boolean;
}

const ControlPanel = ({ onAnalyze, isLoading }: ControlPanelProps) => {
  const [indicator, setIndicator] = useState("CPI");
  const [market, setMarket] = useState("S&P 500");
  const [horizon, setHorizon] = useState("Same day");

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      className="glass-card p-6 space-y-6"
    >
      <div className="flex items-center justify-between">
        <h2 className="text-base font-semibold uppercase tracking-wider text-muted-foreground">
          Configure Analysis
        </h2>
        <span className="metric-badge text-xs">
          Methodology: close-to-close (0–5 days)
        </span>
      </div>

      <div className="grid gap-6 sm:grid-cols-3">
        <PillToggle
          label="Economic Indicator"
          options={indicators}
          value={indicator}
          onChange={setIndicator}
        />
        <PillToggle
          label="Market"
          options={markets}
          value={market}
          onChange={setMarket}
        />
        <PillToggle
          label="Time Horizon"
          options={horizons}
          value={horizon}
          onChange={setHorizon}
        />
      </div>

      <div className="flex items-center gap-4">
        <Button
          onClick={() => onAnalyze({ indicator, market, horizon })}
          disabled={isLoading}
          size="lg"
          className="gap-2 text-base px-8"
        >
          {isLoading ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            <Play className="h-5 w-5" />
          )}
          Analyze
        </Button>
        <p className="text-sm text-muted-foreground">
          Shows how {market} historically reacted to {indicator} surprises ({horizon.toLowerCase()})
        </p>
      </div>
    </motion.div>
  );
};

export default ControlPanel;
