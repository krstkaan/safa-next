import React from 'react';

interface ResponsiveTableProps {
  children: React.ReactNode;
}

export function ResponsiveTable({ children }: ResponsiveTableProps) {
  return (
    <div className="overflow-x-auto">
      <div className="min-w-full inline-block align-middle">
        <div className="overflow-hidden border border-gray-200 md:rounded-lg">
          {children}
        </div>
      </div>
    </div>
  );
}
