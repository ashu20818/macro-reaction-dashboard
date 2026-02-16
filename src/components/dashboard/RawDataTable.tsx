import { useState } from "react";
import { ChevronDown, ChevronUp, Download } from "lucide-react";
import { Button } from "@/components/ui/button";

interface RawDataTableProps {
  title: string;
  data: Record<string, any>[];
  columns: { key: string; label: string; format?: (v: any) => string }[];
  filename: string;
}

const RawDataTable = ({ title, data, columns, filename }: RawDataTableProps) => {
  const [isOpen, setIsOpen] = useState(false);

  const downloadCSV = () => {
    const header = columns.map((c) => c.label).join(",");
    const rows = data.map((row) =>
      columns.map((c) => {
        const val = row[c.key];
        return typeof val === "string" && val.includes(",") ? `"${val}"` : val ?? "";
      }).join(",")
    );
    const csv = [header, ...rows].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${filename}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="glass-card mt-4">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-4 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
      >
        <span>{title} ({data.length} rows)</span>
        {isOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
      </button>

      {isOpen && (
        <div className="px-4 pb-4 space-y-3">
          <div className="flex justify-end">
            <Button variant="outline" size="sm" onClick={downloadCSV} className="gap-2">
              <Download className="h-3.5 w-3.5" />
              Download CSV
            </Button>
          </div>
          <div className="overflow-x-auto max-h-[300px] overflow-y-auto">
            <table className="w-full text-sm">
              <thead className="sticky top-0 bg-card">
                <tr>
                  {columns.map((col) => (
                    <th key={col.key} className="text-left px-3 py-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground border-b border-border">
                      {col.label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {data.map((row, i) => (
                  <tr key={i} className="border-b border-border/50 hover:bg-secondary/30">
                    {columns.map((col) => (
                      <td key={col.key} className="px-3 py-2 text-foreground/80 font-mono text-xs">
                        {col.format ? col.format(row[col.key]) : row[col.key] ?? "—"}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default RawDataTable;
