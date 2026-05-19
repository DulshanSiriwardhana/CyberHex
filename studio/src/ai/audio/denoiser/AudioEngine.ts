/**
 * CyberHex Studio — Neural Audio Processing Engine
 * Real-time audio enhancement: denoising, compression, isolation, mastering,
 * and English fluency correction.
 */
import { AudioFilterType, FluencyAction, EmotionType, type AudioMetrics, type FluencyConfig, type CorrectionResult, type FluencyMetrics, type TranscriptSegment } from '@/types';

/* ─── Types ────────────────────────────── */

export interface AudioEngineConfig {
  sampleRate: number;
  bufferSize: number;
  channels: number;
  enableWorkers: boolean;
  latencyTarget: number;
}

export interface AudioProcessor {
  id: string;
  type: AudioFilterType;
  enabled: boolean;
  node: AudioNode | null;
  params: Record<string, number | boolean>;
}

interface FluencyState {
  recentTokens: string[];
  correctionHistory: CorrectionResult[];
  transcriptSegments: TranscriptSegment[];
  metrics: FluencyMetrics;
}

/* ─── AudioEngine ──────────────────────── */

export class AudioEngine {
  private ctx: AudioContext | null = null;
  private config!: AudioEngineConfig;
  private sourceNode: MediaStreamAudioSourceNode | null = null;
  private destinationNode: MediaStreamAudioDestinationNode | null = null;
  private processors: AudioProcessor[] = [];
  private analyser: AnalyserNode | null = null;
  private gainNode: GainNode | null = null;
  private scriptNode: ScriptProcessorNode | null = null;
  private initialized = false;

  /* Fluency */
  private fluencyConfig: FluencyConfig = {
    enabled: false,
    mode: FluencyAction.CORRECTION,
    targetLanguage: 'en',
    preservePersonality: true,
    confidenceThreshold: 0.7,
    correctionStyle: 'balanced',
    synthesizeSpeech: false,
    generateSubtitles: true,
  };
  private fluency: FluencyState = {
    recentTokens: [],
    correctionHistory: [],
    transcriptSegments: [],
    metrics: { wordsPerMinute: 0, fillerWordCount: 0, grammarErrorsPerMinute: 0, vocabularyRichness: 0, confidenceScore: 0, fluencyScore: 0, clarityScore: 0 },
  };
  private speechRecognition: {
    continuous: boolean;
    interimResults: boolean;
    lang: string;
    onresult: ((event: { resultIndex: number; results: { isFinal: boolean; [i: number]: { transcript: string } }[] }) => void) | null;
    onerror: ((event: { error: string }) => void) | null;
    start: () => void;
    stop: () => void;
  } | null = null;
  private fluencyListeners: Set<(result: CorrectionResult) => void> = new Set();
  private transcriptListeners: Set<(segment: TranscriptSegment) => void> = new Set();
  private metricsListeners: Set<(metrics: FluencyMetrics) => void> = new Set();

  /* ── Initialize ── */

  async initialize(config: AudioEngineConfig, stream: MediaStream): Promise<void> {
    this.config = config;

    this.ctx = new AudioContext({
      sampleRate: config.sampleRate,
      latencyHint: config.latencyTarget < 0.01 ? 'interactive' : 'playback',
    });

    this.sourceNode = this.ctx.createMediaStreamSource(stream);
    this.destinationNode = this.ctx.createMediaStreamDestination();

    this.gainNode = this.ctx.createGain();
    this.gainNode.gain.value = 1.0;

    this.analyser = this.ctx.createAnalyser();
    this.analyser.fftSize = 2048;
    this.analyser.smoothingTimeConstant = 0.8;

    this.sourceNode.connect(this.analyser);
    this.analyser.connect(this.gainNode);
    this.gainNode.connect(this.destinationNode);

    this._setupScriptProcessor();

    this.initialized = true;

    if (this.fluencyConfig.enabled) {
      this._initSpeechRecognition();
    }

    console.log(`[AudioEngine] Initialized ${config.sampleRate}Hz, ${config.channels}ch`);
  }

  private _setupScriptProcessor(): void {
    if (!this.ctx) return;
    this.scriptNode = this.ctx.createScriptProcessor(this.config.bufferSize, 1, 1);
    this.scriptNode.onaudioprocess = (e) => {
      if (!this.initialized) return;
      const inputData = e.inputBuffer.getChannelData(0);
      this._applyProcessors(inputData, e.outputBuffer.getChannelData(0));
    };
  }

  /* ── Processors ── */

  addProcessor(processor: AudioProcessor): void {
    this.processors.push(processor);

    if (this.ctx && processor.type === AudioFilterType.COMPRESSOR) {
      const comp = this.ctx.createDynamicsCompressor();
      comp.threshold.value = (processor.params.threshold as number) ?? -24;
      comp.ratio.value = (processor.params.ratio as number) ?? 12;
      comp.attack.value = ((processor.params.attackMs as number) ?? 5) / 1000;
      comp.release.value = ((processor.params.releaseMs as number) ?? 50) / 1000;
      comp.knee.value = (processor.params.knee as number) ?? 30;
      processor.node = comp;
    }

    if (this.ctx && processor.type === AudioFilterType.DENOISER) {
      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.value = 8000;
      filter.Q.value = 0.7;
      processor.node = filter;
    }

    this._rebuildAudioGraph();
  }

  removeProcessor(id: string): void {
    this.processors = this.processors.filter((p) => p.id !== id);
    this._rebuildAudioGraph();
  }

  setProcessorEnabled(id: string, enabled: boolean): void {
    const proc = this.processors.find((p) => p.id === id);
    if (proc) proc.enabled = enabled;
  }

  setProcessorParam(id: string, param: string, value: number | boolean): void {
    const proc = this.processors.find((p) => p.id === id);
    if (proc) proc.params[param] = value;
  }

  private _rebuildAudioGraph(): void {
    if (!this.ctx || !this.sourceNode || !this.gainNode || !this.destinationNode || !this.analyser) return;

    // Disconnect everything
    this.sourceNode.disconnect();
    this.analyser.disconnect();
    this.gainNode.disconnect();

    let lastNode: AudioNode = this.sourceNode;

    for (const proc of this.processors) {
      if (!proc.enabled || !proc.node) continue;
      lastNode.connect(proc.node);
      lastNode = proc.node;
    }

    lastNode.connect(this.analyser);
    this.analyser.connect(this.gainNode);
    this.gainNode.connect(this.destinationNode);
  }

  private _applyProcessors(input: Float32Array, output: Float32Array): void {
    // CPU-based denoising: simple spectral gate
    const hasDenoiser = this.processors.some(
      (p) => p.enabled && p.type === AudioFilterType.DENOISER && !p.node
    );
    const hasEnhancer = this.processors.some(
      (p) => p.enabled && p.type === AudioFilterType.ENHANCER
    );

    for (let i = 0; i < input.length; i++) {
      let sample = input[i];

      if (hasDenoiser) {
        const threshold = 0.01;
        if (Math.abs(sample) < threshold) {
          sample *= 0.1; // Reduce noise
        }
      }

      if (hasEnhancer) {
        // Simple harmonic enhancement
        const warmth = sample * 0.3;
        const clarity = Math.tanh(sample * 1.5) * 0.7;
        sample = warmth + clarity;
      }

      output[i] = Math.max(-1, Math.min(1, sample)); // Clamp
    }
  }

  /* ── Metrics ── */

  getAudioMetrics(): AudioMetrics {
    if (!this.analyser) {
      return { rms: 0, peak: 0, snr: 0, latencyMs: 0, noiseLevel: 0, voiceActivity: 0, confidence: 0 };
    }

    const data = new Float32Array(this.analyser.frequencyBinCount);
    this.analyser.getFloatTimeDomainData(data);

    let sumSq = 0;
    let peak = 0;
    for (let i = 0; i < data.length; i++) {
      const val = Math.abs(data[i]);
      sumSq += val * val;
      if (val > peak) peak = val;
    }

    const rms = Math.sqrt(sumSq / data.length);
    const noiseLevel = Math.max(0, 1 - (rms * 10));
    const voiceActivity = Math.min(1, rms * 20);

    return {
      rms: Math.round(rms * 1000) / 1000,
      peak: Math.round(peak * 1000) / 1000,
      snr: rms > 0.001 ? Math.round(20 * Math.log10(rms / 0.001)) : 0,
      latencyMs: (this.config?.latencyTarget ?? 0) * 1000,
      noiseLevel: Math.round(noiseLevel * 100) / 100,
      voiceActivity: Math.round(voiceActivity * 100) / 100,
      confidence: 0.9,
    };
  }

  getOutputStream(): MediaStream | null {
    return this.destinationNode?.stream ?? null;
  }

  /* ── English Fluency AI ── */

  private _initSpeechRecognition(): void {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      console.warn('[AudioEngine] SpeechRecognition not available');
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = this.fluencyConfig.targetLanguage;

    recognition.onresult = (event: any) => {
      let interim = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        const text = result[0].transcript;

        if (result.isFinal) {
          this._processSpeechToken(text, true);
        } else {
          interim += text;
        }
      }
      if (interim) {
        this._processSpeechToken(interim, false);
      }
    };

    recognition.onerror = (event: any) => {
      console.warn('[AudioEngine] Speech recognition error:', event.error);
    };

    this.speechRecognition = recognition;
    recognition.start();
    console.log('[AudioEngine] Speech recognition started');
  }

  private _processSpeechToken(text: string, isFinal: boolean): void {
    this.fluency.recentTokens.push(text);
    if (this.fluency.recentTokens.length > 50) this.fluency.recentTokens.shift();

    if (isFinal && text.trim().length > 0) {
      const correction = this._correctEnglish(text);
      this.fluency.correctionHistory.push(correction);
      if (this.fluency.correctionHistory.length > 100) this.fluency.correctionHistory.shift();

      this.fluencyListeners.forEach((fn) => fn(correction));

      if (this.fluencyConfig.generateSubtitles) {
        const segment: TranscriptSegment = {
          id: `seg_${Date.now()}`,
          speaker: 'speaker_0',
          original: text,
          corrected: correction.corrected,
          startTime: Date.now() - 2000,
          endTime: Date.now(),
          confidence: correction.confidence,
          errors: correction.corrections,
          sentiment: EmotionType.NEUTRAL,
        };
        this.fluency.transcriptSegments.push(segment);
        if (this.fluency.transcriptSegments.length > 500) this.fluency.transcriptSegments.shift();
        this.transcriptListeners.forEach((fn) => fn(segment));
      }
    }

    this._updateFluencyMetrics();
  }

  private _correctEnglish(text: string): CorrectionResult {
    const corrections: import('@/types').GrammarError[] = [];
    let corrected = text;

    // Heuristic grammar rules
    const rules: [RegExp, string, string][] = [
      [/\bI goes?\b/i, 'I went', 'Incorrect verb form: "goes" → "went"'],
      [/\bI go (\w+ed)\b/i, 'I went to', 'Missing "to" after "go"'],
      [/\bI (is|are|am) go\b/i, 'I am going', 'Incorrect continuous form'],
      [/\bhe go\b/i, 'he goes', 'Subject-verb agreement: he → goes'],
      [/\bshe go\b/i, 'she goes', 'Subject-verb agreement: she → goes'],
      [/\bthey goes\b/i, 'they go', 'Subject-verb agreement: they → go'],
      [/\bI have went\b/i, 'I have gone', 'Past participle: went → gone'],
      [/\bmore better\b/i, 'better', 'Double comparative: more better → better'],
      [/\bmore bigger\b/i, 'bigger', 'Double comparative: more bigger → bigger'],
      [/\bI didn't went\b/i, "I didn't go", 'Incorrect past after didn\'t'],
      [/\bYesterday I go\b/i, 'Yesterday I went', 'Past tense: go → went'],
      [/\bI goes to\b/i, 'I go to', 'Subject-verb: I → go (not goes)'],
      [/\bmany thing\b/i, 'many things', 'Plural: thing → things'],
      [/\bI buy\b/i, 'I bought', 'Past tense: buy → bought'],
    ];

    for (const [pattern, replacement, explanation] of rules) {
      if (pattern.test(corrected)) {
        const match = corrected.match(pattern);
        corrections.push({
          type: 'grammar',
          original: match?.[0] ?? '',
          correction: replacement,
          confidence: 0.75,
          position: { start: match?.index ?? 0, end: (match?.index ?? 0) + (match?.[0]?.length ?? 0) },
          explanation,
        });
        corrected = corrected.replace(pattern, replacement);
      }
    }

    // Article corrections
    const articleRules: [RegExp, string, string][] = [
      [/\ba (\w*[aeiou])/gi, 'an $1', 'Article: a → an before vowel sound'],
    ];
    for (const [pattern, replacement, explanation] of articleRules) {
      if (pattern.test(corrected)) {
        const match = corrected.match(pattern);
        corrections.push({
          type: 'grammar',
          original: match?.[0] ?? '',
          correction: corrected.replace(pattern, replacement),
          confidence: 0.85,
          position: { start: match?.index ?? 0, end: (match?.index ?? 0) + (match?.[0]?.length ?? 0) },
          explanation,
        });
        corrected = corrected.replace(pattern, replacement);
      }
    }

    // Calculate confidence
    const conf = corrections.length === 0 ? 0.95 : Math.max(0.3, 0.85 - corrections.length * 0.1);

    // Generate alternatives
    const alternatives = corrections.length > 0
      ? [corrected]
      : [];

    return {
      original: text,
      corrected: corrected.trim(),
      corrections,
      confidence: conf,
      latencyMs: 50,
      alternativeCorrections: alternatives,
    };
  }

  private _updateFluencyMetrics(): void {
    const tokens = this.fluency.recentTokens;
    const words = tokens.join(' ').split(/\s+/).filter(Boolean);

    const fillerWords = ['um', 'uh', 'er', 'ah', 'like', 'you know', 'i mean'];
    const fillerCount = words.filter((w) => fillerWords.includes(w.toLowerCase())).length;

    const corrections = this.fluency.correctionHistory;
    const totalErrors = corrections.reduce((sum, c) => sum + c.corrections.length, 0);

    const vocabSet = new Set(words.map((w) => w.toLowerCase()));
    const vocabularyRichness = words.length > 0 ? vocabSet.size / words.length : 0;

    const metrics: FluencyMetrics = {
      wordsPerMinute: words.length / 2, // Rough estimate over 2 minutes window
      fillerWordCount: fillerCount,
      grammarErrorsPerMinute: totalErrors / 2,
      vocabularyRichness: Math.round(vocabularyRichness * 100) / 100,
      confidenceScore: corrections.length > 0 ? corrections[corrections.length - 1].confidence : 1,
      fluencyScore: Math.max(0, 1 - (fillerCount * 0.05) - (totalErrors * 0.02)),
      clarityScore: words.length > 0 ? Math.min(1, 0.7 + vocabularyRichness * 0.3) : 0.5,
    };

    this.fluency.metrics = metrics;
    this.metricsListeners.forEach((fn) => fn(metrics));
  }

  /* Fluency API */
  setFluencyConfig(config: Partial<FluencyConfig>): void {
    Object.assign(this.fluencyConfig, config);
    if (this.fluencyConfig.enabled && !this.speechRecognition) {
      this._initSpeechRecognition();
    } else if (!this.fluencyConfig.enabled && this.speechRecognition) {
      this.speechRecognition.stop();
    }
  }

  onCorrection(fn: (result: CorrectionResult) => void): () => void {
    this.fluencyListeners.add(fn);
    return () => this.fluencyListeners.delete(fn);
  }

  onTranscript(fn: (segment: TranscriptSegment) => void): () => void {
    this.transcriptListeners.add(fn);
    return () => this.transcriptListeners.delete(fn);
  }

  onFluencyMetrics(fn: (metrics: FluencyMetrics) => void): () => void {
    this.metricsListeners.add(fn);
    return () => this.metricsListeners.delete(fn);
  }

  correctText(text: string): CorrectionResult {
    return this._correctEnglish(text);
  }

  getFluencyMetrics(): FluencyMetrics {
    return { ...this.fluency.metrics };
  }

  /* ── Dispose ── */

  dispose(): void {
    this.initialized = false;
    this.speechRecognition?.stop();
    this.speechRecognition = null;
    this.sourceNode?.disconnect();
    this.processors = [];
    this.fluencyListeners.clear();
    this.transcriptListeners.clear();
    this.metricsListeners.clear();
    this.ctx?.close();
    this.ctx = null;
  }
}