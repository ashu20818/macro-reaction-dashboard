import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowLeft, Database, Calculator, BarChart2, FlaskConical, AlertTriangle, Lightbulb } from "lucide-react";
import { Button } from "@/components/ui/button";

const sections = [
  {
    icon: Database,
    title: "Data Sources",
    content: [
      { label: "Economic Data", text: "Monthly releases of CPI (Consumer Price Index), NFP (Nonfarm Payrolls), and ISM PMI (Manufacturing Index) with consensus forecasts from Bloomberg/Reuters." },
      { label: "Market Data", text: "Daily prices for S&P 500 (SPY), US Dollar Index (DXY), VIX (volatility index), and 10-Year Treasury Yield sourced from Yahoo Finance and FRED." },
      { label: "Time Period", text: "Analysis covers 10 years of data from 2015–2024, providing 120 observations per indicator (monthly releases). This extended period captures multiple Fed policy regimes including the 2015–2018 hiking cycle, 2020–2021 QE period, and 2022–2024 inflation fight." },
    ],
  },
  {
    icon: Calculator,
    title: "Surprise Calculation",
    content: [
      { label: "Formula", text: "Surprise = Actual Value − Consensus Forecast. A positive surprise means the data came in higher than expected." },
      { label: "Standardization", text: "Surprises are expressed in their natural units (percentage points for CPI, thousands of jobs for NFP, index points for ISM PMI)." },
    ],
  },
  {
    icon: BarChart2,
    title: "Market Reaction Measurement",
    content: [
      { label: "T+0 (Release Day)", text: "Price change from previous close to close on release day — captures immediate market reaction." },
      { label: "T+5 (One Week)", text: "Cumulative change through five trading days — tests if the reaction persists or fades." },
      { label: "Approach", text: "This simplified approach focuses on the most meaningful questions: Does the market react immediately? And does that reaction persist over the following week?" },
    ],
  },
  {
    icon: FlaskConical,
    title: "Statistical Analysis",
    content: [
      { label: "Regression Analysis", text: "Ordinary Least Squares (OLS) regression with surprise as the independent variable and market reaction as the dependent variable. R² measures explanatory power." },
      { label: "Correlation Analysis", text: "Pearson correlation coefficients measure linear relationship strength between surprises and market moves." },
      { label: "Statistical Significance", text: "P-values indicate the probability that observed relationships occurred by chance. Convention: *** p<0.01, ** p<0.05, * p<0.1." },
      { label: "Average Analysis", text: "Mean reactions are calculated separately for positive and negative surprises to identify asymmetric market behavior." },
    ],
  },
];

const limitations = [
  { title: "Sample Size", text: "With 120 observations per indicator (10 years of monthly data), the analysis has reasonable statistical power. However, results may still be influenced by outlier events (e.g., COVID-19 shock in 2020, 2022 inflation surge)." },
  { title: "Omitted Variables", text: "Market reactions depend on many factors beyond data surprises: Fed policy expectations, geopolitical events, global growth trends, and market positioning. The regression R² values show that surprises explain only a portion of total price movement." },
  { title: "Non-Linear Effects", text: "This analysis assumes linear relationships, but markets may react disproportionately to very large surprises or regime changes (e.g., inflation breakout)." },
  { title: "Stale Consensus", text: "Consensus forecasts may not reflect real-time market expectations, especially if significant news arrives between forecast submission and data release." },
  { title: "Regime Dependence", text: "Relationships may vary across macro regimes. For example, good jobs data may boost stocks in expansion but hurt them during hiking cycles when it signals more Fed tightening." },
  { title: "Market Microstructure", text: "Intraday volatility, liquidity conditions, and positioning can amplify or dampen reactions on any given release day." },
];

const findings = [
  { title: "Inflation Surprises Drive Stock Reactions", text: "Analysis of 10 years of CPI data (120 total releases, 31 above consensus) shows that when inflation comes in hotter than expected, the S&P 500 tends to move -1.15% on average by the end of the week (p=0.110). This reaction persists through T+5, indicating that markets sustainably reprice Fed policy expectations in response to inflation surprises." },
  { title: "Jobs Surprises Impact Dollar Strength", text: "Analyzing 120 NFP releases over 10 years (69 above consensus), the U.S. Dollar Index moves +0.18% on average when jobs data beats expectations (p=0.245). The relationship is statistically weak, suggesting that dollar movements are dominated by other factors such as Fed policy expectations, global risk sentiment, and relative growth differentials." },
  { title: "VIX Spikes Are Asymmetric", text: "Examining all 120 CPI releases, hot inflation surprises cause VIX to move +0.16 pts on average, while cool surprises move it -0.38 pts. This asymmetry of -0.2 pts demonstrates the well-documented \"fear dominates greed\" phenomenon in options markets — negative surprises trigger sharper volatility spikes than positive surprises of equal magnitude." },
];

const Methodology = () => {
  return (
    <div className="mx-auto max-w-4xl px-4 py-8 space-y-10 sm:px-6 lg:px-8">
      {/* Back link */}
      <Link to="/analysis">
        <Button variant="ghost" size="sm" className="gap-2 text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4" />
          Back to Analysis
        </Button>
      </Link>

      {/* Title */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-3xl font-bold tracking-tight">Methodology & Limitations</h1>
        <p className="mt-2 text-muted-foreground">
          How the analysis works, what data is used, and important caveats to consider.
        </p>
      </motion.div>

      {/* Key Conclusions - FIRST (what recruiters read) */}
      <motion.section
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        className="space-y-4"
      >
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/15">
            <Lightbulb className="h-4.5 w-4.5 text-primary" />
          </div>
          <h2 className="text-xl font-semibold">Key Conclusions</h2>
        </div>
        <div className="space-y-4">
          {findings.map((finding, i) => (
            <div key={finding.title} className="glass-card p-5 space-y-2">
              <h3 className="text-base font-semibold">
                Finding {i + 1}: {finding.title}
              </h3>
              <p className="text-sm text-foreground/80 leading-relaxed">{finding.text}</p>
            </div>
          ))}
        </div>
      </motion.section>

      {/* Methodology sections */}
      {sections.map((section, i) => (
        <motion.section
          key={section.title}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 + 0.05 * i }}
          className="space-y-4"
        >
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/15">
              <section.icon className="h-4.5 w-4.5 text-primary" />
            </div>
            <h2 className="text-xl font-semibold">{section.title}</h2>
          </div>
          <div className="glass-card p-5 space-y-4">
            {section.content.map((item) => (
              <div key={item.label}>
                <span className="text-sm font-semibold text-primary">{item.label}: </span>
                <span className="text-sm text-foreground/80 leading-relaxed">{item.text}</span>
              </div>
            ))}
          </div>
        </motion.section>
      ))}

      {/* Limitations - LAST */}
      <motion.section
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.35 }}
        className="space-y-4"
      >
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-accent-amber/15">
            <AlertTriangle className="h-4.5 w-4.5 text-accent-amber" />
          </div>
          <h2 className="text-xl font-semibold">Limitations & Caveats</h2>
        </div>
        <div className="glass-card p-5 space-y-4">
          {limitations.map((item, i) => (
            <div key={item.title}>
              <span className="text-sm font-semibold text-foreground">{i + 1}. {item.title}: </span>
              <span className="text-sm text-foreground/80 leading-relaxed">{item.text}</span>
            </div>
          ))}
        </div>
      </motion.section>
    </div>
  );
};

export default Methodology;
