import { useState, useEffect, useRef } from 'react';
import * as Tone from 'tone';
import { Instrument, Pattern } from '@/types/sequencerTypes';

export const useSequencer = (initialPattern: Pattern, bpm: number, onAudioAnalysis: (data: Uint8Array) => void) => {
  const [steps, setSteps] = useState<Pattern>(initialPattern);
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  
  const sequencerRef = useRef<Tone.Sequence | null>(null);
  const instrumentsRef = useRef<Instrument[]>([]);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const dataArrayRef = useRef<Uint8Array>(new Uint8Array(128));
  const stepsRef = useRef(steps);
  const toneStartedRef = useRef(false);

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
      
      // Update analyzer data for visualization
      if (analyserRef.current) {
        analyserRef.current.getByteFrequencyData(dataArrayRef.current);
        onAudioAnalysis(dataArrayRef.current);
      }
    }, Array.from({ length: 16 }, (_, i) => i), "16n");

    // Start transport with lower default BPM for Plastikman-like pace
    Tone.Transport.bpm.value = bpm;
    
    // Ensure Tone.js is started on component mount
    if (Tone.context.state !== 'running') {
      console.log("Starting Tone.js context on mount");
      Tone.start().then(() => {
        toneStartedRef.current = true;
        console.log("Tone.js context started successfully");
      }).catch(err => {
        console.error("Error starting Tone.js context:", err);
      });
    } else {
      toneStartedRef.current = true;
      console.log("Tone.js context already running");
    }
    
    return () => {
      // Clean up
      console.log("Cleaning up sequencer");
      if (sequencerRef.current) {
        sequencerRef.current.dispose();
      }
      
      // Stop transport before disposing instruments
      Tone.Transport.stop();
      
      instrumentsRef.current.forEach(instrument => {
        // Fix the type checking issue by removing instanceof check
        if ('dispose' in instrument.synth && typeof instrument.synth.dispose === 'function') {
          instrument.synth.dispose();
        }
      });
      
      if (analyserRef.current) {
        Tone.Destination.disconnect(analyserRef.current);
      }
    };
  }, [bpm, onAudioAnalysis]);

  // Update when BPM changes
  useEffect(() => {
    Tone.Transport.bpm.value = bpm;
  }, [bpm]);

  // Handle play state
  useEffect(() => {
    const handlePlayStateChange = async () => {
      if (isPlaying) {
        // Initialize audio context if not running
        if (Tone.context.state !== 'running') {
          console.log("Starting Tone.js on play");
          try {
            await Tone.start();
            toneStartedRef.current = true;
            console.log("Tone.js started successfully on play");
          } catch (err) {
            console.error("Error starting Tone.js on play:", err);
            return; // Don't proceed if we couldn't start
          }
        }
        
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
  }, [isPlaying]);

  const togglePlay = async () => {
    console.log("Toggle play requested, current state:", !isPlaying);
    
    // Initialize audio context on first click (required by browsers)
    if (Tone.context.state !== 'running') {
      console.log("Starting Tone.js on toggle");
      try {
        await Tone.start();
        toneStartedRef.current = true;
        console.log("Tone.js started successfully on toggle");
      } catch (err) {
        console.error("Error starting Tone.js on toggle:", err);
      }
    }
    
    setIsPlaying(!isPlaying);
  };

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
