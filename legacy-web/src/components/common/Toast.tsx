import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBell } from '@fortawesome/free-solid-svg-icons';

interface ToastProps {
  message: string | null;
}

export const Toast: React.FC<ToastProps> = ({ message }) => {
  if (!message) return null;

  return (
    <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 animate-in fade-in slide-in-from-bottom-3 duration-200">
      <div className="bg-[#1E2433] text-white px-4 py-2.5 rounded-full shadow-2xl flex items-center gap-2.5 text-xs font-semibold select-none">
        <span className="w-6 h-6 rounded-full bg-sport-coral/20 text-sport-coral flex items-center justify-center">
          <FontAwesomeIcon icon={faBell} className="text-[10px]" />
        </span>
        <span className="text-white">{message}</span>
      </div>
    </div>
  );
};
