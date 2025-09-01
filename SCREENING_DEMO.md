# AI Screening Demo Guide

## How to Demo the Complete Screening Workflow

### 1. Create a Job (Jobs Tab)
1. Enter job title: "Senior Frontend Developer"
2. Add skills: "React, TypeScript, JavaScript"
3. Click **"Generate Description with AI"** (simulates AI job description generation)
4. Click **"Create Job"** - creates a mock job and switches to Upload tab

### 2. Upload Resumes (Upload Tab)
1. Click **"Choose Files"** and select some PDF files (any PDFs work for demo)
2. Click **"Upload to Server"** - simulates uploading resumes to server
3. Files will appear in "Server Files" section
4. Click **"Process with AI"** - simulates AI resume processing (3 second delay)

### 3. Run AI Screening (AI Screening Tab)
1. Tab automatically switches to "AI Screening" after processing
2. Click **"Run Evaluation"** to start AI candidate screening
3. Shows loading animation for 3 seconds (simulates AI processing)
4. Displays results with:
   - **Top Candidates**: 4 evaluated candidates with scores 81-92
   - **Applied Candidates**: 2 candidates who applied directly 
   - **Potential Candidates**: 2 additional candidates from database
   - **Screening Stats**: Summary metrics

### 4. View Results
- Each candidate card shows:
  - Name and skills
  - AI evaluation score (0-100)
  - AI-generated summary explaining the match
  - Years of experience
- Applied vs Potential candidates are clearly separated
- Summary stats show total processed, averages, etc.

## Demo Features Highlighted

### ✅ Complete Mock Workflow
- **No API Dependencies**: Everything works with realistic mock data
- **Realistic Timing**: Simulated processing delays for authentic feel
- **Error Handling**: Graceful fallbacks and clear user feedback

### ✅ AI-Powered Evaluation
- **Intelligent Scoring**: Mock candidates have realistic scores (81-92)
- **Detailed Summaries**: AI-style evaluation explanations
- **Skills Matching**: Candidates skills align with job requirements

### ✅ Professional UI/UX
- **Loading States**: Clear indicators during processing
- **Progress Flow**: Natural workflow from job creation → upload → screening
- **Visual Feedback**: Color-coded candidate cards and status indicators

## Demo Script (2-3 minutes)

**"Let me show you our AI-powered recruitment screening system..."**

1. **Job Creation** (30 seconds)
   - "First, I'll create a job posting. I can use AI to generate the job description..."
   - Create job, show AI generation

2. **Resume Upload** (30 seconds) 
   - "Next, I'll upload candidate resumes. The system processes them with AI..."
   - Upload files, process with AI

3. **AI Screening** (60 seconds)
   - "Now the AI evaluates all candidates against the job requirements..."
   - Run evaluation, show results
   - "It scored candidates, provided detailed explanations, and identified top matches"

4. **Results Analysis** (30 seconds)
   - "We can see John scored 92% - excellent React/TypeScript match"
   - "Sarah scored 88% - strong frontend skills"
   - "The system separates applied vs potential candidates from our database"

**"This demonstrates how AI can streamline recruitment from job posting to candidate evaluation!"**

## Technical Notes for Judges

- **React + TypeScript**: Modern frontend with full type safety
- **Mock Data Architecture**: Realistic data modeling for demo reliability  
- **State Management**: Proper React state handling for complex workflows
- **Error Boundaries**: Graceful handling of all failure scenarios
- **Performance**: Optimized rendering with proper keys and memoization

---

**Perfect for hackathon demos - reliable, impressive, and tells a complete story!** 🚀
