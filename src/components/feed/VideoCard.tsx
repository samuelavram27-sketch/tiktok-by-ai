import React, { useState, useRef } from 'react';
import {
  Heart,
  MessageCircle,
  Bookmark,
  Share2,
  Music2,
  Plus,
  Check,
  Volume2,
  VolumeX,
  Play,
} from 'lucide-react';
import { VideoItem, SoundTrack, VideoItemWithScore } from '../../types/video';
import { VideoPlayer } from './VideoPlayer';
import { VideoOverlay } from './VideoOverlay';
import { DoubleTapHeart } from '../common/DoubleTapHeart';
import { CommentsSheet } from '../comments/CommentsSheet';
import { ShareModal } from '../share/ShareModal';
import { soundEngine } from '../../utils/audioSynth';
import { recommendationEngine } from '../../utils/recommendationEngine';
import { Sparkles } from 'lucide-react';

interface VideoCardProps {
  video: VideoItemWithScore;
  isActive: boolean;
  isMuted: boolean;
  onToggleMute: () => void;
  onHashtagClick?: (tag: string) => void;
  onUserClick?: (creatorId: string) => void;
  onSoundClick?: (sound: SoundTrack) => void;
  onLikeToggle?: (videoId: string, isLiked: boolean) => void;
  onOpenAlgorithmInfo?: () => void;
}

export const VideoCard: React.FC<VideoCardProps> = ({
  video,
  isActive,
  isMuted,
  onToggleMute,
  onHashtagClick,
  onUserClick,
  onSoundClick,
  onLikeToggle,
  onOpenAlgorithmInfo,
}) => {
  const [isLiked, setIsLiked] = useState<boolean>(!!video.isLiked);
  const [likeCount, setLikeCount] = useState<number>(video.stats.likes);
  const [isSaved, setIsSaved] = useState<boolean>(!!video.isSaved);
  const [saveCount, setSaveCount] = useState<number>(video.stats.saves);
  const [isFollowing, setIsFollowing] = useState<boolean>(!!video.creator.isFollowing);
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [isCommentsOpen, setIsCommentsOpen] = useState(false);
  const [isShareOpen, setIsShareOpen] = useState(false);
  const [hearts, setHearts] = useState<{ id: number; x: number; y: number }[]>([]);
  const [showPlayIcon, setShowPlayIcon] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isExpandedCaption, setIsExpandedCaption] = useState(false);

  const lastTapRef = useRef<number>(0);
  const cardRef = useRef<HTMLDivElement>(null);
  const lastTimeRef = useRef<number>(0);
  const loopCountRef = useRef<number>(0);

  const formatNumber = (num: number) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toString();
  };

  const handleCardClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const now = Date.now();
    const DOUBLE_TAP_DELAY = 300;

    if (now - lastTapRef.current < DOUBLE_TAP_DELAY) {
      // Double tap triggered
      const rect = cardRef.current?.getBoundingClientRect();
      if (rect) {
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        triggerDoubleTapLike(x, y);
      }
      lastTapRef.current = 0;
    } else {
      lastTapRef.current = now;
      // Single tap after delay toggles pause/play
      setTimeout(() => {
        if (Date.now() - lastTapRef.current >= DOUBLE_TAP_DELAY && lastTapRef.current !== 0) {
          togglePlayPause();
        }
      }, DOUBLE_TAP_DELAY);
    }
  };

  const triggerDoubleTapLike = (x: number, y: number) => {
    soundEngine.playLikeSound();
    setHearts((prev) => [...prev, { id: Date.now() + Math.random(), x, y }]);
    if (!isLiked) {
      setIsLiked(true);
      setLikeCount((prev) => prev + 1);
      recommendationEngine.recordInteraction('like', video);
      onLikeToggle?.(video.id, true);
    }
  };

  const handleSingleLikeClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    soundEngine.playLikeSound();
    const nextLiked = !isLiked;
    setIsLiked(nextLiked);
    setLikeCount((prev) => (nextLiked ? prev + 1 : Math.max(0, prev - 1)));
    recommendationEngine.recordInteraction(nextLiked ? 'like' : 'unlike', video);
    onLikeToggle?.(video.id, nextLiked);
  };

  const handleSaveClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    soundEngine.playTone(700, 'sine', 0.1, 0.12);
    const nextSaved = !isSaved;
    setIsSaved(nextSaved);
    setSaveCount((prev) => (nextSaved ? prev + 1 : Math.max(0, prev - 1)));
    recommendationEngine.recordInteraction(nextSaved ? 'save' : 'unsave', video);
  };

  const handleFollowClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    soundEngine.playTone(800, 'triangle', 0.12, 0.15);
    const nextFollowing = !isFollowing;
    setIsFollowing(nextFollowing);
    recommendationEngine.recordInteraction(nextFollowing ? 'follow' : 'unfollow', video);
  };

  const togglePlayPause = () => {
    setIsPlaying((prev) => {
      const next = !prev;
      setShowPlayIcon(!next);
      return next;
    });
  };

  const handleTimeUpdate = (currentTime: number, totalDuration: number) => {
    if (totalDuration > 0) {
      setProgress((currentTime / totalDuration) * 100);
      setDuration(totalDuration);

      // Detect video loop completion (when current time jumps back down)
      if (currentTime < lastTimeRef.current - 1.5 && lastTimeRef.current > totalDuration * 0.7) {
        loopCountRef.current += 1;
      }
      lastTimeRef.current = currentTime;

      // Report watch metrics to recommendation engine
      if (isActive) {
        recommendationEngine.recordWatchEvent(
          video.id,
          currentTime,
          totalDuration,
          loopCountRef.current
        );
      }
    }
  };

  return (
    <div
      ref={cardRef}
      className="relative w-full h-full bg-black select-none snap-start snap-always overflow-hidden flex items-center justify-center"
      onClick={handleCardClick}
    >
      {/* Video / Photo Content Layer */}
      <VideoPlayer
        src={video.videoUrl || ''}
        mediaType={video.mediaType}
        imageUrl={video.imageUrl}
        isActive={isActive && isPlaying}
        isMuted={isMuted}
        filterSettings={video.filterSettings}
        speed={video.speed || 1}
        trimStart={video.trimStart}
        trimEnd={video.trimEnd}
        onTimeUpdate={handleTimeUpdate}
      />

      {/* Text overlays & stickers */}
      <VideoOverlay textOverlays={video.textOverlays} stickers={video.stickers} />

      {/* Floating double-tap heart animations */}
      {hearts.map((heart) => (
        <DoubleTapHeart
          key={heart.id}
          x={heart.x}
          y={heart.y}
          onAnimationEnd={() =>
            setHearts((prev) => prev.filter((h) => h.id !== heart.id))
          }
        />
      ))}

      {/* Center Pause/Play Icon overlay */}
      {showPlayIcon && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-20">
          <div className="w-16 h-16 rounded-full bg-black/50 backdrop-blur-sm flex items-center justify-center text-white/90 animate-in zoom-in-75 duration-150">
            <Play className="w-8 h-8 fill-current ml-1" />
          </div>
        </div>
      )}

      {/* Measured Scrim for text readability */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/80 pointer-events-none z-10" />

      {/* Top Floating Controls */}
      <div className="absolute top-4 left-4 right-4 flex items-center justify-between z-20 pointer-events-auto">
        <div className="flex items-center gap-1.5 text-xs text-white/80 bg-black/30 backdrop-blur-md px-2.5 py-1 rounded-full">
          <span>TokStudio</span>
          {video.mediaType === 'image' && (
            <>
              <span aria-hidden="true">·</span>
              <span className="text-cyan-400 font-semibold">Photo</span>
            </>
          )}
          {video.isUserCreated && (
            <>
              <span aria-hidden="true">·</span>
              <span className="text-rose-400 font-semibold">Your Clip</span>
            </>
          )}
        </div>

        <div className="flex items-center gap-2">
          {/* FYP Algorithm Score Pill */}
          {onOpenAlgorithmInfo && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                soundEngine.playTone(620, 'sine', 0.05, 0.08);
                onOpenAlgorithmInfo();
              }}
              className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-black/40 hover:bg-black/70 backdrop-blur-md text-[11px] font-semibold text-rose-300 border border-rose-500/30 transition-all hover:scale-105 active:scale-95 shadow-sm"
              title="Inspect For You recommendation score"
            >
              <Sparkles className="w-3.5 h-3.5 text-rose-400" />
              <span className="font-mono tabular-nums">
                {video.recommendationBreakdown ? `${video.recommendationBreakdown.totalScore} pts` : 'FYP'}
              </span>
            </button>
          )}

          {/* Mute / Unmute Button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggleMute();
            }}
            className="w-9 h-9 rounded-full bg-black/40 backdrop-blur-md text-white flex items-center justify-center hover:bg-black/60 transition-colors active:scale-95"
            aria-label={isMuted ? 'Unmute sound' : 'Mute sound'}
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Right Sidebar Action Rails */}
      <div className="absolute right-3 bottom-20 z-20 flex flex-col items-center gap-4 pointer-events-auto">
        {/* Creator Avatar with Follow Button */}
        <div className="relative mb-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onUserClick?.(video.creator.id);
            }}
            className="w-12 h-12 rounded-full p-0.5 bg-gradient-to-tr from-rose-500 to-amber-400 shadow-lg group hover:scale-105 transition-transform"
          >
            <img
              src={video.creator.avatarUrl}
              alt={video.creator.name}
              className="w-full h-full rounded-full object-cover bg-neutral-800"
              referrerPolicy="no-referrer"
              onError={(e) => {
                (e.target as HTMLImageElement).src =
                  'https://api.dicebear.com/7.x/avataaars/svg?seed=' + video.creator.username;
              }}
            />
          </button>
          {!isFollowing && (
            <button
              onClick={handleFollowClick}
              className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-5 h-5 rounded-full bg-rose-500 text-white flex items-center justify-center shadow-md hover:bg-rose-600 active:scale-90 transition-transform"
              aria-label="Follow creator"
            >
              <Plus className="w-3.5 h-3.5 stroke-[3]" />
            </button>
          )}
          {isFollowing && (
            <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-4 h-4 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-sm">
              <Check className="w-2.5 h-2.5 stroke-[3]" />
            </div>
          )}
        </div>

        {/* Like Button */}
        <div className="flex flex-col items-center">
          <button
            onClick={handleSingleLikeClick}
            className="w-11 h-11 rounded-full flex items-center justify-center text-white active:scale-125 transition-transform"
            aria-label="Like video"
          >
            <Heart
              className={`w-7 h-7 drop-shadow-md transition-all ${
                isLiked
                  ? 'text-rose-500 fill-rose-500 scale-110'
                  : 'text-white hover:text-rose-300'
              }`}
            />
          </button>
          <span className="text-[11px] font-mono font-medium text-white/90 drop-shadow tabular-nums -mt-1">
            {formatNumber(likeCount)}
          </span>
        </div>

        {/* Comment Button */}
        <div className="flex flex-col items-center">
          <button
            onClick={(e) => {
              e.stopPropagation();
              soundEngine.playTone(480, 'sine', 0.08, 0.1);
              setIsCommentsOpen(true);
            }}
            className="w-11 h-11 rounded-full flex items-center justify-center text-white active:scale-110 transition-transform"
            aria-label="View comments"
          >
            <MessageCircle className="w-7 h-7 drop-shadow-md hover:text-amber-200 transition-colors" />
          </button>
          <span className="text-[11px] font-mono font-medium text-white/90 drop-shadow tabular-nums -mt-1">
            {formatNumber(video.stats.comments)}
          </span>
        </div>

        {/* Bookmark / Save Button */}
        <div className="flex flex-col items-center">
          <button
            onClick={handleSaveClick}
            className="w-11 h-11 rounded-full flex items-center justify-center text-white active:scale-125 transition-transform"
            aria-label="Save video"
          >
            <Bookmark
              className={`w-7 h-7 drop-shadow-md transition-all ${
                isSaved ? 'text-amber-400 fill-amber-400' : 'text-white hover:text-amber-300'
              }`}
            />
          </button>
          <span className="text-[11px] font-mono font-medium text-white/90 drop-shadow tabular-nums -mt-1">
            {formatNumber(saveCount)}
          </span>
        </div>

        {/* Share Button */}
        <div className="flex flex-col items-center">
          <button
            onClick={(e) => {
              e.stopPropagation();
              soundEngine.playTone(560, 'sine', 0.08, 0.1);
              setIsShareOpen(true);
            }}
            className="w-11 h-11 rounded-full flex items-center justify-center text-white active:scale-110 transition-transform"
            aria-label="Share video"
          >
            <Share2 className="w-7 h-7 drop-shadow-md hover:text-blue-300 transition-colors" />
          </button>
          <span className="text-[11px] font-mono font-medium text-white/90 drop-shadow tabular-nums -mt-1">
            {formatNumber(video.stats.shares)}
          </span>
        </div>

        {/* Rotating Music Disc */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onSoundClick?.(video.sound);
          }}
          className="mt-1 relative w-10 h-10 rounded-full bg-neutral-900 border-2 border-neutral-700 p-1 flex items-center justify-center shadow-lg group active:scale-95"
          aria-label="Sound track info"
        >
          <div
            className={`w-full h-full rounded-full overflow-hidden ${
              isActive && isPlaying ? 'animate-spin-slow' : ''
            }`}
          >
            <img
              src={video.creator.avatarUrl}
              alt="Sound"
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
          </div>
          {/* Pulsing note */}
          <Music2 className="w-3 h-3 text-rose-400 absolute -top-1.5 -left-1 animate-bounce" />
        </button>
      </div>

      {/* Bottom Metadata Overlay */}
      <div className="absolute left-4 right-16 bottom-5 z-20 flex flex-col gap-2 pointer-events-auto">
        {/* Creator Name & Handle */}
        <div className="flex items-center gap-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onUserClick?.(video.creator.id);
            }}
            className="text-sm font-bold text-white hover:underline flex items-center gap-1.5 tracking-tight drop-shadow-md"
          >
            <span>@{video.creator.username}</span>
            {video.creator.verified && (
              <span className="w-3.5 h-3.5 rounded-full bg-blue-500 text-white inline-flex items-center justify-center text-[9px] font-bold">
                ✓
              </span>
            )}
          </button>
        </div>

        {/* Caption & Hashtags */}
        <div className="text-xs text-white/95 leading-snug drop-shadow max-w-sm">
          <span className={isExpandedCaption ? '' : 'line-clamp-2'}>{video.caption}</span>
          {video.caption.length > 80 && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                setIsExpandedCaption((prev) => !prev);
              }}
              className="text-white/70 hover:text-white font-medium ml-1.5 text-[11px]"
            >
              {isExpandedCaption ? 'less' : 'more'}
            </button>
          )}

          {/* Hashtags */}
          <div className="flex flex-wrap gap-1.5 mt-1.5">
            {video.hashtags.map((tag) => (
              <button
                key={tag}
                onClick={(e) => {
                  e.stopPropagation();
                  onHashtagClick?.(tag);
                }}
                className="text-white font-semibold hover:text-rose-300 transition-colors text-[11px]"
              >
                #{tag}
              </button>
            ))}
          </div>
        </div>

        {/* Sound Bar Marquee */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onSoundClick?.(video.sound);
          }}
          className="flex items-center gap-2 text-[11px] text-white/80 hover:text-white transition-colors max-w-xs drop-shadow"
        >
          <Music2 className="w-3.5 h-3.5 text-white/90 shrink-0" />
          <div className="overflow-hidden whitespace-nowrap">
            <span className="inline-block tracking-tight font-medium">
              {video.sound.title} — {video.sound.artist}
            </span>
          </div>
        </button>
      </div>

      {/* Scrubbable Bottom Progress Bar */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/20 z-30 group cursor-pointer">
        <div
          className="h-full bg-rose-500 relative transition-all duration-100"
          style={{ width: `${progress}%` }}
        >
          <div className="absolute right-0 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-white opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>
      </div>

      {/* Comments Drawer */}
      <CommentsSheet
        isOpen={isCommentsOpen}
        onClose={() => setIsCommentsOpen(false)}
        videoId={video.id}
        commentCount={video.stats.comments}
        onCommentAdded={() => {
          video.stats.comments += 1;
        }}
      />

      {/* Share Drawer */}
      <ShareModal
        isOpen={isShareOpen}
        onClose={() => setIsShareOpen(false)}
        video={video}
      />
    </div>
  );
};
