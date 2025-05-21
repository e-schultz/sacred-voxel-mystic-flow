import React, { useState, useEffect, useRef } from 'react';
import * as Tone from 'tone';
import { Play, Pause, Music } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';

interface StepSequencerProps {
  onAudioAnalysis: (data: Uint8Array) => void;
}

interface Instrument {
  synth: Tone.Synth<Tone.SynthOptions> | Tone.NoiseSynth | Tone.MembraneSynth | Tone.MetalSynth | Tone.MonoSynth;
  triggerAttackRelease: (note: string | number, duration: string | number, time?: number) => void;
}

const StepSequencer: React.FC<StepSequencerProps> = ({ onAudioAnalysis }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [bpm, setBpm] = useState(120);
  
  // Define the initial pattern first
  const initialPattern = [
    // Pre-programmed minimal techno pattern
    [true, false, false, false, true, false, false, false, true, false, false, false, true, false, false, false], // Kick
    [false, false, true, false, false, false, true, false, false, false, true, false, false, false, true, true], // Hi-hat
    [false, false, false, false, true, false, false, false, false, false, false, false, true, false, false, false], // Percussion
    [true, false, false, false, false, false, false, true, false, false, true, false, false, false, false, false], // Bass
  ];
  
  // Create a pre-programmed pattern
  const [steps, setSteps] = useState(initialPattern);
  const [currentStep, setCurrentStep] = useState(0);
  
  // Refs to persist values without re-renders
  const sequencerRef = useRef<Tone.Sequence | null>(null);
  const instrumentsRef = useRef<Instrument[]>([]);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const dataArrayRef = useRef<Uint8Array>(new Uint8Array(128));
  const stepsRef = useRef(steps);

  // Keep stepsRef updated when steps changes
  useEffect(() => {
    stepsRef.current = steps;
  }, [steps]);

  // Initialize Tone.js
  useEffect(() => {
    // Create instruments
    const kick = new Tone.MembraneSynth({
      volume: -10,
      envelope: { attack: 0.001, decay: 0.2, sustain: 0 }
    }).toDestination();
    
    const hihat = new Tone.NoiseSynth({
      volume: -20,
      envelope: { attack: 0.001, decay: 0.1, sustain: 0 }
    }).toDestination();
    
    const perc = new Tone.MetalSynth({
      volume: -25,
      envelope: { attack: 0.001, decay: 0.1, sustain: 0 }
    }).toDestination();
    
    const bass = new Tone.MonoSynth({
      volume: -20,
      oscillator: { type: "square" },
      envelope: { attack: 0.01, decay: 0.1, sustain: 0.2, release: 0.5 }
    }).toDestination();

    // Create custom wrapper for each instrument
    instrumentsRef.current = [
      { 
        synth: kick,
        triggerAttackRelease: (note, duration, time) => kick.triggerAttackRelease(note, duration, time)
      },
      {
        synth: hihat, 
        triggerAttackRelease: (_, duration, time) => hihat.triggerAttackRelease(duration, time)
      },
      {
        synth: perc,
        triggerAttackRelease: (_, duration, time) => perc.triggerAttackRelease(duration, time)
      },
      {
        synth: bass,
        triggerAttackRelease: (note, duration, time) => bass.triggerAttackRelease(note, duration, time)
      }
    ];

    // Create analyzer for visualization
    analyserRef.current = Tone.context.createAnalyser();
    analyserRef.current.fftSize = 256;
    dataArrayRef.current = new Uint8Array(analyserRef.current.frequencyBinCount);
    Tone.Destination.connect(analyserRef.current);

    // Set up sequencer
    sequencerRef.current = new Tone.Sequence((time, step) => {
      setCurrentStep(step);
      
      // Play sounds for active steps - use stepsRef.current to always get the latest pattern
      stepsRef.current.forEach((instrumentSteps, instrumentIndex) => {
        if (instrumentSteps[step]) {
          const instrument = instrumentsRef.current[instrumentIndex];
          
          // Different handling for different instruments
          switch(instrumentIndex) {
            case 0: // Kick
              instrument.triggerAttackRelease("C1", "8n", time);
              break;
            case 1: // Hi-hat
              instrument.triggerAttackRelease("16n", time);
              break;
            case 2: // Percussion
              instrument.triggerAttackRelease("16n", time);
              break;
            case 3: // Bass
              const notes = ["C2", "G1", "A1", "F1"];
              const note = notes[Math.floor(step / 4) % notes.length];
              instrument.triggerAttackRelease(note, "8n", time);
              break;
          }
        }
      });
      
      // Update analyzer data for visualization
      if (analyserRef.current) {
        analyserRef.current.getByteFrequencyData(dataArrayRef.current);
        onAudioAnalysis(dataArrayRef.current);
      }
    }, Array.from({ length: 16 }, (_, i) => i), "16n");

    // Start transport
    Tone.Transport.bpm.value = bpm;
    
    return () => {
      // Clean up
      if (sequencerRef.current) {
        sequencerRef.current.dispose();
      }
      instrumentsRef.current.forEach(instrument => {
        // Fix the type checking issue by removing instanceof check
        if ('dispose' in instrument.synth && typeof instrument.synth.dispose === 'function') {
          instrument.synth.dispose();
        }
      });
      if (analyserRef.current) {
        Tone.Destination.disconnect(analyserRef.current);
      }
      Tone.Transport.stop();
    };
  }, []);

  // Update when BPM changes
  useEffect(() => {
    Tone.Transport.bpm.value = bpm;
  }, [bpm]);

  // Handle play state
  useEffect(() => {
    if (isPlaying) {
      if (Tone.context.state !== 'running') {
        Tone.context.resume();
      }
      Tone.Transport.start();
      sequencerRef.current?.start(0);
    } else {
      Tone.Transport.pause();
      // Don't stop the sequencer to preserve position
    }
  }, [isPlaying]);

  const togglePlay = async () => {
    // Initialize audio context on first click (required by browsers)
    if (Tone.context.state !== 'running') {
      await Tone.start();
    }
    setIsPlaying(!isPlaying);
  };

  const toggleStep = (instrumentIndex: number, stepIndex: number) => {
    const newSteps = [...steps];
    newSteps[instrumentIndex] = [...newSteps[instrumentIndex]]; // Create a copy of the row
    newSteps[instrumentIndex][stepIndex] = !newSteps[instrumentIndex][stepIndex];
    setSteps(newSteps);
  };

  const instrumentNames = ["Kick", "Hi-hat", "Perc", "Bass"];

  return (
    <div className="fixed bottom-0 left-0 z-20 w-full bg-black/70 border-t border-white/20 backdrop-blur-md p-4">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center justify-between mb-4">
          <Button 
            variant="destructive" 
            size="icon"
            className="w-16 h-16 rounded-full border-2 border-white/50 shadow-lg shadow-red-500/20"
            onClick={togglePlay}
          >
            {isPlaying ? 
              <Pause className="w-8 h-8" /> : 
              <Play className="w-8 h-8 ml-1" />
            }
          </Button>
          
          <div className="flex items-center space-x-2">
            <Music className="w-4 h-4 text-white/50" />
            <Slider
              value={[bpm]}
              min={60}
              max={180}
              step={1}
              className="w-36"
              onValueChange={(value) => setBpm(value[0])}
            />
            <span className="text-xs text-white/70 w-12">{bpm} BPM</span>
          </div>
        </div>

        <div className="grid grid-rows-4 gap-1 mb-1">
          {instrumentNames.map((name, instrumentIndex) => (
            <div key={name} className="flex items-center">
              <div className="w-10 text-xs text-white/50 mr-2">{name}</div>
              <div className="grid grid-cols-16 gap-1 flex-grow">
                {Array.from({ length: 16 }, (_, stepIndex) => (
                  <button
                    key={stepIndex}
                    className={`
                      w-full aspect-square rounded-sm border border-white/20
                      ${steps[instrumentIndex][stepIndex] ? 'bg-primary' : 'bg-black/40'} 
                      ${currentStep === stepIndex ? 'ring-1 ring-white' : ''}
                      hover:bg-white/30 transition-colors
                    `}
                    onClick={() => toggleStep(instrumentIndex, stepIndex)}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default StepSequencer;
