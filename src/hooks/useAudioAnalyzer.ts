
import { useRef, useEffect, useCallback } from 'react';
import * as Tone from 'tone';

export function useAudioAnalyzer(onAudioAnalysis: (data: Uint8Array) => void) {
  const analyserRef = useRef<AnalyserNode | null>(null);
  const dataArrayRef = useRef<Uint8Array>(new Uint8Array(128));
  const requestRef = useRef<number>();
  const previousTimeRef = useRef<number>();
  
  // Use requestAnimationFrame for smoother performance and throttling
  const animate = useCallback((time: number) => {
    if (previousTimeRef.current === undefined || 
        time - previousTimeRef.current > 100) { // Limit to 10fps for performance
      previousTimeRef.current = time;
      
      if (analyserRef.current) {
        analyserRef.current.getByteFrequencyData(dataArrayRef.current);
        onAudioAnalysis(dataArrayRef.current);
      }
    }
    
    requestRef.current = requestAnimationFrame(animate);
  }, [onAudioAnalysis]);
  
  // Setup analyzer once on component mount
  useEffect(() => {
    // Create analyzer for visualization
    analyserRef.current = Tone.context.createAnalyser();
    analyserRef.current.fftSize = 256;
    dataArrayRef.current = new Uint8Array(analyserRef.current.frequencyBinCount);
    
    // Connect to Tone.js destination
    try {
      Tone.Destination.connect(analyserRef.current);
    } catch (error) {
      console.error("Error connecting analyzer to Tone destination:", error);
    }

    // Start animation loop
    requestRef.current = requestAnimationFrame(animate);
    
    // Cleanup function
    return () => {
      if (requestRef.current) {
        cancelAnimationFrame(requestRef.current);
      }
      
      if (analyserRef.current) {
        try {
          Tone.Destination.disconnect(analyserRef.current);
        } catch (error) {
          console.error("Error disconnecting analyzer:", error);
        }
      }
    };
  }, [animate]);

  // Expose manual update function
  const updateAnalyzer = useCallback(() => {
    if (analyserRef.current) {
      analyserRef.current.getByteFrequencyData(dataArrayRef.current);
      onAudioAnalysis(dataArrayRef.current);
    }
  }, [onAudioAnalysis]);

  return {
    updateAnalyzer
  };
}
