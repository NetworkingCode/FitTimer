import React, { useRef, useEffect } from 'react';

interface ArcadeAnimationProps {
  isActive: boolean;
}

// Constants for our virtual canvas
const VIRTUAL_WIDTH = 180;
const VIRTUAL_HEIGHT = 320;
const STAR_COUNT = 100;
const PLAYER_Y_POS = VIRTUAL_HEIGHT - 50;

export const ArcadeAnimation: React.FC<ArcadeAnimationProps> = ({ isActive }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  // Fix: Initialize useRef with null to provide the required initial value.
  const animationFrameId = useRef<number | null>(null);
  const gameTime = useRef(0);
  
  // Use refs for game state to avoid re-renders on each frame
  const stars = useRef<{x: number, y: number, speed: number}[]>([]);
  const bullets = useRef<{x: number, y: number}[]>([]);
  const enemies = useRef<{x: number, y: number, type: number}[]>([]);
  const playerX = useRef(VIRTUAL_WIDTH / 2);
  const playerShootCooldown = useRef(0);
  const enemySpawnCooldown = useRef(0);

  const drawPixelArt = (
      ctx: CanvasRenderingContext2D, 
      pixels: string[], 
      x: number, 
      y: number, 
      colorMap: Record<string, string>,
      size: number
  ) => {
    if (!pixels || pixels.length === 0) return; // Add guard for safety
    const height = pixels.length;
    const width = pixels[0].length;
    for (let row = 0; row < height; row++) {
      for (let col = 0; col < width; col++) {
        const pixelChar = pixels[row][col];
        if (pixelChar !== ' ') {
          ctx.fillStyle = colorMap[pixelChar] || '#ff00ff'; // Default to magenta if color not found
          ctx.fillRect(Math.floor(x + col * size - (width * size / 2)), Math.floor(y + row * size), size, size);
        }
      }
    }
  };

  const playerSprite = [
    "  B  ",
    " BBB ",
    "BBDBB",
    " W W "
  ];
  const playerColors = { B: '#3a86ff', D: '#003566', W: '#adb5bd' };

  const enemySprite = [
    " R R ",
    "RRRRR",
    " YYY ",
    "  Y  "
  ];
  const enemyColors = { R: '#d00000', Y: '#faa307' };
  
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Set canvas size for pixel art scaling
    canvas.width = VIRTUAL_WIDTH;
    canvas.height = VIRTUAL_HEIGHT;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Disable anti-aliasing for crisp pixels
    ctx.imageSmoothingEnabled = false;

    const initialize = () => {
      gameTime.current = 0;
      stars.current = Array.from({ length: STAR_COUNT }, () => ({
        x: Math.random() * VIRTUAL_WIDTH,
        y: Math.random() * VIRTUAL_HEIGHT,
        speed: Math.random() * 0.5 + 0.2,
      }));
      bullets.current = [];
      enemies.current = [];
    };
    
    const gameLoop = () => {
      gameTime.current++;

      // --- UPDATE LOGIC ---
      
      // Stars
      stars.current.forEach(star => {
        star.y += star.speed;
        if (star.y > VIRTUAL_HEIGHT) {
          star.y = 0;
          star.x = Math.random() * VIRTUAL_WIDTH;
        }
      });
      
      // Player bobbing motion
      playerX.current = VIRTUAL_WIDTH / 2 + Math.sin(gameTime.current * 0.05) * 10;
      
      // Player shooting
      playerShootCooldown.current--;
      if (playerShootCooldown.current <= 0) {
          bullets.current.push({ x: playerX.current, y: PLAYER_Y_POS});
          playerShootCooldown.current = 15; // Fire every 15 frames
      }
      
      // Bullets
      bullets.current = bullets.current.filter(b => b.y > 0);
      bullets.current.forEach(b => b.y -= 4);
      
      // Enemy spawning
      enemySpawnCooldown.current--;
      if (enemySpawnCooldown.current <= 0) {
          enemies.current.push({ x: Math.random() * (VIRTUAL_WIDTH - 20) + 10, y: -20, type: 1 });
          enemySpawnCooldown.current = Math.random() * 80 + 40; // Spawn every 40-120 frames
      }
      
      // Enemies
      enemies.current = enemies.current.filter(e => e.y < VIRTUAL_HEIGHT + 20);
      enemies.current.forEach(e => e.y += 1);

      // --- DRAW LOGIC ---

      // Clear canvas
      ctx.fillStyle = '#03045e'; // Dark blue
      ctx.fillRect(0, 0, VIRTUAL_WIDTH, VIRTUAL_HEIGHT);
      
      // Draw stars
      ctx.fillStyle = '#ffffff';
      stars.current.forEach(star => {
        ctx.fillRect(star.x, star.y, 1, 1);
      });
      
      // Draw bullets
      ctx.fillStyle = '#ffdd00'; // Yellow
      bullets.current.forEach(b => {
          ctx.fillRect(b.x - 1, b.y, 2, 4);
      });

      // Draw enemies
      enemies.current.forEach(e => {
        // Fix: Corrected the order of arguments passed to drawPixelArt. The sprite data (`enemySprite`) should come before the coordinates (`e.x`, `e.y`). This fixes the type error on this line and the resulting error on line 35.
        drawPixelArt(ctx, enemySprite, e.x, e.y, enemyColors, 2);
      });

      // Draw player
      // Fix: Corrected the order of arguments passed to drawPixelArt. The sprite data (`playerSprite`) should come before the coordinates. This fixes the type error on this line.
      drawPixelArt(ctx, playerSprite, playerX.current, PLAYER_Y_POS, playerColors, 2);

      animationFrameId.current = requestAnimationFrame(gameLoop);
    };

    if (isActive) {
      initialize();
      animationFrameId.current = requestAnimationFrame(gameLoop);
    } else {
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
      }
    }

    return () => {
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
      }
    };
  }, [isActive]);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full z-0"
      style={{ pointerEvents: 'none', imageRendering: 'pixelated' }}
    />
  );
};
