import React from "react";
import UploadForm from "../components/UploadForm.jsx";

export default function UploadPage({ navigate }) {
  return (
    <>
      <section className="navbar">
        <div className="brand">
          <span className="brand-dot" />
          Sonia Conversations
        </div>
        <div className="nav-actions">
          <button className="btn btn-ghost" onClick={() => navigate("/")}>Home</button>
          <button className="btn btn-ghost" onClick={() => navigate("/upload")}>Upload</button>
        </div>
      </section>

      <main className="container">
        <div style={{ marginBottom: "20px" }}>
          <div className="badge">Uploader</div>
          <h1 style={{ margin: "8px 0 6px 0" }}>Upload documents</h1>
          <p>PDF, DOCX or TXT. We'll extract, chunk, and store in Qdrant. Optionally add metadata before upload.</p>
        </div>

        <UploadForm endpoint="/api/upload" />
      </main>
    </>
  );
}