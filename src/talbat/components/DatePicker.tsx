import * as React from "react";
import { Calendar as CalendarIcon } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { formatArabicDate } from "../utils/helpers";
import { cn } from "@/lib/utils";

interface DatePickerProps {
  value: string; // YYYY-MM-DD
  onChange: (value: string) => void;
  placeholder?: string;
}

export const DatePicker: React.FC<DatePickerProps> = ({ value, onChange, placeholder = "اختر التاريخ" }) => {
  const [open, setOpen] = React.useState(false);
  const date = value ? new Date(value + "T00:00:00") : undefined;
  const display = value ? formatArabicDate(value) : placeholder;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          className={cn(
            "w-full justify-between rounded-full border-0 ring-1 ring-line bg-paper px-4 py-3 text-sm font-medium text-ink hover:bg-white focus:ring-2 focus:ring-brass/20 min-h-[44px] h-11 font-cairo",
            !value && "text-copy-muted"
          )}
        >
          <span className="flex items-center gap-2">
            <span className="grid size-6 place-items-center rounded-full bg-brass/10 text-brass">
              <CalendarIcon className="w-3.5 h-3.5" strokeWidth={1.5} />
            </span>
            <span>{display}</span>
          </span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0 rounded-[1.5rem] bg-canvas ring-1 ring-line shadow-[0_24px_80px_-40px_rgba(26,18,7,0.18)] overflow-hidden border-0" align="start">
        <Calendar
          mode="single"
          selected={date}
          onSelect={(d) => {
            if (d) {
              const v = d.toISOString().split("T")[0];
              onChange(v);
              setOpen(false);
            }
          }}
          captionLayout="dropdown"
          className="p-3"
        />
      </PopoverContent>
    </Popover>
  );
};
