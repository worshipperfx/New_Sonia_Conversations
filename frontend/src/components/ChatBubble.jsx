import React from "react";

export default function ChatBubble({ message }) {
  if (message.isLoading) {
    return (
      <div className="chat-bubble-container bot">
        <div className="chat-bubble bot loading">
          <div className="typing-indicator">
            <span></span>
            <span></span>
            <span></span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`chat-bubble-container ${message.type}`}>
      <div className={`chat-bubble ${message.type}`}>
        <div className="bubble-content">
          {message.content}
        </div>
        
        {message.sources && message.sources.length > 0 && (
          <div className="bubble-sources">
            <div className="sources-label">Sources:</div>
            {message.sources.map((source, index) => (
              <div key={index} className="source-item">
                📄 {source.title || source.filename}
              </div>
            ))}
          </div>
        )}
        
        <div className="bubble-time">
          {message.timestamp.toLocaleTimeString([], { 
            hour: '2-digit', 
            minute: '2-digit' 
          })}
        </div>
      </div>
    </div>
  );
}