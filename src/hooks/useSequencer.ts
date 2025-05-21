
import { useState, useEffect, useRef } from 'react';
import { Pattern } from '@/types/sequencerTypes';
import { useAudioAnalyzer } from './useAudioAnalyzer';
import { createInstruments, disposeInstruments } from '@/utils/createInstruments';
import { useSequencePlayer } from './useSequencePlayer';

export const useSequencer = (initialPattern: Pattern, bpm: number, onAudioAnalysis: (data: Uint8Array) => void) => {
  const [steps, setSteps] = useState<Pattern>(initialPattern);
  const [currentStep, setCurrentStep] = useState(0);
  
  const instrumentsRef = useRef(createInstruments());
  const { updateAnalyzer } = useAudioAnalyzer(onAudioAnalysis);
  
  const { isPlaying, togglePlay, updatePatternRef } = useSequencePlayer(
    initialPattern,
    bpm,
    instrumentsRef.current,
    (step) => {
      setCurrentStep(step);
      updateAnalyzer();
    }
  );
  
  // Update pattern reference when steps change
  useEffect(() => {
    updatePatternRef(steps);
  }, [steps, updatePatternRef]);
  
  // Clean up instruments on unmount
  useEffect(() => {
    return () => {
      disposeInstruments(instrumentsRef.current);
    };
  }, []);
  
  const toggleStep = (instrumentIndex: number, stepIndex: number) => {
    const newSteps = [...steps];
    newSteps[instrumentIndex] = [...newSteps[instrumentIndex]]; // Create a copy of the row
    newSteps[instrumentIndex][stepIndex] = !newSteps[instrumentIndex][stepIndex];
    setSteps(newSteps);
  };

  return {
    steps,
    currentStep,
    isPlaying,
    togglePlay,
    toggleStep
  };
};

export default useSequencer;
