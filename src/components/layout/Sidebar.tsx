import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  Home,
  Radio,
  Calendar,
  Trophy,
  Heart,
  Tv,
  ExternalLink,
  ShieldCheck,
} from 'lucide-react';
import { Logo } from '../common/Logo';
import { COMPETITIONS } from '../../data/mockMatches';
import { useLiveMatches } from '../../hooks/useFootball';

export const Sidebar: React.FC = () => {
  const { data: liveMatches } = useLiveMatches();

  return (
    <aside className="hidden lg:flex flex-col w-64 bg-[#0A0D14] border-r border-white/5 h-screen sticky top-0 shrink-0 select-none">
      {/* Brand Top Header */}
      <div className="p-6 pb-4">
        <Logo size="lg" />
        <p className="text-[11px] text-sport-textMuted tracking-wide mt-1">
          Premium Football Streaming
        </p>
      </div>

      {/* Main Navigation */}
      <div className="flex-1 overflow-y-auto px-4 py-2 space-y-6">
        <div className="space-y-1">
          <NavLink
            to="/"
            end
            className={({ isActive }) =>
              `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-sport-electricBlue/20 text-white font-semibold'
                  : 'text-sport-textSecondary hover:text-white hover:bg-white/5'
              }`
            }
          >
            <Home className="w-4 h-4 text-sport-neonBlue" />
            <span>Home</span>
          </NavLink>

          <NavLink
            to="/live"
            className={({ isActive }) =>
              `flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-sport-electricBlue/20 text-white font-semibold'
                  : 'text-sport-textSecondary hover:text-white hover:bg-white/5'
              }`
            }
          >
            <div className="flex items-center gap-3">
              <Radio className="w-4 h-4 text-sport-coral animate-pulse" />
              <span>Live Matches</span>
            </div>
            {liveMatches.length > 0 && (
              <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-sport-coral text-white animate-pulse">
                {liveMatches.length}
              </span>
            )}
          </NavLink>

          <NavLink
            to="/fixtures"
            className={({ isActive }) =>
              `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-sport-electricBlue/20 text-white font-semibold'
                  : 'text-sport-textSecondary hover:text-white hover:bg-white/5'
              }`
            }
          >
            <Calendar className="w-4 h-4 text-sport-accentYellow" />
            <span>Fixtures & Results</span>
          </NavLink>

          <NavLink
            to="/competitions"
            className={({ isActive }) =>
              `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-sport-electricBlue/20 text-white font-semibold'
                  : 'text-sport-textSecondary hover:text-white hover:bg-white/5'
              }`
            }
          >
            <Trophy className="w-4 h-4 text-sport-accentYellow" />
            <span>Competitions</span>
          </NavLink>

          <NavLink
            to="/favorites"
            className={({ isActive }) =>
              `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-sport-electricBlue/20 text-white font-semibold'
                  : 'text-sport-textSecondary hover:text-white hover:bg-white/5'
              }`
            }
          >
            <Heart className="w-4 h-4 text-sport-coral" />
            <span>Favorites</span>
          </NavLink>
        </div>

        {/* Top Competitions */}
        <div className="pt-4 border-t border-white/5 space-y-1">
          <p className="px-3 text-xs font-semibold uppercase tracking-wider text-sport-textMuted mb-2">
            Top Leagues
          </p>
          {Object.values(COMPETITIONS).map(comp => (
            <NavLink
              key={comp.id}
              to={`/competitions?id=${comp.id}`}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3.5 py-2 rounded-xl text-sm transition-colors ${
                  isActive
                    ? 'bg-white/10 text-white font-semibold'
                    : 'text-sport-textSecondary hover:text-white hover:bg-white/5'
                }`
              }
            >
              <img src={comp.emblem} alt={comp.name} className="w-5 h-5 object-contain" />
              <span className="truncate text-xs">{comp.name}</span>
            </NavLink>
          ))}
        </div>

        {/* Official broadcast channels widget */}
        <div className="p-3.5 rounded-2xl bg-[#121622] border border-white/5 space-y-2">
          <div className="flex items-center gap-2 text-xs font-semibold text-sport-emerald">
            <ShieldCheck className="w-4 h-4" />
            <span>Authorized Streams</span>
          </div>
          <p className="text-[11px] text-sport-textMuted leading-relaxed">
            HLS HD player feeds, official broadcast lineups, and real-time statistics.
          </p>
        </div>
      </div>

      {/* Footer Profile */}
      <div className="p-4 border-t border-white/5 flex items-center justify-between text-xs text-sport-textMuted">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-sport-emerald animate-pulse"></span>
          <span>Official Network Live</span>
        </div>
        <Tv className="w-4 h-4 text-sport-accent" />
      </div>
    </aside>
  );
};
