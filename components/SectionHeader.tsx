import React from 'react';

interface Props {
  title: string;
  subtitle?: string;
  date?: string;
}

export const SectionHeader: React.FC<Props> = ({ title, subtitle, date }) => {
  return (
    <div className="border-b-4 border-double border-ink mb-6 pb-2 text-center">
      <div className="flex justify-between items-center border-b border-ink pb-1 mb-2">
         <span className="font-mono text-xs uppercase tracking-widest">Vol. XCVIII</span>
         <span className="font-mono text-xs uppercase tracking-widest">{date || "Timension Daily"}</span>
         <span className="font-mono text-xs uppercase tracking-widest">Price: 2¢</span>
      </div>
      <h1 className="font-serif text-4xl md:text-6xl font-black text-ink uppercase tracking-tight leading-none mb-2">
        {title}
      </h1>
      {subtitle && (
        <p className="font-serif italic text-lg text-ink-light">
          — {subtitle} —
        </p>
      )}
    </div>
  );
};
