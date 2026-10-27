import React, { useState, useEffect } from 'react';
import { VideoItem, SoundTrack, FilterSettings, TextOverlay, StickerOverlay } from './types/video';
import { loadVideos } from './utils/storage';
import { soundEngine } from './utils/audioSynth';
import { FeedContainer } from './components/feed/FeedContainer';
import { StudioCamera } from './components/record/StudioCamera';
import { VideoEditor } from './components/editor/VideoEditor';
import { PostModal } from './components/editor/PostModal';
import { ExploreView } from './components/explore/ExploreView';
import { ProfileView } from './components/profile/ProfileView';
import { ActivityView } from './components/activity/ActivityView';
import { GoogleMediaSearchModal } from './components/studio/GoogleMediaSearchModal';
import { CreativeVideoGeneratorModal } from './components/studio/CreativeVideoGeneratorModal';
import { BottomNav, NavTab } from './components/navigation/BottomNav';
import { Sparkles, Plus, Compass, Video, Volume2, VolumeX, Keyboard, Globe, Wand2, Image } from 'lucide-react';

export default function App() {
  const [videos, setVideos] = useState<VideoItem[]>([]);
  const [currentTab, setCurrentTab] = useState<NavTab>('home');
  const [isMuted, setIsMuted] = useState<boolean>(true);
  const [exploreTag, setExploreTag] = useState<string | undefined>(undefined);

  // Creation Studio Workflow State
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [isGoogleSearchOpen, setIsGoogleSearchOpen] = useState(false);
  const [isAiGeneratorOpen, setIsAiGeneratorOpen] = useState(false);

  const [editorData, setEditorData] = useState<{
    videoUrl: string;
    mediaType?: 'video' | 'image';
    sound?: SoundTrack;
    initialFilter?: FilterSettings;
  } | null>(null);

  const [postData, setPostData] = useState<{
    videoUrl: string;
    mediaType?: 'video' | 'image';
    sound: SoundTrack;
    filterSettings: FilterSettings;
    textOverlays: TextOverlay[];
    stickers: StickerOverlay[];
    speed: number;
    trimStart: number;
    trimEnd: number;
  } | null>(null);

  // Load initial videos & user videos
  useEffect(() => {
    const loaded = loadVideos();
    setVideos(loaded);
  }, []);

  // Global keyboard shortcut to open recorder (R key)
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (['input', 'textarea'].includes((e.target as HTMLElement).tagName.toLowerCase())) {
        return;
      }
      if (e.key === 'r' || e.key === 'R') {
        setIsCameraOpen(true);
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, []);

  const handleToggleMute = () => {
    const nextMuted = soundEngine.toggleMute();
    setIsMuted(nextMuted);
  };

  const handleOpenRecord = () => {
    setIsCameraOpen(true);
  };

  // Called when camera recording or photo snapshot finishes
  const handleFinishRecording = (
    mediaUrl: string,
    sound?: SoundTrack,
    initialFilter?: FilterSettings,
    mediaType?: 'video' | 'image'
  ) => {
    setIsCameraOpen(false);
    setEditorData({ videoUrl: mediaUrl, mediaType: mediaType || 'video', sound, initialFilter });
  };

  // Called when editor finishes and user clicks Next
  const handleProceedToPost = (data: {
    videoUrl: string;
    mediaType?: 'video' | 'image';
    sound: SoundTrack;
    filterSettings: FilterSettings;
    textOverlays: TextOverlay[];
    stickers: StickerOverlay[];
    speed: number;
    trimStart: number;
    trimEnd: number;
  }) => {
    setEditorData(null);
    setPostData(data);
  };

  // Called when video is published
  const handlePostSuccess = (newVideo: VideoItem) => {
    setPostData(null);
    setVideos((prev) => [newVideo, ...prev]);
    setCurrentTab('home');
  };

  const handleSelectVideo = (videoId: string) => {
    // Bring this video to the front of the feed or set active
    const targetIdx = videos.findIndex((v) => v.id === videoId);
    if (targetIdx !== -1) {
      const selected = videos[targetIdx];
      const remainder = videos.filter((v) => v.id !== videoId);
      setVideos([selected, ...remainder]);
    }
    setCurrentTab('home');
  };

  const handleHashtagClick = (tag: string) => {
    setExploreTag(tag);
    setCurrentTab('explore');
  };

  const handleVideoDeleted = (videoId: string) => {
    setVideos((prev) => prev.filter((v) => v.id !== videoId));
  };

  const handleLikeToggle = (videoId: string, isLiked: boolean) => {
    setVideos((prev) =>
      prev.map((v) => {
        if (v.id === videoId) {
          return {
            ...v,
            isLiked,
            stats: {
              ...v.stats,
              likes: isLiked ? v.stats.likes + 1 : Math.max(0, v.stats.likes - 1),
            },
          };
        }
        return v;
      })
    );
  };

  return (
    <div className="w-full h-screen bg-neutral-950 flex justify-center overflow-hidden">
      {/* Desktop Ambient Background */}
      <div className="hidden lg:flex flex-col justify-between w-72 p-6 text-neutral-400 select-none z-10">
        <div>
          <div className="flex items-center gap-2 text-white font-extrabold text-xl tracking-tight mb-2">
            <span className="w-8 h-8 rounded-xl bg-gradient-to-tr from-cyan-400 via-rose-500 to-amber-400 flex items-center justify-center text-white shadow-lg shadow-rose-500/20">
              <Video className="w-4 h-4 fill-white" />
            </span>
            <span>TokStudio</span>
          </div>
          <p className="text-xs text-neutral-400 leading-relaxed mb-5">
            Short video &amp; photo creator studio. Record takes, import from Google, craft AI motion clips, and publish.
          </p>

          <div className="space-y-1">
            <button
              onClick={() => setCurrentTab('home')}
              className={`w-full flex items-center gap-3 px-3.5 py-2 rounded-xl text-xs font-semibold transition-colors ${
                currentTab === 'home'
                  ? 'bg-neutral-800 text-white'
                  : 'hover:bg-neutral-900 text-neutral-400 hover:text-white'
              }`}
            >
              <Video className="w-4 h-4 text-rose-500" />
              <span>For You Feed</span>
            </button>

            <button
              onClick={() => setCurrentTab('explore')}
              className={`w-full flex items-center gap-3 px-3.5 py-2 rounded-xl text-xs font-semibold transition-colors ${
                currentTab === 'explore'
                  ? 'bg-neutral-800 text-white'
                  : 'hover:bg-neutral-900 text-neutral-400 hover:text-white'
              }`}
            >
              <Compass className="w-4 h-4 text-cyan-400" />
              <span>Discover &amp; Tags</span>
            </button>

            {/* Google Media Search trigger */}
            <button
              onClick={() => setIsGoogleSearchOpen(true)}
              className="w-full flex items-center gap-3 px-3.5 py-2 rounded-xl text-xs font-semibold hover:bg-neutral-900 text-neutral-400 hover:text-white transition-colors"
            >
              <Globe className="w-4 h-4 text-blue-400" />
              <span>Search Google Media</span>
            </button>

            {/* AI Video Generator trigger */}
            <button
              onClick={() => setIsAiGeneratorOpen(true)}
              className="w-full flex items-center gap-3 px-3.5 py-2 rounded-xl text-xs font-semibold hover:bg-neutral-900 text-neutral-400 hover:text-white transition-colors"
            >
              <Wand2 className="w-4 h-4 text-amber-400" />
              <span>Create Motion Video</span>
            </button>

            {/* Primary Record Button */}
            <button
              onClick={handleOpenRecord}
              className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold bg-rose-500 hover:bg-rose-600 text-white transition-all shadow-md shadow-rose-500/20 active:scale-95 mt-2"
            >
              <Plus className="w-4 h-4" />
              <span>Record Video / Snap Photo</span>
            </button>
          </div>
        </div>

        {/* Desktop Keyboard Shortcuts Card */}
        <div className="p-3 bg-neutral-900/80 rounded-2xl border border-neutral-800/80 space-y-2">
          <div className="flex items-center gap-1.5 text-xs font-bold text-neutral-200">
            <Keyboard className="w-3.5 h-3.5 text-rose-400" />
            <span>Shortcuts</span>
          </div>
          <div className="text-[11px] text-neutral-400 space-y-1 font-mono">
            <div className="flex justify-between">
              <span>Next clip</span>
              <kbd className="px-1.5 py-0.5 bg-neutral-800 rounded text-neutral-300">↓</kbd>
            </div>
            <div className="flex justify-between">
              <span>Prev clip</span>
              <kbd className="px-1.5 py-0.5 bg-neutral-800 rounded text-neutral-300">↑</kbd>
            </div>
            <div className="flex justify-between">
              <span>Mute</span>
              <kbd className="px-1.5 py-0.5 bg-neutral-800 rounded text-neutral-300">M</kbd>
            </div>
            <div className="flex justify-between">
              <span>Studio</span>
              <kbd className="px-1.5 py-0.5 bg-neutral-800 rounded text-neutral-300">R</kbd>
            </div>
          </div>
        </div>
      </div>

      {/* Main Mobile App Frame */}
      <main className="relative w-full max-w-[440px] h-full bg-black shadow-2xl flex flex-col overflow-hidden border-x border-neutral-900/60">
        {/* VIEW ROUTING */}
        <div className="flex-1 w-full h-full overflow-hidden">
          {currentTab === 'home' && (
            <FeedContainer
              videos={videos}
              isMuted={isMuted}
              onToggleMute={handleToggleMute}
              onHashtagClick={handleHashtagClick}
              onUserClick={() => setCurrentTab('profile')}
              onLikeToggle={handleLikeToggle}
              onOpenExplore={() => setCurrentTab('explore')}
            />
          )}

          {currentTab === 'explore' && (
            <ExploreView
              videos={videos}
              onSelectVideo={handleSelectVideo}
              initialTag={exploreTag}
            />
          )}

          {currentTab === 'activity' && <ActivityView />}

          {currentTab === 'profile' && (
            <ProfileView
              videos={videos}
              onSelectVideo={handleSelectVideo}
              onOpenRecord={handleOpenRecord}
              onVideoDeleted={handleVideoDeleted}
            />
          )}
        </div>

        {/* Global Bottom Navigation (Visible on Home, Explore, Activity, Profile) */}
        {!isCameraOpen && !editorData && !postData && (
          <BottomNav
            currentTab={currentTab}
            onSelectTab={(tab) => {
              if (tab === 'explore') setExploreTag(undefined);
              setCurrentTab(tab);
            }}
            onOpenRecord={handleOpenRecord}
          />
        )}

        {/* STUDIO CAMERA RECORDING MODAL */}
        {isCameraOpen && (
          <StudioCamera
            onClose={() => setIsCameraOpen(false)}
            onFinishRecording={handleFinishRecording}
          />
        )}

        {/* VIDEO / PHOTO STUDIO EDITOR MODAL */}
        {editorData && (
          <VideoEditor
            videoUrl={editorData.videoUrl}
            mediaType={editorData.mediaType}
            initialSound={editorData.sound}
            initialFilter={editorData.initialFilter}
            onBack={() => {
              setEditorData(null);
              setIsCameraOpen(true);
            }}
            onProceedToPost={handleProceedToPost}
          />
        )}

        {/* POST PUBLISHING MODAL */}
        {postData && (
          <PostModal
            videoData={postData}
            onBack={() => {
              setEditorData({
                videoUrl: postData.videoUrl,
                mediaType: postData.mediaType,
                sound: postData.sound,
                initialFilter: postData.filterSettings,
              });
              setPostData(null);
            }}
            onPostSuccess={handlePostSuccess}
          />
        )}

        {/* GOOGLE & WEB MEDIA SEARCH MODAL */}
        <GoogleMediaSearchModal
          isOpen={isGoogleSearchOpen}
          onClose={() => setIsGoogleSearchOpen(false)}
          onImportMedia={(media) => {
            setEditorData({
              videoUrl: media.url,
              mediaType: media.type,
            });
          }}
        />

        {/* AI CREATIVE VIDEO GENERATOR MODAL */}
        <CreativeVideoGeneratorModal
          isOpen={isAiGeneratorOpen}
          onClose={() => setIsAiGeneratorOpen(false)}
          onGenerated={(videoBlobUrl) => {
            setEditorData({
              videoUrl: videoBlobUrl,
              mediaType: 'video',
            });
          }}
        />
      </main>

      {/* Desktop Right Info Sidebar */}
      <div className="hidden lg:flex flex-col justify-between w-72 p-6 text-neutral-400 select-none z-10">
        <div className="space-y-4">
          {/* For You Algorithm Card */}
          <div className="p-4 bg-gradient-to-b from-rose-950/20 to-neutral-900/60 rounded-2xl border border-rose-500/20">
            <div className="flex items-center gap-2 text-white text-xs font-bold mb-2">
              <Sparkles className="w-4 h-4 text-rose-400" />
              <span>&quot;For You&quot; Algorithm</span>
            </div>
            <div className="space-y-2 text-[11px] text-neutral-300">
              <div className="flex justify-between items-center py-1 border-b border-neutral-800">
                <span className="text-neutral-400">Completion &amp; Loops</span>
                <span className="font-mono text-emerald-400 font-bold">+50 pts</span>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-neutral-800">
                <span className="text-neutral-400">Share Velocity</span>
                <span className="font-mono text-cyan-400 font-bold">+15 pts</span>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-neutral-800">
                <span className="text-neutral-400">Topic Affinity</span>
                <span className="font-mono text-rose-400 font-bold">+25 pts</span>
              </div>
              <div className="flex justify-between items-center py-1">
                <span className="text-neutral-400">Followed Creator</span>
                <span className="font-mono text-amber-400 font-bold">+30 pts</span>
              </div>
            </div>
            <p className="text-[10px] text-neutral-400 mt-2.5 leading-relaxed">
              Tap the &quot;✨ FYP pts&quot; badge on any clip or top bar to inspect scores and tune recommendation modes.
            </p>
          </div>

          <div className="p-4 bg-neutral-900/60 rounded-2xl border border-neutral-800">
            <div className="flex items-center gap-2 text-white text-xs font-bold mb-2">
              <Image className="w-4 h-4 text-cyan-400" />
              <span>Media Studio Support</span>
            </div>
            <ul className="text-[11px] text-neutral-400 space-y-1.5 list-disc list-inside">
              <li>Post vertical photos &amp; photo slideshows</li>
              <li>Search Google &amp; Web media catalog</li>
              <li>Create procedural AI motion clips</li>
              <li>Multi-segment video takes &amp; photo snaps</li>
              <li>Custom text layers, stickers, and sound</li>
            </ul>
          </div>
        </div>

        <div className="text-[11px] text-neutral-500">
          <p>TokStudio Short Video Platform</p>
          <p className="mt-0.5">© 2026 Built for Creators</p>
        </div>
      </div>
    </div>
  );
}
