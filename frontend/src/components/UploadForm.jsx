import { API_ENDPOINTS } from '../config/api.js';
import React, { useCallback, useMemo, useRef, useState } from "react";
function uploadWithProgress({ url, file, metadata, onProgress, onAbortRef }) {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    onAbortRef.current = () => xhr.abort();
    xhr.open("POST", url, true);

    xhr.upload.addEventListener("progress", (evt) => {
      if (evt.lengthComputable && typeof onProgress === "function") {
        const pct = Math.round((evt.loaded / evt.total) * 100);
        onProgress(pct);
      }
    });

    xhr.onreadystatechange = () => {
      if (xhr.readyState === XMLHttpRequest.DONE) {
        const ct = xhr.getResponseHeader("Content-Type") || "";
        if (xhr.status >= 200 && xhr.status < 300) {
          try {
            const data = ct.includes("application/json")
              ? JSON.parse(xhr.responseText)
              : xhr.responseText;
            resolve(data);
          } catch {
            resolve({ raw: xhr.responseText });
          }
        } else {
          reject(new Error(`Upload failed (${xhr.status})${xhr.responseText ? `: ${xhr.responseText}` : ""}`));
        }
      }
    };

    const formData = new FormData();
    formData.append("file", file);
    const meta = {};
    if (metadata.title)  meta.title = metadata.title;
    if (metadata.author) meta.author = metadata.author;
    (metadata.extra || []).forEach((pair) => {
      if (pair.key?.trim() && pair.value?.trim()) meta[pair.key.trim()] = pair.value.trim();
    });
    if (Object.keys(meta).length > 0) formData.append("metadata", JSON.stringify(meta));

    xhr.send(formData);
  });
}

const humanFileSize = (bytes) => {
  if (!bytes && bytes !== 0) return "";
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return `${(bytes / Math.pow(1024, i)).toFixed(2)} ${["B","KB","MB","GB","TB"][i]}`;
};

export default function UploadForm({ 
  endpoint = API_ENDPOINTS.upload, 
  onSuccess, 
  hideResponse = false 
}) {
  const [file, setFile] = useState(null);
  const [metaTitle, setMetaTitle] = useState("");
  const [metaAuthor, setMetaAuthor] = useState("");
  const [extra, setExtra] = useState([{ key: "", value: "", id: crypto.randomUUID() }]);

  const [dragOver, setDragOver] = useState(false);
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState({ type: "", message: "" });
  const [response, setResponse] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const fileInputRef = useRef(null);
  const abortRef = useRef(null);

  const canSubmit = useMemo(() => !!file && !submitting, [file, submitting]);

  const onChooseFile = useCallback(() => fileInputRef.current?.click(), []);
  const onFileChange = (e) => { const f = e.target.files?.[0]; if (f) setFile(f); };

  const onDrop = (e) => { e.preventDefault(); e.stopPropagation(); setDragOver(false);
    const f = e.dataTransfer.files?.[0]; if (f) setFile(f); };
  const onDragOver = (e) => { e.preventDefault(); setDragOver(true); };
  const onDragLeave = (e) => { e.preventDefault(); setDragOver(false); };

  const addExtra = () => setExtra((rows) => [...rows, { key: "", value: "", id: crypto.randomUUID() }]);
  const removeExtra = (id) => setExtra((rows) => rows.filter((r) => r.id !== id));
  const updateExtra = (id, patch) => setExtra((rows) => rows.map((r) => (r.id === id ? { ...r, ...patch } : r)));
  const resetForm = () => {
    setFile(null); setMetaTitle(""); setMetaAuthor("");
    setExtra([{ key: "", value: "", id: crypto.randomUUID() }]);
    setProgress(0); setStatus({ type: "", message: "" });
    setResponse(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) { setStatus({ type: "error", message: "Please select a file first." }); return; }
    setSubmitting(true); setProgress(0); setStatus({ type: "", message: "" }); setResponse(null);

    try {
      const res = await uploadWithProgress({
        url: endpoint,
        file,
        metadata: { title: metaTitle, author: metaAuthor, extra },
        onProgress: setProgress,
        onAbortRef: abortRef
      });
      setStatus({ 
        type: "success", 
        message: `Document uploaded successfully! Processed ${res.chunks_uploaded} text chunks and stored in your knowledge base.` 
      });
      setResponse(res); 
      setProgress(100);
      if (onSuccess) {
        setTimeout(() => {
          onSuccess(res);
        }, 1000);
      }
    } catch (err) {
      setStatus({ type: "error", message: err.message || "Upload failed." });
    } finally {
      setSubmitting(false);
    }
  };

  const cancelUpload = () => {
    if (abortRef.current) {
      abortRef.current();
      setSubmitting(false);
      setStatus({ type: "error", message: "Upload canceled." });
    }
  };

  const handleGoToChat = () => {
    window.location.href = '/chat';
  };

  const handleGoToHome = () => {
    window.location.href = '/';
  };

  const accept = ".pdf,.doc,.docx,.txt,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,text/plain";

  return (
    <div className="card" style={{ padding: "24px" }}>
      <div className="row" style={{ gap: "20px" }}>
        <div>
          <div
            className={`dropzone ${dragOver ? "dragover" : ""}`}
            onDragOver={onDragOver}
            onDragLeave={onDragLeave}
            onDrop={onDrop}
            role="button"
            tabIndex={0}
            aria-label="Upload document"
            onClick={onChooseFile}
          >
            <input ref={fileInputRef} type="file" accept={accept} onChange={onFileChange} />
            <div className="title">{file ? "File selected" : "Drag & drop your document here"}</div>
            <div className="hint">PDF, DOCX or TXT • Click to browse</div>
            {file && (
              <div style={{ marginTop: "12px" }}>
                <span className="badge">{file.name} — {humanFileSize(file.size)}</span>
              </div>
            )}
          </div>
        </div>

        <form className="row" onSubmit={handleSubmit}>
          <div className="grid-2">
            <div>
              <div className="label">Title (optional)</div>
              <input className="input" placeholder="e.g., Company Handbook" value={metaTitle} onChange={(e) => setMetaTitle(e.target.value)} />
            </div>
            <div>
              <div className="label">Author (optional)</div>
              <input className="input" placeholder="e.g., Jane Doe" value={metaAuthor} onChange={(e) => setMetaAuthor(e.target.value)} />
            </div>
          </div>

          <div>
            <div className="label" style={{ marginBottom: "8px" }}>Additional metadata (optional)</div>
            <div className="row">
              {extra.map((row) => (
                <div className="kv-row" key={row.id}>
                  <input className="input" placeholder="Key (e.g., department)" value={row.key} onChange={(e) => updateExtra(row.id, { key: e.target.value })} />
                  <input className="input" placeholder="Value (e.g., Finance)" value={row.value} onChange={(e) => updateExtra(row.id, { value: e.target.value })} />
                  <button type="button" className="btn btn-ghost kv-remove" onClick={() => removeExtra(row.id)} aria-label="Remove metadata row">✕</button>
                </div>
              ))}
              <div>
                <button type="button" className="btn btn-ghost" onClick={addExtra}>+ Add field</button>
              </div>
            </div>
          </div>

          {submitting && (
            <div className="row">
              <div className="progress"><div style={{ width: `${progress}%` }} /></div>
              <div className="row" style={{ justifyItems: "start" }}>
                <span className="badge">Uploading… {progress}%</span>
                <button type="button" className="btn btn-ghost" onClick={cancelUpload}>Cancel</button>
              </div>
            </div>
          )}

          {status.message && (
            <div className={`alert ${status.type === "success" ? "success" : status.type === "error" ? "error" : ""}`}>
              {status.message}
            </div>
          )}

          <div className="row" style={{ gap: "12px" }}>
            <button className="btn btn-primary" type="submit" disabled={!canSubmit}>Upload File to Server</button>
            <button type="button" className="btn btn-ghost" onClick={resetForm}>Reset</button>
          </div>
        </form>
      </div>

      {/* i improved success response with a mordern */}
      {response && !hideResponse && (
        <div style={{ marginTop: "24px" }}>
          <div className="upload-success-card">
            <div className="success-header">
              <div className="success-icon">✅</div>
              <h3>Upload Complete!</h3>
            </div>
            <div className="success-content">
              <p>
                <strong>{file?.name}</strong> has been successfully processed and added to your knowledge base.
              </p>
              <div className="success-stats">
                <div className="stat-item">
                  <span className="stat-number">{response.chunks_uploaded}</span>
                  <span className="stat-label">Text Chunks</span>
                </div>
                <div className="stat-item">
                  <span className="stat-number">✓</span>
                  <span className="stat-label">Indexed</span>
                </div>
              </div>
              <div className="success-actions">
                <button 
                  className="btn btn-primary" 
                  onClick={handleGoToChat}
                  style={{ marginRight: '12px' }}
                >
                  💬 Start Conversation
                </button>
                <button 
                  className="btn btn-ghost" 
                  onClick={handleGoToHome}
                >
                  🏠 Go to Home
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}