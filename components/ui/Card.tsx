import React from 'react';

export default function Card({ children, className='' }: { children: React.ReactNode, className?: string }) {
  return (
    <div className={`bg-white/90 backdrop-blur rounded-3xl border border-gray-100 shadow-sm ${className}`}>
      {children}
    </div>
  );
}
