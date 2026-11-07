import React from 'react';
import { Bell, CheckCircle2 } from 'lucide-react';

interface ToastProps {
  message: string | null;
}

export const Toast: React.FC<ToastProps> = ({ message }) => {
  if (!message) return null;

  return (
    <div className="fixed bottom-20 md:bottom-8 left-1/2 -translate-x-1/2 z-50 animate-bounce duration-300">
      <div className="bg-[#182030]/95 backdrop-blur-md border border-white/15 text-white px-4 py-2.5 rounded-full shadow-2xl flex items-center gap-2.5 text-xs md:text-sm font-medium">
        <span className="p-1 rounded-full bg-sport-electricBlue/20 text-sport-neonBlue">
          <Bell className="w-3.5 h-3.5" />
        </span>
        <span>{message}</span>
      </div>
    </div>
  );
};
