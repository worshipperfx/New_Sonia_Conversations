import React from "react";
import UploadForm from "./UploadForm.jsx";

export default function UploadModal({ onClose, onSuccess }) {
  const handleSuccess = (response) => {
    onSuccess(response);
  };

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleUploadSuccess = (response) => {
    // Add upload confirmation message
    addMessage({
      type: "system",
      content: ` Document uploaded successfully! Processed ${response.chunks_uploaded} text chunks. I can now answer questions about this document.`,
    });

    // Close modal
    setShowUploadModal(false);

    // Auto-ask for summary after a short delay
    setTimeout(() => {
      addMessage({
        type: "user",
        content: "Please provide a comprehensive summary of the uploaded document.",
      });

      // Send summary request
      setIsLoading(true);
      const formData = new FormData();
      formData.append("question", "Please provide a comprehensive summary of the uploaded document, highlighting the key points and main themes.");
      
      fetch("/api/chat", {
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

  return (
    <div className="modal-backdrop" onClick={handleBackdropClick}>
      <div className="modal-container">
        <div className="modal-header">
          <h2>Upload Document</h2>
          <button className="modal-close" onClick={onClose}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18"/>
              <line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>
        
        <div className="modal-body">
          <UploadForm 
            endpoint="/api/upload" 
            onSuccess={handleUploadSuccess}
            hideResponse={true}
          />
        </div>
      </div>
    </div>
  );
}

