'use client';

import React, { useState } from 'react';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';

interface Theme {
  id: string;
  name: string;
  preview: string;
  active: boolean;
}

interface ThemeSelectorProps {
  className?: string;
}

export const ThemeSelector: React.FC<ThemeSelectorProps> = ({ className = "" }) => {
  const [themes] = useState<Theme[]>([
    { id: 'light', name: 'Light', preview: 'bg-white', active: true },
    { id: 'dark', name: 'Dark', preview: 'bg-gray-900', active: false },
    { id: 'blue', name: 'Blue', preview: 'bg-blue-600', active: false },
    { id: 'green', name: 'Green', preview: 'bg-green-600', active: false },
  ]);

  return (
    <Card className={`p-6 ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">Theme Selector</h3>
        <Badge variant="outline">4 Themes</Badge>
      </div>
      
      <div className="grid grid-cols-2 gap-3">
        {themes.map((theme) => (
          <div key={theme.id} className="relative">
            <button className="w-full p-3 rounded-lg border-2 hover:border-blue-500 transition-colors">
              <div className={`w-full h-16 rounded-md ${theme.preview} border`} />
              <div className="mt-2 text-sm font-medium text-gray-900">{theme.name}</div>
              {theme.active && (
                <Badge className="absolute -top-2 -right-2" variant="default">
                  Active
                </Badge>
              )}
            </button>
          </div>
        ))}
      </div>
      
      <div className="mt-4 pt-4 border-t">
        <Button variant="outline" className="w-full">
          Customize Theme
        </Button>
      </div>
    </Card>
  );
};