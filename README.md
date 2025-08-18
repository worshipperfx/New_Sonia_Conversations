# Sonia Conversations

**"Upload your documents. Ask anything. Get intelligent answers powered by GPT."**

Sonia Conversations is an AI powered document assistant that transforms how you interact with your files. Simply upload PDFs, DOCX, or CSV documents, and start having natural language conversations with your content.

Powered by OpenAI's GPT-4 and advanced vector search technology, Sonia provides intelligent, contextual answers by understanding and analyzing your documents at a semantic level.

---

## Features

- Multi-format Support – Upload PDF, DOCX, TXT, or CSV files  
- Intelligent Processing – Automatic document chunking and embedding generation  
- Vector Search – Uses Qdrant vector database for semantic similarity matching  
- Natural Language Chat – Powered by OpenAI GPT-4 for human-like conversations  
- Modern UI – Scroll-based animated landing page with professional design  
- Rich Metadata – Upload modal with title, author, and custom metadata fields  
- Chat Interface – Bubble UI for seamless user and assistant interactions  
- Responsive Design – Works on desktop, tablet, and mobile devices  

---

## Screenshots

You can embed screenshots like this after uploading them to your repo:





---

## Tech Stack

### Frontend

- React 18 + Vite  
- Tailwind CSS (or plain CSS)  
- AOS (Animate on Scroll)  
- Custom Router  

### Backend

- FastAPI  
- Qdrant Cloud  
- OpenAI GPT-4  
- PDFMiner, python-docx, pandas  
- Uvicorn  

---

## Project Structure

<pre>
sonia-conversations/
├── frontend/                   # React frontend
│   ├── src/
│   │   ├── components/
│   │   │   ├── ChatWindow.jsx
│   │   │   ├── UploadForm.jsx
│   │   │   ├── UploadModal.jsx
│   │   │   └── ChatBubble.jsx
│   │   ├── pages/
│   │   │   ├── Landing.jsx
│   │   │   ├── UploadPage.jsx
│   │   │   └── ChatPlaceholder.jsx
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   ├── App.css
│   │   └── index.css
│   ├── vite.config.js
│   └── package.json
├── backend/                   # FastAPI backend
│   ├── routers/
│   │   ├── upload.py
│   │   └── chat.py
│   ├── services/
│   │   ├── document_parser.py
│   │   ├── embeddings.py
│   │   ├── qdrant_utils.py
│   │   └── chunking.py
│   ├── config/
│   ├── main.py
│   └── requirements.txt
├── .env
└── README.md
</pre>

---

## How It Works

### Landing Experience

- Users visit a scroll-based landing page with smooth animations  
- Clear call-to-actions encourage users to upload or chat  

### Document Upload

- Upload modal supports drag & drop and manual file selection  
- Users add metadata (title, author, custom values)  
- Upload triggers backend processing  

### Backend Processing

- FastAPI receives and parses the file  
- The document is chunked semantically  
- OpenAI embeddings are generated and stored in Qdrant  

### Semantic Retrieval

- When the user asks a question, it is embedded  
- Qdrant finds the most relevant document chunks  
- Chunks and the question are sent to GPT-4  

### GPT-4 Response

- GPT-4 replies based on document context  
- Responses appear in chat bubbles  
- Chat history supports follow-ups  

---

## Local Development Setup

### Prerequisites

- Node.js 18+  
- Python 3.9+  
- OpenAI API Key  
- Qdrant Cloud Account  

### Setup Instructions

```bash
# 1. Clone the repository
git clone https://github.com/YOUR_USERNAME/sonia-conversations.git
cd sonia-conversations

# 2. Frontend setup
cd frontend
npm install
npm run dev
# App runs on http://localhost:5173

# 3. Backend setup (in new terminal)
cd backend
pip install -r requirements.txt

# 4. Environment variables
cp .env.example .env
# Then fill in:
# OPENAI_API_KEY=
# QDRANT_URL=
# QDRANT_API_KEY=

# 5. Run backend
uvicorn main:app --reload
# Runs on http://localhost:8000
```
# Environment Variables
- OPENAI_API_KEY=sk-your-api-key
- QDRANT_URL=https://your-cluster.qdrant.tech
- QDRANT_API_KEY=your-qdrant-api-key
- 
# Deployment
- Backend (Render)
- Production URL: https://sonia-conversations-backend.onrender.com

- Chat Endpoint: /api/chat

- Upload Endpoint: /api/upload

## Frontend
- Deploy on Vercel, Netlify, or GitHub Pages

- Ensure API URLs are set correctly in vite.config.js

## Acknowledgments
- Inspired by tools like ChatGPT and Notion AI

- Developed to simulate a real-world AI SaaS product

- Built using React, FastAPI, and OpenAI's APIs

- Special thanks to the Python open source community

## Key Stats
- Supported Formats: PDF, DOCX, TXT, CSV

- File Size Limit: 10MB

- Typical Response Time: < 3s

- Vector Dim: 1536 (OpenAI text-embedding-3-small)

- Chunk Size: ~500 tokens

## Roadmap
- Multi-user support

- Real-time collaboration

- Document analytics

- REST API access

- Enterprise features (SSO, custom branding)

- Mobile app support

## License
© 2025 Sonia Conversations — Marvellous Chitenga
This project is licensed under the MIT License
