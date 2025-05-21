
import { useRef, useEffect } from 'react';
import * as Tone from 'tone';

export function useAudioAnalyzer(onAudioAnalysis: (data: Uint8Array) => void) {
  const analyserRef = useRef<AnalyserNode | null>(null);
  const dataArrayRef = useRef<Uint8Array>(new Uint8Array(128));

  useEffect(() => {
    // Create analyzer for visualization
    analyserRef.current = Tone.context.createAnalyser();
    analyserRef.current.fftSize = 256;
    dataArrayRef.current = new Uint8Array(analyserRef.current.frequencyBinCount);
    Tone.Destination.connect(analyserRef.current);

    // Setup interval for audio analysis
    const analyzerInterval = setInterval(() => {
      if (analyserRef.current) {
        analyserRef.current.getByteFrequencyData(dataArrayRef.current);
        onAudioAnalysis(dataArrayRef.current);
      }
    }, 100); // Update visualization data 10 times per second

    return () => {
      clearInterval(analyzerInterval);
      if (analyserRef.current) {
        Tone.Destination.disconnect(analyserRef.current);
      }
    };
  }, [onAudioAnalysis]);

  return {
    updateAnalyzer: () => {
      if (analyserRef.current) {
        analyserRef.current.getByteFrequencyData(dataArrayRef.current);
        onAudioAnalysis(dataArrayRef.current);
      }
    }
  };
}
