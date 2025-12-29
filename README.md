# Telehealth Next.js Application

A modern Telehealth platform built with a **Next.js 16** frontend and **FastAPI** backend, featuring real-time communication and AI-powered avatar assistants.

## 🚀 Features

### Frontend (Next.js)
- **Authentication**: User secure login and signup flows.
- **Dashboard**: Main hub for patient/doctor access.
- **Telehealth Video Calls**: Integrated video calling functionality.
- **AI Avatar Friend**: Real-time interactive digital assistant powered by **HeyGen Streaming Avatar SDK**.
  - Supports conversational voice interactions.
  - Dynamically loads compatible public avatars.
  - Handles concurrent session limits gracefully.

### Backend (FastAPI)
- **JWT Authentication**: Secure API endpoints protected by bearer tokens.
- **Video & Signaling**: Endpoints for managing video sessions and WebRTC signaling.
- **HeyGen Integration**: Proxy endpoints to securely manage API keys and generate streaming tokens for the frontend.

## 🛠️ Tech Stack

- **Frontend**: 
  - Next.js 16 (App Router)
  - TypeScript
  - Tailwind CSS v4
  - Lucide React (Icons)
  - @heygen/streaming-avatar

- **Backend**:
  - Python 3.13+
  - FastAPI
  - Uvicorn
  - HTTPX (Async HTTP client)

## 📦 Setup & Installation

### Prerequisites
- Node.js 18+
- Python 3.10+
- HeyGen API Key (for Avatar features)

### 1. Backend Setup

```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
```

**Environment Variables**
Create a `.env` file in the `backend` directory:
```env
SECRET_KEY=your_secret_key
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
HEYGEN_API_KEY=your_heygen_api_key
```

**Run Server**
```bash
uvicorn app.main:app --reload
```
API will be available at `http://localhost:8000`.

### 2. Frontend Setup

```bash
cd frontend
npm install
```

**Environment Variables**
Create a `.env.local` file in the `frontend` directory:
```env
NEXT_PUBLIC_API_URL=http://localhost:8000
```

**Run Development Server**
```bash
npm run dev
```
App will be available at `http://localhost:3000`.

## 🤖 AI Avatar Configuration

The "Avatar Friend" feature uses HeyGen. 
- Ensure your `HEYGEN_API_KEY` is set in the backend `.env`.
- The system automatically fetches the first available public avatar (e.g., `Thaddeus_ProfessionalLook2_public`) and its default voice.
- If you encounter "Concurrent limit reached", this is a plan limitation on your HeyGen account.

## 📄 API Documentation

Once the backend is running, visit:
- **Swagger UI**: `http://localhost:8000/docs`
- **ReDoc**: `http://localhost:8000/redoc`