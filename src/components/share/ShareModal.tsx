import React, { useState } from 'react';
import { X, Copy, Check, Share2, Download, MessageCircle, Send } from 'lucide-react';
import { VideoItem } from '../../types/video';
import { soundEngine } from '../../utils/audioSynth';

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  video: VideoItem;
}

export const ShareModal: React.FC<ShareModalProps> = ({ isOpen, onClose, video }) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleCopy = () => {
    soundEngine.playTone(660, 'triangle', 0.1, 0.15);
    navigator.clipboard.writeText(window.location.origin + '?v=' + video.id);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Video by @${video.creator.username}`,
          text: video.caption,
          url: window.location.origin + '?v=' + video.id,
        });
        onClose();
      } catch {
        // User cancelled share
      }
    } else {
      handleCopy();
    }
  };

  const handleDownload = () => {
    soundEngine.playTone(440, 'sine', 0.1, 0.1);
    const mediaSource = video.videoUrl || video.imageUrl || '';
    if (!mediaSource) return;

    const isImage = video.mediaType === 'image' || !video.videoUrl;
    const link = document.createElement('a');
    link.href = mediaSource;
    link.download = `TokStudio-${video.creator.username}-${video.id}.${isImage ? 'jpg' : 'mp4'}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-end">
      <div className="fixed inset-0 bg-black/60 backdrop-blur-xs" onClick={onClose} />

      <div className="relative w-full max-w-lg mx-auto bg-neutral-900 border-t border-neutral-800 rounded-t-3xl p-5 shadow-2xl z-10 animate-in slide-in-from-bottom duration-200">
        <div className="w-10 h-1 bg-neutral-700 rounded-full mx-auto mb-4" />

        <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
          <h3 className="text-sm font-bold text-neutral-100">Share to</h3>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-neutral-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Share targets */}
        <div className="grid grid-cols-4 gap-4 py-5 text-center">
          <button
            onClick={handleNativeShare}
            className="flex flex-col items-center gap-2 group"
          >
            <div className="w-13 h-13 rounded-full bg-blue-600/20 text-blue-400 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Share2 className="w-6 h-6" />
            </div>
            <span className="text-[11px] text-neutral-300 font-medium">System</span>
          </button>

          <button
            onClick={handleCopy}
            className="flex flex-col items-center gap-2 group"
          >
            <div className="w-13 h-13 rounded-full bg-emerald-600/20 text-emerald-400 flex items-center justify-center group-hover:scale-110 transition-transform">
              {copied ? <Check className="w-6 h-6 text-emerald-400" /> : <Copy className="w-6 h-6" />}
            </div>
            <span className="text-[11px] text-neutral-300 font-medium">
              {copied ? 'Copied!' : 'Copy Link'}
            </span>
          </button>

          <button
            onClick={handleDownload}
            className="flex flex-col items-center gap-2 group"
          >
            <div className="w-13 h-13 rounded-full bg-amber-600/20 text-amber-400 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Download className="w-6 h-6" />
            </div>
            <span className="text-[11px] text-neutral-300 font-medium">Download</span>
          </button>

          <button
            onClick={handleCopy}
            className="flex flex-col items-center gap-2 group"
          >
            <div className="w-13 h-13 rounded-full bg-rose-600/20 text-rose-400 flex items-center justify-center group-hover:scale-110 transition-transform">
              <MessageCircle className="w-6 h-6" />
            </div>
            <span className="text-[11px] text-neutral-300 font-medium">Direct</span>
          </button>
        </div>

        {/* Link copy bar */}
        <div className="mt-2 p-2.5 bg-neutral-800 rounded-xl flex items-center justify-between text-xs">
          <span className="text-neutral-400 truncate max-w-[280px]">
            {window.location.origin}?v={video.id}
          </span>
          <button
            onClick={handleCopy}
            className="px-3 py-1 bg-white text-black font-semibold rounded-lg hover:bg-neutral-200 transition-colors"
          >
            {copied ? 'Copied' : 'Copy'}
          </button>
        </div>
      </div>
    </div>
  );
};
