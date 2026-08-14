import React, { useState, useRef, useEffect } from 'react';
import './audio-player.scss';

// Danh sách các file nhạc mặc định.
// Bạn hãy thả các file .mp3 của bạn vào thư mục public/audio/ và cập nhật tên file vào đây nhé!
const PLAYLIST = [
  { title: "Bản nhạc số 1", src: "./audio/b1.flac" },
  { title: "Bản nhạc số 2", src: "./audio/b2.mp3" },
  { title: "Bản nhạc số 3", src: "./audio/b3.mp3" }
];

export default function AudioPlayer() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const audioRef = useRef(null);

  useEffect(() => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.play().catch(err => {
          console.warn("Audio autoplay blocked or file missing:", err);
          setIsPlaying(false);
        });
      } else {
        audioRef.current.pause();
      }
    }
  }, [isPlaying, currentTrackIndex]);

  const handleNext = () => {
    setCurrentTrackIndex((prev) => (prev + 1) % PLAYLIST.length);
    setIsPlaying(true);
  };

  const handlePrev = () => {
    setCurrentTrackIndex((prev) => (prev === 0 ? PLAYLIST.length - 1 : prev - 1));
    setIsPlaying(true);
  };

  const currentTrack = PLAYLIST[currentTrackIndex];

  return (
    <div className="audio-player-widget">
      <audio
        ref={audioRef}
        src={currentTrack.src}
        onEnded={handleNext}
        preload="auto"
      />

      <div className="audio-controls">
        <button className="control-btn" onClick={handlePrev} title="Bài trước">
          &#9198;
        </button>

        <button
          className="play-pause-btn"
          onClick={() => setIsPlaying(!isPlaying)}
          title={isPlaying ? "Tạm dừng" : "Phát nhạc"}
        >
          {isPlaying ? '⏸' : '▶'}
        </button>

        <button className="control-btn" onClick={handleNext} title="Bài tiếp">
          &#9197;
        </button>
      </div>

      <div className="track-info">
        <div className="track-title">
          {isPlaying ? (
            <div className="marquee-content">{currentTrack.title}</div>
          ) : (
            currentTrack.title
          )}
        </div>
      </div>
    </div>
  );
}
