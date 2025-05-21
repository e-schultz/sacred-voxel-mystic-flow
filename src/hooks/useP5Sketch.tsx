
import { useEffect, useRef } from 'react';
import p5 from 'p5';
import { Hexagon, Triangle, ColorPalette } from '../types/geometryTypes';
import {
  drawCenterCircle,
  drawTriangularPattern,
  drawRadialLines,
  drawHexagonGrid,
  drawOverlay
} from '../utils/geometryDrawing';
import { AudioAnalysisData } from '../services/AudioManager';

interface UseP5SketchProps {
  containerRef: React.RefObject<HTMLDivElement>;
  audioData: AudioAnalysisData;
  onMessageChange: () => void;
}

export const useP5Sketch = ({ containerRef, audioData, onMessageChange }: UseP5SketchProps) => {
  const p5InstanceRef = useRef<p5 | null>(null);
  const frameRateRef = useRef<number>(0);
  const isDestroyedRef = useRef<boolean>(false);
  
  useEffect(() => {
    if (!containerRef.current || isDestroyedRef.current) return;
    
    console.log("Creating new p5 instance");
    isDestroyedRef.current = false;

    // Color palette
    const colors: ColorPalette = {
      bg: [10, 5, 20],
      primary: [200, 50, 180],
      secondary: [50, 180, 230],
      highlight: [255, 90, 120],
      dark: [30, 10, 50],
      light: [200, 200, 255]
    };

    const sketch = (p: p5) => {
      let time = 0;
      let hexGrid: Hexagon[] = [];
      let triangleGrid: Triangle[] = [];
      let messageChangeTimer = 0;
      let hexSize = 30;
      let triangleSize = 60;
      let lastFrameTime = 0;
      
      // Initialize objects once
      const initializeObjects = () => {
        console.log("Initializing p5 objects");
        // Create hexagon grid
        hexGrid = []; // Clear existing grid
        for (let i = 0; i < 20; i++) {
          let x = p.random(-p.width/2, p.width/2);
          let y = p.random(-p.height/2, p.height/2);
          let z = p.random(-500, -100);
          let size = p.random(hexSize * 0.5, hexSize * 2);
          let rotSpeed = p.random(0.005, 0.02) * (p.random() > 0.5 ? 1 : -1);
          let hue = p.random() > 0.5 ? colors.primary : colors.secondary;
          
          hexGrid.push({
            x, y, z, size, rotSpeed, hue, 
            yOffset: p.random(0, 1000),
            phase: p.random(p.TWO_PI)
          });
        }
        
        // Create triangles for sacred geometry
        triangleGrid = []; // Clear existing grid
        let numTriangles = 6;
        for (let i = 0; i < numTriangles; i++) {
          let angle = p.TWO_PI * i / numTriangles;
          triangleGrid.push({
            angle: angle,
            distance: triangleSize * 2,
            size: triangleSize,
            rotSpeed: 0.002,
            phase: p.random(p.TWO_PI)
          });
        }
      };

      p.setup = () => {
        try {
          const canvas = p.createCanvas(window.innerWidth, window.innerHeight, p.WEBGL);
          // Use hardware acceleration if available
          // @ts-ignore - p5 WebGL renderer has these properties but typing doesn't
          if (canvas.GL) {
            // @ts-ignore
            canvas.GL.getExtension('OES_texture_float');
            // @ts-ignore
            canvas.GL.getExtension('WEBGL_color_buffer_float');
          }
          
          p.frameRate(60); // Set target frame rate
          initializeObjects();
          console.log("P5 setup complete, canvas created with WEBGL renderer");
        } catch (error) {
          console.error("Error in p5 setup:", error);
        }
      };
      
      p.draw = () => {
        try {
          // Measure performance
          const frameStart = performance.now();
          
          p.background(colors.bg);
          
          // Extract audio data
          const {
            bassEnergy = 0,
            midEnergy = 0,
            highEnergy = 0,
            fullEnergy = 0
          } = audioData || {};
          
          // Calculate framerate
          const now = Date.now();
          if (lastFrameTime !== 0) {
            const delta = now - lastFrameTime;
            if (delta > 0) {
              frameRateRef.current = 1000 / delta;
            }
          }
          lastFrameTime = now;
          
          // Global lighting
          p.ambientLight(40 + highEnergy * 30, 40 + midEnergy * 20, 60 + bassEnergy * 40);
          p.pointLight(255, 255, 255, 0, 0, 300);
          
          // Update time and message
          time += 0.01;
          messageChangeTimer += 0.01;
          
          if (messageChangeTimer > 5) {
            messageChangeTimer = 0;
            onMessageChange();
          }
          
          // Camera movement - affected by bass
          let camX = p.sin(time * 0.2) * 100 + bassEnergy * 50;
          let camY = p.cos(time * 0.1) * 50 + midEnergy * 30;
          p.camera(camX, camY, 500, 0, 0, 0, 0, 1, 0);
          
          // Center geometry
          p.push();
          p.translate(0, 0, -200);
          p.rotateX(p.sin(time * 0.1) * 0.1 + bassEnergy * 0.05);
          p.rotateY(time * 0.1 + midEnergy * 0.1);
          
          // Draw center circle
          drawCenterCircle(p, time, triangleSize, colors, bassEnergy, midEnergy);
          
          // Draw triangular pattern
          drawTriangularPattern(p, time, triangleGrid, colors, midEnergy);
          
          // Draw radial lines
          drawRadialLines(p, time, colors, highEnergy);
          
          p.pop();
          
          // Draw hexagon grid - only visible ones for performance
          const visibleHexagons = hexGrid.filter(hex => 
            hex.z + p.sin(time + hex.yOffset) * 50 + bassEnergy * 200 > -500 && 
            hex.z + p.sin(time + hex.yOffset) * 50 + bassEnergy * 200 < 0
          );
          
          drawHexagonGrid(p, time, visibleHexagons, colors, bassEnergy, midEnergy);
          
          // Overlay effect - simplified for performance
          drawOverlay(p, colors, fullEnergy);
        } catch (error) {
          console.error("Error in p5 draw:", error);
        }
      };

      p.mousePressed = () => {
        // Change message on click
        onMessageChange();
        messageChangeTimer = 0;
        return false; // Prevent default behavior
      };
      
      p.windowResized = () => {
        try {
          console.log("P5: Window resized");
          p.resizeCanvas(window.innerWidth, window.innerHeight);
          // Re-initialize objects when window is resized to ensure proper scaling
          initializeObjects();
        } catch (error) {
          console.error("Error in p5 windowResized:", error);
        }
      };
    };

    // Start the sketch
    p5InstanceRef.current = new p5(sketch, containerRef.current);

    // Clean up
    return () => {
      if (p5InstanceRef.current) {
        console.log("Removing p5 instance");
        p5InstanceRef.current.remove();
        p5InstanceRef.current = null;
        isDestroyedRef.current = true;
      }
    };
  }, [containerRef, audioData, onMessageChange]);

  return p5InstanceRef.current;
};
