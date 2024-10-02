import React, { useState, useEffect } from 'react';
import { GoogleGenerativeAI } from '@google/generative-ai';
import './ChatInterface.css';

const ChatInterface = () => {
  const [messages, setMessages] = useState([]);
  const [userInput, setUserInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [placeholderText, setPlaceholderText] = useState('Ask Gemini Aunty anything...');

  const placeholderTexts = [
    'Ask Gemini Aunty anything...',
    'What\'s on your mind?',
    'Type your question or topic...',
    'Get advice from Gemini Aunty...',
    'Start conversation with Gemini Aunty !',
    'Ask Gemini Aunty about code...',
    'Ask Gemini Aunty about sports...',
    'Ask Gemini Aunty about chess...',
    'Ask Gemini Aunty about grammer...',
  ];

  useEffect(() => {
    const intervalId = setInterval(() => {
      const currentIndex = placeholderTexts.indexOf(placeholderText);
      const nextIndex = (currentIndex + 1) % placeholderTexts.length;
      setPlaceholderText(placeholderText,placeholderTexts[nextIndex]);
    }, 3000);

    return () => clearInterval(intervalId);
  }, [placeholderTexts]);

  // Handle sending a message to the AI
  const handleSend = async () => {
    if (!userInput.trim()) return; // Prevent empty input

    const newMessages = [...messages, { sender: 'user', text: userInput ,timestamp: Date.now()}];
    setMessages(newMessages);
    setUserInput('');
    setLoading(true);
    setError(null);

    try {
      const genAI = new GoogleGenerativeAI(process.env.REACT_APP_GEMINI_API_KEY);
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
      const prompt = userInput; // Use user input as prompt
      const result = await model.generateContent(prompt);
      const reply = result.response.text() || 'Sorry, I couldn’t understand that.';

      setMessages([...newMessages, { sender: 'ai', text: reply, timestamp: Date.now() }]);
    } catch (error) {
      console.error("Error generating response:", error);
      setError('Error getting response.');
      setMessages([...newMessages, { sender: 'ai', text: 'Error getting response.' }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <div className="chatBox">
        {messages.length === 0 ? (
          <div className="start-conversation-message">

            <p>Start conversation with Gemini Aunty!</p>
            <p>Type your question or topic to get started.</p>
            <img src={require('./ai-profile-picture.jpeg')} alt="Gemini Aunty Logo" className="start-conversation-image" />

          </div>
        ) : (
          messages.map((msg, index) => (
            <div
              key={index}
              className={`message ${msg.sender === 'user' ? 'message-user' : 'message-ai'}`}
            >
              {msg.sender === 'ai' && <div className="profile-picture"></div>}
              {msg.text}

              <span className="timestamp">{formatTimestamp(msg.timestamp)}</span>
            </div>
          ))
        )}
        {loading && <div className="loading">Aunty is typing...</div>}
        {error && <div className="error">{error}</div>}
      </div>


 




      <div className="inputContainer">
        <input
          type="text"
          value={userInput}
          onChange={(e) => setUserInput(e.target.value)}
          className="input"
          placeholder={placeholderText}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              handleSend();
            }
          }}
        />
        <button onClick={handleSend} className="button" disabled={loading}>
          {loading ? 'Sending...' : 'Send'}
        </button>
      </div>
    </div>
  );
};

const formatTimestamp = (timestamp) => {
  const date = new Date(timestamp);
  const hours = date.getHours();
  const minutes = date.getMinutes();
  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
};

export default ChatInterface;