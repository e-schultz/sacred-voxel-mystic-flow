
import SacredGeometryVisualizer from "@/components/SacredGeometryVisualizer";
import StepSequencer from "@/components/StepSequencer";
import React, { useEffect } from "react";
import AudioManager from "@/services/AudioManager";

const Index = () => {
  // Pre-initialize AudioManager when the page loads
  useEffect(() => {
    // Initialize the audio manager and start analysis
    const audioManager = AudioManager.getInstance();
    audioManager.initialize().then(success => {
      if (success) {
        audioManager.startAnalysis();
      }
    });
    
    // Cleanup function
    return () => {
      // We don't dispose the singleton here, just stop analysis if needed
      // audioManager.stopAnalysis();
    };
  }, []);

  return (
    <div className="min-h-screen w-full bg-black">
      <SacredGeometryVisualizer />
      <StepSequencer />
    </div>
  );
};

export default Index;
