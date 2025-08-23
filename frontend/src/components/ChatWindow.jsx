import React, { useState, useRef, useEffect } from "react";
import UploadModal from "./UploadModal.jsx";  
import { API_ENDPOINTS } from '../config/api.js';

function formatMessageContent(content) {
  content = content.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
  content = content.replace(/^- (.+)$/gm, '• $1');
  content = content.replace(/^(\d+)\. (.+)$/gm, '<div class="numbered-item"><span class="number">$1.</span> $2</div>');
  content = content.replace(/\n\n/g, '</p><p>');
  content = content.replace(/\n/g, '<br/>');
  
  return `<p>${content}</p>`;
}

export default function ChatWindow({ navigate }) {
  const [messages, setMessages] = useState([
    {
      id: 1,
      type: "bot",
      content: "Hi! I'm Sonia AI, your intelligent document assistant. Upload documents and I'll help you find answers, insights, and summaries from your content.",
      timestamp: new Date(),
      isWelcome: true
    }
  ]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const messagesEndRef = useRef(null);
  const textareaRef = useRef(null);
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px';
    }
  }, [inputValue]);
  useEffect(() => {
    if (!isLoading && !showUploadModal) {
      textareaRef.current?.focus();
    }
  }, [isLoading, showUploadModal]);

  const addMessage = (message) => {
    setMessages(prev => [...prev, { 
      ...message, 
      id: Date.now() + Math.random(),
      timestamp: new Date()
    }]);
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isLoading) return;

    const userMessage = {
      type: "user",
      content: inputValue,
    };

    addMessage(userMessage);
    setInputValue("");
    setIsLoading(true);

    try {
      const formData = new FormData();
      formData.append("question", inputValue);

      const response = await fetch(API_ENDPOINTS.chat, {
      method: "POST",
      body: formData
    });

      const data = await response.json();

      if (response.ok) {
        addMessage({
          type: "bot",
          content: data.answer,
          sources: data.sources,
        });
      } else {
        addMessage({
          type: "bot",
          content: "I apologize, but I encountered an error while processing your request. Please try again.",
          isError: true
        });
      }
    } catch (error) {
      addMessage({
        type: "bot",
        content: "I'm having trouble connecting right now. Please check your connection and try again.",
        isError: true
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleUploadSuccess = (response) => {
    addMessage({
      type: "system",
      content: `**Document uploaded successfully!** Processed ${response.chunks_uploaded} text chunks and stored in your knowledge base. I can now answer questions about this document.`,
    });
    setShowUploadModal(false);
    setTimeout(() => {
      addMessage({
        type: "user",
        content: "Please provide a comprehensive summary of the uploaded document.",
      });
      setIsLoading(true);
      const formData = new FormData();
      formData.append("question", "Please provide a comprehensive summary of the uploaded document, highlighting the key points and main themes.");
      
      fetch(API_ENDPOINTS.chat, {
        method: "POST",
        body: formData
      })
      .then(res => res.json())
      .then(data => {
        addMessage({
          type: "bot",
          content: data.answer,
          sources: data.sources,
        });
      })
      .catch(() => {
        addMessage({
          type: "bot",
          content: "I couldn't generate a summary right now. Feel free to ask me specific questions about your document!",
          isError: true
        });
      })
      .finally(() => {
        setIsLoading(false);
      });
    }, 1500);
  };

  const suggestedQuestions = [
    "Summarize the main points",
    "What are the key findings?",
    "Extract important quotes",
    "What questions does this raise?"
  ];

  const handleSuggestionClick = (question) => {
    setInputValue(question);
    textareaRef.current?.focus();
  };

  return (
    <div className="chat-container">
      {/* Header */}
      <div className="chat-header">
        <div className="header-left">
          {navigate && (
            <button 
              className="back-button"
              onClick={() => navigate("/")}
              title="Back to Home"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="m12 19-7-7 7-7"/>
                <path d="M19 12H5"/>
              </svg>
            </button>
          )}
          <div className="chat-title">
            <div className="brand-icon">
              <div className="brand-dot"></div>
            </div>
            <div>
              <h1>Sonia AI</h1>
              <p>Document Intelligence Assistant</p>
            </div>
          </div>
        </div>
        
        <div className="header-actions">
          <button 
            className="upload-button"
            onClick={() => setShowUploadModal(true)}
            title="Upload Document"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
              <polyline points="7,10 12,15 17,10"/>
              <line x1="12" y1="15" x2="12" y2="3"/>
            </svg>
            Upload
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="chat-messages">
        {messages.map((message) => (
          <MessageBubble key={message.id} message={message} />
        ))}
        
        {isLoading && <LoadingBubble />}
        
        {messages.length === 1 && (
          <div className="suggestions-container">
            <p className="suggestions-title">Try asking:</p>
            <div className="suggestions-grid">
              {suggestedQuestions.map((question, index) => (
                <button
                  key={index}
                  className="suggestion-chip"
                  onClick={() => handleSuggestionClick(question)}
                >
                  {question}
                </button>
              ))}
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="chat-input-area">
        <div className="input-container">
          <textarea
            ref={textareaRef}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Ask me anything about your documents..."
            className="chat-input"
            rows={1}
            disabled={isLoading}
          />
          <button
            onClick={handleSendMessage}
            disabled={!inputValue.trim() || isLoading}
            className="send-button"
            title="Send message"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="22" y1="2" x2="11" y2="13"/>
              <polygon points="22,2 15,22 11,13 2,9 22,2"/>
            </svg>
          </button>
        </div>
        <p className="input-hint">
          Press Enter to send, Shift+Enter for new line
        </p>
      </div>

      {/* Working Upload Modal */}
      {showUploadModal && (
        <UploadModal
          onClose={() => setShowUploadModal(false)}
          onSuccess={handleUploadSuccess}
        />
      )}
    </div>
  );
}
function MessageBubble({ message }) {
  const formatTime = (date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className={`message-container ${message.type}`}>
      {message.type === "bot" && (
        <div className="message-avatar">
          <div className="avatar-icon">S</div>
        </div>
      )}
      
      <div className="message-content">
        <div className={`message-bubble ${message.type} ${message.isError ? 'error' : ''} ${message.isWelcome ? 'welcome' : ''}`}>
          <div 
            className="bubble-text"
            dangerouslySetInnerHTML={{ 
              __html: (message.type === 'bot' || message.type === 'system') 
                ? formatMessageContent(message.content) 
                : message.content 
            }}
          />
          
          {message.sources && message.sources.length > 0 && (
            <div className="sources-section">
              <div className="sources-header">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                  <polyline points="14,2 14,8 20,8"/>
                </svg>
                Sources
              </div>
              <div className="sources-list">
                {message.sources.map((source, index) => (
                  <div key={index} className="source-item">
                    <div className="source-title">{source.title}</div>
                    <div className="source-author">by {source.author}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
        
        <div className="message-time">
          {formatTime(message.timestamp)}
        </div>
      </div>
    </div>
  );
}
function LoadingBubble() {
  return (
    <div className="message-container bot">
      <div className="message-avatar">
        <div className="avatar-icon">S</div>
      </div>
      <div className="message-content">
        <div className="message-bubble bot loading">
          <div className="typing-indicator">
            <span></span>
            <span></span>
            <span></span>
          </div>
        </div>
      </div>
    </div>
  );
}