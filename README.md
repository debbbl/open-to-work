# TalentHub  

### 🚀 Open To Work – Smarter Hiring, Seamless Onboarding  

---

## 👥 Team Members  
- **Tan Shun Qi** – AI Engineer 
- **Lim Shi Ting** – Fullstack Developer  
- **Tan Jin Khye** – Business Analyst / QA & AI Engineer  

---

## 📌 Problem & Solution Summary  

### The Problem  
1. **Inefficient Recruitment** – Manual resume screening slows hiring cycles, delaying the process and causing companies to lose top talent.  
2. **Ineffective Onboarding** – New hires feel lost without structured guidance, reducing productivity and engagement from day one.  

### Our Solution – **TalentHub**  
An **AI-powered end-to-end talent platform** that helps SMEs hire smarter, faster, and onboard seamlessly.  

- **Recruit Smarter**: AI resume parsing, bias-free screening, automated candidate-job matching.  
- **Interview Intelligently**: Auto-generated interview questions, AI-powered live assistant, and summaries.  
- **Onboard Seamlessly**: AI onboarding chatbot, buddy matching, gamified learning, and virtual office tours.  
- **HR Insights at a Glance**: Analytics dashboards tracking time-to-hire, drop-off rates, onboarding completion, and candidate sources.  

---
## Technology Stack Used

### Frontend
- **React 18** with TypeScript
- **Vite** for fast development and building
- **Tailwind CSS** for modern, responsive UI design
- **Lucide React** for consistent iconography
- **Supabase** for database and authentication

### Backend
- **Node.js** with Express.js (Main API server)
- **Python FastAPI** (AI services microservice)
- **TypeScript** for type-safe backend development
- **Google Gemini API** for AI-powered content generation

### AI & Machine Learning
- **Google Gemini 2.0 Flash** for natural language generation
- **Weaviate** vector database for semantic search
- **Sentence Transformers** for text embeddings
- **LlamaIndex** for document processing

### Database & Infrastructure
- **Supabase** (PostgreSQL) for main application data
- **Vector embeddings** for intelligent candidate matching
- **RESTful APIs** for service communication

### Development Tools
- **Git** for version control
- **ESLint** and **Prettier** for code quality
- **PostCSS** for CSS processing

## Setup Instructions

### Prerequisites
- Node.js 18+ and npm
- Python 3.8+
- Git

### 1. Clone the Repository
```bash
git clone https://github.com/your-username/futureReady
cd futureReady
```

### 2. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```
The frontend will be available at `http://localhost:5173`

### 3. Node.js Backend Setup
```bash
cd backend
npm install
npm run dev
```
The API server will be available at `http://localhost:3001`

### 4. Python AI Service Setup
```bash
cd backend/python-ai-service
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```
The AI service will be available at `http://localhost:8000`

### 5. Environment Variables
Create `.env` files in both backend directories:

**Frontend (.env):**
```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

**Backend (.env):**
```env
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_KEY=your_supabase_service_key
AI_SERVICE_URL=http://localhost:8000
```

**Python AI Service (.env):**
```env
GEMINI_API_KEY= API_KEY
```

## Reflection on Challenges and Learnings

### Challenges Faced

1. **AI Integration Complexity**
   - Challenge: Integrating Google Gemini API while ensuring reliable fallbacks
   - Solution: Implemented comprehensive error handling with mock data fallbacks
   - Learning: Always plan for AI service failures in production applications

2. **Multi-Service Architecture**
   - Challenge: Coordinating between Node.js backend and Python AI service
   - Solution: Used HTTP APIs for communication with proper error handling
   - Learning: Microservices require careful planning for inter-service communication

3. **Real-time AI Response Handling**
   - Challenge: Managing loading states and user experience during AI processing
   - Solution: Implemented proper loading indicators and progressive disclosure
   - Learning: AI responses can be unpredictable; UX design must account for varying response times

4. **Data Structure Design**
   - Challenge: Designing flexible schemas for dynamic AI-generated content
   - Solution: Used JSON fields and flexible data models
   - Learning: AI applications need more flexible data structures than traditional CRUD apps

### Key Learnings

1. **AI-First Development**
   - Learned to design applications around AI capabilities and limitations
   - Understanding the importance of prompt engineering for consistent results
   - AI services require robust error handling and graceful degradation

2. **User Experience with AI**
   - AI features need clear feedback and loading states
   - Users expect transparency about when AI is being used
   - Fallback options are crucial for maintaining functionality

3. **Rapid Prototyping**
   - TypeScript accelerated development with better code reliability
   - Component-based architecture enabled faster feature development
   - API-first design allowed parallel frontend/backend development

4. **Integration Patterns**
   - RESTful APIs provide clean separation between AI and business logic
   - Microservices architecture enables technology stack flexibility
   - Proper error boundaries prevent AI failures from breaking the entire app

---

**Built with ❤️ for FutureReady Hackathon 2025**
