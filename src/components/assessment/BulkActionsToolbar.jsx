import React from 'react';
import { Check, Trash2, Download, Send, Copy } from 'lucide-react';

/**
 * ==========================================
 * BULK ACTIONS TOOLBAR
 * ==========================================
 * 
 * Toolbar for performing bulk operations on selected items
 */

function BulkActionsToolbar({ selectedCount, onAction }) {
  if (selectedCount === 0) return null;

  const actions = [
    {
      id: 'approve',
      label: 'Approve',
      icon: Check,
      color: '#10B981'
    },
    {
      id: 'export',
      label: 'Export',
      icon: Download,
      color: '#3B82F6'
    },
    {
      id: 'duplicate',
      label: 'Duplicate',
      icon: Copy,
      color: '#8B5CF6'
    },
    {
      id: 'send',
      label: 'Send',
      icon: Send,
      color: '#F59E0B'
    },
    {
      id: 'delete',
      label: 'Delete',
      icon: Trash2,
      color: '#EF4444'
    }
  ];

  return (
    <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50">
      <div className="bg-white rounded-full shadow-2xl border border-gray-200 px-6 py-3 flex items-center gap-4">
        {/* Selected Count */}
        <div className="flex items-center gap-2 pr-4 border-r border-gray-200">
          <div className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-sm font-bold">
            {selectedCount}
          </div>
          <span className="text-sm font-medium text-gray-700">
            {selectedCount} selected
          </span>
        </div>

        {/* Actions */}
        {actions.map((action) => {
          const ActionIcon = action.icon;
          return (
            <button
              key={action.id}
              onClick={() => onAction && onAction(action.id)}
              className="flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-gray-100 transition-colors"
              title={action.label}
            >
              <ActionIcon size={18} style={{ color: action.color }} />
              <span className="text-sm font-medium text-gray-700">
                {action.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default BulkActionsToolbar;
