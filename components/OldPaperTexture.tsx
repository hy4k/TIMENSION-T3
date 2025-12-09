import React from 'react';

export const OldPaperTexture: React.FC = () => {
  return (
    <div className="pointer-events-none fixed inset-0 z-50 h-full w-full opacity-40 mix-blend-multiply">
      <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
        <filter id="noiseFilter">
          <feTurbulence 
            type="fractalNoise" 
            baseFrequency="0.80" 
            numOctaves="3" 
            stitchTiles="stitch" />
        </filter>
        <rect width="100%" height="100%" filter="url(#noiseFilter)" />
      </svg>
      <div className="absolute inset-0 bg-[radial-gradient(circle,transparent_0%,rgba(139,94,60,0.2)_100%)]" />
    </div>
  );
};
