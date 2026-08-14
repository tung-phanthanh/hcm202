import React from 'react';

import Details from './details';
import Globe from './globe';
import Intro from './intro';
import TimelineBar from './timeline-bar';

export default function App() {
  return (
    <>
      <Globe />
      <Intro />
      <TimelineBar />
      <Details />
      <button 
        className="home-button-fixed" 
        onClick={() => window.location.href = '/'}
      >
        &#8592; Về màn hình chính
      </button>
    </>
  );
}
