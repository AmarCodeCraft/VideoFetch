import { Github, Twitter, Heart, Play, Zap, Shield, Globe } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Tooltip } from '@/components/ui/tooltip';

export function Footer() {
  return (
    <footer className="border-t border-surface-800/60 mt-16 relative">
      <div className="absolute inset-0 bg-gradient-to-t from-surface-950/50 to-transparent pointer-events-none" />
      
      <div className="container mx-auto px-4 py-12 relative">
        {/* Top section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 mb-10">
          {/* Brand */}
          <div className="space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg gradient-brand flex items-center justify-center">
                <Play className="w-3.5 h-3.5 text-white fill-white" />
              </div>
              <span className="text-lg font-extrabold tracking-tight">
                <span className="gradient-text">Video</span>
                <span className="text-surface-200">Fetch</span>
              </span>
            </div>
            <p className="text-sm text-surface-500 leading-relaxed max-w-xs">
              The fastest way to fetch YouTube video metadata, preview content, and download thumbnails.
            </p>
            <div className="flex items-center gap-1.5">
              <Tooltip content="GitHub">
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => {}}>
                  <Github className="w-4 h-4" />
                </Button>
              </Tooltip>
              <Tooltip content="Twitter">
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => {}}>
                  <Twitter className="w-4 h-4" />
                </Button>
              </Tooltip>
            </div>
          </div>

          {/* Features */}
          <div className="space-y-4">
            <h4 className="text-xs font-semibold text-surface-400 uppercase tracking-wider">Features</h4>
            <ul className="space-y-2.5 text-sm text-surface-500">
              <li className="flex items-center gap-2 hover:text-surface-300 transition-colors cursor-default">
                <Zap className="w-3.5 h-3.5 text-brand-400" /> Instant video preview
              </li>
              <li className="flex items-center gap-2 hover:text-surface-300 transition-colors cursor-default">
                <Shield className="w-3.5 h-3.5 text-brand-400" /> Privacy-first embed
              </li>
              <li className="flex items-center gap-2 hover:text-surface-300 transition-colors cursor-default">
                <Globe className="w-3.5 h-3.5 text-brand-400" /> Works with any YT URL
              </li>
            </ul>
          </div>

          {/* Links */}
          <div className="space-y-4">
            <h4 className="text-xs font-semibold text-surface-400 uppercase tracking-wider">Links</h4>
            <ul className="space-y-2.5 text-sm text-surface-500">
              <li><a href="#" className="hover:text-surface-300 transition-colors">Privacy Policy</a></li>
              <li><a href="#" className="hover:text-surface-300 transition-colors">Terms of Service</a></li>
              <li><a href="#" className="hover:text-surface-300 transition-colors">Contact Us</a></li>
            </ul>
          </div>
        </div>

        <Separator />
        
        {/* Bottom bar */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-xs text-surface-600">
            <span>© {new Date().getFullYear()} VideoFetch</span>
            <span className="w-1 h-1 rounded-full bg-surface-700" />
            <span className="flex items-center gap-1">
              Made with <Heart className="w-3 h-3 text-brand-500 animate-pulse-slow" /> for video enthusiasts
            </span>
          </div>
          <span className="text-xs text-surface-700">v1.0.0</span>
        </div>
      </div>
    </footer>
  );
}