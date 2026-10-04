/**
 * Synthesizes all sounds and generative cosmic ambient audio using the Web Audio API.
 * No external audio files are required.
 */

class SoundEngine {
  private ctx: AudioContext | null = null;
  private soundEnabled: boolean = false;
  private musicEnabled: boolean = false;
  private ambientGain: GainNode | null = null;
  private ambientOscillators: OscillatorNode[] = [];
  private ambientFilter: BiquadFilterNode | null = null;
  private isAmbientPlaying: boolean = false;

  private initCtx() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
  }

  public setSoundEnabled(enabled: boolean) {
    this.soundEnabled = enabled;
  }

  public setMusicEnabled(enabled: boolean) {
    this.musicEnabled = enabled;
    this.stopAmbient();
  }

  public triggerHaptic(duration: number | number[] = 30) {
    try {
      if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
        navigator.vibrate(duration as VibratePattern);
      }
    } catch {
      // Ignore vibration error
    }
  }

  public playClick() {
    if (!this.soundEnabled) return;
    this.initCtx();
    if (!this.ctx) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const now = this.ctx.currentTime;

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(800, now);
    osc.frequency.exponentialRampToValueAtTime(300, now + 0.04);

    gain.gain.setValueAtTime(0.2, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + 0.05);
    this.triggerHaptic(15);
  }

  public playDiceRoll() {
    if (!this.soundEnabled) return;
    this.initCtx();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const duration = 0.8;

    // Multi-tap rattle to simulate bouncing die on board
    const taps = [0, 0.12, 0.22, 0.35, 0.46, 0.58, 0.72];
    taps.forEach((t, idx) => {
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const tapTime = now + t;
      const decay = 0.06 - (idx * 0.005);

      osc.type = 'sine';
      const baseFreq = 220 + Math.random() * 120 + (idx * 25);
      osc.frequency.setValueAtTime(baseFreq, tapTime);
      osc.frequency.exponentialRampToValueAtTime(baseFreq * 0.4, tapTime + decay);

      const amp = 0.35 * Math.pow(0.85, idx);
      gain.gain.setValueAtTime(amp, tapTime);
      gain.gain.exponentialRampToValueAtTime(0.001, tapTime + decay);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(tapTime);
      osc.stop(tapTime + decay);
    });

    this.triggerHaptic([20, 30, 20, 40]);
  }

  public playTokenHop(stepIndex: number = 0) {
    if (!this.soundEnabled) return;
    this.initCtx();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    // Scale pitch based on consecutive hop step
    const notes = [440, 494, 554, 587, 659, 740, 830, 880];
    const freq = notes[stepIndex % notes.length] || 440;

    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq * 0.8, now);
    osc.frequency.exponentialRampToValueAtTime(freq * 1.2, now + 0.09);

    gain.gain.setValueAtTime(0.28, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + 0.13);
    this.triggerHaptic(18);
  }

  public playCapture() {
    if (!this.soundEnabled) return;
    this.initCtx();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;

    // Dramatic sub impact
    const subOsc = this.ctx.createOscillator();
    const subGain = this.ctx.createGain();
    subOsc.type = 'sine';
    subOsc.frequency.setValueAtTime(160, now);
    subOsc.frequency.exponentialRampToValueAtTime(35, now + 0.4);

    subGain.gain.setValueAtTime(0.6, now);
    subGain.gain.exponentialRampToValueAtTime(0.001, now + 0.45);

    subOsc.connect(subGain);
    subGain.connect(this.ctx.destination);

    subOsc.start(now);
    subOsc.stop(now + 0.46);

    // Cosmic whoosh noise burst
    const bufferSize = this.ctx.sampleRate * 0.35;
    const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = noiseBuffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    const noise = this.ctx.createBufferSource();
    noise.buffer = noiseBuffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(1400, now);
    filter.frequency.exponentialRampToValueAtTime(250, now + 0.35);

    const noiseGain = this.ctx.createGain();
    noiseGain.gain.setValueAtTime(0.35, now);
    noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

    noise.connect(filter);
    filter.connect(noiseGain);
    noiseGain.connect(this.ctx.destination);

    noise.start(now);
    noise.stop(now + 0.36);

    this.triggerHaptic([50, 40, 80]);
  }

  public playSixRolled() {
    if (!this.soundEnabled) return;
    this.initCtx();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const arpeggio = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
    arpeggio.forEach((f, i) => {
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const t = now + i * 0.07;

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(f, t);

      gain.gain.setValueAtTime(0.25, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.22);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(t);
      osc.stop(t + 0.23);
    });

    this.triggerHaptic([30, 30, 40]);
  }

  public playTokenHome() {
    if (!this.soundEnabled) return;
    this.initCtx();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const notes = [440, 554.37, 659.25, 880, 1108.73];
    notes.forEach((freq, idx) => {
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const t = now + idx * 0.08;

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, t);

      gain.gain.setValueAtTime(0.3, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.4);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(t);
      osc.stop(t + 0.42);
    });

    this.triggerHaptic([40, 40, 60, 40, 80]);
  }

  public playVictoryFanfare() {
    if (!this.soundEnabled) return;
    this.initCtx();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    // Majestic Royal Chord Sequence
    const chords = [
      [261.63, 329.63, 392.0], // C
      [293.66, 369.99, 440.0], // D
      [329.63, 415.30, 493.88], // E
      [523.25, 659.25, 783.99, 1046.5] // High C major
    ];

    chords.forEach((chord, chordIdx) => {
      const chordTime = now + chordIdx * 0.35;
      const duration = chordIdx === 3 ? 1.6 : 0.4;
      chord.forEach((note) => {
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = chordIdx === 3 ? 'triangle' : 'sine';
        osc.frequency.setValueAtTime(note, chordTime);

        gain.gain.setValueAtTime(0.2, chordTime);
        gain.gain.exponentialRampToValueAtTime(0.001, chordTime + duration);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(chordTime);
        osc.stop(chordTime + duration);
      });
    });

    this.triggerHaptic([50, 50, 50, 50, 100, 50, 200]);
  }

  public startAmbient() {
    // Ambient background drone permanently disabled
    this.stopAmbient();
  }

  public stopAmbient() {
    if (!this.isAmbientPlaying) return;
    try {
      if (this.ambientGain && this.ctx) {
        this.ambientGain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + 1);
        setTimeout(() => {
          this.ambientOscillators.forEach((o) => {
            try {
              o.stop();
              o.disconnect();
            } catch {}
          });
          this.ambientOscillators = [];
          this.isAmbientPlaying = false;
        }, 1100);
      }
    } catch {
      this.isAmbientPlaying = false;
    }
  }
}

export const soundManager = new SoundEngine();
