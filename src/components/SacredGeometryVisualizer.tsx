
import React, { useEffect, useRef, useState } from 'react';
import AudioManager from '@/services/AudioManager';
import StepSequencer from './StepSequencer';
import VisualizationSketch from './visualization/VisualizationSketch';
import MessageDisplay from './visualization/MessageDisplay';
import RecordingInstructions from './visualization/RecordingInstructions';
import { VISUALIZATION_MESSAGES } from '@/constants/messages';
import { AudioData } from '@/types/visualization';

const SacredGeometryVisualizer: React.FC = () => {
  const [currentMessage, setCurrentMessage] = useState(VISUALIZATION_MESSAGES[0]);
  const messageIndexRef = useRef(0);
  const audioDataRef = useRef<AudioData>({
    audioData: new Uint8Array(128).fill(0),
    bassEnergy: 0,
    midEnergy: 0,
    highEnergy: 0,
    fullEnergy: 0
  });
  
  // Initialize AudioManager and subscribe to audio data updates
  useEffect(() => {
    const audioManager = AudioManager.getInstance();
    
    // Initialize audio system
    audioManager.initialize().then(() => {
      audioManager.startAnalysis();
    });
    
    // Subscribe to audio data updates
    const subscription = audioManager.audioData$.subscribe(data => {
      audioDataRef.current = data;
    });
    
    return () => {
      // Clean up on unmount
      subscription.unsubscribe();
      audioManager.stopAnalysis();
    };
  }, []);
  
  // Handle message changes
  const handleMessageChange = (mode: number) => {
    if (mode === -1) {
      // Auto change after timer
      messageIndexRef.current = (messageIndexRef.current + 1) % VISUALIZATION_MESSAGES.length;
    } else if (mode === -2) {
      // Manual change on click
      messageIndexRef.current = (messageIndexRef.current + 1) % VISUALIZATION_MESSAGES.length;
    } else {
      // Direct index set (if needed)
      messageIndexRef.current = mode % VISUALIZATION_MESSAGES.length;
    }
    setCurrentMessage(VISUALIZATION_MESSAGES[messageIndexRef.current]);
  };

  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center">
      <VisualizationSketch 
        audioDataRef={audioDataRef} 
        onMessageChange={handleMessageChange} 
      />
      
      <MessageDisplay message={currentMessage} />
      <RecordingInstructions />
      
      <StepSequencer />
    </div>
  );
};

export default SacredGeometryVisualizer;
