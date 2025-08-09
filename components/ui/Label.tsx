import React from 'react';
export default function Label({ children }: { children: React.ReactNode }) {
  return <label className="block text-sm font-medium text-gray-600 mb-1">{children}</label>;
}
