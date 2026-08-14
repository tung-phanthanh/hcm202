import React, { useState } from 'react';
import Fade from './fade';
import { useStateValue } from '../state';
import Tilt from './tilt';
import Particles from './particles';

export default function Intro() {
  const [{ start, isQuizOpen }, dispatch] = useStateValue();
  const [bgOffset, setBgOffset] = useState({ x: 50, y: 50 });
  const [showChapters, setShowChapters] = useState(false);

  const chapters = [
    { id: 1, title: 'Thời niên thiếu & Ra đi tìm đường cứu nước (1890 - 1911)' },
    { id: 2, title: 'Hình thành tư tưởng cứu nước (1911 - 1920)' },
    { id: 3, title: 'Phát triển tư tưởng (1920 - 1930)' },
    { id: 4, title: 'Vượt qua thử thách (1930 - 1945)' },
    { id: 5, title: 'Hoàn thiện & Phát triển (1945 - 1969)' }
  ];

  const handleMouseMove = (e) => {
    // Calculate a small offset based on mouse position for parallax
    const x = (e.clientX / window.innerWidth) * 10 - 5; // -5 to 5
    const y = (e.clientY / window.innerHeight) * 10 - 5; // -5 to 5
    setBgOffset({ x: 50 + x, y: 50 + y });
  };

  return (
    <Fade className="intro" show={!start && !isQuizOpen}>
      <div 
        className="intro-background parallax-bg" 
        style={{ 
          backgroundImage: 'url(./image/vietnam-pattern.jpg)',
          backgroundPosition: `${bgOffset.x}% ${bgOffset.y}%`
        }}
        onMouseMove={handleMouseMove}
      >
        <Particles />
        <Tilt className="intro-content">
          <h1>Quá trình hình thành tư tưởng Hồ Chí Minh</h1>
          <p className="intro-subtitle">Khám phá hành trình vĩ đại qua 5 giai đoạn lịch sử</p>
          
          {!showChapters ? (
            <div className="main-choices">
              <Tilt tiltMaxAngleX={5} tiltMaxAngleY={5} scale={1.05}>
                <button 
                  className="main-choice-btn chapter-choice"
                  onClick={() => setShowChapters(true)}
                >
                  <div className="choice-icon">🗺️</div>
                  <h2>Khám phá hành trình</h2>
                  <p>Học qua bản đồ và các cột mốc lịch sử</p>
                </button>
              </Tilt>
              
              <Tilt tiltMaxAngleX={5} tiltMaxAngleY={5} scale={1.05}>
                <button 
                  className="main-choice-btn quiz-choice"
                  onClick={() => dispatch({ type: 'START_QUIZ' })}
                >
                  <div className="choice-icon">📝</div>
                  <h2>Thử tài kiến thức</h2>
                  <p>Làm bài trắc nghiệm 20 câu hỏi ôn tập</p>
                </button>
              </Tilt>
            </div>
          ) : (
            <div className="chapter-selection fade-in">
              <button className="back-btn" onClick={() => setShowChapters(false)}>
                &#8592; Quay lại
              </button>
              <div className="chapter-list">
                {chapters.map(chapter => (
                  <Tilt key={chapter.id} tiltMaxAngleX={5} tiltMaxAngleY={5} scale={1.05}>
                    <button 
                      className="chapter-btn"
                      onClick={() => {
                        dispatch({ type: 'START_CHAPTER', payload: chapter.id });
                        setTimeout(() => setShowChapters(false), 1000); // Reset for next time
                      }}
                    >
                      <span className="chapter-number">Chương {chapter.id}</span>
                      <span className="chapter-title">{chapter.title}</span>
                    </button>
                  </Tilt>
                ))}
              </div>
            </div>
          )}
        </Tilt>
      </div>
    </Fade>
  );
}
