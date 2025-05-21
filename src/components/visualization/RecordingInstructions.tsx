
import React from 'react';

const RecordingInstructions: React.FC = () => {
  return (
    <div className="z-10 fixed top-4 left-0 w-full text-center pointer-events-none">
      <div className="inline-block px-3 py-1 bg-black/40 rounded-md">
        <span className="font-mono text-white/60 text-sm">Press 'G' to record a 5-second GIF</span>
      </div>
    </div>
  );
};

export default RecordingInstructions;
