import React from 'react';
import { Heart, Bell, Share2, MapPin, UserCheck, Shield } from 'lucide-react';
import { Match } from '../../types/football';
import { formatKickoffTime } from '../../utils/dateUtils';
import { useFavorites } from '../../hooks/useFavorites';
import { useReminders } from '../../hooks/useReminders';

interface MatchHeaderProps {
  match: Match;
}

export const MatchHeader: React.FC<MatchHeaderProps> = ({ match }) => {
  const { isTeamFavorite, toggleTeamFavorite } = useFavorites();
  const { hasReminder, toggleReminder } = useReminders();

  const isLive = match.status === 'IN_PLAY';
  const isFinished = match.status === 'FINISHED';
  const reminderActive = hasReminder(match.id);
  const homeFav = isTeamFavorite(match.homeTeam.id);
  const awayFav = isTeamFavorite(match.awayTeam.id);

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: `${match.homeTeam.name} vs ${match.awayTeam.name} - SPORT2`,
        url: window.location.href,
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert('Match link copied to clipboard!');
    }
  };

  return (
    <div className="w-full rounded-3xl bg-[#111622] border border-white/10 p-5 sm:p-6 shadow-xl my-4">
      {/* Top Competition & Metadata Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-white/5 text-xs">
        <div className="flex items-center gap-2.5">
          <img
            src={match.competition.emblem}
            alt={match.competition.name}
            className="w-5 h-5 object-contain"
          />
          <span className="font-bold text-white tracking-wide">
            {match.competition.name}
          </span>
          <span className="text-sport-textMuted">•</span>
          <span className="text-sport-textMuted">{match.competition.country}</span>
        </div>

        <div className="flex items-center gap-2">
          {/* Reminder button */}
          <button
            onClick={() =>
              toggleReminder(
                match.id,
                `${match.homeTeam.shortName} vs ${match.awayTeam.shortName}`,
                match.utcDate,
                match.competition.name
              )
            }
            className={`p-2 rounded-xl transition-colors ${
              reminderActive
                ? 'bg-sport-accentYellow/20 text-sport-accentYellow border border-sport-accentYellow/30'
                : 'bg-white/5 hover:bg-white/10 text-sport-textMuted hover:text-white'
            }`}
            title="Set Reminder"
          >
            <Bell className={`w-4 h-4 ${reminderActive ? 'fill-sport-accentYellow' : ''}`} />
          </button>

          {/* Share button */}
          <button
            onClick={handleShare}
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-sport-textMuted hover:text-white transition-colors"
            title="Share Match"
          >
            <Share2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Scoreboard Display */}
      <div className="py-6 flex items-center justify-between max-w-2xl mx-auto">
        {/* Home Team */}
        <div className="flex-1 flex flex-col items-center text-center gap-2">
          <div className="relative group">
            <img
              src={match.homeTeam.crest}
              alt={match.homeTeam.name}
              className="w-16 h-16 sm:w-20 sm:h-20 object-contain drop-shadow-xl transition-transform group-hover:scale-105"
            />
            <button
              onClick={() => toggleTeamFavorite(match.homeTeam.id)}
              className="absolute -top-1 -right-1 p-1 rounded-full bg-black/60 hover:bg-black text-sport-textMuted hover:text-sport-coral transition-colors"
              title="Favorite Team"
            >
              <Heart className={`w-3.5 h-3.5 ${homeFav ? 'fill-sport-coral text-sport-coral' : ''}`} />
            </button>
          </div>
          <h2 className="text-sm sm:text-base font-bold text-white tracking-tight">
            {match.homeTeam.name}
          </h2>
          <span className="text-xs text-sport-textMuted font-mono">{match.homeTeam.tla}</span>
        </div>

        {/* Center Live Score / Match Status */}
        <div className="flex flex-col items-center justify-center px-4 shrink-0">
          {isLive ? (
            <>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black uppercase bg-sport-coral text-white animate-pulse mb-2 shadow-lg shadow-sport-coral/30">
                <span className="w-2 h-2 rounded-full bg-white" />
                <span>{match.minute}' MIN</span>
              </div>
              <div className="text-3xl sm:text-5xl font-black font-mono tracking-widest text-white drop-shadow-md">
                {match.score.home ?? 0} : {match.score.away ?? 0}
              </div>
              {match.score.htHome !== undefined && match.score.htHome !== null && (
                <span className="text-[11px] text-sport-textMuted font-mono mt-1">
                  (HT {match.score.htHome} - {match.score.htAway})
                </span>
              )}
            </>
          ) : isFinished ? (
            <>
              <span className="px-3 py-0.5 rounded-full text-xs font-bold uppercase bg-white/10 text-sport-textSecondary mb-2">
                FINAL SCORE
              </span>
              <div className="text-3xl sm:text-5xl font-black font-mono tracking-widest text-white">
                {match.score.home ?? 0} : {match.score.away ?? 0}
              </div>
            </>
          ) : (
            <>
              <span className="text-xs uppercase font-extrabold tracking-widest text-sport-accentYellow mb-1">
                KICKOFF
              </span>
              <div className="text-2xl sm:text-4xl font-black font-mono text-white">
                {formatKickoffTime(match.utcDate)}
              </div>
              <span className="text-xs text-sport-textMuted mt-1">Local Time</span>
            </>
          )}
        </div>

        {/* Away Team */}
        <div className="flex-1 flex flex-col items-center text-center gap-2">
          <div className="relative group">
            <img
              src={match.awayTeam.crest}
              alt={match.awayTeam.name}
              className="w-16 h-16 sm:w-20 sm:h-20 object-contain drop-shadow-xl transition-transform group-hover:scale-105"
            />
            <button
              onClick={() => toggleTeamFavorite(match.awayTeam.id)}
              className="absolute -top-1 -right-1 p-1 rounded-full bg-black/60 hover:bg-black text-sport-textMuted hover:text-sport-coral transition-colors"
              title="Favorite Team"
            >
              <Heart className={`w-3.5 h-3.5 ${awayFav ? 'fill-sport-coral text-sport-coral' : ''}`} />
            </button>
          </div>
          <h2 className="text-sm sm:text-base font-bold text-white tracking-tight">
            {match.awayTeam.name}
          </h2>
          <span className="text-xs text-sport-textMuted font-mono">{match.awayTeam.tla}</span>
        </div>
      </div>

      {/* Bottom Venue and Officials */}
      <div className="pt-4 border-t border-white/5 flex flex-wrap items-center justify-between text-xs text-sport-textMuted gap-2">
        <div className="flex items-center gap-1.5">
          <MapPin className="w-3.5 h-3.5 text-sport-neonBlue" />
          <span>{match.venue}</span>
        </div>
        {match.referee && (
          <div className="flex items-center gap-1.5">
            <UserCheck className="w-3.5 h-3.5 text-sport-accentYellow" />
            <span>Referee: {match.referee}</span>
          </div>
        )}
      </div>
    </div>
  );
};
