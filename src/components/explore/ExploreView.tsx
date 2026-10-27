import React, { useState } from 'react';
import { Search, Flame, Play, Music2, X } from 'lucide-react';
import { VideoItem } from '../../types/video';
import { soundEngine } from '../../utils/audioSynth';
import { getFilterStyleString } from '../../utils/filterStyles';

interface ExploreViewProps {
  videos: VideoItem[];
  onSelectVideo: (videoId: string) => void;
  initialTag?: string;
}

const CATEGORIES = ['All', 'Trending', 'Creative', 'Music', 'Food', 'Street', 'Film'];

export const ExploreView: React.FC<ExploreViewProps> = ({
  videos,
  onSelectVideo,
  initialTag,
}) => {
  const [searchQuery, setSearchQuery] = useState(initialTag ? `#${initialTag}` : '');
  const [selectedCategory, setSelectedCategory] = useState('All');

  const filteredVideos = videos.filter((video) => {
    const query = searchQuery.toLowerCase().trim();
    const matchesCategory =
      selectedCategory === 'All' ||
      video.hashtags.some((t) => t.toLowerCase().includes(selectedCategory.toLowerCase())) ||
      video.caption.toLowerCase().includes(selectedCategory.toLowerCase());

    if (!matchesCategory) return false;
    if (!query) return true;

    const cleanQuery = query.startsWith('#') ? query.slice(1) : query;
    const matchesHashtag = video.hashtags.some((t) => t.toLowerCase().includes(cleanQuery));
    const matchesCaption = video.caption.toLowerCase().includes(query);
    const matchesUser =
      video.creator.username.toLowerCase().includes(query) ||
      video.creator.name.toLowerCase().includes(query);

    return matchesHashtag || matchesCaption || matchesUser;
  });

  const formatViews = (views: number) => {
    if (views >= 1000000) return (views / 1000000).toFixed(1) + 'M';
    if (views >= 1000) return (views / 1000).toFixed(1) + 'K';
    return views.toString();
  };

  return (
    <div className="w-full h-full bg-neutral-950 flex flex-col overflow-y-auto no-scrollbar select-none pb-20">
      {/* Search Header */}
      <div className="sticky top-0 z-30 bg-neutral-900/90 backdrop-blur-md px-4 pt-3 pb-2 border-b border-neutral-800">
        <div className="relative flex items-center">
          <Search className="w-4 h-4 text-neutral-400 absolute left-3.5 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search creators, hashtags, music..."
            className="w-full bg-neutral-800 text-xs text-white pl-10 pr-9 py-2.5 rounded-full placeholder:text-neutral-500 focus:outline-none focus:ring-1 focus:ring-rose-500"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 text-neutral-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Category horizontal scroll bar */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pt-3 pb-1">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => {
                soundEngine.playTone(450, 'sine', 0.04, 0.05);
                setSelectedCategory(cat);
              }}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
                selectedCategory === cat
                  ? 'bg-white text-black shadow-sm'
                  : 'bg-neutral-800 text-neutral-400 hover:text-neutral-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Featured Trending Banner */}
      <div className="p-4">
        <div className="relative rounded-2xl p-4 bg-gradient-to-r from-rose-900/40 via-purple-900/30 to-neutral-900 border border-rose-500/20 overflow-hidden">
          <div className="relative z-10">
            <div className="flex items-center gap-1.5 text-rose-400 text-xs font-bold uppercase tracking-wider mb-1">
              <Flame className="w-4 h-4" />
              <span>Trending Challenge</span>
            </div>
            <h2 className="text-base font-extrabold text-white">#TokStudioClips</h2>
            <p className="text-xs text-neutral-300 mt-1 max-w-xs">
              Showcase your original short clips, audio chops, and creative edits!
            </p>
          </div>
          <Music2 className="absolute right-2 -bottom-2 w-28 h-28 text-white/5 pointer-events-none" />
        </div>
      </div>

      {/* Video Grid */}
      <div className="px-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-xs font-bold text-neutral-200">
            {searchQuery ? `Search Results (${filteredVideos.length})` : 'Popular Now'}
          </h3>
          <span className="text-[11px] text-neutral-500 font-mono">
            {filteredVideos.length} clips
          </span>
        </div>

        {filteredVideos.length === 0 ? (
          <div className="text-center py-16 text-neutral-500 text-xs">
            No clips found matching your search.
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2.5">
            {filteredVideos.map((video) => {
              const filterStyle = getFilterStyleString(video.filterSettings);
              return (
                <div
                  key={video.id}
                  onClick={() => {
                    soundEngine.playTone(520, 'sine', 0.05, 0.08);
                    onSelectVideo(video.id);
                  }}
                  className="group relative aspect-[9/16] rounded-xl overflow-hidden bg-neutral-900 cursor-pointer border border-neutral-800 hover:border-neutral-700 transition-all shadow-md"
                >
                  {video.mediaType === 'image' ? (
                    <img
                      src={video.imageUrl || video.videoUrl}
                      alt={video.caption}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      style={{ filter: filterStyle }}
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <video
                      src={video.videoUrl}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      style={{ filter: filterStyle }}
                      muted
                      preload="metadata"
                    />
                  )}

                  {/* Gradient Scrim */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/20 pointer-events-none" />

                  {/* Play / Image icon overlay */}
                  <div className="absolute top-2 right-2 w-6 h-6 rounded-full bg-black/40 backdrop-blur-xs flex items-center justify-center text-white/90">
                    {video.mediaType === 'image' ? (
                      <span className="text-[10px] font-bold text-cyan-400">IMG</span>
                    ) : (
                      <Play className="w-3 h-3 fill-current ml-0.5" />
                    )}
                  </div>

                  {/* User Created Badge */}
                  {video.isUserCreated && (
                    <div className="absolute top-2 left-2 px-2 py-0.5 rounded-md bg-rose-500 text-[9px] font-bold text-white shadow-sm">
                      Original
                    </div>
                  )}

                  {/* Bottom details */}
                  <div className="absolute bottom-2 left-2 right-2 text-white">
                    <p className="text-[11px] font-semibold truncate leading-tight mb-1">
                      {video.caption}
                    </p>
                    <div className="flex items-center justify-between text-[10px] text-neutral-400">
                      <span className="truncate">@{video.creator.username}</span>
                      <span className="font-mono text-neutral-300">
                        {formatViews(video.stats.views)}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
