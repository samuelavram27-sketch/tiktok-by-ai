import React, { useState, useEffect, useRef, useMemo } from 'react';
import { VideoItem, SoundTrack, VideoItemWithScore } from '../../types/video';
import { VideoCard } from './VideoCard';
import { soundEngine } from '../../utils/audioSynth';
import { recommendationEngine } from '../../utils/recommendationEngine';
import { AlgorithmInsightModal } from './AlgorithmInsightModal';
import { ChevronUp, ChevronDown, Compass, Sparkles } from 'lucide-react';

interface FeedContainerProps {
  videos: VideoItem[];
  isMuted: boolean;
  onToggleMute: () => void;
  onHashtagClick?: (tag: string) => void;
  onUserClick?: (creatorId: string) => void;
  onSoundClick?: (sound: SoundTrack) => void;
  onLikeToggle?: (videoId: string, isLiked: boolean) => void;
  onOpenExplore?: () => void;
}

export const FeedContainer: React.FC<FeedContainerProps> = ({
  videos,
  isMuted,
  onToggleMute,
  onHashtagClick,
  onUserClick,
  onSoundClick,
  onLikeToggle,
  onOpenExplore,
}) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [feedTab, setFeedTab] = useState<'forYou' | 'following'>('forYou');
  const [isAlgorithmModalOpen, setIsAlgorithmModalOpen] = useState(false);
  const [algorithmVersion, setAlgorithmVersion] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  // Compute algorithmic ranking for "For You" feed
  const rankedVideos = useMemo(() => {
    // algorithmVersion triggers re-rank when tuning parameters change
    // eslint-disable-next-line @typescript-eslint/no-unused-expressions
    algorithmVersion;
    return recommendationEngine.rankFeed(videos);
  }, [videos, algorithmVersion]);

  const displayedVideos: VideoItemWithScore[] =
    feedTab === 'following'
      ? videos.filter((v) => v.creator.isFollowing)
      : rankedVideos;

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['input', 'textarea'].includes((e.target as HTMLElement).tagName.toLowerCase())) {
        return;
      }

      if (e.key === 'ArrowDown') {
        e.preventDefault();
        scrollToIndex(activeIndex + 1);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        scrollToIndex(activeIndex - 1);
      } else if (e.key === 'm' || e.key === 'M') {
        onToggleMute();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeIndex, displayedVideos.length, onToggleMute]);

  const scrollToIndex = (index: number) => {
    if (index < 0 || index >= displayedVideos.length) return;
    const container = containerRef.current;
    if (!container) return;

    setActiveIndex(index);
    const targetEl = container.children[index] as HTMLElement;
    if (targetEl) {
      targetEl.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleScroll = () => {
    const container = containerRef.current;
    if (!container) return;

    const scrollTop = container.scrollTop;
    const height = container.clientHeight;
    const newIndex = Math.round(scrollTop / height);

    if (newIndex !== activeIndex && newIndex >= 0 && newIndex < displayedVideos.length) {
      setActiveIndex(newIndex);
    }
  };

  const currentVideo = displayedVideos[activeIndex] || displayedVideos[0];
  const algorithmConfig = recommendationEngine.getConfig();

  return (
    <div className="relative w-full h-full bg-black overflow-hidden flex flex-col">
      {/* Top Feed Navigation (Explore Icon | Following | For You | Algorithm Pill) */}
      <header className="absolute top-0 left-0 right-0 z-30 flex items-center justify-between px-3 pt-3 pb-2 bg-gradient-to-b from-black/80 via-black/40 to-transparent pointer-events-none">
        <div className="flex items-center gap-1 pointer-events-auto">
          <button
            onClick={onOpenExplore}
            className="p-2 text-white/80 hover:text-white transition-colors"
            aria-label="Explore trends"
          >
            <Compass className="w-5 h-5" />
          </button>

          {/* Quick algorithm inspector shortcut */}
          <button
            onClick={() => {
              soundEngine.playTone(550, 'sine', 0.05, 0.08);
              setIsAlgorithmModalOpen(true);
            }}
            className="hidden sm:flex items-center gap-1 px-2 py-0.5 rounded-full bg-white/10 hover:bg-white/20 text-white/90 text-[10px] font-semibold border border-white/10 backdrop-blur-md transition-colors"
            title="Configure For You Feed Algorithm"
          >
            <Sparkles className="w-3 h-3 text-rose-400" />
            <span className="capitalize">{algorithmConfig.mode.replace('_', ' ')}</span>
          </button>
        </div>

        {/* Tab switcher: Following vs For You */}
        <div className="pointer-events-auto flex items-center gap-5 text-sm font-semibold">
          <button
            onClick={() => {
              setFeedTab('following');
              setActiveIndex(0);
              soundEngine.playTone(400, 'sine', 0.05, 0.08);
            }}
            className={`transition-colors relative pb-1 ${
              feedTab === 'following'
                ? 'text-white font-bold'
                : 'text-white/60 hover:text-white/80'
            }`}
          >
            Following
            {feedTab === 'following' && (
              <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-4 h-0.5 bg-white rounded-full" />
            )}
          </button>

          <span className="text-white/20">|</span>

          <button
            onClick={() => {
              setFeedTab('forYou');
              setActiveIndex(0);
              soundEngine.playTone(480, 'sine', 0.05, 0.08);
            }}
            className={`transition-colors relative pb-1 ${
              feedTab === 'forYou' ? 'text-white font-bold' : 'text-white/60 hover:text-white/80'
            }`}
          >
            For You
            {feedTab === 'forYou' && (
              <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-4 h-0.5 bg-white rounded-full" />
            )}
          </button>
        </div>

        {/* Desktop helper navigation buttons */}
        <div className="pointer-events-auto hidden md:flex items-center gap-1">
          <button
            onClick={() => scrollToIndex(activeIndex - 1)}
            disabled={activeIndex === 0}
            className="w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center disabled:opacity-30 disabled:pointer-events-none"
            title="Previous video (Arrow Up)"
          >
            <ChevronUp className="w-4 h-4" />
          </button>
          <button
            onClick={() => scrollToIndex(activeIndex + 1)}
            disabled={activeIndex === displayedVideos.length - 1}
            className="w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center disabled:opacity-30 disabled:pointer-events-none"
            title="Next video (Arrow Down)"
          >
            <ChevronDown className="w-4 h-4" />
          </button>
        </div>
        <div className="md:hidden w-7" />
      </header>

      {/* Snap Scroll Video Stream */}
      <div
        ref={containerRef}
        onScroll={handleScroll}
        className="w-full h-full overflow-y-scroll snap-y snap-mandatory no-scrollbar"
      >
        {displayedVideos.length === 0 ? (
          <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center text-white/70">
            <p className="text-base font-semibold">No clips in this feed yet</p>
            <p className="text-xs text-white/50 mt-1 max-w-xs">
              Follow creators in the &quot;For You&quot; tab to see their latest clips right here.
            </p>
            <button
              onClick={() => setFeedTab('forYou')}
              className="mt-4 px-4 py-2 bg-rose-500 hover:bg-rose-600 text-white font-semibold text-xs rounded-full transition-colors"
            >
              Explore For You Feed
            </button>
          </div>
        ) : (
          displayedVideos.map((video, idx) => (
            <div key={video.id} className="w-full h-full snap-start snap-always">
              <VideoCard
                video={video}
                isActive={idx === activeIndex}
                isMuted={isMuted}
                onToggleMute={onToggleMute}
                onHashtagClick={onHashtagClick}
                onUserClick={onUserClick}
                onSoundClick={onSoundClick}
                onLikeToggle={onLikeToggle}
                onOpenAlgorithmInfo={() => setIsAlgorithmModalOpen(true)}
              />
            </div>
          ))
        )}
      </div>

      {/* Algorithm Insights & Tuning Modal */}
      {currentVideo && (
        <AlgorithmInsightModal
          isOpen={isAlgorithmModalOpen}
          onClose={() => setIsAlgorithmModalOpen(false)}
          currentVideo={currentVideo}
          onConfigChanged={() => setAlgorithmVersion((v) => v + 1)}
        />
      )}
    </div>
  );
};
