import React from "react";

const CelebrationConfetti: React.FC = () => {
  return (
    <div className="fixed inset-0 pointer-events-none z-[60] overflow-hidden">
      {Array.from({ length: 40 }).map((_, i) => (
        <div
          key={i}
          className="absolute animate-confetti"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 30}%`,
            width: `${6 + Math.random() * 8}px`,
            height: `${6 + Math.random() * 8}px`,
            borderRadius: Math.random() > 0.5 ? "50%" : "2px",
            background: ["#83122e", "#cca43b", "#10b981", "#f59e0b", "#3b82f6", "#ec4899"][Math.floor(Math.random() * 6)],
            animationDelay: `${Math.random() * 0.5}s`,
            animationDuration: `${1.2 + Math.random() * 0.8}s`,
          }}
        />
      ))}
    </div>
  );
};

export default CelebrationConfetti;
