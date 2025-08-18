import React, { useEffect } from "react";
import AOS from 'aos';
import 'aos/dist/aos.css';

export default function Landing({ navigate }) {
  useEffect(() => {
    AOS.init({
      duration: 800,
      easing: 'ease-out-cubic',
      once: true,
      offset: 100,
    });
  }, []);

  return (
    <div className="landing-page">
      {/* Navigation */}
      <nav className="landing-nav">
        <div className="nav-container">
          <div className="nav-brand">
            <div className="brand-icon-landing">
              <div className="brand-dot-landing"></div>
            </div>
            <span className="brand-text">Sonia Conversations</span>
          </div>
          <div className="nav-actions">
            <button className="nav-link" onClick={() => navigate("/upload")}>
              Upload
            </button>
            <button className="btn-primary-nav" onClick={() => navigate("/chat")}>
              Start Chat
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-container">
          <div className="hero-content" data-aos="fade-up">
            <div className="hero-badge">
              <span className="badge-text"> Powered by OpenAI & Qdrant</span>
            </div>
            <h1 className="hero-title">
              Talk to your documents.
              <span className="gradient-text"> Intelligently.</span>
            </h1>
            <p className="hero-subtitle">
              Upload PDFs, DOCX, or TXT files and get instant AI powered insights. 
              Ask questions in natural language and get precise answers with source citations.
            </p>
            <div className="hero-cta">
              <button className="btn-primary-large" onClick={() => navigate("/chat")}>
                <span>Start Chatting</span>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="m9 18 6-6-6-6"/>
                </svg>
              </button>
              <button className="btn-secondary-large" onClick={() => navigate("/upload")}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                  <polyline points="7,10 12,15 17,10"/>
                  <line x1="12" y1="15" x2="12" y2="3"/>
                </svg>
                Upload Documents
              </button>
            </div>
          </div>
          
          <div className="hero-visual" data-aos="fade-left" data-aos-delay="200">
            <div className="floating-elements">
              <div className="floating-card document-card">
                <div className="card-icon">📄</div>
                <div className="card-text">PDF Analysis</div>
              </div>
              <div className="floating-card chat-card">
                <div className="card-icon">💬</div>
                <div className="card-text">AI Chat</div>
              </div>
              <div className="floating-card insight-card">
                <div className="card-icon">✨</div>
                <div className="card-text">Smart Insights</div>
              </div>
            </div>
            <div className="neural-network">
              <div className="neural-node node-1"></div>
              <div className="neural-node node-2"></div>
              <div className="neural-node node-3"></div>
              <div className="neural-connection conn-1"></div>
              <div className="neural-connection conn-2"></div>
              <div className="neural-connection conn-3"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features-section">
        <div className="section-container">
          {/* Feature 1: Upload */}
          <div className="feature-row" data-aos="fade-right">
            <div className="feature-content">
              <div className="feature-badge"> Step 1</div>
              <h2 className="feature-title">Upload documents and extract insights instantly</h2>
              <p className="feature-description">
                Drag and drop your PDFs, DOCX, or TXT files. Our AI automatically extracts, 
                chunks, and indexes your content for lightning-fast semantic search.
              </p>
              <ul className="feature-list">
                <li>✅ Support for PDF, DOCX, TXT formats</li>
                <li>✅ Automatic text extraction and chunking</li>
                <li>✅ Metadata preservation and custom tags</li>
                <li>✅ Secure processing with OpenAI embeddings</li>
              </ul>
            </div>
            <div className="feature-visual">
              <DocumentUploadAnimation />
            </div>
          </div>

          {/* Feature 2: Chat */}
          <div className="feature-row reverse" data-aos="fade-left">
            <div className="feature-content">
              <div className="feature-badge">💬 Step 2</div>
              <h2 className="feature-title">Chat with your data in natural language</h2>
              <p className="feature-description">
                Ask questions about your documents as if you're talking to a human expert. 
                Get precise answers with source citations and relevant excerpts.
              </p>
              <ul className="feature-list">
                <li>✅ Natural language query processing</li>
                <li>✅ Context aware responses with citations</li>
                <li>✅ Multi document cross referencing</li>
                <li>✅ Conversation memory and follow ups</li>
              </ul>
            </div>
            <div className="feature-visual">
              <ChatInterfaceAnimation />
            </div>
          </div>

          {/* Feature 3: AI Power */}
          <div className="feature-row" data-aos="fade-right">
            <div className="feature-content">
              <div className="feature-badge">🔐 Step 3</div>
              <h2 className="feature-title">Powered by OpenAI + Qdrant for secure semantic search</h2>
              <p className="feature-description">
                Enterprise grade AI infrastructure ensures accurate responses while keeping 
                your data secure. No training on your content, complete privacy guaranteed.
              </p>
              <ul className="feature-list">
                <li>✅ GPT-4 powered intelligent responses</li>
                <li>✅ Qdrant vector database for fast search</li>
                <li>✅ End to end encryption and privacy</li>
                <li>✅ No data retention or model training</li>
              </ul>
            </div>
            <div className="feature-visual">
              <AIInfrastructureAnimation />
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="landing-footer">
        <div className="footer-container">
          <div className="footer-content">
            <div className="footer-brand">
              <div className="footer-logo">
                <div className="brand-icon-landing">
                  <div className="brand-dot-landing"></div>
                </div>
                <span className="brand-text">Sonia Conversations</span>
              </div>
              <p className="footer-tagline">
                Intelligent document analysis powered by AI
              </p>
            </div>

            <div className="footer-links">
              <div className="footer-column">
                <h4>Quick Links</h4>
                <a href="#" className="footer-link">Blog</a>
                <a href="#" className="footer-link">Documentation</a>
                <a href="#" className="footer-link">GitHub</a>
                <a href="#" className="footer-link">Media Kit</a>
              </div>

              <div className="footer-column">
                <h4>Legal</h4>
                <a href="#" className="footer-link">Legal Notice</a>
                <a href="#" className="footer-link">Privacy Policy</a>
                <a href="#" className="footer-link">Cookie Policy</a>
              </div>
            </div>
          </div>

          <div className="footer-bottom">
            <p className="footer-copyright">
              © 2025 Sonia Conversations — Built by Marvellous Chitenga
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

// Animated Visual Components
function DocumentUploadAnimation() {
  return (
    <div className="upload-animation">
      <div className="upload-zone">
        <div className="upload-files">
          <div className="file-item file-1">
            <div className="file-icon">📄</div>
            <span>Report.pdf</span>
          </div>
          <div className="file-item file-2">
            <div className="file-icon">📊</div>
            <span>Data.docx</span>
          </div>
          <div className="file-item file-3">
            <div className="file-icon">📝</div>
            <span>Notes.txt</span>
          </div>
        </div>
        <div className="processing-indicator">
          <div className="processing-spinner"></div>
          <span>Processing...</span>
        </div>
      </div>
    </div>
  );
}

function ChatInterfaceAnimation() {
  return (
    <div className="chat-animation">
      <div className="chat-window-demo">
        <div className="chat-header-demo">
          <div className="chat-dots">
            <span></span>
            <span></span>
            <span></span>
          </div>
        </div>
        <div className="chat-messages-demo">
          <div className="chat-bubble user-demo">
            What are the key findings in the report?
          </div>
          <div className="chat-bubble bot-demo">
            <div className="typing-demo">
              <span></span>
              <span></span>
              <span></span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function AIInfrastructureAnimation() {
  return (
    <div className="ai-animation">
      <div className="ai-network">
        <div className="ai-node openai-node">
          <div className="node-icon">🤖</div>
          <span>OpenAI</span>
        </div>
        <div className="ai-node qdrant-node">
          <div className="node-icon">🗄️</div>
          <span>Qdrant</span>
        </div>
        <div className="ai-connection"></div>
        <div className="data-flow">
          <div className="data-packet"></div>
        </div>
      </div>
      <div className="security-badge">
        <div className="security-icon">🔒</div>
        <span>Enterprise Security</span>
      </div>
    </div>
  );
}