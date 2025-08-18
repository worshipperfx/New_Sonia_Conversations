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

  return (
    <div className="modal-backdrop" onClick={handleBackdropClick}>
      <div className="modal-content">
        <div className="modal-header">
          <h2>Upload Document</h2>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>
        
        <div className="modal-body">
          <UploadForm 
            endpoint="/api/upload" 
            onSuccess={handleSuccess}
            hideResponse={true}
          />
        </div>
      </div>
    </div>
  );
}