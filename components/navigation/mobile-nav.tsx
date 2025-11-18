'use client';

import { useState } from 'react';
import { Menu, X } from 'lucide-react';

interface MobileNavProps {
  children?: React.ReactNode;
}

export function MobileNav({ children }: MobileNavProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="md:hidden">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100"
        aria-label={isOpen ? "Close mobile menu" : "Open mobile menu"}
      >
        {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 right-0 bg-white border-t shadow-lg z-50">
          <div className="p-4">
            {children}
          </div>
        </div>
      )}
    </div>
  );
}
