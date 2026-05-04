import { useState } from 'react';
import { Search, Play, Sparkles, HelpCircle, X, Link2, Youtube, WifiOff } from 'lucide-react';
import { useOnlineStatus } from '@/hooks/useOnlineStatus';
import { Button } from '@/components/ui/button';
import { Tooltip } from '@/components/ui/tooltip';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

export type PageView = 'fetch' | 'search' | 'offline';

interface MainNavProps {
  searchQuery?: string;
  onSearchChange?: (query: string) => void;
  page?: PageView;
  onPageChange?: (page: PageView) => void;
}

export function MainNav({
  searchQuery = '',
  onSearchChange,
  page = 'fetch',
  onPageChange,
}: MainNavProps) {
  const [searchFocused, setSearchFocused] = useState(false);
  const isOnline = useOnlineStatus();

  const navItems: { id: PageView; label: string; icon: React.ReactNode }[] = [
    { id: 'fetch', label: 'Fetch', icon: <Link2 className="w-3.5 h-3.5" /> },
    { id: 'search', label: 'Watch', icon: <Youtube className="w-3.5 h-3.5" /> },
    { id: 'offline', label: 'Offline', icon: <WifiOff className="w-3.5 h-3.5" /> },
  ];

  return (
    <nav className="sticky top-0 z-50 glass border-b border-white/5 animate-slide-down">
      <div className="container mx-auto px-4">
        <div className="flex items-center h-16 justify-between gap-4">
          {/* Logo */}
          <div className="flex items-center gap-2.5 shrink-0">
            <div className="relative">
              <div className="w-9 h-9 rounded-xl gradient-brand flex items-center justify-center shadow-neon">
                <Play className="w-4 h-4 text-white fill-white" />
              </div>
              <div className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-emerald-400 border-2 border-surface-900 animate-pulse" />
            </div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-extrabold tracking-tight">
                <span className="gradient-text">Video</span>
                <span className="text-surface-200">Fetch</span>
              </h1>
              <Badge variant="default" className="hidden sm:flex text-[10px] px-1.5 py-0 h-5">
                <Sparkles className="w-3 h-3 mr-0.5" />
                Pro
              </Badge>
            </div>
          </div>

          {/* Page Tabs */}
          <div className="hidden md:flex items-center gap-1 p-1 rounded-xl bg-surface-800/40 border border-surface-700/40">
            {navItems.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => onPageChange?.(item.id)}
                className={cn(
                  'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200',
                  page === item.id
                    ? 'bg-gradient-to-r from-brand-500 to-brand-600 text-white shadow-neon'
                    : 'text-surface-400 hover:text-surface-100 hover:bg-surface-700/40'
                )}
              >
                {item.icon}
                {item.label}
                {item.id === 'offline' && !isOnline && (
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                )}
              </button>
            ))}
          </div>
          
          {/* Search */}
          <div className="flex-1 max-w-xl">
            <div className="relative group">
              {searchFocused && (
                <div className="absolute -inset-1 bg-gradient-to-r from-brand-500/15 via-brand-400/5 to-brand-500/15 rounded-2xl blur-md transition-opacity duration-300" />
              )}
              <div className="relative">
                <input
                  type="search"
                  placeholder="Search videos by title or channel..."
                  value={searchQuery ?? ''}
                  onChange={(e) => onSearchChange?.(e.target.value)}
                  onFocus={() => setSearchFocused(true)}
                  onBlur={() => setSearchFocused(false)}
                  className="w-full px-4 py-2.5 rounded-xl bg-surface-800/60 border border-surface-700/50 text-surface-200 placeholder-surface-500 focus:border-brand-500/40 focus:outline-none input-glow transition-all duration-300 pl-10 pr-9 text-sm"
                />
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-500 group-focus-within:text-brand-400 transition-colors" />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => onSearchChange?.('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-0.5 rounded-md text-surface-500 hover:text-surface-200 hover:bg-surface-700/60 transition-colors"
                    aria-label="Clear search"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-1.5 shrink-0">
            <Tooltip content="Help & Tips">
              <Button variant="ghost" size="icon" className="hidden sm:inline-flex">
                <HelpCircle className="w-4 h-4" />
              </Button>
            </Tooltip>
            <Tooltip content="Profile">
              <button className="w-8 h-8 rounded-full bg-gradient-to-br from-brand-400 to-brand-600 flex items-center justify-center text-xs font-bold text-white shadow-neon ring-2 ring-brand-500/20 hover:ring-brand-500/40 transition-all duration-200">
                V
              </button>
            </Tooltip>
          </div>
        </div>

        {/* Mobile tabs row */}
        <div className="md:hidden flex items-center gap-1 p-1 rounded-xl bg-surface-800/40 border border-surface-700/40 mb-2">
          {navItems.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => onPageChange?.(item.id)}
              className={cn(
                'flex-1 inline-flex items-center justify-center gap-1.5 px-2 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200',
                page === item.id
                  ? 'bg-gradient-to-r from-brand-500 to-brand-600 text-white shadow-neon'
                  : 'text-surface-400 hover:text-surface-100 hover:bg-surface-700/40'
              )}
            >
              {item.icon}
              {item.label}
              {item.id === 'offline' && !isOnline && (
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
              )}
            </button>
          ))}
        </div>
      </div>
    </nav>
  );
}