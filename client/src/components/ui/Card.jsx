import React from 'react';

export const Card = ({ children, className = '', hoverable = false, ...props }) => {
  return (
    <div
      className={`bg-white dark:bg-[#162B22] border border-[#DCE7DF] dark:border-[#294A38] rounded-xl shadow-xs transition-colors duration-150 ${
        hoverable ? 'hover:border-[#166534]/50 dark:hover:border-[#4ADE80]/50' : ''
      } ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

export const CardHeader = ({ children, className = '' }) => (
  <div className={`px-5 py-4 border-b border-[#DCE7DF] dark:border-[#294A38] ${className}`}>
    {children}
  </div>
);

export const CardTitle = ({ children, className = '' }) => (
  <h3 className={`text-base font-bold text-[#14532D] dark:text-[#F0FDF4] ${className}`}>
    {children}
  </h3>
);

export const CardDescription = ({ children, className = '' }) => (
  <p className={`text-xs text-[#475569] dark:text-[#A7C4B0] mt-0.5 ${className}`}>
    {children}
  </p>
);

export const CardContent = ({ children, className = '' }) => (
  <div className={`p-5 ${className}`}>{children}</div>
);

export const CardFooter = ({ children, className = '' }) => (
  <div
    className={`px-5 py-3.5 border-t border-[#DCE7DF] dark:border-[#294A38] bg-[#F7FAF8] dark:bg-[#10231B] rounded-b-xl ${className}`}
  >
    {children}
  </div>
);

