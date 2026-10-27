import React, { useState, useRef, useEffect } from 'react';
import { X, Sparkles, Play, Check, Wand2, Film, RefreshCw } from 'lucide-react';
import { soundEngine } from '../../utils/audioSynth';

interface CreativeVideoGeneratorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onGenerated: (videoBlobUrl: string) => void;
}

type GeneratorTheme = 'synthwave' | 'vortex' | 'spectrum' | 'ocean' | 'matrix';

export const CreativeVideoGeneratorModal: React.FC<CreativeVideoGeneratorModalProps> = ({
  isOpen,
  onClose,
  onGenerated,
}) => {
  const [theme, setTheme] = useState<GeneratorTheme>('synthwave');
  const [colorScheme, setColorScheme] = useState<'neon' | 'golden' | 'emerald' | 'cyan'>('neon');
  const [isRecording, setIsRecording] = useState(false);
  const [recordingProgress, setRecordingProgress] = useState(0);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animFrameRef = useRef<number | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let t = 0;
    const render = () => {
      t += 0.035;
      const w = canvas.width;
      const h = canvas.height;

      // Primary color mapping
      const colors = {
        neon: { primary: '#ec4899', secondary: '#06b6d4', dark: '#0a0a1a' },
        golden: { primary: '#f59e0b', secondary: '#ef4444', dark: '#1c1005' },
        emerald: { primary: '#10b981', secondary: '#3b82f6', dark: '#021810' },
        cyan: { primary: '#38bdf8', secondary: '#818cf8', dark: '#031024' },
      }[colorScheme];

      ctx.fillStyle = colors.dark;
      ctx.fillRect(0, 0, w, h);

      if (theme === 'synthwave') {
        // Horizon grid + Sun
        const horizon = h * 0.58;

        // Starry sky
        for (let i = 0; i < 25; i++) {
          const sx = (Math.sin(i * 99 + t * 0.1) * 0.5 + 0.5) * w;
          const sy = (Math.cos(i * 33) * 0.5 + 0.5) * horizon;
          ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
          ctx.fillRect(sx, sy, 2, 2);
        }

        // Retro Glowing Sun
        const sunRadius = 65;
        const sunGrad = ctx.createLinearGradient(0, horizon - sunRadius * 1.5, 0, horizon);
        sunGrad.addColorStop(0, colors.secondary);
        sunGrad.addColorStop(1, colors.primary);
        ctx.fillStyle = sunGrad;
        ctx.beginPath();
        ctx.arc(w / 2, horizon - 20, sunRadius, 0, Math.PI * 2);
        ctx.fill();

        // Horizontal sun slices
        ctx.fillStyle = colors.dark;
        for (let i = 0; i < 6; i++) {
          const sy = horizon - 45 + i * 9;
          ctx.fillRect(w / 2 - sunRadius - 5, sy, (sunRadius + 5) * 2, 2 + i * 0.8);
        }

        // Perspective Grid
        ctx.strokeStyle = colors.primary;
        ctx.lineWidth = 1.5;

        // Vanishing lines
        for (let x = -w * 0.5; x <= w * 1.5; x += 40) {
          ctx.beginPath();
          ctx.moveTo(w / 2, horizon);
          ctx.lineTo(x + Math.sin(t) * 10, h);
          ctx.stroke();
        }

        // Horizontal rolling bars
        const offset = (t * 40) % 30;
        for (let y = horizon; y <= h; y += 18) {
          const py = y + offset;
          if (py < h) {
            ctx.beginPath();
            ctx.moveTo(0, py);
            ctx.lineTo(w, py);
            ctx.stroke();
          }
        }
      } else if (theme === 'vortex') {
        // Hypnotic spiral galaxy
        ctx.save();
        ctx.translate(w / 2, h / 2);
        for (let i = 0; i < 180; i++) {
          const angle = i * 0.2 + t * 1.5;
          const dist = i * 2.2;
          const px = Math.cos(angle) * dist;
          const py = Math.sin(angle) * dist;
          ctx.fillStyle = i % 2 === 0 ? colors.primary : colors.secondary;
          ctx.beginPath();
          ctx.arc(px, py, 2.5 + Math.sin(t + i) * 1.5, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.restore();
      } else if (theme === 'spectrum') {
        // Equalizer waves
        const bars = 24;
        const barWidth = w / bars;
        for (let i = 0; i < bars; i++) {
          const height = Math.abs(Math.sin(t * 3 + i * 0.4)) * (h * 0.45) + 30;
          const grad = ctx.createLinearGradient(0, h / 2 - height / 2, 0, h / 2 + height / 2);
          grad.addColorStop(0, colors.secondary);
          grad.addColorStop(0.5, colors.primary);
          grad.addColorStop(1, colors.secondary);
          ctx.fillStyle = grad;
          ctx.fillRect(i * barWidth + 2, h / 2 - height / 2, barWidth - 4, height);
        }
      } else if (theme === 'ocean') {
        // Ambient liquid waves
        for (let layer = 0; layer < 4; layer++) {
          ctx.beginPath();
          ctx.moveTo(0, h * 0.4);
          for (let x = 0; x <= w; x += 10) {
            const y =
              h * (0.45 + layer * 0.12) +
              Math.sin(x * 0.015 + t * 2 + layer) * 25 +
              Math.cos(t * 1.2 + x * 0.01) * 15;
            ctx.lineTo(x, y);
          }
          ctx.lineTo(w, h);
          ctx.lineTo(0, h);
          ctx.closePath();
          ctx.fillStyle =
            layer % 2 === 0 ? `${colors.primary}66` : `${colors.secondary}66`;
          ctx.fill();
        }
      } else if (theme === 'matrix') {
        // Digital code stream
        ctx.fillStyle = colors.primary;
        ctx.font = '14px monospace';
        const cols = 20;
        for (let i = 0; i < cols; i++) {
          const x = i * (w / cols);
          const y = ((t * 80 + i * 45) % h);
          const char = String.fromCharCode(65 + ((i + Math.floor(t * 5)) % 50));
          ctx.fillText(char, x, y);
          ctx.fillText(String.fromCharCode(48 + (i % 10)), x, (y + 50) % h);
        }
      }

      animFrameRef.current = requestAnimationFrame(render);
    };

    render();

    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [isOpen, theme, colorScheme]);

  if (!isOpen) return null;

  // Record 5 seconds of the canvas into a real video WebM blob
  const handleGenerateVideo = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    soundEngine.playTone(660, 'triangle', 0.1, 0.15);
    setIsRecording(true);
    setRecordingProgress(0);

    const stream = canvas.captureStream(30); // 30 fps
    const chunks: Blob[] = [];

    let mime = 'video/webm;codecs=vp9';
    if (!MediaRecorder.isTypeSupported(mime)) {
      mime = 'video/webm';
    }

    const recorder = new MediaRecorder(stream, { mimeType: mime });
    recorder.ondataavailable = (e) => {
      if (e.data && e.data.size > 0) chunks.push(e.data);
    };

    recorder.onstop = () => {
      setIsRecording(false);
      const blob = new Blob(chunks, { type: mime });
      const url = URL.createObjectURL(blob);
      soundEngine.playTone(880, 'sine', 0.15, 0.2);
      onGenerated(url);
      onClose();
    };

    recorder.start();

    // 5 second record countdown
    let prog = 0;
    const interval = setInterval(() => {
      prog += 20;
      setRecordingProgress(Math.min(100, prog));
      if (prog >= 100) {
        clearInterval(interval);
        recorder.stop();
      }
    }, 1000);
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-end">
      <div className="fixed inset-0 bg-black/70 backdrop-blur-xs" onClick={onClose} />

      <div className="relative w-full max-w-lg mx-auto bg-neutral-900 border-t border-neutral-800 rounded-t-3xl max-h-[85vh] h-[660px] flex flex-col shadow-2xl z-10 animate-in slide-in-from-bottom duration-200 text-white select-none">
        <div className="w-10 h-1 bg-neutral-700 rounded-full mx-auto mt-2.5 mb-1 cursor-grab" />

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-neutral-800">
          <div className="flex items-center gap-2">
            <span className="w-7 h-7 rounded-lg bg-cyan-500/20 text-cyan-400 flex items-center justify-center">
              <Wand2 className="w-4 h-4" />
            </span>
            <div>
              <h3 className="text-xs font-bold text-neutral-100">AI &amp; Motion Video Generator</h3>
              <p className="text-[10px] text-neutral-400">Create original looping motion clips</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-neutral-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Canvas Preview Area */}
        <div className="p-4 flex items-center justify-center bg-black flex-1 min-h-0">
          <div className="relative h-full aspect-[9/16] rounded-2xl overflow-hidden border border-neutral-800 shadow-xl bg-neutral-950 flex items-center justify-center">
            <canvas
              ref={canvasRef}
              width={360}
              height={640}
              className="w-full h-full object-cover"
            />
            {isRecording && (
              <div className="absolute inset-0 bg-black/40 backdrop-blur-xs flex flex-col items-center justify-center gap-2">
                <div className="w-10 h-10 rounded-full border-3 border-rose-500 border-t-transparent animate-spin" />
                <span className="text-xs font-bold text-white font-mono">
                  Rendering Video ({recordingProgress}%)
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Controls Suite */}
        <div className="p-4 bg-neutral-900 border-t border-neutral-800 space-y-3">
          {/* Theme Selector */}
          <div>
            <span className="text-xs font-semibold text-neutral-300 block mb-1.5">Motion Theme</span>
            <div className="grid grid-cols-5 gap-1.5">
              {[
                { id: 'synthwave', label: 'Synthwave' },
                { id: 'vortex', label: 'Vortex' },
                { id: 'spectrum', label: 'Spectrum' },
                { id: 'ocean', label: 'Liquid' },
                { id: 'matrix', label: 'Matrix' },
              ].map((m) => (
                <button
                  key={m.id}
                  onClick={() => {
                    soundEngine.playTone(500, 'sine', 0.04, 0.06);
                    setTheme(m.id as GeneratorTheme);
                  }}
                  className={`py-1.5 rounded-xl text-[11px] font-semibold transition-all border ${
                    theme === m.id
                      ? 'bg-rose-500 border-rose-400 text-white shadow-sm'
                      : 'bg-neutral-800/80 border-neutral-700 text-neutral-400 hover:text-neutral-200'
                  }`}
                >
                  {m.label}
                </button>
              ))}
            </div>
          </div>

          {/* Color Palette */}
          <div className="flex items-center justify-between pt-1">
            <span className="text-xs font-semibold text-neutral-300">Color Palette</span>
            <div className="flex items-center gap-2">
              {[
                { id: 'neon', color: '#ec4899' },
                { id: 'golden', color: '#f59e0b' },
                { id: 'emerald', color: '#10b981' },
                { id: 'cyan', color: '#38bdf8' },
              ].map((c) => (
                <button
                  key={c.id}
                  onClick={() => setColorScheme(c.id as 'neon' | 'golden' | 'emerald' | 'cyan')}
                  className={`w-6 h-6 rounded-full border-2 transition-transform ${
                    colorScheme === c.id ? 'scale-125 border-white' : 'border-neutral-700'
                  }`}
                  style={{ backgroundColor: c.color }}
                />
              ))}
            </div>
          </div>

          {/* Generate & Export Button */}
          <button
            onClick={handleGenerateVideo}
            disabled={isRecording}
            className="w-full py-3 bg-gradient-to-r from-rose-500 to-cyan-500 hover:from-rose-600 hover:to-cyan-600 text-white font-bold text-xs rounded-xl shadow-lg flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-50"
          >
            <Sparkles className="w-4 h-4" />
            {isRecording ? 'Baking Video Stream...' : 'Create Video & Open In Editor'}
          </button>
        </div>
      </div>
    </div>
  );
};
