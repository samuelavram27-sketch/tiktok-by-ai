import React, { useState, useRef, useEffect } from 'react';
import {
  ChevronLeft,
  ArrowRight,
  Scissors,
  Sparkles,
  Type,
  Smile,
  Music2,
  Gauge,
  Play,
  Pause,
  Trash2,
  Plus,
  Volume2,
} from 'lucide-react';
import {
  SoundTrack,
  FilterSettings,
  TextOverlay,
  StickerOverlay,
} from '../../types/video';
import { FILTER_PRESETS, getFilterStyleString } from '../../utils/filterStyles';
import { VideoOverlay } from '../feed/VideoOverlay';
import { SoundPickerModal } from '../sounds/SoundPickerModal';
import { soundEngine } from '../../utils/audioSynth';

interface VideoEditorProps {
  videoUrl: string;
  mediaType?: 'video' | 'image';
  initialSound?: SoundTrack;
  initialFilter?: FilterSettings;
  onBack: () => void;
  onProceedToPost: (editedData: {
    videoUrl: string;
    mediaType?: 'video' | 'image';
    sound: SoundTrack;
    filterSettings: FilterSettings;
    textOverlays: TextOverlay[];
    stickers: StickerOverlay[];
    speed: number;
    trimStart: number;
    trimEnd: number;
  }) => void;
}

type EditorTab = 'trim' | 'filter' | 'text' | 'stickers' | 'audio' | 'speed';

const COLOR_PALETTE = ['#ffffff', '#fbbf24', '#f43f5e', '#38bdf8', '#4ade80', '#c084fc', '#000000'];
const STICKER_LIST = ['🔥', '💯', '✨', '🚀', '❤️', '🥑', '⚡', '🎉', '🕶️', '👑', '🍿', '🎬'];

export const VideoEditor: React.FC<VideoEditorProps> = ({
  videoUrl,
  mediaType = 'video',
  initialSound,
  initialFilter,
  onBack,
  onProceedToPost,
}) => {
  const [activeTab, setActiveTab] = useState<EditorTab>('trim');
  const [isPlaying, setIsPlaying] = useState(true);
  const [duration, setDuration] = useState(15);
  const [currentTime, setCurrentTime] = useState(0);

  // Editing state
  const [trimStart, setTrimStart] = useState(0);
  const [trimEnd, setTrimEnd] = useState(15);
  const [filterSettings, setFilterSettings] = useState<FilterSettings>(
    initialFilter || {
      preset: 'none',
      brightness: 1,
      contrast: 1,
      saturation: 1,
      blur: 0,
      sepia: 0,
    }
  );
  const [textOverlays, setTextOverlays] = useState<TextOverlay[]>([
    {
      id: 'txt-default',
      text: 'TokStudio vibes ✨',
      x: 50,
      y: 35,
      color: '#ffffff',
      hasBackground: true,
      style: 'neon',
      size: 'lg',
    },
  ]);
  const [selectedTextId, setSelectedTextId] = useState<string | null>('txt-default');

  const [stickers, setStickers] = useState<StickerOverlay[]>([]);
  const [selectedStickerId, setSelectedStickerId] = useState<string | null>(null);

  const [sound, setSound] = useState<SoundTrack>(
    initialSound || {
      id: 'sound-default',
      title: 'Original Audio',
      artist: 'You',
      duration: 15,
      bpm: 120,
      genre: 'lofi',
      synthesizeNotes: [],
    }
  );
  const [isSoundPickerOpen, setIsSoundPickerOpen] = useState(false);
  const [originalVolume, setOriginalVolume] = useState(100);
  const [soundtrackVolume, setSoundtrackVolume] = useState(80);
  const [speed, setSpeed] = useState<number>(1);

  const videoRef = useRef<HTMLVideoElement>(null);

  // Load video metadata
  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      const dur = videoRef.current.duration || 15;
      setDuration(dur);
      setTrimEnd(dur);
    }
  };

  // Keep playback within trim bounds
  const handleTimeUpdate = () => {
    if (!videoRef.current) return;
    const time = videoRef.current.currentTime;
    setCurrentTime(time);

    if (time >= trimEnd) {
      videoRef.current.currentTime = trimStart;
      videoRef.current.play();
    }
  };

  // Speed sync
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.playbackRate = speed;
    }
  }, [speed]);

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
      setIsPlaying(false);
    } else {
      videoRef.current.play();
      setIsPlaying(true);
    }
  };

  const handleSeek = (time: number) => {
    if (!videoRef.current) return;
    videoRef.current.currentTime = time;
    setCurrentTime(time);
  };

  // Add text layer
  const handleAddText = () => {
    soundEngine.playTone(600, 'sine', 0.08, 0.1);
    const newText: TextOverlay = {
      id: `txt-${Date.now()}`,
      text: 'Double tap to edit text',
      x: 50,
      y: 50,
      color: '#ffffff',
      hasBackground: true,
      style: 'classic',
      size: 'md',
    };
    setTextOverlays((prev) => [...prev, newText]);
    setSelectedTextId(newText.id);
  };

  // Add sticker
  const handleAddSticker = (emoji: string) => {
    soundEngine.playLikeSound();
    const newSticker: StickerOverlay = {
      id: `stk-${Date.now()}`,
      emoji,
      x: 50 + (Math.random() * 20 - 10),
      y: 50 + (Math.random() * 20 - 10),
      scale: 1.2,
    };
    setStickers((prev) => [...prev, newSticker]);
    setSelectedStickerId(newSticker.id);
  };

  const handleProceed = () => {
    soundEngine.playTone(660, 'triangle', 0.15, 0.2);
    onProceedToPost({
      videoUrl,
      mediaType,
      sound,
      filterSettings,
      textOverlays,
      stickers,
      speed,
      trimStart,
      trimEnd,
    });
  };

  const currentSelectedText = textOverlays.find((t) => t.id === selectedTextId);
  const currentSelectedSticker = stickers.find((s) => s.id === selectedStickerId);
  const filterStyleString = getFilterStyleString(filterSettings);

  return (
    <div className="fixed inset-0 z-50 bg-neutral-950 flex flex-col justify-between overflow-hidden select-none">
      {/* Top Header */}
      <div className="relative z-20 flex items-center justify-between px-4 py-3 bg-neutral-900 border-b border-neutral-800">
        <button
          onClick={onBack}
          className="flex items-center gap-1 text-xs font-semibold text-neutral-300 hover:text-white transition-colors py-1 px-2"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Retake</span>
        </button>

        <span className="text-xs font-bold text-neutral-200">
          {mediaType === 'image' ? 'TokStudio Photo Editor' : 'TokStudio Video Editor'}
        </span>

        <button
          onClick={handleProceed}
          className="px-4 py-1.5 rounded-full bg-rose-500 hover:bg-rose-600 text-white font-semibold text-xs flex items-center gap-1.5 shadow-md shadow-rose-500/25 active:scale-95 transition-all"
        >
          <span>Next</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Main Video / Photo Preview Area */}
      <div className="relative flex-1 flex items-center justify-center p-3 bg-black overflow-hidden">
        <div
          className="relative w-full max-w-[360px] aspect-[9/16] rounded-2xl overflow-hidden bg-neutral-900 shadow-2xl border border-neutral-800 flex items-center justify-center cursor-pointer"
          onClick={togglePlay}
        >
          {mediaType === 'image' ? (
            <img
              src={videoUrl}
              alt="Photo preview"
              className="w-full h-full object-cover"
              style={{ filter: filterStyleString }}
            />
          ) : (
            <video
              ref={videoRef}
              src={videoUrl}
              autoPlay
              playsInline
              loop
              muted={soundtrackVolume > 0 && sound.id !== 'sound-default'}
              onLoadedMetadata={handleLoadedMetadata}
              onTimeUpdate={handleTimeUpdate}
              className="w-full h-full object-cover"
              style={{ filter: filterStyleString }}
            />
          )}

          {/* Render Text Overlays & Stickers */}
          <VideoOverlay textOverlays={textOverlays} stickers={stickers} />

          {/* Pause overlay button (video mode) */}
          {mediaType === 'video' && !isPlaying && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/30 pointer-events-none">
              <div className="w-14 h-14 rounded-full bg-black/60 backdrop-blur-xs flex items-center justify-center text-white">
                <Play className="w-7 h-7 fill-current ml-1" />
              </div>
            </div>
          )}

          {/* Active soundtrack badge */}
          {sound && sound.id !== 'sound-default' && (
            <div className="absolute top-3 left-3 bg-black/50 backdrop-blur-md px-2.5 py-1 rounded-full text-[11px] text-white/90 flex items-center gap-1.5 pointer-events-none border border-white/10">
              <Music2 className="w-3 h-3 text-rose-400" />
              <span className="truncate max-w-[140px] font-medium">{sound.title}</span>
            </div>
          )}

          {/* Speed badge */}
          {speed !== 1 && (
            <div className="absolute top-3 right-3 bg-amber-500/80 backdrop-blur-md px-2 py-0.5 rounded-md text-[10px] font-mono text-white font-bold pointer-events-none">
              {speed}x
            </div>
          )}
        </div>
      </div>

      {/* Bottom Editor Suite */}
      <div className="relative z-20 bg-neutral-900 border-t border-neutral-800 flex flex-col">
        {/* Tool Content Area */}
        <div className="px-4 py-3 min-h-[140px] max-h-[190px] overflow-y-auto no-scrollbar">
          {/* TAB 1: TRIM / PHOTO DURATION */}
          {activeTab === 'trim' && (
            <div className="space-y-3">
              {mediaType === 'image' ? (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-neutral-200">Photo Display Duration</span>
                    <span className="font-mono text-cyan-400 font-bold">{trimEnd.toFixed(0)}s loop</span>
                  </div>
                  <p className="text-[11px] text-neutral-400">
                    Background music will play while viewers enjoy your photo post.
                  </p>
                  <input
                    type="range"
                    min="3"
                    max="15"
                    step="1"
                    value={trimEnd}
                    onChange={(e) => setTrimEnd(parseFloat(e.target.value))}
                    className="w-full accent-cyan-400 h-1.5 bg-neutral-800 rounded-lg cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-neutral-500 font-mono">
                    <span>3s Quick</span>
                    <span>8s Balanced</span>
                    <span>15s Extended</span>
                  </div>
                </div>
              ) : (
                <>
                  <div className="flex items-center justify-between text-xs text-neutral-400">
                    <span className="font-semibold text-neutral-200">Clip Timeline</span>
                    <span className="font-mono text-neutral-300">
                      {trimStart.toFixed(1)}s — {trimEnd.toFixed(1)}s (Duration: {(trimEnd - trimStart).toFixed(1)}s)
                    </span>
                  </div>

                  {/* Slider for start trim */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-[11px] text-neutral-400">
                      <span>Start Trim</span>
                      <span className="font-mono">{trimStart.toFixed(1)}s</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max={Math.max(0, trimEnd - 0.5)}
                      step="0.1"
                      value={trimStart}
                      onChange={(e) => {
                        const val = parseFloat(e.target.value);
                        setTrimStart(val);
                        handleSeek(val);
                      }}
                      className="w-full accent-rose-500 h-1.5 bg-neutral-800 rounded-lg cursor-pointer"
                    />
                  </div>

                  {/* Slider for end trim */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-[11px] text-neutral-400">
                      <span>End Trim</span>
                      <span className="font-mono">{trimEnd.toFixed(1)}s</span>
                    </div>
                    <input
                      type="range"
                      min={trimStart + 0.5}
                      max={duration}
                      step="0.1"
                      value={trimEnd}
                      onChange={(e) => {
                        const val = parseFloat(e.target.value);
                        setTrimEnd(val);
                      }}
                      className="w-full accent-rose-500 h-1.5 bg-neutral-800 rounded-lg cursor-pointer"
                    />
                  </div>
                </>
              )}
            </div>
          )}

          {/* TAB 2: FILTERS & COLOR GRADING */}
          {activeTab === 'filter' && (
            <div className="space-y-3">
              {/* Preset buttons */}
              <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
                {FILTER_PRESETS.map((preset) => (
                  <button
                    key={preset.id}
                    onClick={() => {
                      setFilterSettings({ ...preset.settings });
                      soundEngine.playTone(450, 'sine', 0.04, 0.05);
                    }}
                    className={`px-3 py-1.5 rounded-xl text-xs whitespace-nowrap transition-all border ${
                      filterSettings.preset === preset.id
                        ? 'bg-rose-500 text-white border-rose-400 shadow-md shadow-rose-500/25'
                        : 'bg-neutral-800 text-neutral-300 border-neutral-700 hover:border-neutral-600'
                    }`}
                  >
                    {preset.label}
                  </button>
                ))}
              </div>

              {/* Fine tuning sliders */}
              <div className="grid grid-cols-2 gap-3 pt-1">
                <div className="space-y-1">
                  <div className="flex justify-between text-[10px] text-neutral-400">
                    <span>Brightness</span>
                    <span className="font-mono">{filterSettings.brightness.toFixed(2)}</span>
                  </div>
                  <input
                    type="range"
                    min="0.5"
                    max="1.5"
                    step="0.05"
                    value={filterSettings.brightness}
                    onChange={(e) =>
                      setFilterSettings((prev) => ({
                        ...prev,
                        brightness: parseFloat(e.target.value),
                        preset: 'custom',
                      }))
                    }
                    className="w-full accent-rose-500 h-1.5 bg-neutral-800 rounded-lg"
                  />
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between text-[10px] text-neutral-400">
                    <span>Contrast</span>
                    <span className="font-mono">{filterSettings.contrast.toFixed(2)}</span>
                  </div>
                  <input
                    type="range"
                    min="0.5"
                    max="1.5"
                    step="0.05"
                    value={filterSettings.contrast}
                    onChange={(e) =>
                      setFilterSettings((prev) => ({
                        ...prev,
                        contrast: parseFloat(e.target.value),
                        preset: 'custom',
                      }))
                    }
                    className="w-full accent-rose-500 h-1.5 bg-neutral-800 rounded-lg"
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: TEXT OVERLAYS */}
          {activeTab === 'text' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-neutral-200">Text Layers</span>
                <button
                  onClick={handleAddText}
                  className="px-2.5 py-1 rounded-full bg-rose-500/20 text-rose-400 border border-rose-500/40 text-[11px] font-semibold flex items-center gap-1 hover:bg-rose-500/30"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Add Text
                </button>
              </div>

              {currentSelectedText ? (
                <div className="space-y-2.5 bg-neutral-800/60 p-2.5 rounded-xl border border-neutral-700/60">
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={currentSelectedText.text}
                      onChange={(e) => {
                        const val = e.target.value;
                        setTextOverlays((prev) =>
                          prev.map((t) => (t.id === currentSelectedText.id ? { ...t, text: val } : t))
                        );
                      }}
                      className="flex-1 bg-neutral-900 text-xs text-white px-3 py-1.5 rounded-lg border border-neutral-700 focus:outline-none focus:border-rose-500"
                      placeholder="Type overlay text..."
                    />
                    <button
                      onClick={() => {
                        setTextOverlays((prev) => prev.filter((t) => t.id !== currentSelectedText.id));
                        setSelectedTextId(null);
                      }}
                      className="p-1.5 text-neutral-400 hover:text-rose-400 rounded-lg"
                      title="Delete text layer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Font styles & color palette */}
                  <div className="flex items-center justify-between gap-2 pt-1">
                    <div className="flex items-center gap-1">
                      {(['classic', 'neon', 'typewriter', 'marker'] as const).map((style) => (
                        <button
                          key={style}
                          onClick={() => {
                            setTextOverlays((prev) =>
                              prev.map((t) =>
                                t.id === currentSelectedText.id ? { ...t, style } : t
                              )
                            );
                          }}
                          className={`px-2 py-0.5 rounded text-[10px] font-semibold capitalize ${
                            currentSelectedText.style === style
                              ? 'bg-white text-black'
                              : 'bg-neutral-700 text-neutral-300'
                          }`}
                        >
                          {style}
                        </button>
                      ))}
                    </div>

                    <div className="flex items-center gap-1">
                      {COLOR_PALETTE.map((color) => (
                        <button
                          key={color}
                          onClick={() => {
                            setTextOverlays((prev) =>
                              prev.map((t) =>
                                t.id === currentSelectedText.id ? { ...t, color } : t
                              )
                            );
                          }}
                          className={`w-4.5 h-4.5 rounded-full border border-white/20 transition-transform ${
                            currentSelectedText.color === color ? 'scale-125 ring-2 ring-rose-500' : ''
                          }`}
                          style={{ backgroundColor: color }}
                        />
                      ))}
                    </div>
                  </div>

                  {/* Vertical Position slider */}
                  <div className="flex items-center gap-3 pt-1">
                    <span className="text-[10px] text-neutral-400 shrink-0">Y Position:</span>
                    <input
                      type="range"
                      min="15"
                      max="85"
                      value={currentSelectedText.y}
                      onChange={(e) => {
                        const yVal = parseInt(e.target.value);
                        setTextOverlays((prev) =>
                          prev.map((t) =>
                            t.id === currentSelectedText.id ? { ...t, y: yVal } : t
                          )
                        );
                      }}
                      className="w-full accent-rose-500 h-1.5 bg-neutral-900 rounded-lg"
                    />
                  </div>
                </div>
              ) : (
                <p className="text-xs text-neutral-400 text-center py-2">
                  No text overlay selected. Click &quot;Add Text&quot; to create one!
                </p>
              )}
            </div>
          )}

          {/* TAB 4: STICKERS & REACTIONS */}
          {activeTab === 'stickers' && (
            <div className="space-y-3">
              <span className="text-xs font-semibold text-neutral-200">Tap to add reaction sticker:</span>
              <div className="grid grid-cols-6 gap-2">
                {STICKER_LIST.map((emoji) => (
                  <button
                    key={emoji}
                    onClick={() => handleAddSticker(emoji)}
                    className="h-10 text-xl bg-neutral-800/80 hover:bg-neutral-700 rounded-xl flex items-center justify-center transition-transform active:scale-90"
                  >
                    {emoji}
                  </button>
                ))}
              </div>

              {currentSelectedSticker && (
                <div className="flex items-center justify-between pt-2 border-t border-neutral-800">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{currentSelectedSticker.emoji}</span>
                    <span className="text-xs text-neutral-300">Selected</span>
                  </div>
                  <button
                    onClick={() => {
                      setStickers((prev) => prev.filter((s) => s.id !== currentSelectedSticker.id));
                      setSelectedStickerId(null);
                    }}
                    className="text-xs text-rose-400 hover:text-rose-300 flex items-center gap-1"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    Remove
                  </button>
                </div>
              )}
            </div>
          )}

          {/* TAB 5: AUDIO & MUSIC */}
          {activeTab === 'audio' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Music2 className="w-4 h-4 text-rose-400" />
                  <span className="text-xs font-semibold text-neutral-200 truncate max-w-[180px]">
                    {sound.title}
                  </span>
                </div>
                <button
                  onClick={() => setIsSoundPickerOpen(true)}
                  className="px-3 py-1 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 rounded-full text-xs font-semibold border border-neutral-700"
                >
                  Change Sound
                </button>
              </div>

              {/* Volume Balance Mix */}
              <div className="space-y-2 pt-1">
                <div className="space-y-1">
                  <div className="flex justify-between text-[11px] text-neutral-400">
                    <span>Original Clip Audio</span>
                    <span className="font-mono">{originalVolume}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={originalVolume}
                    onChange={(e) => setOriginalVolume(parseInt(e.target.value))}
                    className="w-full accent-rose-500 h-1.5 bg-neutral-800 rounded-lg"
                  />
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between text-[11px] text-neutral-400">
                    <span>Soundtrack Volume</span>
                    <span className="font-mono">{soundtrackVolume}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={soundtrackVolume}
                    onChange={(e) => setSoundtrackVolume(parseInt(e.target.value))}
                    className="w-full accent-rose-500 h-1.5 bg-neutral-800 rounded-lg"
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB 6: SPEED */}
          {activeTab === 'speed' && (
            <div className="space-y-3">
              <span className="text-xs font-semibold text-neutral-200">Clip Playback Speed:</span>
              <div className="grid grid-cols-6 gap-2">
                {[0.5, 0.75, 1, 1.25, 1.5, 2].map((s) => (
                  <button
                    key={s}
                    onClick={() => {
                      setSpeed(s);
                      soundEngine.playTone(500, 'sine', 0.05, 0.08);
                    }}
                    className={`py-2 rounded-xl text-xs font-mono font-bold transition-all border ${
                      speed === s
                        ? 'bg-rose-500 text-white border-rose-400 shadow-md shadow-rose-500/25'
                        : 'bg-neutral-800 text-neutral-300 border-neutral-700 hover:border-neutral-600'
                    }`}
                  >
                    {s}x
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Bottom Tab Bar for Editor Actions */}
        <div className="grid grid-cols-6 border-t border-neutral-800 bg-neutral-900/90 py-2">
          {[
            { id: 'trim', label: 'Trim', icon: Scissors },
            { id: 'filter', label: 'Filters', icon: Sparkles },
            { id: 'text', label: 'Text', icon: Type },
            { id: 'stickers', label: 'Stickers', icon: Smile },
            { id: 'audio', label: 'Audio', icon: Music2 },
            { id: 'speed', label: 'Speed', icon: Gauge },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id as EditorTab);
                  soundEngine.playTone(400, 'sine', 0.03, 0.05);
                }}
                className={`flex flex-col items-center gap-1 py-1 transition-colors ${
                  isActive ? 'text-rose-500' : 'text-neutral-400 hover:text-neutral-200'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="text-[10px] font-medium tracking-tight">{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Soundtrack Picker Modal */}
      <SoundPickerModal
        isOpen={isSoundPickerOpen}
        onClose={() => setIsSoundPickerOpen(false)}
        selectedSoundId={sound?.id}
        onSelectSound={(chosen) => setSound(chosen)}
      />
    </div>
  );
};
