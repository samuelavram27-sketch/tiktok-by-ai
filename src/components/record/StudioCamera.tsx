import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  Camera,
  RotateCcw,
  Sparkles,
  Timer,
  Gauge,
  Check,
  Upload,
  X,
  Music2,
  Trash2,
  Globe,
  Wand2,
} from 'lucide-react';
import { SoundTrack, FilterSettings } from '../../types/video';
import { SoundPickerModal } from '../sounds/SoundPickerModal';
import { GoogleMediaSearchModal } from '../studio/GoogleMediaSearchModal';
import { CreativeVideoGeneratorModal } from '../studio/CreativeVideoGeneratorModal';
import { FILTER_PRESETS, getFilterStyleString } from '../../utils/filterStyles';
import { soundEngine } from '../../utils/audioSynth';

interface StudioCameraProps {
  onClose: () => void;
  onFinishRecording: (
    mediaUrl: string,
    selectedSound?: SoundTrack,
    initialFilter?: FilterSettings,
    mediaType?: 'video' | 'image'
  ) => void;
}

interface RecordedSegment {
  blob: Blob;
  duration: number;
}

export const StudioCamera: React.FC<StudioCameraProps> = ({ onClose, onFinishRecording }) => {
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('user');
  const [studioMode, setStudioMode] = useState<'video' | 'photo'>('video');
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [maxDuration, setMaxDuration] = useState<15 | 30 | 60>(15);
  const [speed, setSpeed] = useState<0.5 | 1 | 2 | 3>(1);
  const [timerMode, setTimerMode] = useState<0 | 3 | 10>(0);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [segments, setSegments] = useState<RecordedSegment[]>([]);
  const [selectedSound, setSelectedSound] = useState<SoundTrack | undefined>(undefined);
  const [isSoundPickerOpen, setIsSoundPickerOpen] = useState(false);
  const [isGoogleSearchOpen, setIsGoogleSearchOpen] = useState(false);
  const [isAiGeneratorOpen, setIsAiGeneratorOpen] = useState(false);
  const [selectedFilterPreset, setSelectedFilterPreset] = useState<string>('none');
  const [showFilterPicker, setShowFilterPicker] = useState(false);
  const [isFlashing, setIsFlashing] = useState(false);

  const videoRef = useRef<HTMLVideoElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const segmentChunksRef = useRef<Blob[]>([]);
  const timerIntervalRef = useRef<number | null>(null);
  const segmentStartTimeRef = useRef<number>(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Initialize camera
  const startCamera = useCallback(async (facing: 'user' | 'environment') => {
    try {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
      setCameraError(null);
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: facing,
          width: { ideal: 720 },
          height: { ideal: 1280 },
        },
        audio: true,
      });

      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (err: unknown) {
      console.warn('Camera access denied or unavailable', err);
      setCameraError(
        'Camera or microphone not active. You can search Google media, generate AI motion clips, or upload from device.'
      );
    }
  }, [stream]);

  useEffect(() => {
    startCamera(facingMode);
    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
      }
      soundEngine.stopCurrentLoop();
    };
  }, [facingMode, startCamera]);

  // Flip front/back camera
  const handleToggleFacingMode = () => {
    soundEngine.playTone(600, 'sine', 0.08, 0.1);
    setFacingMode((prev) => (prev === 'user' ? 'environment' : 'user'));
  };

  // Start recording actual segment
  const startRecordingSegment = () => {
    if (!stream) return;
    soundEngine.playRecordBeep(true);
    if (selectedSound) {
      soundEngine.startMusicLoop(selectedSound.genre);
    }

    segmentChunksRef.current = [];

    const mimeTypes = [
      'video/webm;codecs=vp9,opus',
      'video/webm;codecs=vp8,opus',
      'video/webm',
      'video/mp4',
    ];
    let selectedMime = '';
    for (const m of mimeTypes) {
      if (MediaRecorder.isTypeSupported(m)) {
        selectedMime = m;
        break;
      }
    }

    try {
      const options = selectedMime ? { mimeType: selectedMime } : undefined;
      const mediaRecorder = new MediaRecorder(stream, options);
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) {
          segmentChunksRef.current.push(e.data);
        }
      };

      mediaRecorder.onstop = () => {
        soundEngine.stopCurrentLoop();
        const segBlob = new Blob(segmentChunksRef.current, {
          type: selectedMime || 'video/webm',
        });
        const durationTaken = (Date.now() - segmentStartTimeRef.current) / 1000;
        setSegments((prev) => [...prev, { blob: segBlob, duration: durationTaken }]);
      };

      mediaRecorder.start(200);
      segmentStartTimeRef.current = Date.now();
      setIsRecording(true);

      timerIntervalRef.current = window.setInterval(() => {
        setRecordingTime((prev) => {
          const next = prev + 0.1;
          if (next >= maxDuration) {
            stopRecordingSegment();
            return maxDuration;
          }
          return next;
        });
      }, 100);
    } catch (err) {
      console.error('Failed to start MediaRecorder', err);
    }
  };

  // Stop recording segment
  const stopRecordingSegment = () => {
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
    }
    soundEngine.playRecordBeep(false);
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
    }
    setIsRecording(false);
  };

  // Snap photo in photo mode
  const snapPhoto = () => {
    soundEngine.playTone(840, 'triangle', 0.12, 0.2);
    setIsFlashing(true);
    setTimeout(() => setIsFlashing(false), 200);

    const video = videoRef.current;
    const filterObj = FILTER_PRESETS.find((p) => p.id === selectedFilterPreset)?.settings;

    if (video && video.videoWidth > 0) {
      const canvas = document.createElement('canvas');
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        if (facingMode === 'user') {
          ctx.translate(canvas.width, 0);
          ctx.scale(-1, 1);
        }
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL('image/jpeg', 0.95);
        onFinishRecording(dataUrl, selectedSound, filterObj, 'image');
        return;
      }
    }

    // Fallback: use high-quality photo sample
    const fallbackPhoto = '/src/assets/images/photo_post_tokyo_sunset_1793111322605.jpg';
    onFinishRecording(fallbackPhoto, selectedSound, filterObj, 'image');
  };

  // Trigger countdown then record/snap
  const handleShutterClick = () => {
    if (studioMode === 'photo') {
      snapPhoto();
      return;
    }

    if (isRecording) {
      stopRecordingSegment();
    } else {
      if (timerMode > 0) {
        let count = timerMode;
        setCountdown(count);
        soundEngine.playCountdownBeep(false);

        const cdInterval = window.setInterval(() => {
          count -= 1;
          if (count > 0) {
            setCountdown(count);
            soundEngine.playCountdownBeep(false);
          } else {
            clearInterval(cdInterval);
            setCountdown(null);
            soundEngine.playCountdownBeep(true);
            startRecordingSegment();
          }
        }, 1000);
      } else {
        startRecordingSegment();
      }
    }
  };

  // Delete last take
  const handleDeleteLastSegment = () => {
    soundEngine.playTone(320, 'sawtooth', 0.1, 0.1);
    if (segments.length === 0) return;
    const lastSeg = segments[segments.length - 1];
    setRecordingTime((prev) => Math.max(0, prev - lastSeg.duration));
    setSegments((prev) => prev.slice(0, prev.length - 1));
  };

  // Finish and open editor with combined clip
  const handleFinishAndEdit = () => {
    if (segments.length === 0) return;
    soundEngine.playTone(700, 'triangle', 0.15, 0.2);

    const finalBlob = new Blob(
      segments.map((s) => s.blob),
      { type: segments[0].blob.type }
    );
    const videoUrl = URL.createObjectURL(finalBlob);
    const filterObj = FILTER_PRESETS.find((p) => p.id === selectedFilterPreset)?.settings;
    onFinishRecording(videoUrl, selectedSound, filterObj, 'video');
  };

  // File upload fallback for both video and images
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      const isImage = file.type.startsWith('image/');
      const filterObj = FILTER_PRESETS.find((p) => p.id === selectedFilterPreset)?.settings;
      onFinishRecording(url, selectedSound, filterObj, isImage ? 'image' : 'video');
    }
  };

  const currentFilterSettings = FILTER_PRESETS.find(
    (p) => p.id === selectedFilterPreset
  )?.settings;
  const filterStyleString = getFilterStyleString(currentFilterSettings);
  const totalProgressPercent = Math.min(100, (recordingTime / maxDuration) * 100);

  return (
    <div className="fixed inset-0 z-50 bg-black flex flex-col justify-between overflow-hidden select-none">
      {/* Hidden file input for uploading existing video clips or photos */}
      <input
        ref={fileInputRef}
        type="file"
        accept="video/mp4,video/webm,video/quicktime,video/*,image/jpeg,image/png,image/webp,image/*"
        className="hidden"
        onChange={handleFileUpload}
      />

      {/* Camera Live Viewfinder / Canvas */}
      <div className="absolute inset-0 z-0 flex items-center justify-center bg-neutral-950">
        {!cameraError ? (
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className={`w-full h-full object-cover transition-all ${
              facingMode === 'user' ? 'scale-x-[-1]' : ''
            }`}
            style={{ filter: filterStyleString }}
          />
        ) : (
          <div className="flex flex-col items-center justify-center p-6 text-center text-neutral-300 max-w-sm">
            <div className="w-16 h-16 rounded-full bg-neutral-900 border border-neutral-800 flex items-center justify-center mb-4">
              <Camera className="w-8 h-8 text-neutral-400" />
            </div>
            <p className="text-sm font-semibold text-neutral-100 mb-1">Creation Studio Ready</p>
            <p className="text-xs text-neutral-400 mb-6 leading-relaxed">
              Snap photos, search Google for trending video clips, generate original motion loops, or import media from device!
            </p>
            <div className="flex flex-col gap-2.5 w-full">
              <button
                onClick={() => setIsGoogleSearchOpen(true)}
                className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-full text-xs font-semibold flex items-center justify-center gap-2 shadow-lg shadow-blue-600/25 active:scale-95 transition-transform"
              >
                <Globe className="w-4 h-4" />
                Search Google &amp; Web Media
              </button>
              <button
                onClick={() => setIsAiGeneratorOpen(true)}
                className="w-full py-2.5 bg-gradient-to-r from-rose-500 to-cyan-500 hover:opacity-90 text-white rounded-full text-xs font-semibold flex items-center justify-center gap-2 shadow-lg shadow-rose-500/20 active:scale-95 transition-transform"
              >
                <Wand2 className="w-4 h-4" />
                Create Animated Motion Video
              </button>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="w-full py-2.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 rounded-full text-xs font-semibold flex items-center justify-center gap-2 border border-neutral-700 transition-colors"
              >
                <Upload className="w-4 h-4" />
                Upload Photo or Video
              </button>
            </div>
          </div>
        )}

        {/* Shutter flash effect */}
        {isFlashing && (
          <div className="absolute inset-0 bg-white z-40 animate-out fade-out duration-200 pointer-events-none" />
        )}

        {/* Countdown Overlay */}
        {countdown !== null && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-xs z-30 pointer-events-none">
            <span className="text-8xl font-black text-white font-mono animate-ping">
              {countdown}
            </span>
          </div>
        )}
      </div>

      {/* Top Controls Header */}
      <div className="relative z-20 pt-4 px-4 bg-gradient-to-b from-black/80 via-black/40 to-transparent">
        {/* Progress bar across takes in video mode */}
        {studioMode === 'video' && (
          <div className="w-full h-1.5 bg-neutral-800/80 rounded-full overflow-hidden flex items-center mb-3">
            <div
              className="h-full bg-rose-500 transition-all duration-100"
              style={{ width: `${totalProgressPercent}%` }}
            />
          </div>
        )}

        <div className="flex items-center justify-between">
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-full bg-black/40 backdrop-blur-md text-white flex items-center justify-center hover:bg-black/60 transition-colors"
            aria-label="Close studio"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Sound selector button */}
          <button
            onClick={() => setIsSoundPickerOpen(true)}
            className="px-3.5 py-1.5 rounded-full bg-black/40 backdrop-blur-md text-white text-xs font-semibold flex items-center gap-1.5 hover:bg-black/60 transition-colors border border-white/10 max-w-[170px]"
          >
            <Music2 className="w-3.5 h-3.5 text-rose-400 shrink-0" />
            <span className="truncate">
              {selectedSound ? selectedSound.title : 'Add Sound'}
            </span>
          </button>

          {/* Google Search & AI Video creation shortcuts */}
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setIsGoogleSearchOpen(true)}
              className="w-9 h-9 rounded-full bg-black/40 backdrop-blur-md text-blue-400 flex items-center justify-center hover:bg-black/60 border border-blue-400/30 transition-colors"
              title="Search Google Media"
            >
              <Globe className="w-4 h-4" />
            </button>
            <button
              onClick={() => setIsAiGeneratorOpen(true)}
              className="w-9 h-9 rounded-full bg-black/40 backdrop-blur-md text-cyan-400 flex items-center justify-center hover:bg-black/60 border border-cyan-400/30 transition-colors"
              title="Create Motion Video"
            >
              <Wand2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Right Studio Tools Column */}
      <div className="relative z-20 self-end mr-4 flex flex-col items-center gap-4.5 bg-black/30 backdrop-blur-md p-2 rounded-2xl border border-white/5">
        {/* Flip camera */}
        <button
          onClick={handleToggleFacingMode}
          className="flex flex-col items-center gap-1 text-white hover:text-rose-400 transition-colors"
          title="Flip camera"
        >
          <RotateCcw className="w-5 h-5" />
          <span className="text-[10px] font-medium">Flip</span>
        </button>

        {/* Speed button (video mode) */}
        {studioMode === 'video' && (
          <button
            onClick={() => {
              soundEngine.playTone(500, 'sine', 0.05, 0.08);
              const speeds: (0.5 | 1 | 2 | 3)[] = [0.5, 1, 2, 3];
              const nextIdx = (speeds.indexOf(speed) + 1) % speeds.length;
              setSpeed(speeds[nextIdx]);
            }}
            className="flex flex-col items-center gap-1 text-white hover:text-amber-400 transition-colors"
            title="Playback speed"
          >
            <Gauge className="w-5 h-5" />
            <span className="text-[10px] font-mono font-medium">{speed}x</span>
          </button>
        )}

        {/* Filters button */}
        <button
          onClick={() => setShowFilterPicker((prev) => !prev)}
          className={`flex flex-col items-center gap-1 transition-colors ${
            selectedFilterPreset !== 'none' ? 'text-rose-400' : 'text-white hover:text-rose-300'
          }`}
          title="Color filters"
        >
          <Sparkles className="w-5 h-5" />
          <span className="text-[10px] font-medium">Filters</span>
        </button>

        {/* Timer countdown */}
        <button
          onClick={() => {
            soundEngine.playTone(600, 'triangle', 0.05, 0.08);
            const modes: (0 | 3 | 10)[] = [0, 3, 10];
            const nextIdx = (modes.indexOf(timerMode) + 1) % modes.length;
            setTimerMode(modes[nextIdx]);
          }}
          className={`flex flex-col items-center gap-1 transition-colors ${
            timerMode > 0 ? 'text-amber-400' : 'text-white hover:text-amber-300'
          }`}
          title="Countdown timer"
        >
          <Timer className="w-5 h-5" />
          <span className="text-[10px] font-mono font-medium">
            {timerMode === 0 ? 'Off' : `${timerMode}s`}
          </span>
        </button>
      </div>

      {/* Filter Presets Shelf (when open) */}
      {showFilterPicker && (
        <div className="relative z-30 mx-4 p-3 bg-neutral-900/95 backdrop-blur-md rounded-2xl border border-neutral-800 animate-in slide-in-from-bottom duration-150">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-neutral-200">Color Grading</span>
            <button
              onClick={() => setShowFilterPicker(false)}
              className="text-neutral-400 hover:text-white text-xs"
            >
              Done
            </button>
          </div>
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
            {FILTER_PRESETS.map((preset) => (
              <button
                key={preset.id}
                onClick={() => {
                  setSelectedFilterPreset(preset.id);
                  soundEngine.playTone(450, 'sine', 0.05, 0.08);
                }}
                className={`px-3 py-1.5 rounded-xl text-xs whitespace-nowrap transition-all border ${
                  selectedFilterPreset === preset.id
                    ? 'bg-rose-500 text-white border-rose-400 shadow-md shadow-rose-500/25'
                    : 'bg-neutral-800 text-neutral-300 border-neutral-700 hover:border-neutral-600'
                }`}
              >
                {preset.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Bottom Shutter & Controls Section */}
      <div className="relative z-20 pb-8 pt-3 px-6 bg-gradient-to-t from-black/95 via-black/60 to-transparent">
        {/* TikTok-style Mode Switcher (Photo | 15s | 30s | 60s) */}
        <div className="flex items-center justify-center gap-6 mb-4 text-xs font-semibold">
          <button
            onClick={() => {
              if (segments.length === 0) {
                setStudioMode('photo');
                soundEngine.playTone(550, 'sine', 0.04, 0.05);
              }
            }}
            disabled={segments.length > 0}
            className={`transition-colors ${
              studioMode === 'photo' ? 'text-white font-bold scale-110' : 'text-neutral-500'
            }`}
          >
            Photo
          </button>

          {[15, 30, 60].map((sec) => (
            <button
              key={sec}
              onClick={() => {
                if (segments.length === 0) {
                  setStudioMode('video');
                  setMaxDuration(sec as 15 | 30 | 60);
                  soundEngine.playTone(500, 'sine', 0.04, 0.05);
                }
              }}
              disabled={segments.length > 0}
              className={`transition-colors ${
                studioMode === 'video' && maxDuration === sec
                  ? 'text-white font-bold scale-110'
                  : 'text-neutral-500'
              }`}
            >
              {sec}s
            </button>
          ))}
        </div>

        {/* Shutter row with Delete Take, Shutter, and Next / Upload */}
        <div className="flex items-center justify-between max-w-sm mx-auto">
          {/* Delete take button */}
          <div className="w-14 flex justify-center">
            {segments.length > 0 && !isRecording && (
              <button
                onClick={handleDeleteLastSegment}
                className="w-11 h-11 rounded-full bg-neutral-800/80 hover:bg-neutral-700 text-rose-400 flex items-center justify-center transition-all active:scale-95"
                title="Delete last take"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            )}
          </div>

          {/* Shutter Button (Adapts to Photo vs Video) */}
          <button
            onClick={handleShutterClick}
            className="relative w-20 h-20 rounded-full flex items-center justify-center transition-transform active:scale-95"
            aria-label={
              studioMode === 'photo'
                ? 'Take photo'
                : isRecording
                ? 'Pause recording'
                : 'Start recording'
            }
          >
            {/* Outer ring */}
            <div
              className={`absolute inset-0 rounded-full border-4 transition-all duration-200 ${
                studioMode === 'photo'
                  ? 'border-white/90 hover:border-white'
                  : isRecording
                  ? 'border-rose-500 scale-110 animate-pulse'
                  : 'border-white/90 hover:border-white'
              }`}
            />
            {/* Inner core */}
            <div
              className={`transition-all duration-200 ${
                studioMode === 'photo'
                  ? 'w-15 h-15 rounded-full bg-white hover:bg-neutral-200'
                  : isRecording
                  ? 'w-7 h-7 rounded-md bg-rose-500'
                  : 'w-16 h-16 rounded-full bg-rose-500 hover:bg-rose-600'
              }`}
            />
          </button>

          {/* Next / Checkmark button or Upload button */}
          <div className="w-14 flex justify-center">
            {segments.length > 0 ? (
              <button
                onClick={handleFinishAndEdit}
                className="w-11 h-11 rounded-full bg-rose-500 hover:bg-rose-600 text-white flex items-center justify-center shadow-lg shadow-rose-500/30 transition-all active:scale-95"
                title="Proceed to editor"
              >
                <Check className="w-6 h-6 stroke-[3]" />
              </button>
            ) : (
              <button
                onClick={() => fileInputRef.current?.click()}
                className="flex flex-col items-center gap-1 text-white hover:text-neutral-300 transition-colors"
                title="Upload photo or video from device"
              >
                <div className="w-10 h-10 rounded-xl bg-neutral-800/80 border border-neutral-700 flex items-center justify-center">
                  <Upload className="w-5 h-5 text-neutral-300" />
                </div>
                <span className="text-[10px] font-medium text-neutral-400">Upload</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Sound Picker Modal */}
      <SoundPickerModal
        isOpen={isSoundPickerOpen}
        onClose={() => setIsSoundPickerOpen(false)}
        selectedSoundId={selectedSound?.id}
        onSelectSound={(sound) => setSelectedSound(sound)}
      />

      {/* Google & Web Media Search Modal */}
      <GoogleMediaSearchModal
        isOpen={isGoogleSearchOpen}
        onClose={() => setIsGoogleSearchOpen(false)}
        onImportMedia={(media) => {
          const filterObj = FILTER_PRESETS.find((p) => p.id === selectedFilterPreset)?.settings;
          onFinishRecording(media.url, selectedSound, filterObj, media.type);
        }}
      />

      {/* AI Creative Video Generator Modal */}
      <CreativeVideoGeneratorModal
        isOpen={isAiGeneratorOpen}
        onClose={() => setIsAiGeneratorOpen(false)}
        onGenerated={(videoBlobUrl) => {
          const filterObj = FILTER_PRESETS.find((p) => p.id === selectedFilterPreset)?.settings;
          onFinishRecording(videoBlobUrl, selectedSound, filterObj, 'video');
        }}
      />
    </div>
  );
};
