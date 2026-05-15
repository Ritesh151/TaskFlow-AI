'use client';
import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Calendar, X } from 'lucide-react';
import { cn } from '@/lib/utils';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
const DAYS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

function toYMD(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function fromYMD(s: string): Date {
  // Parse as local date (avoid UTC offset shifting the day)
  const [y, m, d] = s.split('-').map(Number);
  return new Date(y, m - 1, d);
}

function formatDisplay(ymd: string): string {
  if (!ymd) return '';
  const d = fromYMD(ymd);
  return d.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

function daysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate();
}

function firstDayOfMonth(year: number, month: number): number {
  return new Date(year, month, 1).getDay();
}

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------
export interface DatePickerProps {
  value: string;           // YYYY-MM-DD
  onChange: (ymd: string) => void;
  label?: string;
  required?: boolean;
  error?: string;
  placeholder?: string;
  /** Disable dates before this YYYY-MM-DD (inclusive) */
  minDate?: string;
  /** Disable dates after this YYYY-MM-DD (inclusive) */
  maxDate?: string;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------
export function DatePicker({
  value,
  onChange,
  label,
  required,
  error,
  placeholder = 'Select a date',
  minDate,
  maxDate,
}: DatePickerProps) {
  const today = toYMD(new Date());

  // Derive initial view month from value or today
  const initial = value ? fromYMD(value) : new Date();
  const [viewYear, setViewYear] = useState(initial.getFullYear());
  const [viewMonth, setViewMonth] = useState(initial.getMonth());
  const [open, setOpen] = useState(false);
  const [yearInput, setYearInput] = useState(false); // year-jump mode

  const containerRef = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    function handle(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handle);
    return () => document.removeEventListener('mousedown', handle);
  }, [open]);

  // Close on Escape
  useEffect(() => {
    if (!open) return;
    function handle(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false);
    }
    document.addEventListener('keydown', handle);
    return () => document.removeEventListener('keydown', handle);
  }, [open]);

  // Sync view to selected value when picker opens
  function handleOpen() {
    if (value) {
      const d = fromYMD(value);
      setViewYear(d.getFullYear());
      setViewMonth(d.getMonth());
    }
    setOpen(true);
    setYearInput(false);
  }

  function prevMonth() {
    if (viewMonth === 0) { setViewMonth(11); setViewYear(y => y - 1); }
    else setViewMonth(m => m - 1);
  }

  function nextMonth() {
    if (viewMonth === 11) { setViewMonth(0); setViewYear(y => y + 1); }
    else setViewMonth(m => m + 1);
  }

  function selectDate(ymd: string) {
    onChange(ymd);
    setOpen(false);
  }

  function clearDate(e: React.MouseEvent) {
    e.stopPropagation();
    onChange('');
  }

  function isDisabled(ymd: string): boolean {
    if (minDate && ymd < minDate) return true;
    if (maxDate && ymd > maxDate) return true;
    return false;
  }

  // Build calendar grid
  const totalDays = daysInMonth(viewYear, viewMonth);
  const startDay = firstDayOfMonth(viewYear, viewMonth);
  // Pad with nulls for the leading empty cells
  const cells: (number | null)[] = [
    ...Array(startDay).fill(null),
    ...Array.from({ length: totalDays }, (_, i) => i + 1),
  ];
  // Pad trailing cells to complete the last row
  while (cells.length % 7 !== 0) cells.push(null);

  const labelClass = 'block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide';

  return (
    <div ref={containerRef} className="relative">
      {label && (
        <label className={labelClass}>
          {label}
          {required && <span className="text-red-400 ml-0.5">*</span>}
        </label>
      )}

      {/* Trigger button */}
      <button
        type="button"
        onClick={handleOpen}
        aria-haspopup="dialog"
        aria-expanded={open}
        className={cn(
          'w-full flex items-center gap-3 px-4 py-2.5 rounded-xl border bg-white',
          'text-sm transition-all duration-150 outline-none text-left',
          'focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400',
          error
            ? 'border-red-300 focus:ring-red-500/20 focus:border-red-400'
            : 'border-gray-200 hover:border-gray-300',
        )}
      >
        <Calendar className={cn('w-4 h-4 flex-shrink-0', value ? 'text-blue-500' : 'text-gray-400')} />
        <span className={cn('flex-1', value ? 'text-gray-800' : 'text-gray-400')}>
          {value ? formatDisplay(value) : placeholder}
        </span>
        {value && (
          <span
            role="button"
            tabIndex={0}
            onClick={clearDate}
            onKeyDown={e => e.key === 'Enter' && clearDate(e as unknown as React.MouseEvent)}
            aria-label="Clear date"
            className="text-gray-300 hover:text-gray-500 transition-colors cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
          </span>
        )}
      </button>

      {/* Error */}
      {error && (
        <p className="mt-1.5 text-xs text-red-500 font-medium">{error}</p>
      )}

      {/* Dropdown calendar */}
      <AnimatePresence>
        {open && (
          <motion.div
            role="dialog"
            aria-label="Date picker"
            initial={{ opacity: 0, y: -6, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.98 }}
            transition={{ duration: 0.18, ease: 'easeOut' }}
            className={cn(
              'absolute z-50 mt-2 w-80',
              'bg-white rounded-2xl border border-gray-100',
              'shadow-xl shadow-gray-200/60',
              'overflow-hidden',
            )}
          >
            {/* ── Header ── */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 bg-gradient-to-r from-blue-500 to-purple-600">
              <button
                type="button"
                onClick={prevMonth}
                aria-label="Previous month"
                className="w-7 h-7 flex items-center justify-center rounded-lg text-white/80 hover:text-white hover:bg-white/20 transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              {/* Month + Year — click year to jump */}
              <button
                type="button"
                onClick={() => setYearInput(v => !v)}
                className="flex items-center gap-1.5 text-sm font-semibold text-white hover:text-white/80 transition-colors"
                aria-label="Select year"
              >
                <span>{MONTHS[viewMonth]}</span>
                <span className="opacity-80">{viewYear}</span>
              </button>

              <button
                type="button"
                onClick={nextMonth}
                aria-label="Next month"
                className="w-7 h-7 flex items-center justify-center rounded-lg text-white/80 hover:text-white hover:bg-white/20 transition-colors"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            {/* ── Year jump ── */}
            <AnimatePresence>
              {yearInput && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="overflow-hidden border-b border-gray-100"
                >
                  <YearGrid
                    currentYear={viewYear}
                    onSelect={y => { setViewYear(y); setYearInput(false); }}
                  />
                </motion.div>
              )}
            </AnimatePresence>

            {/* ── Day-of-week headers ── */}
            <div className="grid grid-cols-7 px-3 pt-3 pb-1">
              {DAYS.map(d => (
                <div key={d} className="text-center text-xs font-semibold text-gray-400 py-1">
                  {d}
                </div>
              ))}
            </div>

            {/* ── Day cells ── */}
            <div className="grid grid-cols-7 px-3 pb-3 gap-y-0.5">
              {cells.map((day, idx) => {
                if (day === null) {
                  return <div key={`empty-${idx}`} />;
                }
                const ymd = `${viewYear}-${String(viewMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                const isSelected = ymd === value;
                const isToday = ymd === today;
                const disabled = isDisabled(ymd);

                return (
                  <button
                    key={ymd}
                    type="button"
                    disabled={disabled}
                    onClick={() => selectDate(ymd)}
                    aria-label={formatDisplay(ymd)}
                    aria-pressed={isSelected}
                    className={cn(
                      'relative h-9 w-full flex items-center justify-center rounded-xl text-sm font-medium transition-all duration-100',
                      disabled && 'opacity-30 cursor-not-allowed',
                      !disabled && !isSelected && 'hover:bg-blue-50 hover:text-blue-600 text-gray-700',
                      isSelected && 'bg-blue-500 text-white shadow-md shadow-blue-200',
                      isToday && !isSelected && 'text-blue-500 font-bold',
                    )}
                  >
                    {day}
                    {/* Today dot */}
                    {isToday && !isSelected && (
                      <span className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-blue-400" />
                    )}
                  </button>
                );
              })}
            </div>

            {/* ── Footer shortcuts ── */}
            <div className="flex items-center justify-between px-4 py-2.5 border-t border-gray-100 bg-gray-50/60">
              <button
                type="button"
                onClick={() => selectDate(today)}
                className="text-xs font-semibold text-blue-500 hover:text-blue-600 transition-colors"
              >
                Today
              </button>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="text-xs font-medium text-gray-400 hover:text-gray-600 transition-colors"
              >
                Close
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Year grid sub-component
// ---------------------------------------------------------------------------
interface YearGridProps {
  currentYear: number;
  onSelect: (year: number) => void;
}

function YearGrid({ currentYear, onSelect }: YearGridProps) {
  const thisYear = new Date().getFullYear();
  // Show a 12-year window centred on the current view year
  const start = currentYear - 5;
  const years = Array.from({ length: 12 }, (_, i) => start + i);

  return (
    <div className="grid grid-cols-4 gap-1 p-3">
      {years.map(y => (
        <button
          key={y}
          type="button"
          onClick={() => onSelect(y)}
          className={cn(
            'py-1.5 rounded-xl text-xs font-semibold transition-colors',
            y === currentYear
              ? 'bg-blue-500 text-white'
              : y === thisYear
              ? 'text-blue-500 bg-blue-50'
              : 'text-gray-600 hover:bg-gray-100',
          )}
        >
          {y}
        </button>
      ))}
    </div>
  );
}
