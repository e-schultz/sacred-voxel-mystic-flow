
import React from 'react';

interface MessageDisplayProps {
  message: string;
}

const MessageDisplay: React.FC<MessageDisplayProps> = ({ message }) => {
  return (
    <div className="z-10 fixed bottom-20 left-0 w-full text-center pointer-events-none">
      <div className="inline-block p-4 bg-black/50 border border-white/30 uppercase tracking-wider animate-pulse-slow">
        <span className="font-mono text-white/70 text-lg">{message}</span>
      </div>
    </div>
  );
};

export default MessageDisplay;
