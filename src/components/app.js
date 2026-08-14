import React from 'react';

import Details from './details';
import Globe from './globe';
import Intro from './intro';
import TimelineBar from './timeline-bar';
import AudioPlayer from './audio-player';
import Quiz from './quiz';
import '../index.scss';
import '../quiz-and-intro.scss';

export default function App() {
  return (
    <>
      <Globe />
      <Intro />
      <Details />
      <AudioPlayer />
      <Quiz />
    </>
  );
}
