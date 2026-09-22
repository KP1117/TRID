// 10 Standard VLC / Audio Equalizer Frequencies
export const EQ_FREQUENCIES = [32, 64, 125, 250, 500, 1000, 2000, 4000, 8000, 16000];

export const EQ_PRESETS: Record<string, number[]> = {
  'Flat': [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  'Bass Boost': [6.0, 5.0, 4.0, 2.0, 0.5, 0, 0, 0, 0, 0],
  'Vocal Enhancer': [-2.0, -1.0, 0, 3.0, 4.5, 4.0, 2.5, 1.0, 0, -1.0],
  'Rock': [4.5, 3.0, -1.5, -3.0, -1.0, 1.5, 3.5, 4.5, 4.5, 4.5],
  'Pop': [-1.5, 1.5, 3.5, 4.0, 2.5, -0.5, -1.5, -1.5, -1.0, -1.0],
  'Classical': [4.0, 3.0, 2.5, 2.0, -1.5, -1.5, 0, 2.0, 3.0, 3.5],
  'Electronic': [5.0, 4.0, 1.0, 0, -2.0, 2.0, 1.5, 2.5, 4.5, 4.0],
  'Jazz': [3.0, 2.0, 1.0, 2.0, -1.5, -1.5, 0, 1.5, 3.0, 3.5],
  'Full Bass & Treble': [7.0, 5.5, 0, -3.0, -2.0, 1.0, 4.5, 6.0, 7.0, 7.0],
  'Voice / Dialogue': [-3.0, -2.0, 0, 2.0, 4.0, 3.5, 2.0, 0, -2.0, -3.0],
};

export class AudioEngine {
  private ctx: AudioContext | null = null;
  private source: MediaElementAudioSourceNode | null = null;
  private gainNode: GainNode | null = null;
  private pannerNode: StereoPannerNode | null = null;
  private filters: BiquadFilterNode[] = [];
  private analyserNode: AnalyserNode | null = null;
  private connectedElement: HTMLMediaElement | null = null;

  public init(mediaElement: HTMLMediaElement) {
    if (this.connectedElement === mediaElement && this.ctx) {
      if (this.ctx.state === 'suspended') {
        this.ctx.resume();
      }
      return;
    }

    try {
      const AudioCtxClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioCtxClass) return;

      this.ctx = new AudioCtxClass();
      this.source = this.ctx.createMediaElementSource(mediaElement);
      this.connectedElement = mediaElement;

      // 1. Gain Node (handles 0% to 200% volume boost)
      this.gainNode = this.ctx.createGain();

      // 2. Stereo Panner (handles balance -1 to 1)
      if (this.ctx.createStereoPanner) {
        this.pannerNode = this.ctx.createStereoPanner();
      }

      // 3. 10-band Equalizer filters
      this.filters = EQ_FREQUENCIES.map((freq, index) => {
        const filter = this.ctx!.createBiquadFilter();
        if (index === 0) {
          filter.type = 'lowshelf';
        } else if (index === EQ_FREQUENCIES.length - 1) {
          filter.type = 'highshelf';
        } else {
          filter.type = 'peaking';
          filter.Q.value = 1.4;
        }
        filter.frequency.value = freq;
        filter.gain.value = 0;
        return filter;
      });

      // 4. Analyser for spectrum visualization
      this.analyserNode = this.ctx.createAnalyser();
      this.analyserNode.fftSize = 128;
      this.analyserNode.smoothingTimeConstant = 0.8;

      // Connect the chain:
      // Source -> Filter 0 -> Filter 1 -> ... -> Filter 9 -> Gain -> Panner -> Analyser -> Destination
      let currentNode: AudioNode = this.source;

      for (const filter of this.filters) {
        currentNode.connect(filter);
        currentNode = filter;
      }

      currentNode.connect(this.gainNode);
      currentNode = this.gainNode;

      if (this.pannerNode) {
        currentNode.connect(this.pannerNode);
        currentNode = this.pannerNode;
      }

      currentNode.connect(this.analyserNode);
      this.analyserNode.connect(this.ctx.destination);
    } catch (err) {
      console.warn('AudioEngine initialization notice:', err);
    }
  }

  public resume() {
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public setVolume(volumePct: number, muted: boolean) {
    if (!this.gainNode || !this.ctx) return;
    const targetGain = muted ? 0 : volumePct / 100;
    this.gainNode.gain.setValueAtTime(targetGain, this.ctx.currentTime);
  }

  public setPan(panValue: number) {
    if (!this.pannerNode || !this.ctx) return;
    this.pannerNode.pan.setValueAtTime(Math.max(-1, Math.min(1, panValue)), this.ctx.currentTime);
  }

  public setBandGain(bandIndex: number, gainDb: number) {
    if (!this.ctx || !this.filters[bandIndex]) return;
    this.filters[bandIndex].gain.setValueAtTime(gainDb, this.ctx.currentTime);
  }

  public setEqualizerBands(gains: number[], enabled: boolean) {
    if (!this.ctx || this.filters.length === 0) return;
    this.filters.forEach((filter, i) => {
      const gain = enabled ? (gains[i] ?? 0) : 0;
      filter.gain.setValueAtTime(gain, this.ctx!.currentTime);
    });
  }

  public getVisualizerData(): Uint8Array | null {
    if (!this.analyserNode) return null;
    const buffer = new Uint8Array(this.analyserNode.frequencyBinCount);
    this.analyserNode.getByteFrequencyData(buffer);
    return buffer;
  }
}

export const audioEngine = new AudioEngine();
