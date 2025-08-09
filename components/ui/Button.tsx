import React from 'react';

type Props = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'ghost';
};

const cn = (...cls: (string | false | null | undefined)[]) => cls.filter(Boolean).join(' ');

export default function Button({ variant='primary', className, children, ...props }: Props) {
  if (variant === 'ghost') {
    return (
      <button
        {...props}
        className={cn(
          'px-4 py-2 rounded-xl border border-gray-200 hover:bg-gray-50 transition-colors duration-200',
          className
        )}
      >
        {children}
      </button>
    );
  }
  return (
    <button
      {...props}
      className={cn(
        'px-5 py-3 rounded-2xl text-white font-semibold shadow-lg transition-all duration-300',
        'bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-500 hover:to-blue-500',
        'focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500',
        className
      )}
    >
      {children}
    </button>
  );
}
