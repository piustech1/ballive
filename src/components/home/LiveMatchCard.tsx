import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Match } from '../../types/football';

interface LiveMatchCardProps {
  match: Match;
  className?: string;
}

export const LiveMatchCard: React.FC<LiveMatchCardProps> = ({ match, className = '' }) => {
  const navigate = useNavigate();

  // Color schemes matching the visual reference screenshot:
  // Card 1: Electric Royal Blue
  // Card 2: Clean Off-White / Silver
  // Card 3: Coral Red
  // Card 4: Deep Violet / Indigo
  // Card 5: Emerald Green
  const theme = match.cardTheme || 'blue';

  const themeConfig = {
    blue: {
      cardBg: 'bg-gradient-to-b from-[#2563EB] to-[#1D4ED8]',
      textColor: 'text-white',
      mutedText: 'text-white/80',
      pillBg: 'bg-white',
      pillText: 'text-[#1E3A8A]',
      dotColor: 'bg-[#22C55E]', // Green dot
      shadow: 'shadow-glow-blue',
    },
    silver: {
      cardBg: 'bg-[#E5E7EB]',
      textColor: 'text-[#1E293B]',
      mutedText: 'text-[#475569]',
      pillBg: 'bg-[#334155]',
      pillText: 'text-white',
      dotColor: 'bg-[#EAB308]', // Yellow dot as in reference
      shadow: 'shadow-md',
    },
    coral: {
      cardBg: 'bg-gradient-to-b from-[#F43F5E] to-[#E11D48]',
      textColor: 'text-white',
      mutedText: 'text-white/85',
      pillBg: 'bg-white',
      pillText: 'text-[#9F1239]',
      dotColor: 'bg-[#22C55E]',
      shadow: 'shadow-lg',
    },
    violet: {
      cardBg: 'bg-gradient-to-b from-[#7C3AED] to-[#5B21B6]',
      textColor: 'text-white',
      mutedText: 'text-white/85',
      pillBg: 'bg-white',
      pillText: 'text-[#4C1D95]',
      dotColor: 'bg-[#38BDF8]',
      shadow: 'shadow-lg',
    },
    emerald: {
      cardBg: 'bg-gradient-to-b from-[#059669] to-[#047857]',
      textColor: 'text-white',
      mutedText: 'text-white/85',
      pillBg: 'bg-white',
      pillText: 'text-[#064E3B]',
      dotColor: 'bg-[#FACC15]',
      shadow: 'shadow-lg',
    },
  }[theme];

  const handleClick = () => {
    navigate(`/match/${match.id}`);
  };

  return (
    <div
      onClick={handleClick}
      className={`relative shrink-0 w-[155px] sm:w-[170px] md:w-[185px] h-[215px] sm:h-[225px] rounded-3xl p-4 flex flex-col justify-between cursor-pointer select-none transition-all duration-300 hover:scale-[1.03] active:scale-[0.98] ${themeConfig.cardBg} ${themeConfig.shadow} ${className}`}
      role="button"
      tabIndex={0}
      onKeyDown={e => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleClick();
        }
      }}
      aria-label={`${match.homeTeam.shortName} vs ${match.awayTeam.shortName}, Live score: ${match.score.home ?? 0} to ${match.score.away ?? 0}`}
    >
      {/* Top Row: "Live" badge on left, status dot on right (as in screenshot) */}
      <div className="flex items-center justify-between w-full">
        <span
          className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wide flex items-center gap-1 ${themeConfig.pillBg} ${themeConfig.pillText}`}
        >
          Live
        </span>
        <div className="relative flex items-center justify-center">
          <span
            className={`w-2 h-2 rounded-full ${themeConfig.dotColor} animate-ping absolute opacity-75`}
          />
          <span className={`w-2 h-2 rounded-full ${themeConfig.dotColor}`} />
        </div>
      </div>

      {/* Center: Home and Away Club Crests side by side */}
      <div className="flex items-center justify-center gap-3 my-auto py-2">
        <div className="w-12 h-12 flex items-center justify-center drop-shadow-md transition-transform hover:scale-110">
          <img
            src={match.homeTeam.crest}
            alt={match.homeTeam.name}
            className="w-11 h-11 object-contain"
            loading="eager"
          />
        </div>
        <div className="w-12 h-12 flex items-center justify-center drop-shadow-md transition-transform hover:scale-110">
          <img
            src={match.awayTeam.crest}
            alt={match.awayTeam.name}
            className="w-11 h-11 object-contain"
            loading="eager"
          />
        </div>
      </div>

      {/* Bottom Area: Team names on left, scores on right (2 distinct rows as in reference) */}
      <div className="w-full space-y-1 pt-1">
        {/* Home Team Row */}
        <div className="flex items-center justify-between text-xs sm:text-[13px] font-semibold leading-tight">
          <span className={`truncate pr-2 ${themeConfig.textColor}`}>
            {match.homeTeam.shortName}
          </span>
          <span className={`font-mono font-bold text-sm sm:text-base ${themeConfig.textColor}`}>
            {match.score.home ?? 0}
          </span>
        </div>

        {/* Away Team Row */}
        <div className="flex items-center justify-between text-xs sm:text-[13px] font-semibold leading-tight">
          <span className={`truncate pr-2 ${themeConfig.textColor}`}>
            {match.awayTeam.shortName}
          </span>
          <span className={`font-mono font-bold text-sm sm:text-base ${themeConfig.textColor}`}>
            {match.score.away ?? 0}
          </span>
        </div>

        {/* Minute indicator hint */}
        {match.minute && (
          <div className={`text-[10px] text-right font-medium tracking-tight ${themeConfig.mutedText}`}>
            {match.minute}'
          </div>
        )}
      </div>
    </div>
  );
};
