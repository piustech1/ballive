import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, Radio, Calendar, Trophy, Heart } from 'lucide-react';
import { useLiveMatches } from '../../hooks/useFootball';

export const BottomNav: React.FC = () => {
  const { data: liveMatches } = useLiveMatches();
  const liveCount = liveMatches.length;

  const navItems = [
    { to: '/', label: 'Home', icon: Home },
    {
      to: '/live',
      label: 'Live',
      icon: Radio,
      badge: liveCount > 0 ? liveCount : undefined,
    },
    { to: '/fixtures', label: 'Fixtures', icon: Calendar },
    { to: '/competitions', label: 'Leagues', icon: Trophy },
    { to: '/favorites', label: 'Favorites', icon: Heart },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#0A0D14]/95 backdrop-blur-lg border-t border-white/10 pb-safe">
      <div className="flex items-center justify-around h-16 px-2">
        {navItems.map(item => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex flex-col items-center justify-center flex-1 h-full py-1 text-[11px] font-medium transition-colors relative ${
                  isActive ? 'text-sport-neonBlue font-semibold' : 'text-sport-textMuted hover:text-white'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <div className="relative">
                    <Icon className={`w-5 h-5 mb-0.5 ${isActive ? 'stroke-[2.2]' : 'stroke-[1.8]'}`} />
                    {item.badge && (
                      <span className="absolute -top-1 -right-2 px-1.5 py-0.2 rounded-full text-[9px] font-black bg-sport-coral text-white animate-pulse">
                        {item.badge}
                      </span>
                    )}
                  </div>
                  <span>{item.label}</span>
                  {isActive && (
                    <span className="absolute bottom-1 w-1 h-1 rounded-full bg-sport-neonBlue" />
                  )}
                </>
              )}
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
};
