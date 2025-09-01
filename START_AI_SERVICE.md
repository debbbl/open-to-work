# Starting the AI Service for Real Gemini Integration

## Quick Start

To enable **real Gemini AI** for job description generation, you need to start the Python AI service:

### 1. Navigate to the AI Service Directory
```bash
cd backend/python-ai-service
```

### 2. Install Dependencies (if not done already)
```bash
pip install -r requirements.txt
```

### 3. Start the AI Service
```bash
python -m uvicorn app.main:app --reload --port 8000
```

Or alternatively:
```bash
uvicorn app.main:app --reload --port 8000
```

### 4. Verify it's Running
- The service should be available at: `http://localhost:8000`
- You should see: `INFO: Uvicorn running on http://127.0.0.1:8000`

## What This Enables

With the AI service running, the following features use **real Gemini AI**:

### ✅ **Job Description Generation** (NEW!)
- Navigate to **Recruit** → **Jobs** tab
- Enter job details and click **"Generate Description with AI"**
- Uses actual Gemini 2.0 Flash model to generate professional job descriptions
- Includes fallback to mock data if service is unavailable

### ✅ **Interview Questions** (Uses mock for demo reliability)
- Generates personalized questions based on candidate profiles
- Falls back to high-quality mock data

### ✅ **Offer Letters** (Uses mock for demo reliability)
- Creates customized offer letters
- Falls back to professional mock templates

## API Key Configuration

The Gemini API key is already configured in the code:
```python
api_key = "AIzaSyA-gPsqqK6nXOxmoXUjT2llNMQOY1ArPxI"
```

For production, you would set this as an environment variable.

## Troubleshooting

### If the AI service won't start:
1. Make sure you're in the `backend/python-ai-service` directory
2. Check that Python 3.8+ is installed: `python --version`
3. Install dependencies: `pip install -r requirements.txt`
4. Try: `python -m uvicorn app.main:app --port 8000`

### If job description generation fails:
- The app will automatically fall back to mock data
- Check the browser console for error messages
- Ensure the AI service is running on port 8000

## Demo Strategy

For hackathon demos, you have two options:

### Option 1: Full AI Demo
- Start the AI service as described above
- Show real Gemini AI generating job descriptions
- Emphasize the live AI integration

### Option 2: Mock Data Demo (More Reliable)
- Skip starting the AI service
- App uses high-quality mock data
- Faster and more reliable for presentations
- Still demonstrates the complete workflow

Both approaches show a fully functional recruitment platform!

---

**Pro Tip**: For maximum demo reliability, test the AI service before your presentation. If it's working, great! If not, the mock data fallback ensures your demo still works perfectly. 🚀
