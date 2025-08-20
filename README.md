# HR Talent Acquisition & Onboarding Platform

A comprehensive full-stack web application designed to streamline the talent acquisition and onboarding process for HR and hiring managers.

## 📋 Overview

The platform follows a clear pipeline workflow: **Screening → Interviewing → Offer → Hired → Onboard**

### Core Modules:
- **Recruit Module**: Job creation, resume ingestion, AI-powered screening
- **Interview Module**: Scheduling, AI assistance, candidate comparison
- **Offer Module**: Automated offer letters, compensation benchmarking
- **Hired Module**: Journey summaries, reporting
- **Onboard Module**: Gamified onboarding with chatbot assistance
- **Manager Dashboard**: Analytics and pipeline management

## 🚀 Tech Stack

### Frontend
- React 18 with TypeScript
- Tailwind CSS for styling
- Lucide React for icons
- React Router for navigation
- Recharts for data visualization

### Backend
- Node.js with Express
- TypeScript
- RESTful API architecture
- Modular service-based structure

## 📁 Project Structure

```
├── frontend/                 # React frontend application
│   ├── src/
│   │   ├── components/      # Reusable UI components
│   │   ├── pages/          # Main page components
│   │   ├── hooks/          # Custom React hooks
│   │   ├── types/          # TypeScript type definitions
│   │   ├── utils/          # Utility functions
│   │   └── services/       # API service functions
├── backend/                 # Express backend application
│   ├── src/
│   │   ├── controllers/    # Route handlers
│   │   ├── services/       # Business logic
│   │   ├── models/         # Data models
│   │   ├── routes/         # API routes
│   │   └── utils/          # Backend utilities
└── README.md
```

## 🛠️ Installation & Setup

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn

### Frontend Setup
1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

The frontend will be available at `http://localhost:5173`

### Backend Setup
1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

The backend API will be available at `http://localhost:3001`

## 🔗 Connecting Frontend & Backend

The frontend is configured to communicate with the backend API at `http://localhost:3001`. 

### API Endpoints
- `GET /api/jobs` - Fetch all job postings
- `POST /api/jobs` - Create new job posting
- `GET /api/candidates` - Fetch candidates
- `POST /api/candidates` - Add new candidate
- `PUT /api/candidates/:id/stage` - Update candidate stage
- `GET /api/analytics` - Fetch dashboard analytics

### Environment Configuration
Create a `.env` file in the frontend directory:
```
VITE_API_URL=http://localhost:3001/api
```

## 🚀 Running the Complete Application

1. **Start the backend** (Terminal 1):
   ```bash
   cd backend && npm run dev
   ```

2. **Start the frontend** (Terminal 2):
   ```bash
   cd frontend && npm run dev
   ```

3. Open your browser to `http://localhost:5173`

## 📊 Features Overview

### Recruit Module
- Job posting creation with AI-powered descriptions
- Bulk resume upload (drag & drop)
- Multi-stage AI screening with bias-free options
- Skill matching heatmaps

### Interview Module
- Calendar-based scheduling
- AI question generation
- Candidate comparison tools

### Offer Module
- Automated offer letter templates
- Compensation benchmarking
- Offer status tracking

### Onboard Module
- AI chatbot assistant (RAG-based)
- Gamified quest system
- Mentor matching algorithm
- Progress tracking

### Analytics Dashboard
- Kanban pipeline view
- Real-time metrics
- Performance insights
- Collaboration tools

## 🔮 Future Enhancements
- Integration with external ATS systems (Workday, Greenhouse)
- Advanced AI models for screening
- Video interview capabilities
- Mobile application
- Advanced reporting and exports

## 📝 Notes
- All AI features currently use placeholder implementations
- Database integration ready for your preferred solution
- Responsive design optimized for HR workflows
- Production-ready code structure