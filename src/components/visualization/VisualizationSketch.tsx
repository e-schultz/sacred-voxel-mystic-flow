
import React, { useEffect, useRef } from 'react';
import p5 from 'p5';
import { AudioData, Hexagon, Triangle, ColorPalette } from '@/types/visualization';
import { 
  drawCenterCircle, 
  drawTriangularPattern, 
  drawRadialLines, 
  drawHexagonGrid, 
  drawOverlay 
} from '@/utils/visualizationUtils';

interface VisualizationSketchProps {
  audioDataRef: React.MutableRefObject<AudioData>;
  onMessageChange: (index: number) => void;
}

const VisualizationSketch: React.FC<VisualizationSketchProps> = ({ audioDataRef, onMessageChange }) => {
  const sketchContainerRef = useRef<HTMLDivElement>(null);
  const p5InstanceRef = useRef<p5 | null>(null);

  useEffect(() => {
    if (!sketchContainerRef.current) return;

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
      let canvasWidth: number;
      let canvasHeight: number;
      
      // Add keyPressed function to handle GIF recording
      p.keyPressed = () => {
        if (p.key === 'g' || p.key === 'G') {
          console.log('Recording GIF...');
          p.saveGif('sacred-voxel-mystic', 5);
        }
        return false; // Prevent default behavior
      };

      p.setup = () => {
        canvasWidth = window.innerWidth;
        canvasHeight = window.innerHeight;
        p.createCanvas(canvasWidth, canvasHeight, p.WEBGL);
        
        // Create hexagon grid
        for (let i = 0; i < 20; i++) {
          let x = p.random(-canvasWidth/2, canvasWidth/2);
          let y = p.random(-canvasHeight/2, canvasHeight/2);
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
      
      p.draw = () => {
        p.background(colors.bg);
        
        // Get audio data from audioDataRef
        const { bassEnergy, midEnergy, highEnergy, fullEnergy } = audioDataRef.current;
        
        // Global lighting
        p.ambientLight(40 + highEnergy * 30, 40 + midEnergy * 20, 60 + bassEnergy * 40);
        p.pointLight(255, 255, 255, 0, 0, 300);
        
        // Update time and message
        time += 0.01;
        messageChangeTimer += 0.01;
        
        if (messageChangeTimer > 5) {
          messageChangeTimer = 0;
          onMessageChange(-1); // Special value to indicate auto-change
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
        
        // Draw hexagon grid
        drawHexagonGrid(p, time, hexGrid, colors, bassEnergy, midEnergy);
        
        // Overlay effect
        drawOverlay(p, colors, fullEnergy, canvasWidth, canvasHeight);
      };

      p.mousePressed = () => {
        // Change message on click
        onMessageChange(-2); // Special value to indicate manual click
        messageChangeTimer = 0;
        return false; // Prevent default behavior
      };
      
      p.windowResized = () => {
        canvasWidth = window.innerWidth;
        canvasHeight = window.innerHeight;
        p.resizeCanvas(canvasWidth, canvasHeight);
      };
    };

    // Start the sketch and store the instance
    const p5Instance = new p5(sketch, sketchContainerRef.current);
    p5InstanceRef.current = p5Instance;

    // Clean up
    return () => {
      p5Instance.remove();
      p5InstanceRef.current = null;
    };
  }, [audioDataRef, onMessageChange]);

  return <div ref={sketchContainerRef} className="absolute inset-0" />;
};

export default VisualizationSketch;
