
import React, { useState, useCallback } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import useSequencer from '@/hooks/useSequencer';
import { initialPattern } from '@/constants/sequencerPatterns';
import SequencerGrid from './sequencer/SequencerGrid';
import TransportControls from './sequencer/TransportControls';
import { StepSequencerProps } from '@/types/sequencerTypes';

const StepSequencer: React.FC<StepSequencerProps> = ({ onAudioAnalysis }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [bpm, setBpm] = useState(120);
  
  // Memoize the audio analysis callback to prevent unnecessary re-renders
  const handleAudioAnalysis = useCallback((data: Uint8Array) => {
    onAudioAnalysis(data);
  }, [onAudioAnalysis]);
  
  const { 
    steps, 
    currentStep, 
    isPlaying, 
    togglePlay, 
    toggleStep 
  } = useSequencer(initialPattern, bpm, handleAudioAnalysis);

  return (
    <div className="fixed bottom-0 left-0 z-20 w-full bg-black/80 border-t border-white/10 backdrop-blur-md">
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <div className="flex justify-center border-b border-white/10">
          <CollapsibleTrigger asChild>
            <Button 
              variant="ghost" 
              size="sm"
              className="w-20 h-7 px-2 rounded-b-none rounded-t-none border-x border-t-0 border-white/10"
            >
              {isOpen ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
            </Button>
          </CollapsibleTrigger>
        </div>
        
        <CollapsibleContent>
          <div className="p-4 max-w-3xl mx-auto">
            <TransportControls 
              isPlaying={isPlaying}
              togglePlay={togglePlay}
              bpm={bpm}
              setBpm={setBpm}
            />
            
            <SequencerGrid 
              steps={steps}
              currentStep={currentStep}
              toggleStep={toggleStep}
            />
          </div>
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
};

export default StepSequencer;
