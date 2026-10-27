/**
 * Real-time Web Audio Synthesizer for TokStudio.
 * Generates energetic short loops, beat patterns, countdown beeps, and UI feedback sound effects.
 */

class SoundEngine {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = false;
  private currentLoopInterval: number | null = null;
  private isLooping: boolean = false;

  private initCtx() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtx();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
    return this.ctx;
  }

  public toggleMute(muted?: boolean): boolean {
    if (muted !== undefined) {
      this.isMuted = muted;
    } else {
      this.isMuted = !this.isMuted;
    }
    if (this.isMuted) {
      this.stopCurrentLoop();
    }
    return this.isMuted;
  }

  public getMuted(): boolean {
    return this.isMuted;
  }

  // Play a single note
  public playTone(freq: number, type: OscillatorType = 'sine', duration: number = 0.3, volume: number = 0.2) {
    if (this.isMuted) return;
    try {
      const ctx = this.initCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = type;
      osc.frequency.setValueAtTime(freq, ctx.currentTime);

      gain.gain.setValueAtTime(volume, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + duration);
    } catch (e) {
      console.warn('Audio play error:', e);
    }
  }

  // Pop / Like sound effect
  public playLikeSound() {
    if (this.isMuted) return;
    try {
      const ctx = this.initCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(320, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(680, ctx.currentTime + 0.12);

      gain.gain.setValueAtTime(0.25, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.15);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.16);
    } catch {
      // ignore
    }
  }

  // Camera record start beep
  public playRecordBeep(isStart: boolean = true) {
    if (this.isMuted) return;
    try {
      const ctx = this.initCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(isStart ? 880 : 440, ctx.currentTime);

      gain.gain.setValueAtTime(0.2, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.1);
    } catch {
      // ignore
    }
  }

  // Countdown tick
  public playCountdownBeep(isFinal: boolean = false) {
    if (this.isMuted) return;
    try {
      const ctx = this.initCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(isFinal ? 1200 : 800, ctx.currentTime);

      gain.gain.setValueAtTime(0.3, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + (isFinal ? 0.25 : 0.12));

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + (isFinal ? 0.25 : 0.12));
    } catch {
      // ignore
    }
  }

  // Start playing a musical loop style for videos
  public startMusicLoop(genre: string = 'lofi') {
    if (this.isMuted) return;
    this.stopCurrentLoop();
    this.isLooping = true;

    try {
      this.initCtx();
    } catch {
      return;
    }

    const tempo = genre === 'trap' ? 140 : genre === 'synthwave' ? 124 : genre === 'edm' ? 128 : 90;
    const intervalMs = (60 / tempo) * 500; // 8th notes

    let step = 0;
    const lofiChords = [
      [261.63, 329.63, 392.0, 493.88], // Cmaj7
      [220.0, 261.63, 329.63, 392.0],  // Am7
      [174.61, 220.0, 261.63, 329.63], // Fmaj7
      [196.0, 246.94, 293.66, 349.23], // G7
    ];

    const synthwaveBass = [110, 110, 130.81, 146.83, 110, 164.81, 146.83, 130.81];

    this.currentLoopInterval = window.setInterval(() => {
      if (!this.isLooping || this.isMuted || !this.ctx) return;

      const time = this.ctx.currentTime;
      const bar = Math.floor(step / 8) % 4;
      const subStep = step % 8;

      if (genre === 'lofi') {
        // Soft electric piano chord on step 0 and 4
        if (subStep === 0 || subStep === 4) {
          const chord = lofiChords[bar];
          chord.forEach((freq, idx) => {
            const osc = this.ctx!.createOscillator();
            const gain = this.ctx!.createGain();
            osc.type = 'triangle';
            osc.frequency.setValueAtTime(freq, time);

            gain.gain.setValueAtTime(0.06 / (idx + 1), time);
            gain.gain.exponentialRampToValueAtTime(0.001, time + 0.7);

            osc.connect(gain);
            gain.connect(this.ctx!.destination);
            osc.start(time);
            osc.stop(time + 0.75);
          });
        }
        // Subtle kick on step 0 and snare/rim on step 4
        if (subStep === 0) {
          this.playKick(time);
        } else if (subStep === 4) {
          this.playRimshot(time);
        }
      } else if (genre === 'synthwave') {
        // Rolling 16th bass
        const bassFreq = synthwaveBass[subStep % synthwaveBass.length];
        const osc = this.ctx!.createOscillator();
        const gain = this.ctx!.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(bassFreq, time);

        gain.gain.setValueAtTime(0.12, time);
        gain.gain.exponentialRampToValueAtTime(0.01, time + 0.2);

        osc.connect(gain);
        gain.connect(this.ctx!.destination);
        osc.start(time);
        osc.stop(time + 0.22);

        if (subStep === 0 || subStep === 4) {
          this.playKick(time);
        }
        if (subStep === 4) {
          this.playSnare(time);
        }
      } else {
        // Upbeat hiphop / pop beat
        if (subStep % 2 === 0) {
          this.playTone(440 + (subStep * 50), 'sine', 0.15, 0.08);
        }
        if (subStep === 0 || subStep === 3 || subStep === 6) {
          this.playKick(time);
        }
        if (subStep === 4) {
          this.playSnare(time);
        }
      }

      step++;
    }, intervalMs);
  }

  private playKick(time: number) {
    if (!this.ctx) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.frequency.setValueAtTime(140, time);
    osc.frequency.exponentialRampToValueAtTime(35, time + 0.15);

    gain.gain.setValueAtTime(0.3, time);
    gain.gain.exponentialRampToValueAtTime(0.01, time + 0.18);

    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(time);
    osc.stop(time + 0.2);
  }

  private playSnare(time: number) {
    if (!this.ctx) return;
    // noise + tone
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(220, time);
    gain.gain.setValueAtTime(0.15, time);
    gain.gain.exponentialRampToValueAtTime(0.01, time + 0.12);

    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(time);
    osc.stop(time + 0.14);
  }

  private playRimshot(time: number) {
    if (!this.ctx) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'highpass' as unknown as OscillatorType;
    osc.frequency.setValueAtTime(800, time);
    gain.gain.setValueAtTime(0.09, time);
    gain.gain.exponentialRampToValueAtTime(0.005, time + 0.08);

    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(time);
    osc.stop(time + 0.09);
  }

  public stopCurrentLoop() {
    this.isLooping = false;
    if (this.currentLoopInterval !== null) {
      clearInterval(this.currentLoopInterval);
      this.currentLoopInterval = null;
    }
  }
}

export const soundEngine = new SoundEngine();
