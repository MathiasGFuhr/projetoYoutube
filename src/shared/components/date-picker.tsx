"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface DatePickerProps {
  value: string; // YYYY-MM-DD
  onChange: (value: string) => void;
  markedDates?: string[]; // YYYY-MM-DD[]
  placeholder?: string;
}

const MONTH_NAMES = [
  "Janeiro","Fevereiro","Março","Abril","Maio","Junho",
  "Julho","Agosto","Setembro","Outubro","Novembro","Dezembro",
];

const WEEK_DAYS = ["D","S","T","Q","Q","S","S"];

function pad2(n: number) { return String(n).padStart(2, "0"); }

function toYMD(d: Date) {
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
}

function parseYMD(s: string) {
  const [y, m, d] = s.split("-").map(Number);
  return new Date(y, m - 1, d);
}

function formatDisplay(s: string) {
  if (!s) return "";
  const [y, m, d] = s.split("-");
  return `${d}/${m}/${y}`;
}

function getCalendarDays(year: number, month: number) {
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const prevDays = new Date(year, month, 0).getDate();

  const days: { day: number; current: boolean; dateStr: string }[] = [];

  for (let i = firstDay - 1; i >= 0; i--) {
    const d = prevDays - i;
    const pm = month === 0 ? 11 : month - 1;
    const py = month === 0 ? year - 1 : year;
    days.push({ day: d, current: false, dateStr: toYMD(new Date(py, pm, d)) });
  }

  for (let d = 1; d <= daysInMonth; d++) {
    days.push({ day: d, current: true, dateStr: toYMD(new Date(year, month, d)) });
  }

  let nextD = 1;
  while (days.length < 42) {
    const nm = month === 11 ? 0 : month + 1;
    const ny = month === 11 ? year + 1 : year;
    days.push({ day: nextD, current: false, dateStr: toYMD(new Date(ny, nm, nextD)) });
    nextD++;
  }

  return days;
}

export function DatePicker({ value, onChange, markedDates = [], placeholder = "Selecionar data" }: DatePickerProps) {
  const [open, setOpen] = useState(false);
  const [viewDate, setViewDate] = useState(() => value ? parseYMD(value) : new Date());
  const containerRef = useRef<HTMLDivElement>(null);

  const selectedDate = value ? parseYMD(value) : null;
  const todayStr = toYMD(new Date());

  const days = getCalendarDays(viewDate.getFullYear(), viewDate.getMonth());

  const markedSet = new Set(markedDates);

  const goPrev = () => setViewDate((d) => new Date(d.getFullYear(), d.getMonth() - 1, 1));
  const goNext = () => setViewDate((d) => new Date(d.getFullYear(), d.getMonth() + 1, 1));

  const handleSelect = (dateStr: string) => {
    onChange(dateStr);
    setOpen(false);
  };

  // Close on click outside
  useEffect(() => {
    if (!open) return;
    const handleClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  const handleInputClick = useCallback(() => {
    setOpen(true);
    if (value) setViewDate(parseYMD(value));
  }, [value]);

  return (
    <div className="relative" ref={containerRef}>
      {/* Input */}
      <div
        className={cn(
          "relative flex items-center gap-2 w-full bg-zinc-900/80 border border-zinc-800/70 rounded-xl px-4 py-2.5 text-[13px] text-zinc-200 cursor-pointer transition-colors hover:border-zinc-600",
          open && "border-zinc-500"
        )}
        onClick={handleInputClick}
      >
        <CalendarIcon className="size-4 text-zinc-500 flex-shrink-0" />
        <span className={cn(!value && "text-zinc-600")}>
          {value ? formatDisplay(value) : placeholder}
        </span>
      </div>

      {/* Popup */}
      {open && (
        <div className="absolute z-50 mt-2 w-72 rounded-2xl border border-zinc-700/60 bg-[#141414] shadow-[0_20px_60px_rgba(0,0,0,0.6)] p-3">
          {/* Header */}
          <div className="flex items-center justify-between mb-3 px-1">
            <button
              onClick={goPrev}
              className="p-1 rounded-lg text-zinc-500 hover:text-zinc-200 hover:bg-zinc-800/60 transition-colors"
            >
              <ChevronLeft className="size-4" />
            </button>
            <span className="text-[13px] font-bold text-zinc-200">
              {MONTH_NAMES[viewDate.getMonth()]} {viewDate.getFullYear()}
            </span>
            <button
              onClick={goNext}
              className="p-1 rounded-lg text-zinc-500 hover:text-zinc-200 hover:bg-zinc-800/60 transition-colors"
            >
              <ChevronRight className="size-4" />
            </button>
          </div>

          {/* Week days */}
          <div className="grid grid-cols-7 mb-1">
            {WEEK_DAYS.map((d, i) => (
              <div key={i} className="text-center text-[10px] font-bold text-zinc-600 uppercase tracking-wider py-1">
                {d}
              </div>
            ))}
          </div>

          {/* Days */}
          <div className="grid grid-cols-7 gap-0.5">
            {days.map((day) => {
              const isSelected = selectedDate ? toYMD(selectedDate) === day.dateStr : false;
              const isToday = day.dateStr === todayStr;
              const isMarked = markedSet.has(day.dateStr);

              return (
                <button
                  key={day.dateStr}
                  onClick={() => handleSelect(day.dateStr)}
                  className={cn(
                    "relative h-8 rounded-lg text-[11px] font-medium transition-all flex items-center justify-center",
                    day.current
                      ? isSelected
                        ? "bg-red-500 text-white shadow-[0_4px_12px_rgba(255,31,31,0.4)]"
                        : isToday
                          ? "bg-zinc-800 text-zinc-200 border border-zinc-600"
                          : "text-zinc-300 hover:bg-zinc-800/60"
                      : "text-zinc-600 hover:text-zinc-400"
                  )}
                >
                  {day.day}
                  {isMarked && (
                    <span className={cn(
                      "absolute bottom-0.5 left-1/2 -translate-x-1/2 size-1 rounded-full",
                      isSelected ? "bg-white/70" : "bg-red-500"
                    )} />
                  )}
                </button>
              );
            })}
          </div>

          {/* Footer hint */}
          {markedDates.length > 0 && (
            <div className="mt-2 flex items-center gap-1.5 px-1">
              <span className="size-1.5 rounded-full bg-red-500" />
              <span className="text-[10px] text-zinc-500">Dias com projetos agendados</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
