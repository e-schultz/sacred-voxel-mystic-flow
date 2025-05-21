
import { useState, useEffect, useRef } from 'react';
import * as Tone from 'tone';
import { Pattern, Instrument } from '@/types/sequencerTypes';
import { useToneInitializer } from './useToneInitializer';

export function useSequencePlayer(
  initialPattern: Pattern,
  bpm: number,
  instruments: Instrument[],
  onStep: (step: number) => void
) {
  const [isPlaying, setIsPlaying] = useState(false);
  const sequencerRef = useRef<Tone.Sequence | null>(null);
  const stepsRef = useRef<Pattern>(initialPattern);
  const { startToneContext } = useToneInitializer();
  
  // Set up sequencer
  useEffect(() => {
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
              instrument.triggerAttackRelease("C1", "4n", time); // Longer note duration for kick
              break;
            case 1: // Hi-hat
              instrument.triggerAttackRelease("8n", time); // Longer for more decay
              break;
            case 2: // Percussion
              instrument.triggerAttackRelease("4n", time); // Longer for atmospheric percussion
              break;
            case 3: // Bass
              // Deeper notes for Plastikman-style bass
              const notes = ["A1", "G1", "F1", "E1"];
              const note = notes[Math.floor(step / 4) % notes.length];
              instrument.triggerAttackRelease(note, "4n", time); // Longer bass notes for flow
              break;
          }
        }
      });
    }, Array.from({ length: 16 }, (_, i) => i), "16n");

    return () => {
      if (sequencerRef.current) {
        sequencerRef.current.dispose();
      }
    };
  }, [bpm, instruments, onStep]);
  
  // Update pattern reference when it changes
  const updatePatternRef = (newPattern: Pattern) => {
    stepsRef.current = newPattern;
  };

  // Handle play state
  useEffect(() => {
    const handlePlayStateChange = async () => {
      if (isPlaying) {
        // Initialize audio context if not running
        const started = await startToneContext();
        if (!started) return;
        
        // Start transport and sequencer
        Tone.Transport.start();
        if (sequencerRef.current) {
          sequencerRef.current.start(0);
          console.log("Sequencer started");
        }
      } else {
        // Just pause transport, don't stop sequencer to preserve position
        Tone.Transport.pause();
        console.log("Transport paused");
      }
    };
    
    handlePlayStateChange();
  }, [isPlaying, startToneContext]);

  const togglePlay = async () => {
    console.log("Toggle play requested, current state:", !isPlaying);
    
    // Initialize audio context on first click (required by browsers)
    const started = await startToneContext();
    if (!started) return;
    
    setIsPlaying(!isPlaying);
  };
  
  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (sequencerRef.current) {
        sequencerRef.current.dispose();
      }
      Tone.Transport.stop();
    };
  }, []);
  
  return {
    isPlaying,
    togglePlay,
    updatePatternRef
  };
}
