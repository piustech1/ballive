import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Heart, Trash2, Plus, Play, Calendar, Shield, Trophy } from 'lucide-react';
import { useFavorites } from '../hooks/useFavorites';
import { useFixtures, useLiveMatches } from '../hooks/useFootball';
import { TEAMS, COMPETITIONS } from '../data/mockMatches';
import { FixturesList } from '../components/home/FixturesList';

export const FavoritesPage: React.FC = () => {
  const navigate = useNavigate();
  const {
    favoriteTeamIds,
    favoriteCompIds,
    toggleTeamFavorite,
    toggleCompetitionFavorite,
  } = useFavorites();

  const { data: allFixtures, isLoading } = useFixtures();
  const { data: liveMatches } = useLiveMatches();

  // Filter matches involving favorite teams or competitions
  const favoriteMatches = allFixtures?.filter(m => {
    const isTeamMatch =
      favoriteTeamIds.includes(m.homeTeam.id) || favoriteTeamIds.includes(m.awayTeam.id);
    const isCompMatch = favoriteCompIds.includes(m.competition.id);
    return isTeamMatch || isCompMatch;
  }) || [];

  const favoriteTeams = favoriteTeamIds
    .map(id => TEAMS[id])
    .filter(Boolean);

  const favoriteCompetitions = favoriteCompIds
    .map(id => COMPETITIONS[id])
    .filter(Boolean);

  return (
    <div className="flex-1 min-w-0 max-w-6xl mx-auto px-4 sm:px-6 py-6 pb-24 md:pb-16 space-y-6">
      {/* Page Title */}
      <div>
        <h1 className="text-xl sm:text-2xl font-black text-white font-display tracking-tight flex items-center gap-2">
          <Heart className="w-6 h-6 text-sport-coral fill-sport-coral" />
          <span>My Favorites & Watchlist</span>
        </h1>
        <p className="text-xs text-sport-textMuted mt-1">
          Personalized dashboard for your favorited clubs and competitions.
        </p>
      </div>

      {/* Favorite Clubs Shelf */}
      <div className="rounded-3xl bg-[#111622] border border-white/5 p-5 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold uppercase tracking-wider text-sport-textMuted flex items-center gap-1.5">
            <Shield className="w-4 h-4 text-sport-neonBlue" />
            <span>Saved Clubs ({favoriteTeams.length})</span>
          </h3>
          <span className="text-[11px] text-sport-textMuted">Tap heart to remove</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
          {favoriteTeams.map(team => (
            <div
              key={team.id}
              className="p-3 rounded-2xl bg-white/5 border border-white/5 flex flex-col items-center text-center gap-2 relative group hover:border-white/10 transition-colors"
            >
              <button
                onClick={() => toggleTeamFavorite(team.id)}
                className="absolute top-2 right-2 p-1 rounded-full bg-black/40 text-sport-coral hover:bg-black transition-colors"
                title="Remove from favorites"
              >
                <Heart className="w-3 h-3 fill-sport-coral" />
              </button>

              <img
                src={team.crest}
                alt={team.name}
                className="w-10 h-10 object-contain drop-shadow-md cursor-pointer"
                onClick={() => navigate(`/?search=${encodeURIComponent(team.name)}`)}
              />

              <div
                className="w-full cursor-pointer"
                onClick={() => navigate(`/?search=${encodeURIComponent(team.name)}`)}
              >
                <p className="text-xs font-bold text-white truncate">{team.shortName}</p>
                <p className="text-[10px] text-sport-textMuted">{team.tla}</p>
              </div>
            </div>
          ))}

          {favoriteTeams.length === 0 && (
            <div className="col-span-full py-4 text-center text-xs text-sport-textMuted">
              No clubs saved yet. Click the heart icon on any match or team to add them here!
            </div>
          )}
        </div>
      </div>

      {/* Favorite Competitions */}
      <div className="rounded-3xl bg-[#111622] border border-white/5 p-5 space-y-4">
        <h3 className="text-xs font-bold uppercase tracking-wider text-sport-textMuted flex items-center gap-1.5">
          <Trophy className="w-4 h-4 text-sport-accentYellow" />
          <span>Saved Competitions ({favoriteCompetitions.length})</span>
        </h3>

        <div className="flex flex-wrap gap-2.5">
          {favoriteCompetitions.map(comp => (
            <div
              key={comp.id}
              className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white/5 border border-white/5 text-xs text-white"
            >
              <img src={comp.emblem} alt="" className="w-5 h-5 object-contain" />
              <span className="font-semibold">{comp.name}</span>
              <button
                onClick={() => toggleCompetitionFavorite(comp.id)}
                className="text-sport-textMuted hover:text-sport-coral ml-1"
                title="Remove"
              >
                <Heart className="w-3.5 h-3.5 fill-sport-coral text-sport-coral" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Relevant Matches for Favorites */}
      <div className="space-y-3">
        <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
          <Calendar className="w-4 h-4 text-sport-electricBlue" />
          <span>Upcoming & Live Matches For Your Favorites</span>
        </h3>

        <FixturesList matches={favoriteMatches} isLoading={isLoading} />
      </div>
    </div>
  );
};
