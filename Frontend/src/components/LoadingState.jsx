import { useEffect, useState } from 'react';

const loadingSteps = [
  'Parsing query semantics...',
  'Traversing knowledge graph...',
  'Calculating vector similarity...',
  'Ranking relationship scores...',
  'Synthesizing neural response...',
];

export default function LoadingState() {
  const [stepIndex, setStepIndex] = useState(0);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const stepInterval = setInterval(() => {
      setStepIndex((prev) => (prev + 1) % loadingSteps.length);
    }, 900);

    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 92) return prev;
        return prev + Math.random() * 8;
      });
    }, 400);

    return () => {
      clearInterval(stepInterval);
      clearInterval(progressInterval);
    };
  }, []);

  return (
    <div className="loading-panel glass-panel animate-slide-up">
      <div className="loading-top">
        <div className="loading-icon-wrap">
          <div className="loading-ring loading-ring-outer" />
          <div className="loading-ring loading-ring-inner" />
          <div className="loading-core" />
        </div>
        <div className="loading-text-area">
          <p className="loading-label">Neural Engine Active</p>
          <p className="loading-step">{loadingSteps[stepIndex]}</p>
        </div>
      </div>
      <div className="loading-progress-track">
        <div className="loading-progress-fill" style={{ width: `${progress}%` }} />
        <div className="loading-progress-glow" style={{ left: `${progress}%` }} />
      </div>
      <div className="loading-nodes">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="loading-node"
            style={{ '--node-delay': `${i * 0.15}s` }}
          />
        ))}
      </div>
    </div>
  );
}
