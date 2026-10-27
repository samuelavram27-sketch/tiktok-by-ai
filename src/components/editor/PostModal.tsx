import React, { useState } from 'react';
import { ChevronLeft, Globe, Lock, Users, Hash, CheckCircle2 } from 'lucide-react';
import { VideoItem, SoundTrack, FilterSettings, TextOverlay, StickerOverlay } from '../../types/video';
import { CURRENT_USER, saveUserVideo } from '../../utils/storage';
import { soundEngine } from '../../utils/audioSynth';
import { getFilterStyleString } from '../../utils/filterStyles';

interface PostModalProps {
  videoData: {
    videoUrl: string;
    mediaType?: 'video' | 'image';
    sound: SoundTrack;
    filterSettings: FilterSettings;
    textOverlays: TextOverlay[];
    stickers: StickerOverlay[];
    speed: number;
    trimStart: number;
    trimEnd: number;
  };
  onBack: () => void;
  onPostSuccess: (createdVideo: VideoItem) => void;
}

const TRENDING_TAGS = ['foryou', 'viral', 'tokstudio', 'creator', 'fyp', 'creative', 'lifestyle'];

export const PostModal: React.FC<PostModalProps> = ({ videoData, onBack, onPostSuccess }) => {
  const isImage = videoData.mediaType === 'image';
  const [caption, setCaption] = useState(
    isImage ? 'My new photo post on TokStudio ✨' : 'My new clip created with TokStudio! 🚀'
  );
  const [hashtags, setHashtags] = useState<string[]>(
    isImage ? ['tokstudio', 'photomode', 'creator'] : ['tokstudio', 'foryou', 'creator']
  );
  const [privacy, setPrivacy] = useState<'public' | 'friends' | 'private'>('public');
  const [allowComments, setAllowComments] = useState(true);
  const [isPosting, setIsPosting] = useState(false);
  const [postProgress, setPostProgress] = useState(0);

  const handleToggleTag = (tag: string) => {
    soundEngine.playTone(520, 'sine', 0.05, 0.08);
    if (hashtags.includes(tag)) {
      setHashtags((prev) => prev.filter((t) => t !== tag));
    } else {
      setHashtags((prev) => [...prev, tag]);
    }
  };

  const handlePost = () => {
    soundEngine.playTone(660, 'sine', 0.1, 0.15);
    setIsPosting(true);

    let progress = 15;
    const interval = setInterval(() => {
      progress += 25;
      setPostProgress(Math.min(100, progress));

      if (progress >= 100) {
        clearInterval(interval);
        soundEngine.playTone(880, 'triangle', 0.2, 0.25);

        const newVideo: VideoItem = {
          id: `user-${isImage ? 'img' : 'vid'}-${Date.now()}`,
          mediaType: isImage ? 'image' : 'video',
          videoUrl: isImage ? '' : videoData.videoUrl,
          imageUrl: isImage ? videoData.videoUrl : undefined,
          caption: caption.trim() || (isImage ? 'Photo post' : 'New clip'),
          hashtags,
          creator: {
            ...CURRENT_USER,
          },
          stats: {
            likes: 1,
            comments: 0,
            shares: 0,
            saves: 0,
            views: 1,
          },
          isLiked: true,
          isSaved: false,
          sound: videoData.sound,
          filterSettings: videoData.filterSettings,
          textOverlays: videoData.textOverlays,
          stickers: videoData.stickers,
          speed: videoData.speed,
          trimStart: videoData.trimStart,
          trimEnd: videoData.trimEnd,
          createdAt: Date.now(),
          isUserCreated: true,
        };

        saveUserVideo(newVideo);
        setTimeout(() => {
          onPostSuccess(newVideo);
        }, 500);
      }
    }, 250);
  };

  const filterStyle = getFilterStyleString(videoData.filterSettings);

  return (
    <div className="fixed inset-0 z-50 bg-neutral-950 flex flex-col justify-between overflow-y-auto no-scrollbar select-none">
      {/* Header */}
      <div className="sticky top-0 z-20 flex items-center justify-between px-4 py-3 bg-neutral-900 border-b border-neutral-800">
        <button
          onClick={onBack}
          disabled={isPosting}
          className="flex items-center gap-1 text-xs font-semibold text-neutral-300 hover:text-white transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Editor</span>
        </button>

        <span className="text-xs font-bold text-neutral-100">
          {isImage ? 'Post Photo' : 'Post Video'}
        </span>
        <div className="w-12" />
      </div>

      {/* Main Content */}
      <div className="max-w-lg mx-auto w-full p-4 space-y-5 flex-1">
        {/* Thumbnail & Caption Row */}
        <div className="flex gap-4 items-start bg-neutral-900 p-3.5 rounded-2xl border border-neutral-800">
          {/* Mini video / photo cover */}
          <div className="w-24 aspect-[9/16] rounded-xl overflow-hidden bg-black shrink-0 relative border border-neutral-700">
            {isImage ? (
              <img
                src={videoData.videoUrl}
                alt="Post cover"
                className="w-full h-full object-cover"
                style={{ filter: filterStyle }}
              />
            ) : (
              <video
                src={videoData.videoUrl}
                className="w-full h-full object-cover"
                style={{ filter: filterStyle }}
                muted
              />
            )}
            {videoData.textOverlays.length > 0 && (
              <div className="absolute inset-x-1 top-4 bg-black/60 rounded text-[8px] text-white text-center font-bold truncate px-1">
                {videoData.textOverlays[0].text}
              </div>
            )}
          </div>

          {/* Caption textarea */}
          <div className="flex-1 min-w-0">
            <textarea
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              placeholder="Describe your video, add context or questions..."
              maxLength={220}
              rows={4}
              className="w-full bg-transparent text-xs text-white placeholder:text-neutral-500 focus:outline-none resize-none leading-relaxed"
            />
            <div className="flex justify-between items-center text-[10px] text-neutral-500 pt-1 border-t border-neutral-800">
              <span>{caption.length} / 220</span>
            </div>
          </div>
        </div>

        {/* Hashtags Section */}
        <div className="space-y-2">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-neutral-300">
            <Hash className="w-4 h-4 text-rose-500" />
            <span>Hashtags &amp; Topics</span>
          </div>

          <div className="flex flex-wrap gap-2">
            {TRENDING_TAGS.map((tag) => {
              const isSelected = hashtags.includes(tag);
              return (
                <button
                  key={tag}
                  onClick={() => handleToggleTag(tag)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                    isSelected
                      ? 'bg-rose-500 text-white shadow-sm shadow-rose-500/30'
                      : 'bg-neutral-800 text-neutral-400 hover:text-neutral-200'
                  }`}
                >
                  #{tag}
                </button>
              );
            })}
          </div>
        </div>

        {/* Privacy Selector */}
        <div className="space-y-2 pt-2">
          <span className="text-xs font-semibold text-neutral-300">Who can watch this video</span>
          <div className="grid grid-cols-3 gap-2">
            {[
              { id: 'public', label: 'Public', icon: Globe },
              { id: 'friends', label: 'Friends', icon: Users },
              { id: 'private', label: 'Only Me', icon: Lock },
            ].map((opt) => {
              const Icon = opt.icon;
              const isSelected = privacy === opt.id;
              return (
                <button
                  key={opt.id}
                  onClick={() => {
                    soundEngine.playTone(480, 'sine', 0.04, 0.06);
                    setPrivacy(opt.id as 'public' | 'friends' | 'private');
                  }}
                  className={`flex flex-col items-center gap-1.5 py-3 rounded-2xl border transition-all ${
                    isSelected
                      ? 'bg-neutral-800 border-rose-500 text-white'
                      : 'bg-neutral-900 border-neutral-800 text-neutral-400 hover:border-neutral-700'
                  }`}
                >
                  <Icon className={`w-5 h-5 ${isSelected ? 'text-rose-500' : ''}`} />
                  <span className="text-xs font-semibold">{opt.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Interactive Toggles */}
        <div className="bg-neutral-900 rounded-2xl border border-neutral-800 divide-y divide-neutral-800">
          <div className="flex items-center justify-between p-3.5">
            <div>
              <p className="text-xs font-semibold text-neutral-200">Allow comments</p>
              <p className="text-[11px] text-neutral-500">Everyone can leave feedback</p>
            </div>
            <input
              type="checkbox"
              checked={allowComments}
              onChange={(e) => setAllowComments(e.target.checked)}
              className="w-4 h-4 accent-rose-500 rounded cursor-pointer"
            />
          </div>
        </div>
      </div>

      {/* Bottom Post Bar */}
      <div className="sticky bottom-0 z-20 p-4 bg-neutral-900 border-t border-neutral-800">
        {isPosting ? (
          <div className="space-y-2">
            <div className="flex justify-between text-xs text-neutral-300">
              <span>Publishing your clip to TokStudio feed...</span>
              <span className="font-mono">{postProgress}%</span>
            </div>
            <div className="w-full h-2 bg-neutral-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-rose-500 transition-all duration-200"
                style={{ width: `${postProgress}%` }}
              />
            </div>
          </div>
        ) : (
          <button
            onClick={handlePost}
            className="w-full py-3.5 bg-rose-500 hover:bg-rose-600 active:scale-[0.98] text-white font-bold text-sm rounded-xl shadow-lg shadow-rose-500/25 flex items-center justify-center gap-2 transition-all"
          >
            <CheckCircle2 className="w-5 h-5" />
            Post Clip
          </button>
        )}
      </div>
    </div>
  );
};
