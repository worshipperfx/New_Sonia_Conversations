import React from "react";

export default function ChatPlaceholder({ navigate }) {
  return (
    <>
      <section className="navbar">
        <div className="brand">
          <span className="brand-dot" />
          Sonya Conversations
        </div>
        <div className="nav-actions">
          <button className="btn btn-ghost" onClick={() => navigate("/")}>Home</button>
          <button className="btn btn-ghost" onClick={() => navigate("/upload")}>Upload</button>
        </div>
      </section>

      <main className="container">
        <div className="card" style={{ padding: 24 }}>
          <h1>Chat coming soon</h1>
          <p style={{ marginTop: 8 }}>
            This is a placeholder for the conversation UI. Upload your documents first, then we'll enable chat over your private corpus.
          </p>
          <div style={{ marginTop: 16 }}>
            <button className="btn btn-primary" onClick={() => navigate("/upload")}>Start Upload</button>
          </div>
        </div>
      </main>
    </>
  );
}