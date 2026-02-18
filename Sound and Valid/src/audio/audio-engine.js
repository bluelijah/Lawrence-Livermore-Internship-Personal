/**
 * Central audio manager.
 * Lazily creates AudioContext on first user gesture (required by iOS Safari).
 * Manages microphone stream and AnalyserNode.
 */

let instance = null;

export class AudioEngine {
  constructor() {
    this.audioCtx = null;
    this.analyser = null;
    this.micStream = null;
    this.micSource = null;
  }

  static getInstance() {
    if (!instance) {
      instance = new AudioEngine();
    }
    return instance;
  }

  async init() {
    if (this.audioCtx) {
      // Resume if suspended (happens on iOS after tab switch)
      if (this.audioCtx.state === "suspended") {
        await this.audioCtx.resume();
      }
      return;
    }

    this.audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    this.analyser = this.audioCtx.createAnalyser();
    this.analyser.fftSize = 2048;
    this.analyser.smoothingTimeConstant = 0.8;
  }

  async startMicrophone() {
    if (!this.audioCtx) await this.init();

    if (this.micStream) return; // Already running

    this.micStream = await navigator.mediaDevices.getUserMedia({
      audio: {
        echoCancellation: false,
        noiseSuppression: false,
        autoGainControl: false,
      },
    });

    this.micSource = this.audioCtx.createMediaStreamSource(this.micStream);
    this.micSource.connect(this.analyser);
    // Do NOT connect to destination — prevents feedback loop
  }

  stopMicrophone() {
    if (this.micSource) {
      this.micSource.disconnect();
      this.micSource = null;
    }
    if (this.micStream) {
      this.micStream.getTracks().forEach((t) => t.stop());
      this.micStream = null;
    }
  }

  getAnalyser() {
    return this.analyser;
  }

  getSampleRate() {
    return this.audioCtx ? this.audioCtx.sampleRate : 44100;
  }

  getAudioContext() {
    return this.audioCtx;
  }
}
