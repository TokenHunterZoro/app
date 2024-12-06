import { TableHead } from "@/components/ui/table";
import { ChevronDown } from "lucide-react";

export default function SortableTableHeader({
  children,
  onClick,
  sorted,
  direction,
}: {
  children: React.ReactNode;
  onClick: () => void;
  sorted: boolean;
  direction: string;
}) {
  return (
    <TableHead
      onClick={onClick}
      className="cursor-pointer hover:bg-muted/60 transition-colors"
    >
      <div className="flex items-center gap-2">
        {children}
        <ChevronDown
          className={`h-4 w-4 transition-transform ${
            sorted ? "opacity-100" : "opacity-0"
          } ${direction === "desc" ? "rotate-180" : ""}`}
        />
      </div>
    </TableHead>
  );
}
