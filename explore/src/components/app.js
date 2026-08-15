import React from 'react';

import Details from './details';
import Globe from './globe';
import Intro from './intro';
import TimelineBar from './timeline-bar';
import Chatbot from './chatbot';

export default function App() {
  return (
    <>
      <Globe />
      <Intro />
      <TimelineBar />
      <Details />
      <Chatbot />
      <button 
        className="home-button-fixed" 
        onClick={() => window.location.href = '/'}
      >
        &#8592; Về màn hình chính
      </button>
    </>
  );
}
