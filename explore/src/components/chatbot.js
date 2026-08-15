import React, { useState, useRef, useEffect } from 'react';
import { useStateValue } from '../state';

export default function Chatbot() {
  const [{ focusedMarker }] = useStateValue();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { role: 'bot', text: 'Chào bạn! Tôi là trợ lý AI am hiểu về cuộc đời và sự nghiệp của Chủ tịch Hồ Chí Minh. Bạn có câu hỏi gì không?' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userMessage }]);
    setIsLoading(true);

    // Extract context from focusedMarker if available
    let currentEvent = '';
    let currentLocation = '';
    let currentYear = '';

    if (focusedMarker) {
      currentEvent = focusedMarker.eventName || '';
      currentLocation = focusedMarker.city || '';
      currentYear = focusedMarker.year || '';
    }

    try {
      const response = await fetch('/api/ask', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          question: userMessage,
          currentEvent,
          currentLocation,
          currentYear
        })
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Something went wrong');
      }

      setMessages(prev => [...prev, { role: 'bot', text: data.answer }]);
    } catch (error) {
      console.error('Chat error:', error);
      setMessages(prev => [...prev, { role: 'bot', text: 'Xin lỗi, đã có lỗi xảy ra khi kết nối với máy chủ AI. Vui lòng thử lại sau.' }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="chatbot-container">
      {/* Chat toggle button */}
      <button 
        className={`chatbot-toggle ${isOpen ? 'open' : ''}`}
        onClick={() => setIsOpen(!isOpen)}
        title="Trợ lý AI"
      >
        {isOpen ? '✕' : '💬'}
      </button>

      {/* Chat window */}
      <div className={`chatbot-window ${isOpen ? 'show' : ''}`}>
        <div className="chatbot-header">
          <h3>Trợ lý AI Bác Hồ</h3>
          {focusedMarker && (
            <span className="chatbot-context">
              📍 {focusedMarker.city} ({focusedMarker.year})
            </span>
          )}
        </div>
        
        <div className="chatbot-messages">
          {messages.map((msg, idx) => (
            <div key={idx} className={`message-wrapper ${msg.role}`}>
              <div className="message-bubble">
                {msg.text}
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="message-wrapper bot">
              <div className="message-bubble loading">
                <span>.</span><span>.</span><span>.</span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <form className="chatbot-input-area" onSubmit={handleSend}>
          <input 
            type="text" 
            placeholder="Đặt câu hỏi về Bác..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={isLoading}
          />
          <button type="submit" disabled={!input.trim() || isLoading}>
            Gửi
          </button>
        </form>
      </div>
    </div>
  );
}
