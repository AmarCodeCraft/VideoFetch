import React from 'react';
import { Download, AlertCircle } from 'lucide-react';

interface VideoQuality {
  label: string;
  width: number;
  height: number;
  fileSize: string;
}

interface DownloadPanelProps {
  qualities: VideoQuality[];
  onDownload: (quality: VideoQuality) => void;
  isDownloading: boolean;
  progress: number;
  error?: string;
}

export function DownloadPanel({
  qualities,
  onDownload,
  isDownloading,
  progress,
  error
}: DownloadPanelProps) {
  return (
    <div className="p-4 bg-white rounded-lg shadow-lg">
      <h3 className="font-semibold mb-4">Download Video</h3>
      
      {error && (
        <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-lg flex items-center gap-2">
          <AlertCircle className="w-5 h-5" />
          <span>{error}</span>
        </div>
      )}
      
      <div className="space-y-3">
        {qualities.map((quality) => (
          <button
            key={quality.label}
            onClick={() => onDownload(quality)}
            disabled={isDownloading}
            className="w-full flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <div>
              <span className="font-medium">{quality.label}</span>
              <span className="text-sm text-gray-500 ml-2">
                ({quality.width}x{quality.height})
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-500">{quality.fileSize}</span>
              <Download className="w-4 h-4" />
            </div>
          </button>
        ))}
      </div>
      
      {isDownloading && (
        <div className="mt-4">
          <div className="flex justify-between text-sm mb-1">
            <span>Downloading...</span>
            <span>{progress}%</span>
          </div>
          <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-blue-500 transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}
    </div>
  );
}