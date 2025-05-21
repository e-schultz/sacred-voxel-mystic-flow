
import { AudioAnalysisData } from '@/services/AudioManager';

export interface ColorPalette {
  bg: number[];
  primary: number[];
  secondary: number[];
  highlight: number[];
  dark: number[];
  light: number[];
}

export interface Hexagon {
  x: number;
  y: number;
  z: number;
  size: number;
  rotSpeed: number;
  hue: number[];
  yOffset: number;
  phase: number;
}

export interface Triangle {
  angle: number;
  distance: number;
  size: number;
  rotSpeed: number;
  phase: number;
}

export interface SacredGeometryVisualizerProps {
  // Removed audioData prop as we now use AudioManager
}
