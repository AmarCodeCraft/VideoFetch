import React from 'react';
import { ChevronLeft, ChevronRight, Play } from 'lucide-react';

interface Video {
  id: string;
  title: string;
  thumbnail: string;
  duration: string;
}

export function FeaturedCarousel() {
  const featured: Video[] = [
    {
      id: '1',
      title: 'Getting Started with Web Development',
      thumbnail: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085',
      duration: '12:34'
    },
    // Add more featured videos
  ];

  return (
    <div className="relative w-full aspect-video rounded-xl overflow-hidden">
      <div className="absolute inset-0 flex">
        {featured.map((video) => (
          <div key={video.id} className="relative w-full flex-shrink-0">
            <img
              src={video.thumbnail}
              alt={video.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
            <div className="absolute bottom-0 left-0 p-6">
              <h2 className="text-white text-2xl font-bold mb-2">{video.title}</h2>
              <button className="flex items-center gap-2 bg-white text-black px-4 py-2 rounded-full hover:bg-gray-100">
                <Play className="w-5 h-5" />
                Play Now
              </button>
            </div>
          </div>
        ))}
      </div>
      
      <button className="absolute left-4 top-1/2 -translate-y-1/2 p-2 bg-white/80 rounded-full hover:bg-white">
        <ChevronLeft className="w-6 h-6" />
      </button>
      <button className="absolute right-4 top-1/2 -translate-y-1/2 p-2 bg-white/80 rounded-full hover:bg-white">
        <ChevronRight className="w-6 h-6" />
      </button>
    </div>
  );
}