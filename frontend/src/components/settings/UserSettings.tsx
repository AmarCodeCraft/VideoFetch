import React, { useState } from 'react';
import { Trash2, Download, Cookie, Database } from 'lucide-react';

export function UserSettings() {
  const [showConfirm, setShowConfirm] = useState(false);
  
  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <h2 className="text-xl font-semibold mb-6">Settings</h2>
      
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Trash2 className="w-5 h-5 text-gray-500" />
            <div>
              <h3 className="font-medium">Clear History</h3>
              <p className="text-sm text-gray-500">Remove all watched videos</p>
            </div>
          </div>
          <button
            onClick={() => setShowConfirm(true)}
            className="px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg"
          >
            Clear
          </button>
        </div>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Database className="w-5 h-5 text-gray-500" />
            <div>
              <h3 className="font-medium">Cache Management</h3>
              <p className="text-sm text-gray-500">Clear cached video data</p>
            </div>
          </div>
          <button className="px-4 py-2 text-blue-600 hover:bg-blue-50 rounded-lg">
            Clear Cache
          </button>
        </div>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Cookie className="w-5 h-5 text-gray-500" />
            <div>
              <h3 className="font-medium">Cookie Preferences</h3>
              <p className="text-sm text-gray-500">Manage cookie settings</p>
            </div>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input type="checkbox" className="sr-only peer" />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
          </label>
        </div>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Download className="w-5 h-5 text-gray-500" />
            <div>
              <h3 className="font-medium">Offline Viewing</h3>
              <p className="text-sm text-gray-500">Download videos for later</p>
            </div>
          </div>
          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
            Manage Downloads
          </button>
        </div>
      </div>
      
      {showConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-semibold mb-2">Clear History?</h3>
            <p className="text-gray-600 mb-4">
              This action cannot be undone. All your watch history will be permanently removed.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowConfirm(false)}
                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  // Handle clear history
                  setShowConfirm(false);
                }}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                Clear History
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}