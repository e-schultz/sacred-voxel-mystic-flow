
import * as Tone from 'tone';
import { Instrument } from '@/types/sequencerTypes';

export function createInstruments(): Instrument[] {
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
  return [
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
}

export function disposeInstruments(instruments: Instrument[]): void {
  instruments.forEach(instrument => {
    if ('dispose' in instrument.synth && typeof instrument.synth.dispose === 'function') {
      instrument.synth.dispose();
    }
  });
}
