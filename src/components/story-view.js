import React, { useEffect } from 'react';
import { useStateValue } from '../state';
import Gallery from './gallery';

export default function StoryView() {
  const [{ events, activeEventIndex }, dispatch] = useStateValue();
  
  const event = events[activeEventIndex];

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'ArrowRight') {
        dispatch({ type: 'NEXT_EVENT' });
      } else if (e.key === 'ArrowLeft') {
        dispatch({ type: 'PREV_EVENT' });
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [dispatch]);

  if (!event) return null;

  // Handle array of descriptions or single string
  const renderDescription = () => {
    if (Array.isArray(event.description)) {
      return event.description.map((text, i) => (
        <p key={i} style={{ marginBottom: '1rem' }}>{text}</p>
      ));
    }
    return <p>{event.description}</p>;
  };

  return (
    <div className="story-view">
      <button 
        className="navigation-btn prev-btn"
        onClick={() => dispatch({ type: 'PREV_EVENT' })}
        disabled={activeEventIndex === 0}
      >
        &#8249;
      </button>
      
      <div className="story-content" key={event.id}>
        <div className="story-text">
          <div className="event-year">{event.year}</div>
          <h2 className="event-title">{event.eventName}</h2>
          <div className="event-meta">
            📍 {event.location}
          </div>
          <div className="event-description">
            {renderDescription()}
          </div>
        </div>
        <div className="story-media">
          <Gallery mediaUrl={event.mediaUrl} />
        </div>
      </div>

      <button 
        className="navigation-btn next-btn"
        onClick={() => dispatch({ type: 'NEXT_EVENT' })}
        disabled={activeEventIndex === events.length - 1}
      >
        &#8250;
      </button>
    </div>
  );
}
