/**
 * Plays sine wave reference tones at a target frequency.
 * Uses OscillatorNode with gain fade-in/out to avoid clicks.
 */

export class TonePlayer {
  constructor(audioCtx) {
    this.audioCtx = audioCtx;
    this.oscillator = null;
    this.gainNode = null;
    this.playing = false;
  }

  play(frequency, duration = null) {
    this.stop();

    this.oscillator = this.audioCtx.createOscillator();
    this.gainNode = this.audioCtx.createGain();

    this.oscillator.type = "sine";
    this.oscillator.frequency.setValueAtTime(
      frequency,
      this.audioCtx.currentTime
    );

    // Fade in over 50ms to avoid click
    this.gainNode.gain.setValueAtTime(0, this.audioCtx.currentTime);
    this.gainNode.gain.linearRampToValueAtTime(
      0.3,
      this.audioCtx.currentTime + 0.05
    );

    this.oscillator.connect(this.gainNode);
    this.gainNode.connect(this.audioCtx.destination);
    this.oscillator.start();
    this.playing = true;

    if (duration) {
      const fadeOutStart = this.audioCtx.currentTime + duration - 0.05;
      const fadeOutEnd = this.audioCtx.currentTime + duration;

      this.gainNode.gain.setValueAtTime(0.3, fadeOutStart);
      this.gainNode.gain.linearRampToValueAtTime(0, fadeOutEnd);
      this.oscillator.stop(fadeOutEnd);

      this.oscillator.onended = () => {
        this.playing = false;
        this.oscillator = null;
        this.gainNode = null;
      };
    }
  }

  stop() {
    if (this.oscillator) {
      try {
        // Quick fade out
        this.gainNode.gain.cancelScheduledValues(this.audioCtx.currentTime);
        this.gainNode.gain.setValueAtTime(
          this.gainNode.gain.value,
          this.audioCtx.currentTime
        );
        this.gainNode.gain.linearRampToValueAtTime(
          0,
          this.audioCtx.currentTime + 0.02
        );
        this.oscillator.stop(this.audioCtx.currentTime + 0.02);
      } catch (e) {
        // Already stopped
      }
      this.oscillator = null;
      this.gainNode = null;
    }
    this.playing = false;
  }

  isPlaying() {
    return this.playing;
  }
}
