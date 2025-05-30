import p5 from 'p5';
import { Hexagon, Triangle } from '@/types/visualization';

export function drawCenterCircle(p: p5, time: number, triangleSize: number, colors: any, bassEnergy: number, midEnergy: number) {
  p.push();
  p.rotateX(p.PI/2);
  p.noFill();
  p.stroke(colors.light[0], colors.light[1], colors.light[2], 100 + midEnergy * 100);
  p.strokeWeight(2 + bassEnergy * 3);
  p.circle(0, 0, triangleSize * 3 * (1 + bassEnergy * 0.5));
  
  p.stroke(colors.primary[0], colors.primary[1], colors.primary[2], 150);
  p.strokeWeight(1 + midEnergy * 2);
  p.circle(0, 0, triangleSize * 3.2 * (1 + midEnergy * 0.3));
  
  // Inner pulse circle - now reacts to bass
  let pulseSize = triangleSize * 2 + p.sin(time * 3) * 20 + bassEnergy * 100;
  p.stroke(colors.highlight[0], colors.highlight[1], colors.highlight[2], 200);
  p.strokeWeight(2 + bassEnergy * 5);
  p.circle(0, 0, pulseSize);
  p.pop();
  
  // Center dot
  p.push();
  p.fill(colors.highlight);
  p.noStroke();
  p.sphere(5 + bassEnergy * 15);
  p.pop();
}

export function drawTriangularPattern(p: p5, time: number, triangleGrid: Triangle[], colors: any, midEnergy: number) {
  for (let tri of triangleGrid) {
    p.push();
    // Position and rotate triangles around center - affected by mid frequencies
    p.rotateZ(tri.angle + time * tri.rotSpeed + midEnergy * 0.2);
    p.translate(0, tri.distance * (1 + midEnergy * 0.3), 0);
    p.rotateX(p.PI/2);
    
    // Pulsing effect - enhanced by audio
    let pulseAmount = p.sin(time * 2 + tri.phase) * 0.2 + 0.8 + midEnergy * 0.3;
    
    // Draw filled triangle
    p.fill(colors.primary[0], colors.primary[1], colors.primary[2], 40 + midEnergy * 60);
    p.stroke(colors.highlight[0], colors.highlight[1], colors.highlight[2], 160);
    p.strokeWeight(2 + midEnergy * 3);
    
    p.beginShape();
    let triH = tri.size * p.sqrt(3) / 2;
    p.vertex(0, -triH/2 * pulseAmount);
    p.vertex(-tri.size/2 * pulseAmount, triH/2 * pulseAmount);
    p.vertex(tri.size/2 * pulseAmount, triH/2 * pulseAmount);
    p.endShape(p.CLOSE);
    
    // Inner triangle
    p.stroke(colors.light[0], colors.light[1], colors.light[2], 100 + midEnergy * 100);
    p.strokeWeight(1 + midEnergy * 2);
    
    p.beginShape();
    let innerScale = 0.7;
    p.vertex(0, -triH/2 * innerScale);
    p.vertex(-tri.size/2 * innerScale, triH/2 * innerScale);
    p.vertex(tri.size/2 * innerScale, triH/2 * innerScale);
    p.endShape(p.CLOSE);
    
    p.pop();
  }
}

export function drawRadialLines(p: p5, time: number, colors: any, highEnergy: number) {
  // Draw radial lines emanating from center - affected by high frequencies
  p.push();
  p.stroke(colors.secondary[0], colors.secondary[1], colors.secondary[2], 100 + highEnergy * 100);
  p.strokeWeight(1 + highEnergy * 2);
  
  for (let i = 0; i < 24; i++) {
    let angle = p.TWO_PI * i / 24;
    let length = 250 + p.sin(time + i * 0.5) * 30 + highEnergy * 150;
    
    p.push();
    p.rotateZ(angle + highEnergy * 0.05);
    p.line(0, 0, 0, 0, length, 0);
    p.pop();
  }
  p.pop();
}

export function drawHexagonGrid(p: p5, time: number, hexGrid: Hexagon[], colors: any, bassEnergy: number, midEnergy: number) {
  for (let hex of hexGrid) {
    p.push();
    // Position affected by bass
    p.translate(
      hex.x, 
      hex.y, 
      hex.z + p.sin(time + hex.yOffset) * 50 + bassEnergy * 200
    );
    // Rotation affected by audio
    p.rotateX(time * hex.rotSpeed + bassEnergy * 0.2);
    p.rotateY(time * hex.rotSpeed * 1.5 + midEnergy * 0.3);
    p.rotateZ(hex.phase + time * hex.rotSpeed * 0.7);
    
    // Draw hexagon
    p.stroke(hex.hue[0], hex.hue[1], hex.hue[2], 150);
    p.strokeWeight(2 + midEnergy * 3);
    p.fill(hex.hue[0], hex.hue[1], hex.hue[2], 30 + bassEnergy * 50);
    
    p.beginShape();
    for (let i = 0; i < 6; i++) {
      let angle = p.TWO_PI * i / 6;
      // Size affected by bass
      let pxSize = hex.size * (1 + bassEnergy * 0.5);
      let px = p.cos(angle) * pxSize;
      let py = p.sin(angle) * pxSize;
      p.vertex(px, py, 0);
    }
    p.endShape(p.CLOSE);
    
    // Inner hexagon
    p.noFill();
    p.stroke(colors.light[0], colors.light[1], colors.light[2], 70 + midEnergy * 100);
    p.strokeWeight(1 + midEnergy * 1.5);
    
    p.beginShape();
    for (let i = 0; i < 6; i++) {
      let angle = p.TWO_PI * i / 6;
      let pxSize = hex.size * 0.7 * (1 + midEnergy * 0.3);
      let px = p.cos(angle) * pxSize;
      let py = p.sin(angle) * pxSize;
      p.vertex(px, py, 0);
    }
    p.endShape(p.CLOSE);
    
    // Voxel effect - hexagon extrusion - affected by bass
    let depth = hex.size * 0.3 * (1 + bassEnergy * 1);
    p.stroke(hex.hue[0], hex.hue[1], hex.hue[2], 60 + bassEnergy * 100);
    
    for (let i = 0; i < 6; i++) {
      let angle = p.TWO_PI * i / 6;
      let pxSize = hex.size * (1 + bassEnergy * 0.5);
      let px1 = p.cos(angle) * pxSize;
      let py1 = p.sin(angle) * pxSize;
      
      let nextAngle = p.TWO_PI * ((i + 1) % 6) / 6;
      let px2 = p.cos(nextAngle) * pxSize;
      let py2 = p.sin(nextAngle) * pxSize;
      
      p.line(px1, py1, 0, px1, py1, -depth);
      p.line(px1, py1, -depth, px2, py2, -depth);
    }
    
    p.pop();
  }
}

export function drawOverlay(p: p5, colors: any, fullEnergy: number, width: number, height: number) {
  p.push();
  // Reset the camera for 2D overlay
  p.camera();
  p.noStroke();
  
  // Scan line effect - intensity based on full energy
  for (let y = 0; y < height; y += 4) {
    p.fill(colors.light[0], colors.light[1], colors.light[2], 5 + fullEnergy * 10);
    p.rect(0, y, width, 1);
  }
  
  // Vignette effect
  p.drawingContext.shadowBlur = 0;
  let gradientAlpha = 150;
  for (let i = 0; i < 5; i++) {
    let size = p.map(i, 0, 5, width * 1.5, width * 0.3);
    let alpha = p.map(i, 0, 5, 0, gradientAlpha);
    p.fill(colors.dark[0], colors.dark[1], colors.dark[2], alpha);
    p.ellipse(width/2, height/2, size, size);
  }
  
  // Glitch effect - more likely with high energy
  if (p.random() > 0.97 - fullEnergy * 0.2) {
    let x = p.random(width);
    let y = p.random(height);
    let w = p.random(50, 150);
    let h = p.random(2, 8);
    p.fill(colors.highlight[0], colors.highlight[1], colors.highlight[2], 100 + fullEnergy * 100);
    p.rect(x, y, w, h);
  }
  
  p.pop();
}
