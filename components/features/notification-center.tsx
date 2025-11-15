'use client';

import React, { useState } from 'react';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';

interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  time: string;
  read: boolean;
}

interface NotificationCenterProps {
  className?: string;
}

export const NotificationCenter: React.FC<NotificationCenterProps> = ({ className = "" }) => {
  const [notifications] = useState<Notification[]>([
    {
      id: '1',
      title: 'New Order Received',
      message: 'Order #12345 has been placed successfully',
      type: 'success',
      time: '2 min ago',
      read: false
    },
    {
      id: '2',
      title: 'System Update',
      message: 'System will be updated tonight at 2:00 AM',
      type: 'info',
      time: '1 hour ago',
      read: true
    },
    {
      id: '3',
      title: 'Low Inventory Alert',
      message: 'Product XYZ is running low in stock',
      type: 'warning',
      time: '3 hours ago',
      read: false
    }
  ]);

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <Card className={`p-6 ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <h3 className="text-lg font-semibold">Notifications</h3>
          {unreadCount > 0 && (
            <Badge variant="destructive">{unreadCount}</Badge>
          )}
        </div>
        <Button variant="outline" size="sm">
          Mark All Read
        </Button>
      </div>
      
      <div className="space-y-3 max-h-64 overflow-y-auto">
        {notifications.map((notification) => (
          <div 
            key={notification.id} 
            className={`p-3 rounded-lg border transition-colors ${
              notification.read ? 'bg-gray-50' : 'bg-blue-50 border-blue-200'
            }`}
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-2">
                  <h4 className="text-sm font-medium text-gray-900">{notification.title}</h4>
                  <Badge 
                    variant={
                      notification.type === 'success' ? 'default' :
                      notification.type === 'warning' ? 'secondary' :
                      notification.type === 'error' ? 'destructive' : 'outline'
                    }
                    className="text-xs"
                  >
                    {notification.type}
                  </Badge>
                </div>
                <p className="text-sm text-gray-600 mt-1">{notification.message}</p>
                <span className="text-xs text-gray-500 mt-1">{notification.time}</span>
              </div>
              {!notification.read && (
                <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0 mt-1" />
              )}
            </div>
          </div>
        ))}
      </div>
      
      <div className="mt-4 pt-4 border-t">
        <Button variant="outline" className="w-full">
          View All Notifications
        </Button>
      </div>
    </Card>
  );
};