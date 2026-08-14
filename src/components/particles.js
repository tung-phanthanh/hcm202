import React, { useMemo } from 'react';
import './particles.scss';

export default function Particles() {
  // Generate random particles only once
  const particles = useMemo(() => {
    const items = [];
    for (let i = 0; i < 40; i++) {
      items.push({
        id: i,
        size: Math.random() * 4 + 2, // 2px to 6px
        left: Math.random() * 100, // 0 to 100%
        top: Math.random() * 100, // 0 to 100%
        animationDuration: Math.random() * 20 + 10, // 10s to 30s
        animationDelay: Math.random() * -20, // Negative delay to start immediately at random positions
      });
    }
    return items;
  }, []);

  return (
    <div className="particles-container">
      {particles.map((p) => (
        <div
          key={p.id}
          className="particle"
          style={{
            width: `${p.size}px`,
            height: `${p.size}px`,
            left: `${p.left}%`,
            top: `${p.top}%`,
            animationDuration: `${p.animationDuration}s`,
            animationDelay: `${p.animationDelay}s`,
          }}
        />
      ))}
    </div>
  );
}
