import React, { useEffect, useRef } from 'react';
import { useStateValue } from '../state';
import TimelineNode from './timeline-node';

export default function Timeline() {
  const [{ events, activeEventIndex }] = useStateValue();
  const trackRef = useRef(null);

  // Auto-scroll the timeline to keep the active node visible
  useEffect(() => {
    if (trackRef.current && activeEventIndex !== null) {
      const activeNode = trackRef.current.children[activeEventIndex];
      if (activeNode) {
        activeNode.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
      }
    }
  }, [activeEventIndex]);

  return (
    <div className="timeline-container">
      <div className="timeline-track" ref={trackRef}>
        {events.map((event, index) => (
          <TimelineNode 
            key={event.id || index}
            event={event}
            index={index}
            isActive={index === activeEventIndex}
          />
        ))}
      </div>
    </div>
  );
}
