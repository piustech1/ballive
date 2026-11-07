import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  X,
  Home,
  Radio,
  Calendar,
  Trophy,
  Heart,
  Bell,
  Tv,
  Settings,
  ShieldCheck,
  ChevronRight,
} from 'lucide-react';
import { Logo } from '../common/Logo';
import { COMPETITIONS } from '../../data/mockMatches';
import { useLiveMatches } from '../../hooks/useFootball';

interface NavigationDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NavigationDrawer: React.FC<NavigationDrawerProps> = ({ isOpen, onClose }) => {
  const { data: liveMatches } = useLiveMatches();

  if (!isOpen) return null;

  const navLinks = [
    { to: '/', label: 'Home', icon: Home },
    {
      to: '/live',
      label: 'Live Matches',
      icon: Radio,
      badge: liveMatches.length > 0 ? `${liveMatches.length} Live` : undefined,
      badgeColor: 'bg-sport-coral text-white',
    },
    { to: '/fixtures', label: 'Fixtures & Scores', icon: Calendar },
    { to: '/competitions', label: 'Competitions', icon: Trophy },
    { to: '/favorites', label: 'My Favorites', icon: Heart },
  ];

  return (
    <div className="fixed inset-0 z-50 flex">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/80 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Drawer Content */}
      <div className="relative w-80 max-w-[85vw] bg-[#0A0D14] border-r border-white/10 h-full flex flex-col z-10 shadow-2xl animate-in slide-in-from-left duration-200">
        {/* Top Header */}
        <div className="flex items-center justify-between p-5 border-b border-white/10">
          <Logo size="md" />
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-sport-textMuted hover:text-white hover:bg-white/5 transition-colors"
            aria-label="Close menu"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Nav Area */}
        <div className="flex-1 overflow-y-auto px-4 py-6 space-y-6">
          {/* Main Navigation */}
          <div className="space-y-1">
            <p className="px-3 text-xs font-semibold uppercase tracking-wider text-sport-textMuted mb-2">
              Menu
            </p>
            {navLinks.map(link => {
              const Icon = link.icon;
              return (
                <NavLink
                  key={link.to}
                  to={link.to}
                  onClick={onClose}
                  className={({ isActive }) =>
                    `flex items-center justify-between px-3.5 py-3 rounded-xl font-medium text-sm transition-colors ${
                      isActive
                        ? 'bg-sport-electricBlue/20 text-white font-semibold'
                        : 'text-sport-textSecondary hover:text-white hover:bg-white/5'
                    }`
                  }
                >
                  <div className="flex items-center gap-3">
                    <Icon className="w-4 h-4 text-sport-neonBlue" />
                    <span>{link.label}</span>
                  </div>
                  {link.badge && (
                    <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${link.badgeColor}`}>
                      {link.badge}
                    </span>
                  )}
                </NavLink>
              );
            })}
          </div>

          {/* Top Leagues & Tournaments */}
          <div className="space-y-1 pt-4 border-t border-white/5">
            <p className="px-3 text-xs font-semibold uppercase tracking-wider text-sport-textMuted mb-2">
              Top Leagues
            </p>
            {Object.values(COMPETITIONS).map(comp => (
              <NavLink
                key={comp.id}
                to={`/competitions?id=${comp.id}`}
                onClick={onClose}
                className="flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm text-sport-textSecondary hover:text-white hover:bg-white/5 transition-colors group"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <img src={comp.emblem} alt={comp.name} className="w-5 h-5 object-contain" />
                  <span className="truncate">{comp.name}</span>
                </div>
                <ChevronRight className="w-4 h-4 text-sport-textMuted group-hover:translate-x-0.5 transition-transform" />
              </NavLink>
            ))}
          </div>

          {/* Streaming & Network Status */}
          <div className="p-4 rounded-2xl bg-[#121622] border border-white/5 space-y-2">
            <div className="flex items-center gap-2 text-xs font-semibold text-sport-emerald">
              <ShieldCheck className="w-4 h-4" />
              <span>Official Broadcasters Connected</span>
            </div>
            <p className="text-xs text-sport-textMuted leading-relaxed">
              Legitimate streaming feeds, live scores, and verified competition timetables.
            </p>
          </div>
        </div>

        {/* Footer info */}
        <div className="p-4 border-t border-white/10 text-xs text-sport-textMuted flex items-center justify-between">
          <span>SPORT2 v2.5 Mobile</span>
          <span className="flex items-center gap-1 text-sport-accentYellow">
            <Tv className="w-3.5 h-3.5" />
            HD Streaming
          </span>
        </div>
      </div>
    </div>
  );
};
