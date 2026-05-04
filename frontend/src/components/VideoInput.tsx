import React, { useState } from 'react';
import { Search, Loader2, Link } from 'lucide-react';
import toast from 'react-hot-toast';
import { Button } from '@/components/ui/button';

interface VideoInputProps {
  onSubmit: (url: string) => void;
  loading?: boolean;
}

export function VideoInput({ onSubmit, loading }: VideoInputProps) {
  const [url, setUrl] = useState('');
  const [focused, setFocused] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim()) {
      toast.error('Please enter a YouTube URL');
      return;
    }
    onSubmit(url);
  };

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-2xl">
      <div className="relative group">
        {focused && (
          <div className="absolute -inset-1 bg-gradient-to-r from-brand-500/20 via-brand-400/10 to-brand-500/20 rounded-2xl blur-lg transition-opacity duration-500" />
        )}
        <div className="relative flex items-center">
          <div className="absolute left-4 text-surface-500 pointer-events-none">
            <Link className="w-4 h-4" />
          </div>
          <input
            type="text"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            placeholder="Paste YouTube video URL here..."
            disabled={loading}
            className="w-full pl-11 pr-32 py-4 rounded-2xl bg-surface-800/70 border border-surface-700/50 text-surface-100 placeholder-surface-500 focus:border-brand-500/40 focus:outline-none input-glow transition-all duration-300 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          />
          <div className="absolute right-2">
            <Button
              type="submit"
              disabled={loading || !url.trim()}
              variant="glow"
              className="h-10 px-5 text-sm gap-2"
            >
              {loading ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <Search size={16} />
              )}
              <span className="hidden sm:inline">{loading ? 'Fetching...' : 'Fetch'}</span>
            </Button>
          </div>
        </div>
      </div>
      {focused && (
        <p className="text-xs text-surface-600 mt-2 text-center animate-fade-in">
          Supports youtube.com, youtu.be, and shorts URLs
        </p>
      )}
    </form>
  );
}