import React, { useState } from 'react';
import {
  X,
  Search,
  Globe,
  Link2,
  Video,
  Image,
  Play,
  ArrowRight,
  Sparkles,
  Download,
} from 'lucide-react';
import { WEB_MEDIA_LIBRARY, WebMediaItem } from '../../data/webMediaLibrary';
import { soundEngine } from '../../utils/audioSynth';

interface GoogleMediaSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImportMedia: (media: { url: string; type: 'video' | 'image'; title: string }) => void;
}

const QUICK_SEARCH_CHIPS = [
  'Tokyo Sunset',
  'Skateboarding',
  'Streetwear',
  'Matcha Cafe',
  'Coding Tech',
  'Synth Beats',
  'Food & Pasta',
  'Travel',
];

export const GoogleMediaSearchModal: React.FC<GoogleMediaSearchModalProps> = ({
  isOpen,
  onClose,
  onImportMedia,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [mediaTypeFilter, setMediaTypeFilter] = useState<'all' | 'video' | 'image'>('all');
  const [customUrl, setCustomUrl] = useState('');
  const [customMediaType, setCustomMediaType] = useState<'video' | 'image'>('video');
  const [isUrlTabOpen, setIsUrlTabOpen] = useState(false);

  if (!isOpen) return null;

  const filteredMedia = WEB_MEDIA_LIBRARY.filter((item) => {
    const matchesType = mediaTypeFilter === 'all' || item.type === mediaTypeFilter;
    if (!matchesType) return false;

    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase().trim();
    return (
      item.title.toLowerCase().includes(q) ||
      item.category.toLowerCase().includes(q) ||
      item.tags.some((t) => t.toLowerCase().includes(q))
    );
  });

  const handleSelectMedia = (item: WebMediaItem) => {
    soundEngine.playTone(600, 'triangle', 0.1, 0.15);
    onImportMedia({
      url: item.url,
      type: item.type,
      title: item.title,
    });
    onClose();
  };

  const handleImportCustomUrl = (e: React.FormEvent) => {
    e.preventDefault();
    const url = customUrl.trim();
    if (!url) return;

    soundEngine.playTone(660, 'sine', 0.1, 0.15);
    // Detect type if ends with image extension
    const isImg =
      customMediaType === 'image' ||
      /\.(jpg|jpeg|png|webp|gif|svg)$/i.test(url);

    onImportMedia({
      url,
      type: isImg ? 'image' : 'video',
      title: 'Google Web Import',
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-end">
      <div className="fixed inset-0 bg-black/70 backdrop-blur-xs" onClick={onClose} />

      <div className="relative w-full max-w-lg mx-auto bg-neutral-900 border-t border-neutral-800 rounded-t-3xl max-h-[85vh] h-[660px] flex flex-col shadow-2xl z-10 animate-in slide-in-from-bottom duration-200 text-white select-none">
        <div className="w-10 h-1 bg-neutral-700 rounded-full mx-auto mt-2.5 mb-1 cursor-grab" />

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-neutral-800">
          <div className="flex items-center gap-2">
            <span className="w-7 h-7 rounded-lg bg-blue-500/20 text-blue-400 flex items-center justify-center">
              <Globe className="w-4 h-4" />
            </span>
            <div>
              <h3 className="text-xs font-bold text-neutral-100">Search Google &amp; Web Media</h3>
              <p className="text-[10px] text-neutral-400">Discover and import video clips &amp; photos</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-neutral-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search Bar & Direct URL Mode Toggle */}
        <div className="p-3 border-b border-neutral-800 space-y-2.5">
          <div className="relative flex items-center">
            <Search className="w-4 h-4 text-neutral-400 absolute left-3.5 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search Google videos &amp; photos..."
              className="w-full bg-neutral-800 text-xs text-white pl-10 pr-20 py-2.5 rounded-full placeholder:text-neutral-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
            <button
              onClick={() => setIsUrlTabOpen((prev) => !prev)}
              className={`absolute right-1.5 px-2.5 py-1 text-[11px] font-semibold rounded-full transition-colors flex items-center gap-1 ${
                isUrlTabOpen
                  ? 'bg-blue-500 text-white'
                  : 'bg-neutral-700 text-neutral-300 hover:text-white'
              }`}
            >
              <Link2 className="w-3 h-3" />
              <span>Link</span>
            </button>
          </div>

          {/* Paste URL Box if toggle active */}
          {isUrlTabOpen && (
            <form
              onSubmit={handleImportCustomUrl}
              className="p-3 bg-neutral-800/80 rounded-2xl border border-neutral-700/80 space-y-2 animate-in slide-in-from-top-2"
            >
              <span className="text-[11px] text-neutral-300 font-semibold block">
                Paste Direct Media URL from Google:
              </span>
              <div className="flex gap-2">
                <input
                  type="url"
                  value={customUrl}
                  onChange={(e) => setCustomUrl(e.target.value)}
                  placeholder="https://example.com/video.mp4 or photo.jpg"
                  className="flex-1 bg-neutral-900 text-xs text-white px-3 py-2 rounded-xl border border-neutral-700 focus:outline-none focus:border-blue-500"
                />
                <button
                  type="submit"
                  disabled={!customUrl.trim()}
                  className="px-3.5 py-2 bg-blue-500 hover:bg-blue-600 disabled:opacity-50 text-white rounded-xl text-xs font-semibold flex items-center gap-1"
                >
                  <Download className="w-3.5 h-3.5" />
                  Import
                </button>
              </div>
              <div className="flex items-center gap-4 text-[11px] text-neutral-400 pt-1">
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="radio"
                    name="urlType"
                    checked={customMediaType === 'video'}
                    onChange={() => setCustomMediaType('video')}
                    className="accent-blue-500"
                  />
                  <span>Video Clip (.mp4, .webm)</span>
                </label>
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="radio"
                    name="urlType"
                    checked={customMediaType === 'image'}
                    onChange={() => setCustomMediaType('image')}
                    className="accent-blue-500"
                  />
                  <span>Photo / Image</span>
                </label>
              </div>
            </form>
          )}

          {/* Quick Search Chips */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
            {QUICK_SEARCH_CHIPS.map((chip) => (
              <button
                key={chip}
                onClick={() => {
                  soundEngine.playTone(480, 'sine', 0.03, 0.05);
                  setSearchQuery(chip);
                }}
                className={`px-3 py-1 rounded-full text-[11px] whitespace-nowrap transition-colors border ${
                  searchQuery.toLowerCase() === chip.toLowerCase()
                    ? 'bg-blue-500 border-blue-400 text-white font-semibold'
                    : 'bg-neutral-800 text-neutral-400 border-neutral-700/60 hover:text-neutral-200'
                }`}
              >
                {chip}
              </button>
            ))}
          </div>

          {/* Type Filter Tabs: All, Videos, Photos */}
          <div className="flex items-center gap-2 pt-1">
            <button
              onClick={() => setMediaTypeFilter('all')}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors ${
                mediaTypeFilter === 'all'
                  ? 'bg-white text-black'
                  : 'bg-neutral-800 text-neutral-400 hover:text-white'
              }`}
            >
              All Media ({WEB_MEDIA_LIBRARY.length})
            </button>
            <button
              onClick={() => setMediaTypeFilter('video')}
              className={`px-3 py-1 rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors ${
                mediaTypeFilter === 'video'
                  ? 'bg-white text-black'
                  : 'bg-neutral-800 text-neutral-400 hover:text-white'
              }`}
            >
              <Video className="w-3.5 h-3.5" />
              <span>Videos</span>
            </button>
            <button
              onClick={() => setMediaTypeFilter('image')}
              className={`px-3 py-1 rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors ${
                mediaTypeFilter === 'image'
                  ? 'bg-white text-black'
                  : 'bg-neutral-800 text-neutral-400 hover:text-white'
              }`}
            >
              <Image className="w-3.5 h-3.5" />
              <span>Photos</span>
            </button>
          </div>
        </div>

        {/* Media Grid */}
        <div className="flex-1 overflow-y-auto p-3 space-y-2.5 no-scrollbar">
          {filteredMedia.length === 0 ? (
            <div className="text-center py-16 text-neutral-500 text-xs">
              No matching media found. Try another query or paste a direct Google URL.
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-2.5">
              {filteredMedia.map((item) => (
                <div
                  key={item.id}
                  onClick={() => handleSelectMedia(item)}
                  className="group relative aspect-[9/16] rounded-xl overflow-hidden bg-neutral-950 border border-neutral-800 hover:border-blue-500/60 transition-all cursor-pointer shadow-md"
                >
                  {/* Thumbnail / Video */}
                  {item.type === 'video' ? (
                    <video
                      src={item.url}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      muted
                      preload="metadata"
                    />
                  ) : (
                    <img
                      src={item.thumbnail}
                      alt={item.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      referrerPolicy="no-referrer"
                    />
                  )}

                  {/* Top Type Badge */}
                  <div className="absolute top-2 left-2 flex items-center gap-1 px-2 py-0.5 rounded-md bg-black/60 backdrop-blur-xs text-[10px] font-semibold text-white">
                    {item.type === 'video' ? (
                      <>
                        <Video className="w-3 h-3 text-rose-400" />
                        <span>{item.duration}s</span>
                      </>
                    ) : (
                      <>
                        <Image className="w-3 h-3 text-cyan-400" />
                        <span>Photo</span>
                      </>
                    )}
                  </div>

                  {/* Gradient Scrim */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent pointer-events-none" />

                  {/* Bottom details & Import CTA */}
                  <div className="absolute bottom-2 left-2 right-2 flex flex-col gap-1">
                    <p className="text-[11px] font-bold text-white truncate leading-tight">
                      {item.title}
                    </p>
                    <div className="flex items-center justify-between text-[10px] text-neutral-400">
                      <span className="truncate">{item.source}</span>
                      <span className="text-blue-400 font-semibold group-hover:underline flex items-center gap-0.5">
                        Import <ArrowRight className="w-2.5 h-2.5" />
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
