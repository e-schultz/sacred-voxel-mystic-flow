
import { useEffect, useState } from 'react';
import { useSubscription } from 'use-subscription';
import AudioManager, { AudioAnalysisData } from '../services/AudioManager';

export const useAudioManager = () => {
  const [isInitialized, setIsInitialized] = useState(false);
  const audioManager = AudioManager.getInstance();
  
  // Set up subscription to audio data
  const audioData = useSubscription({
    getCurrentValue: () => {
      return audioManager.audioData$.getValue();
    },
    subscribe: callback => {
      const subscription = audioManager.audioData$.subscribe(callback);
      return () => subscription.unsubscribe();
    },
  });
  
  // Initialize audio system on mount
  useEffect(() => {
    let mounted = true;
    
    const initAudio = async () => {
      const result = await audioManager.initialize();
      if (mounted && result) {
        setIsInitialized(true);
        audioManager.startAnalysis();
      }
    };
    
    initAudio();
    
    // Clean up on unmount
    return () => {
      mounted = false;
      // We don't dispose the manager here as it's a singleton
      // audioManager.stopAnalysis(); // Uncomment if we want to stop analysis when no components are using it
    };
  }, []);
  
  // Expose methods needed by components
  return {
    audioData,
    isInitialized,
    triggerAnalysisUpdate: () => audioManager.triggerAnalysisUpdate()
  };
};
