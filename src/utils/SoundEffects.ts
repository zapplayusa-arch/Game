// Retro Sound Effects and Procedural BGM Synthesizer using Web Audio API

class SoundEffectsManager {
  private ctx: AudioContext | null = null;
  private soundEnabled: boolean = true;
  private musicEnabled: boolean = true;
  private bgmIntervalId: number | null = null;
  private currentBgmOscillators: { osc: OscillatorNode; gain: GainNode }[] = [];
  private bgmStep: number = 0;

  // Scale degrees: A Minor / Cosmic Scale for retro synth vibes
  // A2, C3, D3, E3, G3, A3
  private bassNotes = [110.00, 130.81, 146.83, 164.81, 196.00, 220.00];

  init() {
    if (this.ctx) return;
    try {
      const AudioCtxClass = window.AudioContext || (window as any).webkitAudioContext;
      this.ctx = new AudioCtxClass();
    } catch (e) {
      console.warn("Web Audio API not supported in this browser.", e);
    }
  }

  setSoundEnabled(enabled: boolean) {
    this.soundEnabled = enabled;
  }

  setMusicEnabled(enabled: boolean) {
    this.musicEnabled = enabled;
    if (!enabled) {
      this.stopBGM();
    } else {
      // If BGM is enabled, we start it on user gesture, we don't start it immediately here
    }
  }

  private getContext(): AudioContext | null {
    this.init();
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
    return this.ctx;
  }

  // Play a simple button tap sound
  playSelect() {
    if (!this.soundEnabled) return;
    const ctx = this.getContext();
    if (!ctx) return;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(400, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(800, ctx.currentTime + 0.08);

    gain.gain.setValueAtTime(0.15, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.08);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + 0.08);
  }

  // Play a beautiful "sparkle" double-tone for core collections
  playCoin() {
    if (!this.soundEnabled) return;
    const ctx = this.getContext();
    if (!ctx) return;

    const playTone = (freq: number, startOffset: number, duration: number) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, ctx.currentTime + startOffset);
      osc.frequency.exponentialRampToValueAtTime(freq * 1.5, ctx.currentTime + startOffset + duration);

      gain.gain.setValueAtTime(0.12, ctx.currentTime + startOffset);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + startOffset + duration);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(ctx.currentTime + startOffset);
      osc.stop(ctx.currentTime + startOffset + duration);
    };

    // Beautiful retro arpeggio
    playTone(523.25, 0, 0.08); // C5
    playTone(659.25, 0.05, 0.12); // E5
  }

  // Play a retro power-up sound (rising laser chord)
  playPowerUp() {
    if (!this.soundEnabled) return;
    const ctx = this.getContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const duration = 0.35;

    const osc = ctx.createOscillator();
    const osc2 = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(150, now);
    osc.frequency.exponentialRampToValueAtTime(900, now + duration);

    osc2.type = 'triangle';
    osc2.frequency.setValueAtTime(300, now);
    osc2.frequency.exponentialRampToValueAtTime(1800, now + duration);

    gain.gain.setValueAtTime(0.08, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + duration);

    osc.connect(gain);
    osc2.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc2.start();
    osc.stop(now + duration);
    osc2.stop(now + duration);
  }

  // Play shield absorbing/breaking sound (glass shatter / frequency drop)
  playShieldBreak() {
    if (!this.soundEnabled) return;
    const ctx = this.getContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const duration = 0.4;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(800, now);
    osc.frequency.exponentialRampToValueAtTime(100, now + duration);

    gain.gain.setValueAtTime(0.15, now);
    gain.gain.setValueAtTime(0.15, now + 0.1);
    gain.gain.exponentialRampToValueAtTime(0.001, now + duration);

    // Simple distortion simulation by clipping
    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(now + duration);
  }

  // Play screen bomb / EMP blast (deep rumble sweeping down + high pitch spark)
  playBomb() {
    if (!this.soundEnabled) return;
    const ctx = this.getContext();
    if (!ctx) return;

    const now = ctx.currentTime;

    // High explosion sweep
    const oscHigh = ctx.createOscillator();
    const gainHigh = ctx.createGain();
    oscHigh.type = 'sawtooth';
    oscHigh.frequency.setValueAtTime(2000, now);
    oscHigh.frequency.exponentialRampToValueAtTime(100, now + 0.5);

    gainHigh.gain.setValueAtTime(0.1, now);
    gainHigh.gain.exponentialRampToValueAtTime(0.001, now + 0.5);

    oscHigh.connect(gainHigh);
    gainHigh.connect(ctx.destination);
    oscHigh.start();
    oscHigh.stop(now + 0.5);

    // Deep rumble sweep
    const oscLow = ctx.createOscillator();
    const gainLow = ctx.createGain();
    oscLow.type = 'sawtooth';
    oscLow.frequency.setValueAtTime(180, now);
    oscLow.frequency.linearRampToValueAtTime(40, now + 0.8);

    gainLow.gain.setValueAtTime(0.25, now);
    gainLow.gain.exponentialRampToValueAtTime(0.001, now + 0.8);

    oscLow.connect(gainLow);
    gainLow.connect(ctx.destination);
    oscLow.start();
    oscLow.stop(now + 0.8);
  }

  // Play ship explosion (white noise / filtered rumble crunch)
  playExplosion() {
    if (!this.soundEnabled) return;
    const ctx = this.getContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const duration = 0.7;

    // We can simulate noise using an oscillator with rapid frequency modulation or basic detuning
    const osc = ctx.createOscillator();
    const osc2 = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(120, now);
    osc.frequency.linearRampToValueAtTime(20, now + duration);

    osc2.type = 'triangle';
    osc2.frequency.setValueAtTime(90, now);
    osc2.frequency.linearRampToValueAtTime(10, now + duration);
    osc2.detune.setValueAtTime(100, now);
    osc2.detune.linearRampToValueAtTime(-100, now + duration);

    gain.gain.setValueAtTime(0.3, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + duration);

    osc.connect(gain);
    osc2.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc2.start();
    osc.stop(now + duration);
    osc2.stop(now + duration);
  }

  // Procedural BGM (A steady, low-volume cyber bass groove)
  startBGM() {
    if (!this.musicEnabled) return;
    const ctx = this.getContext();
    if (!ctx) return;

    if (this.bgmIntervalId) return; // Already playing

    this.bgmStep = 0;

    // Custom bass rhythm: 4 steps, loops
    // A2 (110Hz), E2 (82.4Hz), G2 (98Hz), D2 (73.4Hz)
    const baseMelody = [110.00, 110.00, 82.41, 82.41, 98.00, 98.00, 73.42, 82.41];

    const beatDuration = 0.35; // 350ms per step

    this.bgmIntervalId = window.setInterval(() => {
      const currentCtx = this.getContext();
      if (!currentCtx || !this.musicEnabled) return;

      const now = currentCtx.currentTime;
      const freq = baseMelody[this.bgmStep % baseMelody.length];

      // Create bass synthesizer
      const osc = currentCtx.createOscillator();
      const gain = currentCtx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, now);

      // Cyber punch on start of step, then decay
      gain.gain.setValueAtTime(0.12, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + beatDuration - 0.02);

      osc.connect(gain);
      gain.connect(currentCtx.destination);

      osc.start(now);
      osc.stop(now + beatDuration);

      // Play a very quiet retro high-hat sound on off-beats for spice
      if (this.bgmStep % 2 === 1) {
        const hhOsc = currentCtx.createOscillator();
        const hhGain = currentCtx.createGain();

        hhOsc.type = 'triangle';
        hhOsc.frequency.setValueAtTime(5000, now);
        hhGain.gain.setValueAtTime(0.015, now);
        hhGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.04);

        hhOsc.connect(hhGain);
        hhGain.connect(currentCtx.destination);
        hhOsc.start(now);
        hhOsc.stop(now + 0.05);
      }

      this.bgmStep++;
    }, beatDuration * 1000);
  }

  stopBGM() {
    if (this.bgmIntervalId) {
      clearInterval(this.bgmIntervalId);
      this.bgmIntervalId = null;
    }
  }
}

export const SoundEffects = new SoundEffectsManager();
