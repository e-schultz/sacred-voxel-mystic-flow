
import React, { useRef, useState } from 'react';
import { sacredGeometryMessages } from '../constants/messages';
import { useP5Sketch } from '../hooks/useP5Sketch';
import MessageDisplay from './MessageDisplay';
import { SacredGeometryVisualizerProps } from '../types/geometryTypes';
import { useAudioManager } from '../hooks/useAudioManager';

const SacredGeometryVisualizer: React.FC<SacredGeometryVisualizerProps> = () => {
  const canvasRef = useRef<HTMLDivElement>(null);
  const [currentMessage, setCurrentMessage] = useState(sacredGeometryMessages[0]);
  const messageIndexRef = useRef(0);
  
  // Use our new AudioManager hook instead of direct props
  const { audioData } = useAudioManager();
  
  // Handle message changes
  const handleMessageChange = () => {
    messageIndexRef.current = (messageIndexRef.current + 1) % sacredGeometryMessages.length;
    setCurrentMessage(sacredGeometryMessages[messageIndexRef.current]);
  };
  
  // Initialize P5
  useP5Sketch({
    containerRef: canvasRef,
    audioData,
    onMessageChange: handleMessageChange,
  });

  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center">
      <div ref={canvasRef} className="absolute inset-0 z-0" />
      <MessageDisplay message={currentMessage} />
    </div>
  );
};

export default SacredGeometryVisualizer;
