"""
AI Services Router - Handles AI-powered interview questions and offer letter generation
"""
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Dict, Any, Optional
from app.services.ai_service import ai_service

router = APIRouter()

# Pydantic models for request/response validation
class CandidateProfile(BaseModel):
    name: str
    position: str
    skills: List[str]
    experience: int
    email: Optional[str] = None

class InterviewQuestionRequest(BaseModel):
    candidate_profile: CandidateProfile
    interview_type: str = "technical"  # technical, behavioral, system_design, cultural_fit
    difficulty_level: str = "mid-level"  # junior, mid-level, senior
    num_questions: int = 5

class InterviewQuestion(BaseModel):
    category: str
    question: str
    difficulty: str
    follow_up: str
    evaluation_criteria: List[str]

class PositionDetails(BaseModel):
    title: str
    department: str = "Engineering"
    start_date: str
    location: str = "San Francisco, CA"
    reports_to: str = "Engineering Manager"

class Compensation(BaseModel):
    base_salary: int
    equity_shares: int = 0
    signing_bonus: int = 0
    bonus_percentage: int = 0

class CompanyInfo(BaseModel):
    name: str = "TechCorp Inc."
    address: Optional[str] = None

class OfferLetterRequest(BaseModel):
    candidate_info: CandidateProfile
    position_details: PositionDetails
    compensation: Compensation
    company_info: CompanyInfo

class OfferLetter(BaseModel):
    content: str
    generated_at: str
    status: str
    format: str

class MarketAnalysisRequest(BaseModel):
    job_title: str
    location: str
    experience_level: str
    company_size: str

class JobDescriptionRequest(BaseModel):
    job_title: str
    required_skills: str = ""
    nice_to_have: str = ""
    years_experience: str = ""
    responsibilities: str = ""
    education_requirements: str = ""
    industry_projects: str = ""

class JobDescription(BaseModel):
    description: str
    generated_at: str
    status: str
    job_title: str

class SalaryRange(BaseModel):
    min: int
    max: int

class MarketAnalysis(BaseModel):
    market_average: SalaryRange
    competitive_range: SalaryRange
    top_tier: SalaryRange
    total_comp: SalaryRange
    equity_range: SalaryRange
    trends: List[str]
    recommendations: List[str]
    benefits_insights: List[str]

@router.post("/ai/interview-questions", response_model=List[InterviewQuestion])
async def generate_interview_questions(request: InterviewQuestionRequest):
    """
    Generate AI-powered interview questions based on candidate profile
    """
    try:
        candidate_dict = {
            'name': request.candidate_profile.name,
            'position': request.candidate_profile.position,
            'skills': request.candidate_profile.skills,
            'experience': request.candidate_profile.experience
        }
        
        questions = ai_service.generate_interview_questions(
            candidate_profile=candidate_dict,
            interview_type=request.interview_type,
            difficulty_level=request.difficulty_level,
            num_questions=request.num_questions
        )
        
        return questions
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error generating questions: {str(e)}")

@router.post("/ai/offer-letter", response_model=OfferLetter)
async def generate_offer_letter(request: OfferLetterRequest):
    """
    Generate AI-powered offer letter content
    """
    try:
        candidate_dict = {
            'name': request.candidate_info.name,
            'position': request.candidate_info.position,
            'skills': request.candidate_info.skills,
            'experience': request.candidate_info.experience
        }
        
        position_dict = request.position_details.dict()
        compensation_dict = request.compensation.dict()
        company_dict = request.company_info.dict()
        
        offer_content = ai_service.generate_offer_letter(
            candidate_info=candidate_dict,
            position_details=position_dict,
            compensation=compensation_dict,
            company_info=company_dict
        )
        
        return offer_content
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error generating offer letter: {str(e)}")

@router.post("/ai/market-analysis", response_model=MarketAnalysis)
async def analyze_compensation_market(request: MarketAnalysisRequest):
    """
    Get AI-powered compensation market analysis
    """
    try:
        market_data = ai_service.analyze_compensation_market(
            job_title=request.job_title,
            location=request.location,
            experience_level=request.experience_level,
            company_size=request.company_size
        )
        
        return market_data
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error analyzing market: {str(e)}")

@router.post("/ai/job-description", response_model=JobDescription)
async def generate_job_description(request: JobDescriptionRequest):
    """
    Generate AI-powered job description using Gemini API
    """
    try:
        job_desc = ai_service.generate_job_description(
            job_title=request.job_title,
            required_skills=request.required_skills,
            nice_to_have=request.nice_to_have,
            years_experience=request.years_experience,
            responsibilities=request.responsibilities,
            education_requirements=request.education_requirements,
            industry_projects=request.industry_projects
        )
        
        return job_desc
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error generating job description: {str(e)}")

@router.get("/ai/health")
async def health_check():
    """
    Health check endpoint for AI services
    """
    return {
        "status": "healthy",
        "ai_service": "active",
        "gemini_api": "connected"
    }

# Additional endpoints for interview management
@router.get("/ai/question-categories")
async def get_question_categories():
    """
    Get available interview question categories
    """
    return {
        "categories": [
            {"id": "technical", "name": "Technical", "description": "Coding and technical problem solving"},
            {"id": "behavioral", "name": "Behavioral", "description": "Past experiences and STAR method questions"},
            {"id": "system_design", "name": "System Design", "description": "Architecture and scalability questions"},
            {"id": "cultural_fit", "name": "Cultural Fit", "description": "Values, teamwork, and company culture"}
        ],
        "difficulty_levels": [
            {"id": "junior", "name": "Junior (1-2 years)", "description": "Entry level questions"},
            {"id": "mid-level", "name": "Mid-level (3-5 years)", "description": "Intermediate complexity"},
            {"id": "senior", "name": "Senior (5+ years)", "description": "Advanced and leadership questions"}
        ]
    }

@router.get("/ai/offer-templates")
async def get_offer_templates():
    """
    Get available offer letter templates
    """
    return {
        "templates": [
            {"id": "standard", "name": "Standard Offer", "description": "General offer letter template"},
            {"id": "senior", "name": "Senior Role", "description": "Template for senior positions with leadership"},
            {"id": "remote", "name": "Remote Position", "description": "Template for remote work arrangements"},
            {"id": "equity_heavy", "name": "Equity Heavy", "description": "Template emphasizing stock options"}
        ]
    }
