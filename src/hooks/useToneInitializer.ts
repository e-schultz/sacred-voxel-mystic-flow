
import { useEffect, useRef, useCallback } from 'react';
import * as Tone from 'tone';

export function useToneInitializer() {
  const toneStartedRef = useRef(false);
  
  useEffect(() => {
    // Check if Tone context is already running
    if (Tone.context.state === 'running') {
      toneStartedRef.current = true;
      console.log("Tone.js context already running on mount");
    }
    
    return () => {
      console.log("Tone initializer cleanup");
    };
  }, []);
  
  const startToneContext = useCallback(async (): Promise<boolean> => {
    if (Tone.context.state !== 'running') {
      console.log("Starting Tone.js context");
      try {
        await Tone.start();
        toneStartedRef.current = true;
        console.log("Tone.js context started successfully");
        return true;
      } catch (err) {
        console.error("Error starting Tone.js context:", err);
        return false;
      }
    }
    return true;
  }, []);
  
  return {
    isToneStarted: useCallback(() => toneStartedRef.current, []),
    startToneContext
  };
}
