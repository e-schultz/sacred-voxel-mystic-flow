
import SacredGeometryVisualizer from "@/components/SacredGeometryVisualizer";
import StepSequencer from "@/components/StepSequencer";
import { useState } from "react";

const Index = () => {
  const [audioData, setAudioData] = useState<Uint8Array>(new Uint8Array(128));

  const handleAudioAnalysis = (data: Uint8Array) => {
    setAudioData(data);
  };

  return (
    <div className="min-h-screen w-full bg-black">
      <SacredGeometryVisualizer audioData={audioData} />
      <StepSequencer onAudioAnalysis={handleAudioAnalysis} />
    </div>
  );
};

export default Index;
