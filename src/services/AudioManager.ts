
import * as Tone from 'tone';
import { BehaviorSubject } from 'rxjs';

// Singleton class to manage all audio-related functionality
class AudioManager {
  private static instance: AudioManager;
  private analyzer: AnalyserNode | null = null;
  private dataArray: Uint8Array = new Uint8Array(128);
  private animationFrameId: number | null = null;
  private lastAnalysisTime = 0;
  private analysisInterval = 30; // ms between analyses (33fps)

  // RxJS subjects for pub/sub pattern
  private audioDataSubject = new BehaviorSubject({
    audioData: new Uint8Array(128),
    bassEnergy: 0,
    midEnergy: 0,
    highEnergy: 0,
    fullEnergy: 0
  });

  public audioData$ = this.audioDataSubject.asObservable();

  private constructor() {
    // Private constructor for singleton
    console.log('AudioManager: Initializing singleton');
  }

  public static getInstance(): AudioManager {
    if (!AudioManager.instance) {
      AudioManager.instance = new AudioManager();
    }
    return AudioManager.instance;
  }

  public async initialize(): Promise<boolean> {
    console.log('AudioManager: Initializing audio system');
    try {
      // Start Tone.js context if not already running
      if (Tone.context.state !== 'running') {
        console.log('AudioManager: Starting Tone.js context');
        await Tone.start();
      }

      // Set up analyzer only if it doesn't exist already
      if (!this.analyzer) {
        console.log('AudioManager: Creating analyzer');
        this.analyzer = Tone.context.createAnalyser();
        this.analyzer.fftSize = 256;
        this.dataArray = new Uint8Array(this.analyzer.frequencyBinCount);
        
        // Connect analyzer to Tone.js destination
        Tone.Destination.connect(this.analyzer);
      }
      return true;
    } catch (error) {
      console.error('AudioManager: Failed to initialize', error);
      return false;
    }
  }

  public startAnalysis(): void {
    if (this.animationFrameId) {
      return; // Already running
    }
    
    console.log('AudioManager: Starting audio analysis');
    this.lastAnalysisTime = performance.now();
    this.analyzeFrame();
  }

  public stopAnalysis(): void {
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
      console.log('AudioManager: Stopped audio analysis');
    }
  }

  public getAverageEnergy(startBin: number, endBin: number): number {
    let sum = 0;
    let count = 0;
    
    for (let i = startBin; i < endBin && i < this.dataArray.length; i++) {
      sum += this.dataArray[i];
      count++;
    }
    
    // Normalize between 0 and 1
    return count > 0 ? sum / (count * 255) : 0;
  }

  public dispose(): void {
    console.log('AudioManager: Disposing resources');
    this.stopAnalysis();
    
    if (this.analyzer) {
      try {
        Tone.Destination.disconnect(this.analyzer);
        this.analyzer = null;
      } catch (error) {
        console.error('AudioManager: Error disconnecting analyzer', error);
      }
    }
  }

  // Used by sequencer to manually trigger an analysis update (if needed)
  public triggerAnalysisUpdate(): void {
    if (this.analyzer) {
      this.analyzer.getByteFrequencyData(this.dataArray);
      
      const bassEnergy = this.getAverageEnergy(0, 10);
      const midEnergy = this.getAverageEnergy(10, 30);
      const highEnergy = this.getAverageEnergy(30, 60);
      const fullEnergy = this.getAverageEnergy(0, 60);
      
      this.audioDataSubject.next({
        audioData: new Uint8Array(this.dataArray),
        bassEnergy,
        midEnergy,
        highEnergy,
        fullEnergy
      });
    }
  }

  private analyzeFrame = (): void => {
    this.animationFrameId = requestAnimationFrame(this.analyzeFrame);
    
    const now = performance.now();
    // Throttle analysis to our target framerate
    if (now - this.lastAnalysisTime < this.analysisInterval) {
      return;
    }
    this.lastAnalysisTime = now;

    if (this.analyzer) {
      // Get audio data
      this.analyzer.getByteFrequencyData(this.dataArray);
      
      // Calculate energy levels for different frequency bands
      const bassEnergy = this.getAverageEnergy(0, 10);
      const midEnergy = this.getAverageEnergy(10, 30);
      const highEnergy = this.getAverageEnergy(30, 60);
      const fullEnergy = this.getAverageEnergy(0, 60);
      
      // Publish data to subscribers
      this.audioDataSubject.next({
        audioData: new Uint8Array(this.dataArray),
        bassEnergy,
        midEnergy,
        highEnergy,
        fullEnergy
      });
    }
  }
}

export default AudioManager;
