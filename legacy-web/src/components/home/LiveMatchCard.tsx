import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Match } from '../../types/football';

interface LiveMatchCardProps {
  match: Match;
  className?: string;
}

export const LiveMatchCard: React.FC<LiveMatchCardProps> = ({ match, className = '' }) => {
  const navigate = useNavigate();

  // Solid color themes from original reference screenshot:
  // Card 1: Solid Royal Blue (Real Madrid)
  // Card 2: Solid Off-White / Silver (Tottenham)
  // Card 3: Solid Coral / Red (Liverpool)
  // Card 4: Solid Violet
  // Card 5: Solid Emerald
  const theme = match.cardTheme || 'blue';

  const themeConfig: Record<
    string,
    {
      cardBg: string;
      textColor: string;
      mutedText: string;
      pillBg: string;
      pillText: string;
      dotColor: string;
    }
  > = {
    blue: {
      cardBg: 'bg-[#2563EB]',
      textColor: 'text-white',
      mutedText: 'text-white/80',
      pillBg: 'bg-white',
      pillText: 'text-[#1E3A8A]',
      dotColor: 'bg-[#22C55E]',
    },
    silver: {
      cardBg: 'bg-[#EAEBED]',
      textColor: 'text-[#0F172A]',
      mutedText: 'text-[#475569]',
      pillBg: 'bg-[#1E293B]',
      pillText: 'text-white',
      dotColor: 'bg-[#EAB308]',
    },
    coral: {
      cardBg: 'bg-[#F43F5E]',
      textColor: 'text-white',
      mutedText: 'text-white/85',
      pillBg: 'bg-white',
      pillText: 'text-[#BE123C]',
      dotColor: 'bg-[#22C55E]',
    },
    violet: {
      cardBg: 'bg-[#7C3AED]',
      textColor: 'text-white',
      mutedText: 'text-white/85',
      pillBg: 'bg-white',
      pillText: 'text-[#5B21B6]',
      dotColor: 'bg-[#38BDF8]',
    },
    emerald: {
      cardBg: 'bg-[#059669]',
      textColor: 'text-white',
      mutedText: 'text-white/85',
      pillBg: 'bg-white',
      pillText: 'text-[#065F46]',
      dotColor: 'bg-[#FACC15]',
    },
  };

  const cfg = themeConfig[theme] || themeConfig.blue;

  const handleClick = () => navigate(`/match/${match.id}`);

  return (
    <div
      onClick={handleClick}
      className={`shrink-0 w-[158px] sm:w-[172px] h-[220px] sm:h-[232px] rounded-3xl p-4 flex flex-col justify-between cursor-pointer select-none transition-transform duration-200 hover:scale-[1.02] active:scale-[0.97] shadow-lg ${cfg.cardBg} ${className}`}
      role="button"
      tabIndex={0}
      onKeyDown={e => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleClick();
        }
      }}
      aria-label={`${match.homeTeam.shortName} vs ${match.awayTeam.shortName}, Live score ${match.score.home ?? 0} to ${match.score.away ?? 0}`}
    >
      {/* ── Top Row: "Live" solid pill + dot ── */}
      <div className="flex items-center justify-between w-full">
        <span
          className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${cfg.pillBg} ${cfg.pillText}`}
        >
          Live
        </span>
        <div className="relative flex items-center justify-center">
          <span
            className={`w-2 h-2 rounded-full ${cfg.dotColor} animate-ping absolute opacity-75`}
          />
          <span className={`w-2 h-2 rounded-full ${cfg.dotColor}`} />
        </div>
      </div>

      {/* ── Center: Home & Away Real Club Crests ── */}
      <div className="flex items-center justify-center gap-3.5 my-auto py-2">
        <div className="w-12 h-12 flex items-center justify-center drop-shadow-md">
          <img
            src={match.homeTeam.crest}
            alt={match.homeTeam.name}
            className="w-11 h-11 object-contain"
            loading="eager"
            referrerPolicy="no-referrer"
          />
        </div>
        <div className="w-12 h-12 flex items-center justify-center drop-shadow-md">
          <img
            src={match.awayTeam.crest}
            alt={match.awayTeam.name}
            className="w-11 h-11 object-contain"
            loading="eager"
            referrerPolicy="no-referrer"
          />
        </div>
      </div>

      {/* ── Bottom: Home & Away Team Names and Scores (Two Rows) ── */}
      <div className="w-full space-y-1 pt-1">
        {/* Home Team */}
        <div className="flex items-center justify-between text-xs sm:text-[13px] font-bold leading-tight">
          <span className={`truncate pr-2 ${cfg.textColor}`}>
            {match.homeTeam.shortName}
          </span>
          <span className={`font-mono font-black text-sm sm:text-base ${cfg.textColor}`}>
            {match.score.home ?? 0}
          </span>
        </div>

        {/* Away Team */}
        <div className="flex items-center justify-between text-xs sm:text-[13px] font-bold leading-tight">
          <span className={`truncate pr-2 ${cfg.textColor}`}>
            {match.awayTeam.shortName}
          </span>
          <span className={`font-mono font-black text-sm sm:text-base ${cfg.textColor}`}>
            {match.score.away ?? 0}
          </span>
        </div>
      </div>
    </div>
  );
};
