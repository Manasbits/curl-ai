import React from 'react';

type InputProps = React.InputHTMLAttributes<HTMLInputElement> & {
  label?: string;
  icon?: React.ReactNode;
};

export function Input({ label, icon, className = '', ...props }: InputProps) {
  return (
    <label className={`flex flex-col gap-2 w-full ${className}`}>
      {label && <span className="text-sm text-gray-700">{label}</span>}
      <div className="flex items-center bg-gray-100 rounded-xl px-4 py-3">
        <input
          className="bg-transparent outline-none w-full text-gray-700"
          {...props}
        />
        {icon && <div className="ml-2 text-gray-500">{icon}</div>}
      </div>
    </label>
  );
}

export default Input;
