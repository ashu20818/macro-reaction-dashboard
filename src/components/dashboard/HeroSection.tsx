import { Activity, TrendingUp, BarChart3 } from "lucide-react";
import { motion } from "framer-motion";

const chips = [
  { icon: Activity, label: "Economic Surprises" },
  { icon: TrendingUp, label: "Market Reactions" },
  { icon: BarChart3, label: "Multi-Day Patterns" },
];

const HeroSection = () => {
  return (
    <motion.section
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-4"
    >
      <div className="flex items-center gap-3">
        <div className="h-10 w-1.5 rounded-full bg-primary" />
        <h1 className="text-4xl font-bold tracking-tight">
          Macro Event Reaction Dashboard
        </h1>
      </div>
      <p className="max-w-2xl text-lg text-muted-foreground">
        How markets react when economic data surprises Wall Street — and whether the reaction sticks or fades.
      </p>
      <div className="flex flex-wrap gap-3 pt-2">
        {chips.map(({ icon: Icon, label }) => (
          <span key={label} className="metric-badge text-sm py-1.5 px-3.5">
            <Icon className="h-4 w-4 text-primary" />
            {label}
          </span>
        ))}
      </div>
    </motion.section>
  );
};

export default HeroSection;
