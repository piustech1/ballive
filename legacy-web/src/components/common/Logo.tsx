import React from 'react';
import { Link } from 'react-router-dom';

interface LogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const Logo: React.FC<LogoProps> = ({ className = '', size = 'md' }) => {
  const sizeClasses = {
    sm: 'text-lg',
    md: 'text-2xl',
    lg: 'text-3xl',
  };

  const badgeSizes = {
    sm: 'w-4 h-4 text-xs',
    md: 'w-5 h-5 text-xs',
    lg: 'w-6 h-6 text-sm',
  };

  return (
    <Link
      to="/"
      className={`inline-flex items-center gap-1 font-display font-black tracking-wider text-white select-none group transition-opacity hover:opacity-90 ${sizeClasses[size]} ${className}`}
    >
      <span className="tracking-widest uppercase text-white font-extrabold">SPORT</span>
      <span className="relative inline-flex items-center justify-center">
        <span className="text-sport-accentYellow font-black font-display drop-shadow-[0_0_8px_rgba(250,204,21,0.6)]">
          2
        </span>
        {/* Subtle decorative dot or star */}
        <span className="absolute -top-1 -right-1 w-1.5 h-1.5 bg-sport-accentYellow rounded-full animate-pulse-fast"></span>
      </span>
    </Link>
  );
};
