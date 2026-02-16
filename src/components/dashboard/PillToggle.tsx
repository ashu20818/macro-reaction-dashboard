import { cn } from "@/lib/utils";

interface PillToggleProps {
  options: string[];
  value: string;
  onChange: (value: string) => void;
  label: string;
}

const PillToggle = ({ options, value, onChange, label }: PillToggleProps) => {
  return (
    <div className="space-y-3">
      <label className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
        {label}
      </label>
      <div className="flex flex-wrap gap-2 rounded-xl bg-secondary/60 p-1.5">
        {options.map((option) => (
          <button
            key={option}
            onClick={() => onChange(option)}
            className={cn(
              "pill-toggle text-sm",
              value === option && "pill-toggle-active"
            )}
          >
            {option}
          </button>
        ))}
      </div>
    </div>
  );
};

export default PillToggle;
