import React from 'react';
import { useStateValue } from '../state';

export default function Hero() {
  const [, dispatch] = useStateValue();

  return (
    <div className="hero-container">
      <h1>Hành trình tìm đường cứu nước</h1>
      <p className="hero-subtitle">1890 — 1969</p>
      <button 
        className="start-btn" 
        onClick={() => dispatch({ type: 'START_JOURNEY' })}
      >
        Bắt đầu khám phá
      </button>
    </div>
  );
}
