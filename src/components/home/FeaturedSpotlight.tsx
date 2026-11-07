import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Play, Tv, ShieldCheck, Flame } from 'lucide-react';
import { Match } from '../../types/football';
import { formatKickoffTime } from '../../utils/dateUtils';

interface FeaturedSpotlightProps {
  match?: Match;
}

export const FeaturedSpotlight: React.FC<FeaturedSpotlightProps> = ({ match }) => {
  const navigate = useNavigate();

  if (!match) return null;

  const isLive = match.status === 'IN_PLAY';

  return (
    <div className="w-full px-4 sm:px-6 my-4">
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#121829] via-[#161F36] to-[#0F1422] border border-white/10 p-5 sm:p-6 shadow-2xl">
        {/* Background glow graphics */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-sport-electricBlue/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
        <div className="absolute bottom-0 left-1/3 w-60 h-60 bg-sport-accentYellow/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
          {/* Left Info Column */}
          <div className="flex-1 space-y-3 text-center md:text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-semibold">
              <Flame className="w-3.5 h-3.5 text-sport-accentYellow" />
              <span className="text-white">MATCH OF THE WEEK</span>
              <span className="text-sport-textMuted">•</span>
              <span className="text-sport-textSecondary">{match.competition.name}</span>
            </div>

            <h3 className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-white font-display tracking-tight">
              {match.homeTeam.name} vs {match.awayTeam.name}
            </h3>

            <p className="text-xs sm:text-sm text-sport-textMuted flex items-center justify-center md:justify-start gap-2">
              <span>{match.venue}</span>
              <span>•</span>
              <span className="flex items-center gap-1 text-sport-emerald font-medium">
                <ShieldCheck className="w-3.5 h-3.5" />
                Official 4K Broadcast
              </span>
            </p>

            <div className="pt-1 flex items-center justify-center md:justify-start gap-3">
              <button
                onClick={() => navigate(`/match/${match.id}`)}
                className="px-5 py-2.5 rounded-2xl bg-gradient-to-r from-sport-electricBlue to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold text-sm shadow-glow-blue flex items-center gap-2 transition-all hover:scale-105 active:scale-95"
              >
                <Play className="w-4 h-4 fill-white" />
                <span>{isLive ? 'Watch Live Stream' : 'Match Preview & Stream'}</span>
              </button>

              <div className="flex items-center gap-1.5 px-3 py-2 rounded-2xl bg-white/5 text-xs text-sport-textSecondary">
                <Tv className="w-4 h-4 text-sport-neonBlue" />
                <span>Multi-Cam & 60 FPS</span>
              </div>
            </div>
          </div>

          {/* Right Teams Head-to-Head Visual */}
          <div className="flex items-center justify-center gap-6 sm:gap-8 bg-black/30 backdrop-blur-sm border border-white/5 px-6 py-4 rounded-2xl">
            {/* Home Team */}
            <div className="flex flex-col items-center gap-2">
              <img
                src={match.homeTeam.crest}
                alt={match.homeTeam.name}
                className="w-14 h-14 sm:w-16 sm:h-16 object-contain drop-shadow-lg"
              />
              <span className="text-xs sm:text-sm font-bold text-white text-center max-w-[90px] truncate">
                {match.homeTeam.shortName}
              </span>
            </div>

            {/* Score / Time Badge */}
            <div className="flex flex-col items-center justify-center">
              {isLive ? (
                <>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-sport-coral text-white animate-pulse mb-1">
                    LIVE {match.minute}'
                  </span>
                  <div className="text-2xl sm:text-3xl font-black font-mono text-white tracking-wider">
                    {match.score.home ?? 0} - {match.score.away ?? 0}
                  </div>
                </>
              ) : (
                <>
                  <span className="text-[10px] uppercase font-bold text-sport-accentYellow tracking-widest mb-1">
                    KICKOFF
                  </span>
                  <span className="text-base sm:text-lg font-bold text-white font-mono">
                    {formatKickoffTime(match.utcDate)}
                  </span>
                </>
              )}
            </div>

            {/* Away Team */}
            <div className="flex flex-col items-center gap-2">
              <img
                src={match.awayTeam.crest}
                alt={match.awayTeam.name}
                className="w-14 h-14 sm:w-16 sm:h-16 object-contain drop-shadow-lg"
              />
              <span className="text-xs sm:text-sm font-bold text-white text-center max-w-[90px] truncate">
                {match.awayTeam.shortName}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
