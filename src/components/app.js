import React from 'react';

import Details from './details';
import Globe from './globe';
import Intro from './intro';
import TimelineBar from './timeline-bar';
import AudioPlayer from './audio-player';
import '../index.scss';

export default function App() {
  return (
    <>
      <Globe />
      <Intro />
      <Details />
      <AudioPlayer />
    </>
  );
}
