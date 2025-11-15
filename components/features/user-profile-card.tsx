'use client';

import React from 'react';
import { Card } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';

interface UserProfileCardProps {
  user?: {
    name: string;
    email: string;
    role: string;
    avatar?: string;
  };
  className?: string;
}

export const UserProfileCard: React.FC<UserProfileCardProps> = ({ 
  user = {
    name: "Demo User",
    email: "demo@example.com",
    role: "Administrator"
  },
  className = "" 
}) => {
  return (
    <Card className={`p-6 ${className}`}>
      <div className="flex items-center space-x-4">
        <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center text-white font-semibold">
          {user.name.charAt(0)}
        </div>
        <div className="flex-1">
          <h3 className="font-semibold text-gray-900">{user.name}</h3>
          <p className="text-sm text-gray-600">{user.email}</p>
          <Badge variant="secondary" className="mt-1">
            {user.role}
          </Badge>
        </div>
        <Button variant="outline" size="sm">
          Edit Profile
        </Button>
      </div>
    </Card>
  );
};