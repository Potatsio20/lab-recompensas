import React from 'react';

type Props = React.InputHTMLAttributes<HTMLInputElement>;

export default function Input(props: Props) {
  return (
    <input
      {...props}
      className={
        'w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-base ' +
        'placeholder:text-gray-400 outline-none ring-0 focus:ring-2 focus:ring-blue-500 transition-all'
      }
    />
  );
}
