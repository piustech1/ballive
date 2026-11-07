import React, { useState } from 'react';
import { Calendar as CalendarIcon, Radio, ChevronLeft, ChevronRight } from 'lucide-react';
import { generateDateStrip } from '../../utils/dateUtils';

interface DateSelectorStripProps {
  selectedDate: string; // YYYY-MM-DD
  onSelectDate: (date: string) => void;
  showLiveOnly: boolean;
  onToggleLiveOnly: () => void;
  liveCount: number;
}

export const DateSelectorStrip: React.FC<DateSelectorStripProps> = ({
  selectedDate,
  onSelectDate,
  showLiveOnly,
  onToggleLiveOnly,
  liveCount,
}) => {
  const [dateStrip] = useState(() => generateDateStrip(new Date(), 2, 5));

  const handleCustomDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.value) {
      onSelectDate(e.target.value);
    }
  };

  return (
    <div className="w-full px-4 sm:px-6 my-2">
      <div className="flex items-center gap-2 overflow-x-auto scrollbar-none py-1.5 -mx-1 px-1">
        {/* Live Filter Pill */}
        <button
          onClick={onToggleLiveOnly}
          className={`shrink-0 flex items-center gap-1.5 px-4 py-2.5 rounded-2xl text-xs font-bold transition-all duration-200 select-none ${
            showLiveOnly
              ? 'bg-sport-coral text-white shadow-lg shadow-sport-coral/30 scale-105'
              : 'bg-[#141B2B] hover:bg-[#1A2438] text-white/90 border border-white/5'
          }`}
          aria-pressed={showLiveOnly}
        >
          <span className="relative flex h-2 w-2">
            <span
              className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                showLiveOnly ? 'bg-white' : 'bg-sport-coral'
              }`}
            />
            <span
              className={`relative inline-flex rounded-full h-2 w-2 ${
                showLiveOnly ? 'bg-white' : 'bg-sport-coral'
              }`}
            />
          </span>
          <span>Live</span>
          {liveCount > 0 && (
            <span
              className={`ml-0.5 px-1.5 py-0.2 rounded-full text-[10px] font-black ${
                showLiveOnly ? 'bg-black/30 text-white' : 'bg-sport-coral text-white'
              }`}
            >
              {liveCount}
            </span>
          )}
        </button>

        {/* Date Selector Items */}
        {dateStrip.map(item => {
          const isSelected = !showLiveOnly && selectedDate === item.iso;
          return (
            <button
              key={item.iso}
              onClick={() => {
                if (showLiveOnly) onToggleLiveOnly();
                onSelectDate(item.iso);
              }}
              className={`shrink-0 flex flex-col items-center justify-center min-w-[70px] px-3 py-2 rounded-2xl text-xs transition-all duration-200 select-none ${
                isSelected
                  ? 'bg-sport-electricBlue text-white shadow-glow-blue font-bold scale-105'
                  : 'bg-[#141B2B] hover:bg-[#1A2438] text-sport-textSecondary border border-white/5'
              }`}
            >
              <span className={`text-[11px] leading-tight ${isSelected ? 'text-white' : 'text-sport-textMuted'}`}>
                {item.dayName}
              </span>
              <span className="text-sm font-extrabold font-mono mt-0.5">
                {item.dayNumber} {item.monthName}
              </span>
            </button>
          );
        })}

        {/* Interactive Calendar Date Picker Icon Button */}
        <label
          className="shrink-0 flex items-center justify-center w-11 h-11 rounded-2xl bg-[#141B2B] hover:bg-[#1A2438] border border-white/5 cursor-pointer text-sport-textMuted hover:text-white transition-colors"
          title="Pick custom date"
        >
          <CalendarIcon className="w-4 h-4" />
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
