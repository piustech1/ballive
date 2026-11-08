import React, { useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Tv, Radio, ChevronRight, ChevronLeft, ShieldCheck, Play } from 'lucide-react';
import { useSportsChannels } from '../../hooks/useFootball';
import { ApiChannel } from '../../services/sportsStreamingApiService';

export const ChannelsSection: React.FC = () => {
  const navigate = useNavigate();
  const { data: channels, isLoading } = useSportsChannels();
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const offset = direction === 'left' ? -300 : 300;
      scrollRef.current.scrollBy({ left: offset, behavior: 'smooth' });
    }
  };

  if (!isLoading && (!channels || channels.length === 0)) {
    return null;
  }

  const handleChannelClick = (channel: ApiChannel) => {
    // Navigate to a dedicated match/channel watching route
    navigate(`/match/${channel.id}`);
  };

  return (
    <section className="w-full px-4 sm:px-6 my-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Tv className="w-5 h-5 text-sport-accentYellow" />
          <h2 className="text-base sm:text-lg font-bold tracking-tight text-white font-display">
            24/7 Live Sports TV Channels
          </h2>
          <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase bg-sport-emerald/20 text-sport-emerald border border-sport-emerald/30">
            Official
          </span>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={() => scroll('left')}
            className="p-1 rounded-full bg-white/5 hover:bg-white/10 text-white/70 hover:text-white transition-colors"
            aria-label="Scroll left"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={() => scroll('right')}
            className="p-1 rounded-full bg-white/5 hover:bg-white/10 text-white/70 hover:text-white transition-colors"
            aria-label="Scroll right"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Horizontal scrolling channels */}
      <div
        ref={scrollRef}
        className="flex items-center gap-3 overflow-x-auto scrollbar-none py-1 scroll-smooth -mx-1 px-1"
      >
        {isLoading ? (
          Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="shrink-0 w-44 h-24 rounded-2xl bg-white/5 animate-pulse p-3"
            />
          ))
        ) : (
          channels?.map(channel => (
            <div
              key={channel.id}
              onClick={() => handleChannelClick(channel)}
              className="shrink-0 w-48 sm:w-52 p-3.5 rounded-2xl bg-[#111622] hover:bg-[#161D2E] border border-white/5 hover:border-sport-electricBlue/40 transition-all cursor-pointer group flex flex-col justify-between shadow-lg select-none"
            >
              <div className="flex items-start justify-between gap-2">
                <span className="px-2 py-0.5 rounded-full text-[9px] font-bold uppercase bg-white/10 text-sport-neonBlue">
                  {channel.category || 'Sports TV'}
                </span>
                <span className="flex items-center gap-1 text-[10px] font-bold text-sport-coral animate-pulse">
                  <span className="w-1.5 h-1.5 rounded-full bg-sport-coral" />
                  LIVE
                </span>
              </div>

              <div className="my-2 flex items-center gap-2.5">
                {channel.poster ? (
                  <img
                    src={channel.poster}
                    alt={channel.name}
                    className="w-8 h-8 rounded-lg object-contain bg-black/40 p-1 border border-white/5"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-lg bg-sport-electricBlue/20 text-sport-electricBlue flex items-center justify-center font-bold text-xs">
                    TV
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-bold text-white truncate group-hover:text-sport-neonBlue transition-colors">
                    {channel.name}
                  </p>
                  <p className="text-[10px] text-sport-textMuted truncate">
                    {channel.format || 'HLS Multi-Bitrate'}
                  </p>
                </div>
              </div>

              <div className="pt-2 border-t border-white/5 flex items-center justify-between text-[11px] text-sport-textSecondary">
                <span>Watch Stream</span>
                <Play className="w-3 h-3 fill-current text-sport-accentYellow group-hover:translate-x-0.5 transition-transform" />
              </div>
            </div>
          ))
        )}
      </div>
    </section>
  );
};
