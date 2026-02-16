import { motion } from "framer-motion";
import { FileText, BarChart2, Clock } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const analyzes = [
  {
    category: "Economic Releases",
    items: [
      { name: "CPI", tip: "Consumer Price Index — measures inflation" },
      { name: "NFP", tip: "Non-Farm Payrolls — measures job growth" },
      { name: "ISM PMI", tip: "Purchasing Managers Index — measures manufacturing activity" },
    ],
  },
  {
    category: "Market Reactions",
    items: [
      { name: "S&P 500", tip: "Broad US stock market index (via SPY)" },
      { name: "Dollar Index", tip: "Measures USD strength against a basket of currencies" },
      { name: "10Y Bonds", tip: "US Treasury 10-year yield" },
      { name: "VIX", tip: "Volatility Index — market's 'fear gauge'" },
    ],
  },
];

const steps = [
  { icon: FileText, step: "1", title: "Pick an indicator", desc: "CPI, NFP, or ISM PMI" },
  { icon: BarChart2, step: "2", title: "Choose a market", desc: "Stocks, dollar, bonds, or VIX" },
  { icon: Clock, step: "3", title: "Set time horizon", desc: "Same day through one week later" },
];

const InfoCards = () => {
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      {/* What This Analyzes */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="glass-card p-6 space-y-5"
      >
        <h2 className="text-base font-semibold uppercase tracking-wider text-muted-foreground">
          What This Analyzes
        </h2>
        <div className="grid gap-4 sm:grid-cols-2">
          {analyzes.map((group) => (
            <div key={group.category} className="space-y-3">
              <h3 className="text-sm font-medium text-primary">{group.category}</h3>
              <div className="flex flex-wrap gap-2">
                {group.items.map((item) => (
                  <Tooltip key={item.name}>
                    <TooltipTrigger asChild>
                      <span className="metric-badge cursor-help border-dashed text-sm py-1.5 px-3">
                        {item.name}
                      </span>
                    </TooltipTrigger>
                    <TooltipContent side="top" className="max-w-[200px] text-xs">
                      {item.tip}
                    </TooltipContent>
                  </Tooltip>
                ))}
              </div>
            </div>
          ))}
          <div className="space-y-3 sm:col-span-2">
            <h3 className="text-sm font-medium text-primary">Measured Over</h3>
            <span className="metric-badge text-sm py-1.5 px-3">0–5 trading days (close-to-close)</span>
          </div>
        </div>
      </motion.div>

      {/* How to Use */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="glass-card p-6 space-y-5"
      >
        <h2 className="text-base font-semibold uppercase tracking-wider text-muted-foreground">
          How to Use
        </h2>
        <div className="space-y-4">
          {steps.map(({ icon: Icon, step, title, desc }) => (
            <div key={step} className="flex items-start gap-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/15 text-primary">
                <Icon className="h-5 w-5" />
              </div>
              <div>
                <p className="text-base font-medium">
                  <span className="text-primary mr-1">Step {step}.</span>
                  {title}
                </p>
                <p className="text-sm text-muted-foreground">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
};

export default InfoCards;
