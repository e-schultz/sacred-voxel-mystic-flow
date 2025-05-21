
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

export interface ColorPalette {
  bg: number[];
  primary: number[];
  secondary: number[];
  highlight: number[];
  dark: number[];
  light: number[];
}

export interface SacredGeometryVisualizerProps {
  audioData: Uint8Array;
}
