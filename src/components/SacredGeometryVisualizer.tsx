
import React, { useRef, useState } from 'react';
import { sacredGeometryMessages } from '../constants/messages';
import { useP5Sketch } from '../hooks/useP5Sketch';
import MessageDisplay from './MessageDisplay';
import { SacredGeometryVisualizerProps } from '../types/geometryTypes';

const SacredGeometryVisualizer: React.FC<SacredGeometryVisualizerProps> = ({ audioData }) => {
  const canvasRef = useRef<HTMLDivElement>(null);
  const [currentMessage, setCurrentMessage] = useState(sacredGeometryMessages[0]);
  const messageIndexRef = useRef(0);
  const audioDataRef = useRef<Uint8Array>(audioData);
  
  // Update audioDataRef when audioData prop changes
  React.useEffect(() => {
    audioDataRef.current = audioData;
  }, [audioData]);
  
  // Handle message changes
  const handleMessageChange = () => {
    messageIndexRef.current = (messageIndexRef.current + 1) % sacredGeometryMessages.length;
    setCurrentMessage(sacredGeometryMessages[messageIndexRef.current]);
  };
  
  // Initialize P5
  useP5Sketch({
    containerRef: canvasRef,
    audioDataRef: audioDataRef,
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
