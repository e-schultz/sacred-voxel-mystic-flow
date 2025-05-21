
import { useEffect, useRef } from 'react';
import * as Tone from 'tone';

export function useToneInitializer() {
  const toneStartedRef = useRef(false);
  
  useEffect(() => {
    // Ensure Tone.js is started on component mount
    if (Tone.context.state !== 'running') {
      console.log("Starting Tone.js context on mount");
      Tone.start().then(() => {
        toneStartedRef.current = true;
        console.log("Tone.js context started successfully");
      }).catch(err => {
        console.error("Error starting Tone.js context:", err);
      });
    } else {
      toneStartedRef.current = true;
      console.log("Tone.js context already running");
    }
    
    return () => {
      console.log("Tone initializer cleanup");
    };
  }, []);
  
  const startToneContext = async (): Promise<boolean> => {
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
  };
  
  return {
    isToneStarted: () => toneStartedRef.current,
    startToneContext
  };
}
