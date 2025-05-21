
import * as Tone from 'tone';

export interface Instrument {
  synth: Tone.Synth<Tone.SynthOptions> | Tone.NoiseSynth | Tone.MembraneSynth | Tone.MetalSynth | Tone.MonoSynth;
  triggerAttackRelease: (note: string | number, duration: string | number, time?: number) => void;
}

export type Pattern = boolean[][];

// We no longer need the StepSequencerProps interface with onAudioAnalysis
