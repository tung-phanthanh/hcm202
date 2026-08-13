import React from 'react';
import { useStateValue } from '../state';

export default function TimelineNode({ event, index, isActive }) {
  const [, dispatch] = useStateValue();
  
  // Try to parse year nicely, some might be "19-5-1890", we just want the year
  const label = typeof event.year === 'string' ? event.year.slice(-4) : event.year;

  return (
    <div 
      className={`timeline-node ${isActive ? 'active' : ''}`}
      onClick={() => dispatch({ type: 'SET_ACTIVE_EVENT', payload: index })}
    >
      <div className="node-dot" />
      <div className="node-label">{label}</div>
    </div>
  );
}
