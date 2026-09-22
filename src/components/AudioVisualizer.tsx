import React, { useEffect, useRef } from 'react';
import { audioEngine } from '../utils/audioEngine';

interface AudioVisualizerProps {
  isPlaying: boolean;
  className?: string;
}

export const AudioVisualizer: React.FC<AudioVisualizerProps> = ({ isPlaying, className = '' }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const render = () => {
      if (!canvas) return;
      const width = canvas.width;
      const height = canvas.height;

      ctx.clearRect(0, 0, width, height);

      const freqData = audioEngine.getVisualizerData();

      if (freqData && isPlaying) {
        const barCount = 32;
        const barWidth = (width / barCount) - 2;

        for (let i = 0; i < barCount; i++) {
          const value = freqData[i * 2] || 0;
          const percent = value / 255;
          const barHeight = Math.max(2, percent * height);

          // VLC iconic gradient: amber-400 to orange-600
          const gradient = ctx.createLinearGradient(0, height, 0, height - barHeight);
          gradient.addColorStop(0, '#f97316'); // orange-500
          gradient.addColorStop(1, '#fbbf24'); // amber-400

          ctx.fillStyle = gradient;
          const x = i * (barWidth + 2);
          const y = height - barHeight;

          ctx.beginPath();
          ctx.roundRect(x, y, barWidth, barHeight, [2, 2, 0, 0]);
          ctx.fill();
        }
      } else {
        // Idle gentle wave
        ctx.fillStyle = 'rgba(249, 115, 22, 0.2)';
        const barCount = 32;
        const barWidth = (width / barCount) - 2;
        for (let i = 0; i < barCount; i++) {
          const x = i * (barWidth + 2);
          ctx.fillRect(x, height - 3, barWidth, 3);
        }
      }

      animationFrameRef.current = requestAnimationFrame(render);
    };

    render();

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isPlaying]);

  return (
    <canvas
      id="vlc-audio-visualizer-canvas"
      ref={canvasRef}
      width={240}
      height={32}
      className={`rounded opacity-80 pointer-events-none ${className}`}
    />
  );
};
