import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';

export const Breadcrumb = ({ items = [], homePath = '/' }) => {
  return (
    <nav aria-label="Breadcrumb" className="flex items-center flex-wrap gap-1.5 text-xs text-[#64748B] dark:text-[#A7C4B0]">
      <Link
        to={homePath}
        className="inline-flex items-center gap-1 hover:text-[#166534] dark:hover:text-[#4ADE80] font-medium transition-colors"
      >
        <Home className="w-3.5 h-3.5" />
        <span>Portal</span>
      </Link>
      {items.map((item, idx) => (
        <React.Fragment key={idx}>
          <ChevronRight className="w-3.5 h-3.5 opacity-60" />
          {item.to ? (
            <Link
              to={item.to}
              className="hover:text-[#166534] dark:hover:text-[#4ADE80] font-medium transition-colors"
            >
              {item.label}
            </Link>
          ) : (
            <span className="font-semibold text-[#172B24] dark:text-[#F0FDF4]">
              {item.label}
            </span>
          )}
        </React.Fragment>
      ))}
    </nav>
  );
};

