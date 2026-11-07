import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Share2, Tv, ShieldCheck, ChevronRight } from 'lucide-react';
import { useMatch, useFixtures } from '../hooks/useFootball';
import { VideoPlayer } from '../components/match/VideoPlayer';
import { MatchHeader } from '../components/match/MatchHeader';
import { MatchTabs } from '../components/match/MatchTabs';
import { StreamSource } from '../types/football';

export const MatchPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data: match, isLoading, error } = useMatch(id || '');
  const [selectedSource, setSelectedSource] = useState<StreamSource | undefined>(undefined);

  // Fetch other matches in the same competition for "Related Fixtures"
  const { data: relatedMatches } = useFixtures({
    competitionId: match?.competition.id,
  });

  const otherMatches = relatedMatches?.filter(m => m.id !== id)?.slice(0, 3) || [];

  if (isLoading) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-8 space-y-6">
        <div className="h-6 w-32 bg-white/10 rounded animate-pulse" />
        <div className="aspect-video w-full rounded-3xl bg-white/5 animate-pulse" />
        <div className="h-32 w-full rounded-3xl bg-white/5 animate-pulse" />
      </div>
    );
  }

  if (error || !match) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center space-y-4">
        <h2 className="text-xl font-bold text-white">Match Not Found</h2>
        <p className="text-xs text-sport-textMuted">
          The requested match could not be found or may have concluded.
        </p>
        <button
          onClick={() => navigate('/')}
          className="px-5 py-2.5 rounded-2xl bg-sport-electricBlue text-white text-xs font-semibold shadow-glow-blue"
        >
          Return to Live Center
        </button>
      </div>
    );
  }

  return (
    <div className="flex-1 min-w-0 max-w-5xl mx-auto px-4 sm:px-6 py-4 pb-24 md:pb-16 space-y-4">
      {/* Top Back Navigation Bar */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-sport-textSecondary hover:text-white text-xs font-semibold transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Matches</span>
        </button>

        <div className="flex items-center gap-2 text-xs text-sport-textMuted">
          <span className="hidden sm:inline-block">{match.competition.name}</span>
          <span className="hidden sm:inline-block">•</span>
          <span className="text-sport-emerald font-semibold flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5" />
            Verified Match Feed
          </span>
        </div>
      </div>

      {/* 1. Responsive 16:9 Video Player (The primary focus) */}
      <VideoPlayer
        match={match}
        activeSource={selectedSource}
        onSourceChange={setSelectedSource}
      />

      {/* 2. Match Scoreboard Header */}
      <MatchHeader match={match} />

      {/* 3. Match Interactive Tabs (Timeline, Stats, 2D Pitch Lineups, H2H, Broadcasters) */}
      <MatchTabs match={match} />

      {/* 4. Related Competition Fixtures */}
      {otherMatches.length > 0 && (
        <div className="rounded-3xl bg-[#111622] border border-white/5 p-5 space-y-3">
          <div className="flex items-center justify-between text-xs font-bold text-sport-textMuted uppercase tracking-wider">
            <span>More in {match.competition.name}</span>
            <button
              onClick={() => navigate(`/competitions?id=${match.competition.id}`)}
              className="text-sport-neonBlue hover:underline flex items-center gap-0.5 lowercase"
            >
              view table <ChevronRight className="w-3 h-3" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            {otherMatches.map(m => (
              <div
                key={m.id}
                onClick={() => navigate(`/match/${m.id}`)}
                className="p-3 rounded-2xl bg-white/5 hover:bg-white/10 cursor-pointer transition-colors border border-white/5 flex flex-col justify-between"
              >
                <div className="flex justify-between items-center text-[10px] text-sport-textMuted mb-2">
                  <span>{m.status === 'IN_PLAY' ? `LIVE ${m.minute}'` : 'Upcoming'}</span>
                  {m.hasLiveStream && <Tv className="w-3 h-3 text-sport-neonBlue" />}
                </div>

                <div className="space-y-1.5 text-xs font-semibold text-white">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <img src={m.homeTeam.crest} alt="" className="w-4 h-4 object-contain" />
                      <span className="truncate max-w-[90px]">{m.homeTeam.shortName}</span>
                    </div>
                    <span className="font-mono">{m.score.home ?? '-'}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <img src={m.awayTeam.crest} alt="" className="w-4 h-4 object-contain" />
                      <span className="truncate max-w-[90px]">{m.awayTeam.shortName}</span>
                    </div>
                    <span className="font-mono">{m.score.away ?? '-'}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
