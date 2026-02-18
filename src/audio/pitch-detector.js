/**
 * Real-time pitch detection using autocorrelation.
 *
 * Autocorrelation finds the dominant period in the signal by
 * correlating the waveform with shifted copies of itself.
 * The lag at which correlation peaks corresponds to the fundamental period.
 *
 * This approach gives sub-Hz accuracy, much better than FFT bin resolution.
 *
 * Based on: https://alexanderell.is/posts/tuner/
 */

export class PitchDetector {
  constructor(analyser, sampleRate) {
    this.analyser = analyser;
    this.sampleRate = sampleRate;
    this.bufferLength = analyser.fftSize;
    this.buffer = new Float32Array(this.bufferLength);
    this.running = false;
    this.onPitch = null;
    this._rafId = null;
  }

  start(callback) {
    this.onPitch = callback;
    this.running = true;
    this._detect();
  }

  stop() {
    this.running = false;
    if (this._rafId) {
      cancelAnimationFrame(this._rafId);
      this._rafId = null;
    }
  }

  _detect() {
    if (!this.running) return;

    this.analyser.getFloatTimeDomainData(this.buffer);
    const result = this._autocorrelate(this.buffer, this.sampleRate);

    if (this.onPitch) {
      this.onPitch(result.frequency, result.clarity);
    }

    this._rafId = requestAnimationFrame(() => this._detect());
  }

  _autocorrelate(buf, sampleRate) {
    const SIZE = buf.length;

    // 1. Check if there's enough signal (RMS level)
    let rms = 0;
    for (let i = 0; i < SIZE; i++) {
      rms += buf[i] * buf[i];
    }
    rms = Math.sqrt(rms / SIZE);

    if (rms < 0.01) {
      return { frequency: -1, clarity: 0 }; // Too quiet
    }

    // 2. Trim buffer — find where signal crosses near zero at edges
    //    This reduces edge artifacts in the correlation
    let r1 = 0;
    let r2 = SIZE - 1;
    const thresh = 0.2;

    for (let i = 0; i < SIZE / 2; i++) {
      if (Math.abs(buf[i]) < thresh) {
        r1 = i;
        break;
      }
    }

    for (let i = 1; i < SIZE / 2; i++) {
      if (Math.abs(buf[SIZE - i]) < thresh) {
        r2 = SIZE - i;
        break;
      }
    }

    const trimmedBuf = buf.slice(r1, r2);
    const trimmedSize = trimmedBuf.length;

    if (trimmedSize < 2) {
      return { frequency: -1, clarity: 0 };
    }

    // 3. Autocorrelation — compute normalized correlation at each lag
    const correlations = new Float32Array(trimmedSize);
    for (let offset = 0; offset < trimmedSize; offset++) {
      let sum = 0;
      for (let j = 0; j < trimmedSize - offset; j++) {
        sum += trimmedBuf[j] * trimmedBuf[j + offset];
      }
      correlations[offset] = sum;
    }

    // 4. Find the first peak after the initial decline
    //    The correlation starts at max (offset=0) and declines.
    //    We skip past this initial decline to find the first real peak.
    let d = 0;
    while (d < trimmedSize - 1 && correlations[d] > correlations[d + 1]) {
      d++;
    }

    let maxVal = -1;
    let maxPos = -1;
    for (let i = d; i < trimmedSize; i++) {
      if (correlations[i] > maxVal) {
        maxVal = correlations[i];
        maxPos = i;
      }
    }

    if (maxPos < 0) {
      return { frequency: -1, clarity: 0 };
    }

    // 5. Parabolic interpolation for sub-sample accuracy
    let shift = maxPos;
    if (maxPos > 0 && maxPos < trimmedSize - 1) {
      const y1 = correlations[maxPos - 1];
      const y2 = correlations[maxPos];
      const y3 = correlations[maxPos + 1];
      const a = (y1 + y3 - 2 * y2) / 2;
      const b = (y3 - y1) / 2;
      if (a !== 0) {
        shift = maxPos - b / (2 * a);
      }
    }

    const frequency = sampleRate / shift;
    const clarity = maxVal / correlations[0]; // Normalized: 0 to 1

    return { frequency, clarity };
  }
}
