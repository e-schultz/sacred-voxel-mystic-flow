
import React from 'react';
import { Play, Pause, Music } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';

interface TransportControlsProps {
  isPlaying: boolean;
  togglePlay: () => Promise<void>;
  bpm: number;
  setBpm: (value: number) => void;
}

const TransportControls: React.FC<TransportControlsProps> = ({ isPlaying, togglePlay, bpm, setBpm }) => {
  return (
    <div className="flex items-center justify-between mb-4">
      <Button 
        variant="ghost" 
        size="icon"
        className="w-12 h-12 rounded-full border-2 border-white/30 bg-black/40 hover:bg-white/10"
        onClick={togglePlay}
      >
        {isPlaying ? 
          <Pause className="w-6 h-6 text-white/90" /> : 
          <Play className="w-6 h-6 ml-0.5 text-white/90" />
        }
      </Button>
      
      <div className="flex items-center space-x-2">
        <Music className="w-4 h-4 text-white/50" />
        <Slider
          value={[bpm]}
          min={60}
          max={180}
          step={1}
          className="w-36"
          onValueChange={(value) => setBpm(value[0])}
        />
        <span className="text-xs text-white/70 w-12">{bpm} BPM</span>
      </div>
    </div>
  );
};

export default TransportControls;
