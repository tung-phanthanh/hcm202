import React, { useState, useEffect } from 'react';
import Fade from './fade';
import { useStateValue } from '../state';
import quizData from '../data/quiz_data.json';
import Particles from './particles';

export default function Quiz() {
  const [{ isQuizOpen }, dispatch] = useStateValue();
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [isFinished, setIsFinished] = useState(false);
  const [bgOffset, setBgOffset] = useState({ x: 50, y: 50 });

  useEffect(() => {
    // Reset state when quiz is opened
    if (isQuizOpen) {
      setCurrentQuestionIndex(0);
      setScore(0);
      setSelectedOption(null);
      setIsAnswered(false);
      setIsFinished(false);
    }
  }, [isQuizOpen]);

  const handleMouseMove = (e) => {
    const x = (e.clientX / window.innerWidth) * 10 - 5;
    const y = (e.clientY / window.innerHeight) * 10 - 5;
    setBgOffset({ x: 50 + x, y: 50 + y });
  };

  const handleOptionClick = (index) => {
    if (isAnswered) return;
    
    setSelectedOption(index);
    setIsAnswered(true);
    
    const currentQuestion = quizData[currentQuestionIndex];
    if (index === currentQuestion.correctAnswer) {
      setScore(prev => prev + 1);
    }
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < quizData.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
      setSelectedOption(null);
      setIsAnswered(false);
    } else {
      setIsFinished(true);
    }
  };

  const handleGoHome = () => {
    dispatch({ type: 'CLOSE_QUIZ' });
  };

  if (!isQuizOpen) return null;

  const currentQuestion = quizData[currentQuestionIndex];

  return (
    <Fade className="quiz-full-screen" show={isQuizOpen}>
      <div 
        className="quiz-background parallax-bg" 
        style={{ 
          backgroundImage: 'url(./image/vietnam-pattern.jpg)',
          backgroundPosition: `${bgOffset.x}% ${bgOffset.y}%`
        }}
        onMouseMove={handleMouseMove}
      >
        <Particles />
        <button 
          className="home-button-fixed"
          onClick={handleGoHome}
        >
          &#8962; Trang chủ
        </button>

        <div className="quiz-container fade-up-text">
          {!isFinished ? (
            <div className="quiz-content">
              <div className="quiz-header">
                <h2>Câu hỏi {currentQuestionIndex + 1} / {quizData.length}</h2>
                <div className="score-display">Điểm: {score}</div>
              </div>
              
              <div className="question-text">
                <h3>{currentQuestion.question}</h3>
              </div>

              <div className="options-container">
                {currentQuestion.options.map((option, index) => {
                  let optionClass = "quiz-option";
                  if (isAnswered) {
                    if (index === currentQuestion.correctAnswer) {
                      optionClass += " correct";
                    } else if (index === selectedOption) {
                      optionClass += " incorrect";
                    } else {
                      optionClass += " disabled";
                    }
                  } else if (selectedOption === index) {
                    optionClass += " selected";
                  }

                  return (
                    <button 
                      key={index} 
                      className={optionClass}
                      onClick={() => handleOptionClick(index)}
                      disabled={isAnswered}
                    >
                      {option}
                    </button>
                  );
                })}
              </div>

              {isAnswered && (
                <div className="explanation-container fade-in">
                  <div className={`feedback ${selectedOption === currentQuestion.correctAnswer ? 'success' : 'error'}`}>
                    {selectedOption === currentQuestion.correctAnswer ? '🎉 Chính xác!' : '❌ Chưa chính xác!'}
                  </div>
                  <p className="explanation-text"><strong>Giải thích:</strong> {currentQuestion.explanation}</p>
                  <button className="next-question-btn" onClick={handleNextQuestion}>
                    {currentQuestionIndex < quizData.length - 1 ? 'Câu tiếp theo →' : 'Xem kết quả →'}
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="quiz-results">
              <h2>Kết quả kiểm tra</h2>
              <div className="final-score">
                <span className="score-number">{score}</span> / {quizData.length}
              </div>
              <p className="result-message">
                {score === quizData.length ? 'Tuyệt vời! Bạn nắm rất vững kiến thức!' : 
                 score >= quizData.length * 0.7 ? 'Rất tốt! Kiến thức của bạn khá vững.' : 
                 score >= quizData.length * 0.5 ? 'Khá tốt! Nhưng hãy ôn tập thêm nhé.' : 
                 'Bạn cần ôn tập lại kỹ hơn về Tư tưởng Hồ Chí Minh!'}
              </p>
              <div className="result-actions">
                <button className="retry-btn" onClick={() => {
                  setCurrentQuestionIndex(0);
                  setScore(0);
                  setSelectedOption(null);
                  setIsAnswered(false);
                  setIsFinished(false);
                }}>
                  Làm lại
                </button>
                <button className="return-home-btn" onClick={handleGoHome}>
                  Về trang chủ
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </Fade>
  );
}
