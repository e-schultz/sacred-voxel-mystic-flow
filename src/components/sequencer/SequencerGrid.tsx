
import React from 'react';
import { instrumentNames } from '@/constants/sequencerPatterns';

interface SequencerGridProps {
  steps: boolean[][];
  currentStep: number;
  toggleStep: (instrumentIndex: number, stepIndex: number) => void;
}

const SequencerGrid: React.FC<SequencerGridProps> = ({ steps, currentStep, toggleStep }) => {
  return (
    <div className="grid grid-rows-4 gap-1 mb-1">
      {instrumentNames.map((name, instrumentIndex) => (
        <div key={name} className="flex items-center">
          <div className="w-10 text-xs text-white/50 mr-2">{name}</div>
          <div className="grid grid-cols-16 gap-1 flex-grow">
            {Array.from({ length: 16 }, (_, stepIndex) => (
              <button
                key={stepIndex}
                className={`
                  w-full aspect-square rounded-sm border border-white/20
                  ${steps[instrumentIndex][stepIndex] ? 'bg-blue-600' : 'bg-black/40'} 
                  ${currentStep === stepIndex ? 'ring-1 ring-white' : ''}
                  hover:bg-white/30 transition-colors
                `}
                onClick={() => toggleStep(instrumentIndex, stepIndex)}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default SequencerGrid;
