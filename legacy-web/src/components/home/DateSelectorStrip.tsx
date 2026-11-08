import React, { useMemo } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCalendarDays } from '@fortawesome/free-solid-svg-icons';

interface DateSelectorStripProps {
  selectedDate: string; // YYYY-MM-DD
  onSelectDate: (date: string) => void;
  showLiveOnly: boolean;
  onToggleLiveOnly: () => void;
  liveCount: number;
}

interface DateTabItem {
  iso: string;
  label: string; // 'Yesterday', 'Today', 'Tomorrow', 'Thu', etc.
  dateDisplay: string; // '12 Dec'
  isToday: boolean;
}

export const DateSelectorStrip: React.FC<DateSelectorStripProps> = ({
  selectedDate,
  onSelectDate,
  showLiveOnly,
  onToggleLiveOnly,
  liveCount,
}) => {
  // Generate date tabs: Yesterday, Today, Tomorrow, plus next 3 days
  const dateTabs = useMemo<DateTabItem[]>(() => {
    const today = new Date();
    const items: DateTabItem[] = [];

    // -1 (Yesterday) through +3 (days ahead)
    for (let offset = -1; offset <= 3; offset++) {
      const d = new Date();
      d.setDate(today.getDate() + offset);

      const iso = d.toISOString().split('T')[0];
      const dayNum = d.getDate();
      const monthStr = d.toLocaleDateString('en-US', { month: 'short' });

      let label: string;
      if (offset === -1) {
        label = 'Yesterday';
      } else if (offset === 0) {
        label = 'Today';
      } else if (offset === 1) {
        label = 'Tomorrow';
      } else {
        label = d.toLocaleDateString('en-US', { weekday: 'short' });
      }

      items.push({
        iso,
        label,
        dateDisplay: `${dayNum} ${monthStr}`,
        isToday: offset === 0,
      });
    }

    return items;
  }, []);

  const handleCustomDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.value) {
      if (showLiveOnly) onToggleLiveOnly();
      onSelectDate(e.target.value);
    }
  };

  return (
    <div className="w-full px-4 sm:px-6 my-3.5">
      {/* ── SOLID DARK SURFACE (NO OUTLINE, NO GRADIENTS) ── */}
      <div className="flex items-center gap-1.5 p-1.5 rounded-2xl bg-[#141824] shadow-md overflow-x-auto scrollbar-none">
        {/* ── SOLID RED LIVE PILL (SOLID FILL, WHITE TEXT, NO OUTLINE, NO GRADIENT) ── */}
        <button
          onClick={onToggleLiveOnly}
          className={`shrink-0 flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all duration-200 select-none active:scale-95 ${
            showLiveOnly
              ? 'bg-[#EF4444] text-white shadow-md'
              : 'bg-[#EF4444] text-white hover:brightness-110'
          }`}
          aria-pressed={showLiveOnly}
          title="Live matches"
        >
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-white" />
          </span>
          <span className="tracking-tight text-white font-bold">Live</span>
          {liveCount > 0 && (
            <span className="px-1.5 py-0.2 rounded-full text-[10px] font-mono font-black bg-black/25 text-white">
              {liveCount}
            </span>
          )}
        </button>

        {/* ── DATE TABS: Yesterday, Today, Tomorrow (NO OUTLINES, SOLID FILLS) ── */}
        <div className="flex items-center gap-1 flex-1 overflow-x-auto scrollbar-none py-0.5">
          {dateTabs.map(item => {
            const isSelected = !showLiveOnly && selectedDate === item.iso;

            return (
              <button
                key={item.iso}
                onClick={() => {
                  if (showLiveOnly) onToggleLiveOnly();
                  onSelectDate(item.iso);
                }}
                className={`shrink-0 flex flex-col items-center justify-center min-w-[72px] sm:min-w-[80px] px-2.5 py-1.5 rounded-xl transition-all duration-200 select-none active:scale-95 ${
                  isSelected
                    ? 'bg-[#2563EB] text-white font-bold shadow-md'
                    : 'text-white/60 hover:text-white hover:bg-white/5'
                }`}
              >
                <span
                  className={`text-[10px] tracking-wider uppercase font-semibold leading-tight ${
                    isSelected
                      ? 'text-white'
                      : item.isToday
                      ? 'text-white font-bold'
                      : 'text-white/50'
                  }`}
                >
                  {item.label}
                </span>
                <span className="text-[12px] font-bold font-mono mt-0.5 leading-none">
                  {item.dateDisplay}
                </span>
              </button>
            );
          })}
        </div>

        {/* ── CALENDAR PICKER (Font Awesome faCalendarDays, NO OUTLINES) ── */}
        <label
          className="shrink-0 w-9 h-9 rounded-xl flex items-center justify-center text-white/60 hover:text-white hover:bg-white/10 active:scale-95 cursor-pointer transition-colors"
          title="Pick custom date"
        >
          <FontAwesomeIcon icon={faCalendarDays} className="text-xs" />
          <input
            type="date"
            value={selectedDate}
            onChange={handleCustomDateChange}
            className="sr-only"
          />
        </label>
      </div>
    </div>
  );
};
