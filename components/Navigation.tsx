
import React from 'react';
import { Home, Users, Zap, Radar } from 'lucide-react';
import { AppSection } from '../types';

interface NavigationProps {
  currentSection: AppSection;
  onNavigate: (section: AppSection) => void;
}

export const Navigation: React.FC<NavigationProps> = ({ currentSection, onNavigate }) => {
  const navItems = [
    { id: AppSection.HOME, label: 'Dashboard', icon: <Home size={20} /> },
    { id: AppSection.CHRONOSCOPE, label: 'Chronoscope', icon: <Radar size={20} /> },
    { id: AppSection.MENTORS, label: 'Mentors', icon: <Users size={20} /> },
    { id: AppSection.CHRONICLE, label: 'Simulation', icon: <Zap size={20} /> },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 z-[60] bg-paper border-t-4 border-double border-ink shadow-[0_-4px_10px_rgba(0,0,0,0.1)] pb-safe">
      <div className="max-w-3xl mx-auto flex justify-around items-center px-2">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => onNavigate(item.id)}
            className={`
              flex flex-col items-center justify-center py-3 px-2 w-full transition-all duration-300 relative
              ${currentSection === item.id
                ? 'text-ink font-bold -translate-y-2'
                : 'text-ink-light/70 hover:text-ink hover:-translate-y-1'}
            `}
          >
            {/* Active indicator shape */}
            {currentSection === item.id && (
              <div className="absolute inset-0 bg-vintage-gold/20 border-x border-t border-ink rounded-t-lg -z-10 bottom-0 top-1"></div>
            )}
            <div className="mb-1">{item.icon}</div>
            <span className="text-[10px] uppercase tracking-widest font-serif">{item.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
};
