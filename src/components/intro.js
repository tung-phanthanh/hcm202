import React from 'react';
import Fade from './fade';
import { useStateValue } from '../state';

export default function Intro() {
  const [{ start }, dispatch] = useStateValue();

  const chapters = [
    { id: 1, title: 'Thời niên thiếu & Ra đi tìm đường cứu nước (1890 - 1911)' },
    { id: 2, title: 'Hình thành tư tưởng cứu nước (1911 - 1920)' },
    { id: 3, title: 'Phát triển tư tưởng (1920 - 1930)' },
    { id: 4, title: 'Vượt qua thử thách (1930 - 1945)' },
    { id: 5, title: 'Hoàn thiện & Phát triển (1945 - 1969)' }
  ];

  return (
    <Fade className="intro" show={!start}>
      <div className="intro-background" style={{ backgroundImage: 'url(./image/vietnam-pattern.jpg)' }}>
        <div className="intro-content">
          <h1>Quá trình hình thành tư tưởng Hồ Chí Minh</h1>
          <p className="intro-subtitle">Khám phá hành trình vĩ đại qua 5 giai đoạn lịch sử</p>
          <div className="chapter-list">
            {chapters.map(chapter => (
              <button 
                key={chapter.id} 
                className="chapter-btn"
                onClick={() => dispatch({ type: 'START_CHAPTER', payload: chapter.id })}
              >
                <span className="chapter-number">Chương {chapter.id}</span>
                <span className="chapter-title">{chapter.title}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </Fade>
  );
}
