// components/ui/button.js
import React from 'react';

export function Button({ children, className = '', disabled = false, onClick, ...props }) {
  const baseClasses = "px-4 py-2 rounded-lg font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2";
  const variantClasses = disabled 
    ? "bg-gray-300 text-gray-500 cursor-not-allowed"
    : "bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500";
  
  return (
    <button
      className={`${baseClasses} ${variantClasses} ${className}`}
      disabled={disabled}
      onClick={onClick}
      {...props}
    >
      {children}
    </button>
  );
}
