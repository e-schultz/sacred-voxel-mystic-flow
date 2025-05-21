
import { useState, useEffect, useRef, useCallback } from 'react';
import * as Tone from 'tone';
import { Pattern, Instrument } from '@/types/sequencerTypes';
import AudioManager from '@/services/AudioManager';

export function useSequencePlayer(
  initialPattern: Pattern,
  bpm: number,
  instruments: Instrument[],
  onStep: (step: number) => void
) {
  const [isPlaying, setIsPlaying] = useState(false);
  const sequencerRef = useRef<Tone.Sequence | null>(null);
  const stepsRef = useRef<Pattern>(initialPattern);
  
  // Memoize updatePatternRef to prevent unnecessary re-renders
  const updatePatternRef = useCallback((newPattern: Pattern) => {
    stepsRef.current = newPattern;
  }, []);
  
  // Set up sequencer - use useCallback to stabilize effect dependencies
  useEffect(() => {
    // Clear previous sequencer if it exists
    if (sequencerRef.current) {
      sequencerRef.current.dispose();
    }
    
    // Update transport BPM
    Tone.Transport.bpm.value = bpm;
    
    sequencerRef.current = new Tone.Sequence((time, step) => {
      // Update current step in UI
      onStep(step);
      
      // Play sounds for active steps - use stepsRef.current to always get the latest pattern
      stepsRef.current.forEach((instrumentSteps, instrumentIndex) => {
        if (instrumentSteps[step]) {
          const instrument = instruments[instrumentIndex];
          
          // Different handling for different instruments
          switch(instrumentIndex) {
            case 0: // Kick
              instrument.triggerAttackRelease("C1", "4n", time);
              break;
            case 1: // Hi-hat
              instrument.triggerAttackRelease("8n", time);
              break;
            case 2: // Percussion
              instrument.triggerAttackRelease("4n", time);
              break;
            case 3: // Bass
              const notes = ["A1", "G1", "F1", "E1"];
              const note = notes[Math.floor(step / 4) % notes.length];
              instrument.triggerAttackRelease(note, "4n", time);
              break;
          }
        }
      });
    }, Array.from({ length: 16 }, (_, i) => i), "16n");

    // Cleanup function
    return () => {
      if (sequencerRef.current) {
        sequencerRef.current.dispose();
      }
    };
  }, [bpm, instruments, onStep]);
  
  // Handle play state
  useEffect(() => {
    if (!sequencerRef.current) return;
    
    const handlePlayStateChange = async () => {
      try {
        if (isPlaying) {
          // Initialize audio context through our AudioManager
          const audioManager = AudioManager.getInstance();
          const initialized = await audioManager.initialize();
          
          if (!initialized) {
            console.error("Failed to initialize audio context");
            return;
          }
          
          // Start transport and sequencer
          Tone.Transport.start();
          sequencerRef.current?.start(0);
          console.log("Sequencer started");
        } else {
          // Just pause transport, don't stop sequencer to preserve position
          Tone.Transport.pause();
          console.log("Transport paused");
        }
      } catch (error) {
        console.error("Error in play state change:", error);
      }
    };
    
    handlePlayStateChange();
  }, [isPlaying]);

  // Toggle play with improved error handling
  const togglePlay = async () => {
    try {
      console.log("Toggle play requested, current state:", !isPlaying);
      
      // Initialize audio context through our AudioManager
      const audioManager = AudioManager.getInstance();
      const initialized = await audioManager.initialize();
      
      if (!initialized) {
        console.error("Failed to initialize audio context");
        return;
      }
      
      setIsPlaying(prev => !prev);
    } catch (error) {
      console.error("Error toggling play:", error);
    }
  };
  
  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (sequencerRef.current) {
        sequencerRef.current.dispose();
      }
      // Make sure to stop the transport
      if (Tone.Transport.state !== "stopped") {
        Tone.Transport.stop();
      }
    };
  }, []);
  
  return {
    isPlaying,
    togglePlay,
    updatePatternRef
  };
}
