import React, { useState, useEffect, useRef } from 'react';
import * as Tone from 'tone';
import { Play, Pause, Music, ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import AudioManager from '@/services/AudioManager';

const StepSequencer: React.FC = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [bpm, setBpm] = useState(120);
  const [isOpen, setIsOpen] = useState(false);
  
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
  const instrumentsRef = useRef<any[]>([]);
  const stepsRef = useRef(steps);
  const audioManagerRef = useRef(AudioManager.getInstance());

  // Keep stepsRef updated when steps changes
  useEffect(() => {
    stepsRef.current = steps;
  }, [steps]);

  // Initialize Tone.js
  useEffect(() => {
    // Create instruments with modified attack and release for Plastikman-like slower sound
    const kick = new Tone.MembraneSynth({
      volume: -10,
      envelope: { 
        attack: 0.02,    // Slower attack for more rounded kick
        decay: 0.8,      // Longer decay for sustained body
        sustain: 0.01,   // Low sustain for minimal lingering
        release: 1.4     // Longer release for more space between kicks
      },
      octaves: 5,        // Deeper kick
      pitchDecay: 0.05   // Slower pitch drop for that Plastikman sub feel
    }).toDestination();
    
    const hihat = new Tone.NoiseSynth({
      volume: -25,
      noise: { 
        type: "white"    // White noise for hi-hats
      },
      envelope: { 
        attack: 0.005,   // Fast but not instant attack
        decay: 0.2,      // Medium decay
        sustain: 0,      // No sustain
        release: 0.8     // Longer release for more atmosphere
      }
    }).toDestination();
    
    const perc = new Tone.MetalSynth({
      volume: -30,
      envelope: { 
        attack: 0.1,     // Slower attack for atmospheric percussion
        decay: 0.5,      // Longer decay
        sustain: 0.1,    // Some sustain for ambience
        release: 1.2     // Long release for spacious decay
      },
      harmonicity: 3.1,  // More harmonic complexity
      modulationIndex: 16,
      resonance: 1000,
      octaves: 1.5
    }).toDestination();
    
    const bass = new Tone.MonoSynth({
      volume: -15,
      oscillator: { 
        type: "triangle"  // Softer bass tone like in Plastikman tracks
      },
      envelope: { 
        attack: 0.1,      // Gradual attack for flowing bass
        decay: 0.3,       // Medium decay
        sustain: 0.4,     // Good sustain for flowing bass lines
        release: 2.0      // Long release for atmospheric quality
      },
      filterEnvelope: {
        attack: 0.4,      // Slow filter attack for evolving timbre
        decay: 0.3,       // Medium filter decay
        sustain: 0.3,     // Medium filter sustain
        release: 2.0,     // Long filter release
        baseFrequency: 100,
        octaves: 2.5,     // Wide filter sweep
        exponent: 2
      }
    }).toDestination();

    // Create custom wrapper for each instrument
    instrumentsRef.current = [
      { 
        synth: kick,
        triggerAttackRelease: (note: string | number, duration: string | number, time?: number) => kick.triggerAttackRelease(note, duration, time)
      },
      {
        synth: hihat, 
        triggerAttackRelease: (_: string | number, duration: string | number, time?: number) => hihat.triggerAttackRelease(duration, time)
      },
      {
        synth: perc,
        triggerAttackRelease: (_: string | number, duration: string | number, time?: number) => perc.triggerAttackRelease(duration, time)
      },
      {
        synth: bass,
        triggerAttackRelease: (note: string | number, duration: string | number, time?: number) => bass.triggerAttackRelease(note, duration, time)
      }
    ];

    // Initialize the AudioManager
    const audioManager = audioManagerRef.current;
    audioManager.initialize();

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
      
      // Trigger audio analysis update
      audioManager.triggerAnalysisUpdate();
    }, Array.from({ length: 16 }, (_, i) => i), "16n");

    // Start transport with lower default BPM for Plastikman-like pace
    Tone.Transport.bpm.value = bpm;
    
    return () => {
      // Clean up
      if (sequencerRef.current) {
        sequencerRef.current.dispose();
      }
      instrumentsRef.current.forEach(instrument => {
        if ('dispose' in instrument.synth && typeof instrument.synth.dispose === 'function') {
          instrument.synth.dispose();
        }
      });
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
      
      // Start audio analysis when playing
      audioManagerRef.current.startAnalysis();
    } else {
      Tone.Transport.pause();
      // Don't stop the sequencer to preserve position
      
      // Stop audio analysis when paused
      audioManagerRef.current.stopAnalysis();
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
            <div className="flex items-center justify-between mb-4">
              <Button 
                variant="ghost" 
                size="icon"
                className="w-12 h-12 rounded-full border-2 border-white/30 bg-black/40 hover:bg-white/10"
                onClick={togglePlay}
              >
                {isPlaying ? 
                  <Pause className="w-6 h-6 text-white/90" /> : 
                  <Play className="w-6 h-6 ml-0.5 text-white/90" />
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
                          ${steps[instrumentIndex][stepIndex] ? 'bg-blue-600' : 'bg-black/40'} 
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
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
};

export default StepSequencer;
