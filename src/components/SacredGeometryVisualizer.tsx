
import React, { useEffect, useRef, useState } from 'react';
import p5 from 'p5';

const messages = [
  "THE ONLY WAY OUT IS THROUGH",
  "MIGHT AS WELL DANCE WHILE DOING IT",
  "JOY IS AN ACT OF RESISTANCE",
  "WELCOME, SELF-DANCER",
  "FRICTION CAN BE USEFUL",
  "FEEL WHAT YOU'RE DANCING AGAINST",
  "PERFORMING REFUSAL",
  "REFUSAL TO COLLAPSE INTO LEGIBILITY",
  "AND DOING IT WITH RHYTHM"
];

interface Hexagon {
  x: number;
  y: number;
  z: number;
  size: number;
  rotSpeed: number;
  hue: number[];
  yOffset: number;
  phase: number;
}

interface Triangle {
  angle: number;
  distance: number;
  size: number;
  rotSpeed: number;
  phase: number;
}

const SacredGeometryVisualizer: React.FC = () => {
  const canvasRef = useRef<HTMLDivElement>(null);
  const [currentMessage, setCurrentMessage] = useState(messages[0]);
  const messageIndexRef = useRef(0);
  
  useEffect(() => {
    if (!canvasRef.current) return;

    // Color palette
    const colors = {
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

      p.setup = () => {
        p.createCanvas(window.innerWidth, window.innerHeight, p.WEBGL);
        
        // Create hexagon grid
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
        
        // Global lighting
        p.ambientLight(40, 40, 60);
        p.pointLight(255, 255, 255, 0, 0, 300);
        
        // Update time and message
        time += 0.01;
        messageChangeTimer += 0.01;
        
        if (messageChangeTimer > 5) {
          messageChangeTimer = 0;
          messageIndexRef.current = (messageIndexRef.current + 1) % messages.length;
          setCurrentMessage(messages[messageIndexRef.current]);
        }
        
        // Camera movement
        let camX = p.sin(time * 0.2) * 100;
        let camY = p.cos(time * 0.1) * 50;
        p.camera(camX, camY, 500, 0, 0, 0, 0, 1, 0);
        
        // Center geometry
        p.push();
        p.translate(0, 0, -200);
        p.rotateX(p.sin(time * 0.1) * 0.1);
        p.rotateY(time * 0.1);
        
        // Draw center circle
        drawCenterCircle(p, time, triangleSize, colors);
        
        // Draw triangular pattern
        drawTriangularPattern(p, time, triangleGrid, colors);
        
        // Draw radial lines
        drawRadialLines(p, time, colors);
        
        p.pop();
        
        // Draw hexagon grid
        drawHexagonGrid(p, time, hexGrid, colors);
        
        // Overlay effect
        drawOverlay(p, colors);
      };

      p.mousePressed = () => {
        // Change message on click
        messageIndexRef.current = (messageIndexRef.current + 1) % messages.length;
        setCurrentMessage(messages[messageIndexRef.current]);
        messageChangeTimer = 0;
        return false; // Prevent default behavior
      };
      
      p.windowResized = () => {
        p.resizeCanvas(window.innerWidth, window.innerHeight);
      };
    };

    // Start the sketch
    const p5Instance = new p5(sketch, canvasRef.current);

    // Clean up
    return () => {
      p5Instance.remove();
    };
  }, []);

  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center">
      <div ref={canvasRef} className="absolute inset-0 z-0" />
      
      <div className="z-10 fixed bottom-8 left-0 w-full text-center pointer-events-none">
        <div className="inline-block p-4 bg-black/50 border border-white/30 uppercase tracking-wider animate-pulse-slow">
          <span className="font-mono text-white/70 text-lg">{currentMessage}</span>
        </div>
      </div>
    </div>
  );
};

// Helper functions for drawing
function drawCenterCircle(p: p5, time: number, triangleSize: number, colors: any) {
  p.push();
  p.rotateX(p.PI/2);
  p.noFill();
  p.stroke(colors.light[0], colors.light[1], colors.light[2], 100);
  p.strokeWeight(2);
  p.circle(0, 0, triangleSize * 3);
  
  p.stroke(colors.primary[0], colors.primary[1], colors.primary[2], 150);
  p.strokeWeight(1);
  p.circle(0, 0, triangleSize * 3.2);
  
  // Inner pulse circle
  let pulseSize = triangleSize * 2 + p.sin(time * 3) * 20;
  p.stroke(colors.highlight[0], colors.highlight[1], colors.highlight[2], 200);
  p.strokeWeight(2);
  p.circle(0, 0, pulseSize);
  p.pop();
  
  // Center dot
  p.push();
  p.fill(colors.highlight);
  p.noStroke();
  p.sphere(5);
  p.pop();
}

function drawTriangularPattern(p: p5, time: number, triangleGrid: Triangle[], colors: any) {
  for (let tri of triangleGrid) {
    p.push();
    // Position and rotate triangles around center
    p.rotateZ(tri.angle + time * tri.rotSpeed);
    p.translate(0, tri.distance, 0);
    p.rotateX(p.PI/2);
    
    // Pulsing effect
    let pulseAmount = p.sin(time * 2 + tri.phase) * 0.2 + 0.8;
    
    // Draw filled triangle
    p.fill(colors.primary[0], colors.primary[1], colors.primary[2], 40);
    p.stroke(colors.highlight[0], colors.highlight[1], colors.highlight[2], 160);
    p.strokeWeight(2);
    
    p.beginShape();
    let triH = tri.size * p.sqrt(3) / 2;
    p.vertex(0, -triH/2 * pulseAmount);
    p.vertex(-tri.size/2 * pulseAmount, triH/2 * pulseAmount);
    p.vertex(tri.size/2 * pulseAmount, triH/2 * pulseAmount);
    p.endShape(p.CLOSE);
    
    // Inner triangle
    p.stroke(colors.light[0], colors.light[1], colors.light[2], 100);
    p.strokeWeight(1);
    
    p.beginShape();
    let innerScale = 0.7;
    p.vertex(0, -triH/2 * innerScale);
    p.vertex(-tri.size/2 * innerScale, triH/2 * innerScale);
    p.vertex(tri.size/2 * innerScale, triH/2 * innerScale);
    p.endShape(p.CLOSE);
    
    p.pop();
  }
}

function drawRadialLines(p: p5, time: number, colors: any) {
  // Draw radial lines emanating from center
  p.push();
  p.stroke(colors.secondary[0], colors.secondary[1], colors.secondary[2], 100);
  p.strokeWeight(1);
  
  for (let i = 0; i < 24; i++) {
    let angle = p.TWO_PI * i / 24;
    let length = 250 + p.sin(time + i * 0.5) * 30;
    
    p.push();
    p.rotateZ(angle);
    p.line(0, 0, 0, 0, length, 0);
    p.pop();
  }
  p.pop();
}

function drawHexagonGrid(p: p5, time: number, hexGrid: Hexagon[], colors: any) {
  for (let hex of hexGrid) {
    p.push();
    p.translate(hex.x, hex.y, hex.z + p.sin(time + hex.yOffset) * 50);
    p.rotateX(time * hex.rotSpeed);
    p.rotateY(time * hex.rotSpeed * 1.5);
    p.rotateZ(hex.phase + time * hex.rotSpeed * 0.7);
    
    // Draw hexagon
    p.stroke(hex.hue[0], hex.hue[1], hex.hue[2], 150);
    p.strokeWeight(2);
    p.fill(hex.hue[0], hex.hue[1], hex.hue[2], 30);
    
    p.beginShape();
    for (let i = 0; i < 6; i++) {
      let angle = p.TWO_PI * i / 6;
      let px = p.cos(angle) * hex.size;
      let py = p.sin(angle) * hex.size;
      p.vertex(px, py, 0);
    }
    p.endShape(p.CLOSE);
    
    // Inner hexagon
    p.noFill();
    p.stroke(colors.light[0], colors.light[1], colors.light[2], 70);
    p.strokeWeight(1);
    
    p.beginShape();
    for (let i = 0; i < 6; i++) {
      let angle = p.TWO_PI * i / 6;
      let px = p.cos(angle) * (hex.size * 0.7);
      let py = p.sin(angle) * (hex.size * 0.7);
      p.vertex(px, py, 0);
    }
    p.endShape(p.CLOSE);
    
    // Voxel effect - hexagon extrusion
    let depth = hex.size * 0.3;
    p.stroke(hex.hue[0], hex.hue[1], hex.hue[2], 60);
    
    for (let i = 0; i < 6; i++) {
      let angle = p.TWO_PI * i / 6;
      let px1 = p.cos(angle) * hex.size;
      let py1 = p.sin(angle) * hex.size;
      
      let nextAngle = p.TWO_PI * ((i + 1) % 6) / 6;
      let px2 = p.cos(nextAngle) * hex.size;
      let py2 = p.sin(nextAngle) * hex.size;
      
      p.line(px1, py1, 0, px1, py1, -depth);
      p.line(px1, py1, -depth, px2, py2, -depth);
    }
    
    p.pop();
  }
}

function drawOverlay(p: p5, colors: any) {
  p.push();
  // Reset the camera for 2D overlay
  p.camera();
  p.noStroke();
  
  // Scan line effect
  for (let y = 0; y < p.height; y += 4) {
    p.fill(colors.light[0], colors.light[1], colors.light[2], 5);
    p.rect(0, y, p.width, 1);
  }
  
  // Vignette effect
  p.drawingContext.shadowBlur = 0;
  let gradientAlpha = 150;
  for (let i = 0; i < 5; i++) {
    let size = p.map(i, 0, 5, p.width * 1.5, p.width * 0.3);
    let alpha = p.map(i, 0, 5, 0, gradientAlpha);
    p.fill(colors.dark[0], colors.dark[1], colors.dark[2], alpha);
    p.ellipse(p.width/2, p.height/2, size, size);
  }
  
  // Glitch effect
  if (p.random() > 0.97) {
    let x = p.random(p.width);
    let y = p.random(p.height);
    let w = p.random(50, 150);
    let h = p.random(2, 8);
    p.fill(colors.highlight[0], colors.highlight[1], colors.highlight[2], 100);
    p.rect(x, y, w, h);
  }
  
  p.pop();
}

export default SacredGeometryVisualizer;
