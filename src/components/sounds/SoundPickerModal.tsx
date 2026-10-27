import React, { useState } from 'react';
import { X, Play, Pause, Music2, Check, Search } from 'lucide-react';
import { SoundTrack } from '../../types/video';
import { POPULAR_SOUNDS } from '../../data/mockVideos';
import { soundEngine } from '../../utils/audioSynth';

interface SoundPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedSoundId?: string;
  onSelectSound: (sound: SoundTrack) => void;
}

export const SoundPickerModal: React.FC<SoundPickerModalProps> = ({
  isOpen,
  onClose,
  selectedSoundId,
  onSelectSound,
}) => {
  const [playingId, setPlayingId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  if (!isOpen) return null;

  const handleTogglePlay = (sound: SoundTrack) => {
    if (playingId === sound.id) {
      soundEngine.stopCurrentLoop();
      setPlayingId(null);
    } else {
      soundEngine.stopCurrentLoop();
      soundEngine.startMusicLoop(sound.genre);
      setPlayingId(sound.id);
    }
  };

  const handleChoose = (sound: SoundTrack) => {
    soundEngine.stopCurrentLoop();
    setPlayingId(null);
    onSelectSound(sound);
    onClose();
  };

  const handleClose = () => {
    soundEngine.stopCurrentLoop();
    setPlayingId(null);
    onClose();
  };

  const filtered = POPULAR_SOUNDS.filter(
    (s) =>
      s.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.artist.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.genre.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-end">
      <div className="fixed inset-0 bg-black/60 backdrop-blur-xs" onClick={handleClose} />

      <div className="relative w-full max-w-lg mx-auto bg-neutral-900 border-t border-neutral-800 rounded-t-3xl h-[70vh] max-h-[580px] flex flex-col shadow-2xl z-10 animate-in slide-in-from-bottom duration-200">
        <div className="w-10 h-1 bg-neutral-700 rounded-full mx-auto mt-2.5 mb-2 cursor-grab" />

        <div className="flex items-center justify-between px-4 pb-3 border-b border-neutral-800">
          <div className="flex items-center gap-2">
            <Music2 className="w-5 h-5 text-rose-500" />
            <h3 className="text-sm font-bold text-neutral-100">Soundtrack &amp; Audio</h3>
          </div>
          <button
            onClick={handleClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-neutral-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search */}
        <div className="p-3 border-b border-neutral-800">
          <div className="relative flex items-center">
            <Search className="w-4 h-4 text-neutral-400 absolute left-3 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search sounds, artists, genres..."
              className="w-full bg-neutral-800 text-xs text-neutral-100 pl-9 pr-4 py-2.5 rounded-full placeholder:text-neutral-500 focus:outline-none focus:ring-1 focus:ring-neutral-400"
            />
          </div>
        </div>

        {/* Sounds List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2.5 no-scrollbar">
          {filtered.map((sound) => {
            const isPlaying = playingId === sound.id;
            const isSelected = selectedSoundId === sound.id;

            return (
              <div
                key={sound.id}
                className={`flex items-center justify-between p-3 rounded-2xl transition-all border ${
                  isSelected
                    ? 'bg-rose-950/20 border-rose-500/50'
                    : 'bg-neutral-800/60 border-neutral-800 hover:border-neutral-700'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <button
                    onClick={() => handleTogglePlay(sound)}
                    className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 transition-transform active:scale-95 ${
                      isPlaying
                        ? 'bg-rose-500 text-white shadow-lg shadow-rose-500/25'
                        : 'bg-neutral-700 text-white hover:bg-neutral-600'
                    }`}
                  >
                    {isPlaying ? <Pause className="w-5 h-5 fill-current" /> : <Play className="w-5 h-5 fill-current ml-0.5" />}
                  </button>

                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-bold text-neutral-100 truncate">{sound.title}</p>
                    <p className="text-[11px] text-neutral-400 mt-0.5 truncate">
                      {sound.artist} · <span className="uppercase text-neutral-500 font-mono">{sound.genre}</span> · {sound.duration}s
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => handleChoose(sound)}
                  className={`ml-3 px-3.5 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                    isSelected
                      ? 'bg-rose-500 text-white'
                      : 'bg-neutral-700 hover:bg-neutral-600 text-neutral-200'
                  }`}
                >
                  {isSelected && <Check className="w-3.5 h-3.5" />}
                  {isSelected ? 'Selected' : 'Use'}
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
