import React from 'react';
import { COMPETITIONS } from '../../data/mockMatches';
import { Layers } from 'lucide-react';

interface CompetitionFilterChipsProps {
  selectedCompetitionId: string;
  onSelectCompetition: (id: string) => void;
}

export const CompetitionFilterChips: React.FC<CompetitionFilterChipsProps> = ({
  selectedCompetitionId,
  onSelectCompetition,
}) => {
  const allFilters = [
    { id: 'all', name: 'All Leagues', emblem: null },
    ...Object.values(COMPETITIONS),
  ];

  return (
    <div className="w-full px-4 sm:px-6 my-2">
      <div className="flex items-center gap-2 overflow-x-auto scrollbar-none py-1 -mx-1 px-1">
        {allFilters.map(filter => {
          const isSelected = selectedCompetitionId === filter.id;
          return (
            <button
              key={filter.id}
              onClick={() => onSelectCompetition(filter.id)}
              className={`shrink-0 flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all select-none ${
                isSelected
                  ? 'bg-white text-[#0A0D14] shadow-md font-bold'
                  : 'bg-white/5 hover:bg-white/10 text-sport-textSecondary border border-white/5'
              }`}
            >
              {filter.emblem ? (
                <img
                  src={filter.emblem}
                  alt={filter.name}
                  className="w-4 h-4 object-contain"
                />
              ) : (
                <Layers className="w-3.5 h-3.5 text-sport-neonBlue" />
              )}
              <span>{filter.name}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
