import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Play, Loader2, Activity, TrendingUp, BarChart3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import PillToggle from "@/components/dashboard/PillToggle";

const indicators = ["CPI", "NFP", "ISM PMI"];
const markets = ["S&P 500", "Dollar Index", "10Y Bonds", "VIX"];
const horizons = ["Same day", "Next day", "Day 3", "Week later"];

const chips = [
  { icon: Activity, label: "10 Years of Data" },
  { icon: TrendingUp, label: "4 Major Markets" },
  { icon: BarChart3, label: "3 Key Indicators" },
];

const Index = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [indicator, setIndicator] = useState("CPI");
  const [market, setMarket] = useState("S&P 500");
  const [horizon, setHorizon] = useState("Same day");

  const handleAnalyze = useCallback(() => {
    setIsLoading(true);
    setTimeout(() => {
      navigate(
        `/analysis?indicator=${encodeURIComponent(indicator)}&market=${encodeURIComponent(market)}&horizon=${encodeURIComponent(horizon)}`
      );
    }, 600);
  }, [indicator, market, horizon, navigate]);

  return (
    <div className="mx-auto max-w-5xl px-4 py-16 sm:px-6 lg:px-8">
      {/* Hero */}
      <motion.section
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center space-y-5"
      >
        <h1 className="text-4xl sm:text-5xl font-bold tracking-tight">
          Decode Market Reactions to{" "}
          <span className="text-primary">Economic Surprises</span>
        </h1>
        <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
          Analyze 10 years of data showing how stocks, bonds, and currencies react
          when economic indicators beat or miss expectations.
        </p>
        <div className="flex flex-wrap justify-center gap-3 pt-2">
          {chips.map(({ icon: Icon, label }) => (
            <span key={label} className="metric-badge text-sm py-2 px-4">
              <Icon className="h-4 w-4 text-primary" />
              {label}
            </span>
          ))}
        </div>
      </motion.section>

      {/* Configuration */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25 }}
        className="glass-card mt-12 p-6 sm:p-8 space-y-6"
      >
        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold uppercase tracking-wider text-muted-foreground">
            Configure Analysis
          </h2>
          <span className="metric-badge text-xs hidden sm:inline-flex">
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

        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <Button
            onClick={handleAnalyze}
            disabled={isLoading}
            size="lg"
            className="gap-2 text-base px-10"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                Loading...
              </>
            ) : (
              <>
                <Play className="h-5 w-5" />
                Analyze
              </>
            )}
          </Button>
          <div className="space-y-0.5">
            <p className="text-sm text-muted-foreground">
              See how <span className="text-foreground font-medium">{market}</span> reacts to{" "}
              <span className="text-foreground font-medium">{indicator}</span> surprises
            </p>
            <p className="text-xs text-muted-foreground/60">
              First load may take 30–60s while the server wakes up.
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Index;
