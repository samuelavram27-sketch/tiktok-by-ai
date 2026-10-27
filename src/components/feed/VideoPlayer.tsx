import React, { useRef, useEffect, useState } from 'react';
import { FilterSettings } from '../../types/video';
import { getFilterStyleString } from '../../utils/filterStyles';

interface VideoPlayerProps {
  src: string;
  mediaType?: 'video' | 'image';
  imageUrl?: string;
  isActive: boolean;
  isMuted: boolean;
  filterSettings?: FilterSettings;
  speed?: number;
  trimStart?: number;
  trimEnd?: number;
  onTimeUpdate?: (currentTime: number, duration: number) => void;
  onVideoClick?: () => void;
  seekTime?: number | null;
}

export const VideoPlayer: React.FC<VideoPlayerProps> = ({
  src,
  mediaType = 'video',
  imageUrl,
  isActive,
  isMuted,
  filterSettings,
  speed = 1,
  trimStart,
  trimEnd,
  onTimeUpdate,
  onVideoClick,
  seekTime,
}) => {
  const isImageMode = mediaType === 'image' || !!imageUrl || (!src && !!imageUrl);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [hasError, setHasError] = useState(false);
  const [isBuffering, setIsBuffering] = useState(false);
  const [imageProgress, setImageProgress] = useState(0);

  // Handle video play/pause based on isActive
  useEffect(() => {
    if (isImageMode) return;
    const video = videoRef.current;
    if (!video) return;

    if (isActive) {
      if (trimStart !== undefined && trimStart > 0 && Math.abs(video.currentTime - trimStart) > 1) {
        video.currentTime = trimStart;
      }
      const playPromise = video.play();
      if (playPromise !== undefined) {
        playPromise.catch(() => {
          // Auto-play was prevented by browser policy (user gesture needed)
        });
      }
    } else {
      video.pause();
    }
  }, [isActive, trimStart, isImageMode]);

  // Handle Photo post timer loop (8 seconds per photo loop)
  useEffect(() => {
    if (!isImageMode || !isActive) return;

    const PHOTO_DURATION = 8;
    const interval = 100;
    const timer = setInterval(() => {
      setImageProgress((prev) => {
        const next = prev + 0.1;
        const current = next % PHOTO_DURATION;
        onTimeUpdate?.(current, PHOTO_DURATION);
        return next;
      });
    }, interval);

    return () => clearInterval(timer);
  }, [isImageMode, isActive, onTimeUpdate]);

  // Sync mute state & volume
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.muted = isMuted;
    }
  }, [isMuted]);

  // Sync playback rate
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.playbackRate = speed;
    }
  }, [speed]);

  // Seek when seekTime changes
  useEffect(() => {
    if (seekTime !== null && seekTime !== undefined && videoRef.current) {
      videoRef.current.currentTime = seekTime;
    }
  }, [seekTime]);

  const handleTimeUpdate = () => {
    const video = videoRef.current;
    if (!video) return;

    if (trimEnd !== undefined && trimEnd > 0 && video.currentTime >= trimEnd) {
      video.currentTime = trimStart || 0;
    }

    if (onTimeUpdate) {
      onTimeUpdate(video.currentTime, video.duration || 1);
    }
  };

  // Canvas visualizer animation fallback if video fails to load
  useEffect(() => {
    if (!hasError) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let t = 0;

    const render = () => {
      t += 0.03;
      const w = canvas.width;
      const h = canvas.height;

      const grad = ctx.createLinearGradient(0, 0, w, h);
      grad.addColorStop(0, '#0f172a');
      grad.addColorStop(0.5, '#1e1b4b');
      grad.addColorStop(1, '#020617');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, w, h);

      for (let i = 0; i < 3; i++) {
        ctx.beginPath();
        ctx.moveTo(0, h / 2);
        for (let x = 0; x <= w; x += 10) {
          const y = h / 2 + Math.sin(x * 0.01 + t + i) * 60 + Math.cos(t * 1.5 + x * 0.005) * 40;
          ctx.lineTo(x, y);
        }
        ctx.lineTo(w, h);
        ctx.lineTo(0, h);
        ctx.closePath();
        ctx.fillStyle = i === 0 ? 'rgba(236, 72, 153, 0.25)' : i === 1 ? 'rgba(99, 102, 241, 0.25)' : 'rgba(6, 182, 212, 0.25)';
        ctx.fill();
      }

      ctx.save();
      ctx.translate(w / 2, h / 2);
      ctx.beginPath();
      ctx.arc(0, 0, 50 + Math.sin(t * 2) * 8, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(255, 255, 255, 0.08)';
      ctx.fill();
      ctx.restore();

      animId = requestAnimationFrame(render);
    };

    render();
    return () => cancelAnimationFrame(animId);
  }, [hasError]);

  const filterStyle = getFilterStyleString(filterSettings);
  const activeImageSrc = imageUrl || src;

  return (
    <div
      className="relative w-full h-full bg-black flex items-center justify-center overflow-hidden cursor-pointer"
      onClick={onVideoClick}
    >
      {isImageMode ? (
        <div className="relative w-full h-full overflow-hidden flex items-center justify-center">
          <img
            src={activeImageSrc}
            alt="TokStudio Post"
            className={`w-full h-full object-cover select-none pointer-events-none transition-transform duration-7000 ease-in-out ${
              isActive ? 'scale-108' : 'scale-100'
            }`}
            style={{ filter: filterStyle }}
            referrerPolicy="no-referrer"
            onError={() => setHasError(true)}
          />
        </div>
      ) : !hasError ? (
        <video
          ref={videoRef}
          src={src}
          className="w-full h-full object-cover select-none pointer-events-none transition-[filter] duration-200"
          style={{ filter: filterStyle }}
          playsInline
          loop
          muted={isMuted}
          preload="auto"
          onTimeUpdate={handleTimeUpdate}
          onWaiting={() => setIsBuffering(true)}
          onPlaying={() => setIsBuffering(false)}
          onError={() => setHasError(true)}
        />
      ) : (
        <canvas
          ref={canvasRef}
          width={400}
          height={710}
          className="w-full h-full object-cover select-none"
          style={{ filter: filterStyle }}
        />
      )}

      {/* Buffering spinner */}
      {isBuffering && !isImageMode && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-20">
          <div className="w-12 h-12 border-3 border-white/20 border-t-white rounded-full animate-spin" />
        </div>
      )}
    </div>
  );
};
