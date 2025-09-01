"""
AI Service for interview question generation and offer letter creation using Gemini API
"""
import os
import json
from typing import List, Dict, Any, Optional
from google import genai
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class AIService:
    def __init__(self, api_key: str = "AIzaSyA-gPsqqK6nXOxmoXUjT2llNMQOY1ArPxI"):
        """Initialize AI service with Gemini API key"""
        self.client = genai.Client(api_key=api_key)
        
    def generate_interview_questions(
        self, 
        candidate_profile: Dict[str, Any],
        interview_type: str = "technical",
        difficulty_level: str = "mid-level",
        num_questions: int = 5
    ) -> List[Dict[str, Any]]:
        """
        Generate AI-powered interview questions based on candidate profile
        
        Args:
            candidate_profile: Dict containing candidate info (skills, experience, position)
            interview_type: Type of interview (technical, behavioral, system_design, cultural_fit)
            difficulty_level: junior, mid-level, senior
            num_questions: Number of questions to generate
            
        Returns:
            List of question dictionaries with category, question, difficulty, and follow_up
        """
        try:
            # Construct the prompt based on candidate profile
            prompt = self._build_question_prompt(
                candidate_profile, interview_type, difficulty_level, num_questions
            )
            
            response = self.client.models.generate_content(
                model="gemini-2.0-flash-exp",
                contents=prompt
            )
            
            # Parse the response and format as structured data
            questions = self._parse_questions_response(response.text)
            return questions
            
        except Exception as e:
            logger.error(f"Error generating interview questions: {str(e)}")
            # Return mock data as fallback
            return self._get_mock_questions(interview_type, difficulty_level, num_questions)
    
    def generate_offer_letter(
        self,
        candidate_info: Dict[str, Any],
        position_details: Dict[str, Any],
        compensation: Dict[str, Any],
        company_info: Dict[str, Any]
    ) -> Dict[str, Any]:
        """
        Generate AI-powered offer letter content
        
        Args:
            candidate_info: Name, background, etc.
            position_details: Title, department, start date, etc.
            compensation: Salary, benefits, equity, etc.
            company_info: Company name, location, etc.
            
        Returns:
            Dict with offer letter content and metadata
        """
        try:
            prompt = self._build_offer_prompt(
                candidate_info, position_details, compensation, company_info
            )
            
            response = self.client.models.generate_content(
                model="gemini-2.0-flash-exp",
                contents=prompt
            )
            
            offer_content = self._parse_offer_response(response.text)
            return offer_content
            
        except Exception as e:
            logger.error(f"Error generating offer letter: {str(e)}")
            # Return mock data as fallback
            return self._get_mock_offer_letter(candidate_info, position_details, compensation)
    
    def analyze_compensation_market(
        self,
        job_title: str,
        location: str,
        experience_level: str,
        company_size: str
    ) -> Dict[str, Any]:
        """
        Get AI-powered compensation market analysis
        
        Returns:
            Dict with market data, recommendations, and insights
        """
        try:
            prompt = f"""
            Provide a comprehensive compensation analysis for the following role:
            
            Job Title: {job_title}
            Location: {location}
            Experience Level: {experience_level}
            Company Size: {company_size}
            
            Please provide:
            1. Market average salary range
            2. Competitive salary range (25th-75th percentile)
            3. Top tier salary range (75th-90th percentile)
            4. Total compensation including equity/bonuses
            5. Key market trends and recommendations
            6. Benefits comparison
            
            Format the response as JSON with the following structure:
            {{
                "market_average": {{"min": number, "max": number}},
                "competitive_range": {{"min": number, "max": number}},
                "top_tier": {{"min": number, "max": number}},
                "total_comp": {{"min": number, "max": number}},
                "equity_range": {{"min": number, "max": number}},
                "trends": ["trend1", "trend2"],
                "recommendations": ["rec1", "rec2"],
                "benefits_insights": ["insight1", "insight2"]
            }}
            """
            
            response = self.client.models.generate_content(
                model="gemini-2.0-flash-exp",
                contents=prompt
            )
            
            market_data = self._parse_market_analysis(response.text, job_title, location)
            return market_data
            
        except Exception as e:
            logger.error(f"Error analyzing compensation market: {str(e)}")
            return self._get_mock_market_data(job_title, location)
    
    def _build_question_prompt(
        self, candidate_profile: Dict, interview_type: str, difficulty: str, num_questions: int
    ) -> str:
        """Build the prompt for question generation"""
        skills = ", ".join(candidate_profile.get('skills', []))
        experience = candidate_profile.get('experience', 0)
        position = candidate_profile.get('position', 'Software Engineer')
        
        prompt = f"""
        Generate {num_questions} {interview_type} interview questions for a {difficulty} level candidate.
        
        Candidate Profile:
        - Position: {position}
        - Skills: {skills}
        - Experience: {experience} years
        
        Question Types:
        - Technical: Focus on coding, architecture, problem-solving
        - Behavioral: STAR method questions about past experiences
        - System Design: Architecture and scalability questions
        - Cultural Fit: Values, teamwork, and company culture
        
        Please provide questions as JSON with this structure:
        [
            {{
                "category": "{interview_type}",
                "question": "The actual question text",
                "difficulty": "Easy/Medium/Hard",
                "follow_up": "Suggested follow-up question",
                "evaluation_criteria": ["criteria1", "criteria2"]
            }}
        ]
        
        Make questions specific to the candidate's skill set and experience level.
        """
        
        return prompt
    
    def _build_offer_prompt(
        self, candidate_info: Dict, position_details: Dict, compensation: Dict, company_info: Dict
    ) -> str:
        """Build the prompt for offer letter generation"""
        prompt = f"""
        Generate a professional job offer letter with the following details:
        
        Candidate: {candidate_info.get('name', 'Candidate Name')}
        Position: {position_details.get('title', 'Software Engineer')}
        Department: {position_details.get('department', 'Engineering')}
        Start Date: {position_details.get('start_date', '2024-03-01')}
        Location: {position_details.get('location', 'San Francisco, CA')}
        Reporting To: {position_details.get('reports_to', 'Engineering Manager')}
        
        Compensation:
        - Base Salary: ${compensation.get('base_salary', 120000):,}
        - Stock Options: {compensation.get('equity_shares', 1000)} shares
        - Signing Bonus: ${compensation.get('signing_bonus', 5000):,}
        - Annual Bonus: {compensation.get('bonus_percentage', 10)}%
        
        Company: {company_info.get('name', 'TechCorp Inc.')}
        
        Include standard benefits like health insurance, 401k, PTO, and learning budget.
        Make the tone professional yet welcoming. Include terms about at-will employment and offer expiration.
        
        Format as a complete offer letter with proper structure and formatting.
        """
        
        return prompt
    
    def _parse_questions_response(self, response_text: str) -> List[Dict[str, Any]]:
        """Parse AI response for interview questions"""
        try:
            # Try to extract JSON from the response
            start_idx = response_text.find('[')
            end_idx = response_text.rfind(']') + 1
            
            if start_idx != -1 and end_idx != 0:
                json_str = response_text[start_idx:end_idx]
                questions = json.loads(json_str)
                return questions
            else:
                # Fallback parsing if JSON extraction fails
                return self._parse_questions_fallback(response_text)
                
        except Exception as e:
            logger.error(f"Error parsing questions response: {str(e)}")
            return self._get_mock_questions("technical", "mid-level", 5)
    
    def _parse_questions_fallback(self, response_text: str) -> List[Dict[str, Any]]:
        """Fallback parsing for questions when JSON parsing fails"""
        questions = []
        lines = response_text.split('\n')
        
        current_question = {}
        for line in lines:
            line = line.strip()
            if line.startswith('Question:') or line.startswith('Q:'):
                if current_question:
                    questions.append(current_question)
                current_question = {
                    'category': 'Technical',
                    'question': line.replace('Question:', '').replace('Q:', '').strip(),
                    'difficulty': 'Medium',
                    'follow_up': 'Can you explain your reasoning?',
                    'evaluation_criteria': ['Technical accuracy', 'Problem-solving approach']
                }
            elif line.startswith('Follow-up:'):
                if current_question:
                    current_question['follow_up'] = line.replace('Follow-up:', '').strip()
        
        if current_question:
            questions.append(current_question)
            
        return questions[:5]  # Return max 5 questions
    
    def _parse_offer_response(self, response_text: str) -> Dict[str, Any]:
        """Parse AI response for offer letter"""
        return {
            'content': response_text,
            'generated_at': '2024-01-20T10:00:00Z',
            'status': 'generated',
            'format': 'full_letter'
        }
    
    def _parse_market_analysis(self, response_text: str, job_title: str, location: str) -> Dict[str, Any]:
        """Parse AI response for market analysis"""
        try:
            # Try to extract JSON from response
            start_idx = response_text.find('{')
            end_idx = response_text.rfind('}') + 1
            
            if start_idx != -1 and end_idx != 0:
                json_str = response_text[start_idx:end_idx]
                market_data = json.loads(json_str)
                return market_data
            else:
                return self._get_mock_market_data(job_title, location)
                
        except Exception as e:
            logger.error(f"Error parsing market analysis: {str(e)}")
            return self._get_mock_market_data(job_title, location)
    
    def _get_mock_questions(self, interview_type: str, difficulty: str, num_questions: int) -> List[Dict[str, Any]]:
        """Fallback mock questions"""
        mock_questions = {
            'technical': [
                {
                    'category': 'Technical',
                    'question': 'Explain the difference between React hooks and class components',
                    'difficulty': 'Medium',
                    'follow_up': 'When would you choose one over the other?',
                    'evaluation_criteria': ['React knowledge', 'Understanding of modern patterns']
                },
                {
                    'category': 'Technical',
                    'question': 'How would you optimize a slow database query?',
                    'difficulty': 'Hard',
                    'follow_up': 'What tools would you use to identify the bottleneck?',
                    'evaluation_criteria': ['Database optimization', 'Problem-solving approach']
                }
            ],
            'behavioral': [
                {
                    'category': 'Behavioral',
                    'question': 'Tell me about a time when you had to work with a difficult team member',
                    'difficulty': 'Medium',
                    'follow_up': 'What was the outcome and what did you learn?',
                    'evaluation_criteria': ['Communication skills', 'Conflict resolution']
                }
            ]
        }
        
        questions = mock_questions.get(interview_type, mock_questions['technical'])
        return questions[:num_questions]
    
    def _get_mock_offer_letter(self, candidate_info: Dict, position_details: Dict, compensation: Dict) -> Dict[str, Any]:
        """Fallback mock offer letter"""
        return {
            'content': f"""
            Dear {candidate_info.get('name', 'Candidate')},

            We are pleased to offer you the position of {position_details.get('title', 'Software Engineer')} 
            with our company. 

            Position Details:
            - Title: {position_details.get('title', 'Software Engineer')}
            - Department: {position_details.get('department', 'Engineering')}
            - Start Date: {position_details.get('start_date', '2024-03-01')}

            Compensation:
            - Annual Salary: ${compensation.get('base_salary', 120000):,}
            - Stock Options: {compensation.get('equity_shares', 1000)} shares
            - Benefits: Health, dental, vision insurance, 401k matching

            We look forward to your acceptance of this offer.

            Sincerely,
            Hiring Manager
            """,
            'generated_at': '2024-01-20T10:00:00Z',
            'status': 'generated',
            'format': 'full_letter'
        }
    
    def _get_mock_market_data(self, job_title: str, location: str) -> Dict[str, Any]:
        """Fallback mock market data"""
        base_salary = 125000  # Base salary for reference
        
        if 'senior' in job_title.lower():
            base_salary *= 1.3
        elif 'junior' in job_title.lower():
            base_salary *= 0.7
            
        if 'san francisco' in location.lower() or 'bay area' in location.lower():
            base_salary *= 1.4
        elif 'new york' in location.lower():
            base_salary *= 1.3
        elif 'remote' in location.lower():
            base_salary *= 1.1
            
        return {
            'market_average': {'min': int(base_salary * 0.85), 'max': int(base_salary * 1.15)},
            'competitive_range': {'min': int(base_salary * 0.9), 'max': int(base_salary * 1.25)},
            'top_tier': {'min': int(base_salary * 1.15), 'max': int(base_salary * 1.45)},
            'total_comp': {'min': int(base_salary * 1.1), 'max': int(base_salary * 1.6)},
            'equity_range': {'min': 15000, 'max': 45000},
            'trends': [
                f'{job_title} salaries trending up 8% this year',
                f'{location} market showing strong demand',
                'Remote flexibility increasingly important'
            ],
            'recommendations': [
                'Offer within competitive range to ensure acceptance',
                'Consider equity package for total compensation appeal',
                'Highlight growth opportunities and learning budget'
            ],
            'benefits_insights': [
                'Health insurance is table stakes',
                'Flexible PTO policies are increasingly expected',
                'Learning and development budget highly valued'
            ]
        }
    
    def generate_job_description(
        self,
        job_title: str,
        required_skills: str = "",
        nice_to_have: str = "",
        years_experience: str = "",
        responsibilities: str = "",
        education_requirements: str = "",
        industry_projects: str = ""
    ) -> Dict[str, Any]:
        """
        Generate AI-powered job description using Gemini API
        
        Args:
            job_title: The job title/position
            required_skills: Required technical skills
            nice_to_have: Nice to have skills
            years_experience: Years of experience required
            responsibilities: Key responsibilities
            education_requirements: Education requirements
            industry_projects: Relevant industry project experience
            
        Returns:
            Dict with generated job description and metadata
        """
        try:
            prompt = self._build_job_description_prompt(
                job_title, required_skills, nice_to_have, years_experience,
                responsibilities, education_requirements, industry_projects
            )
            
            response = self.client.models.generate_content(
                model="gemini-2.0-flash-exp",
                contents=prompt
            )
            
            return {
                'description': response.text,
                'generated_at': '2024-01-20T10:00:00Z',
                'status': 'generated',
                'job_title': job_title
            }
            
        except Exception as e:
            logger.error(f"Error generating job description: {str(e)}")
            # Return mock data as fallback
            return self._get_mock_job_description(job_title)
    
    def _build_job_description_prompt(
        self, job_title: str, required_skills: str, nice_to_have: str,
        years_experience: str, responsibilities: str, education_requirements: str,
        industry_projects: str
    ) -> str:
        """Build the prompt for job description generation"""
        prompt = f"""
        Generate a comprehensive and professional job description for the following position:
        
        Job Title: {job_title}
        Required Skills: {required_skills or 'General skills for this role'}
        Nice to Have: {nice_to_have or 'Additional beneficial skills'}
        Years of Experience: {years_experience or '3-5 years'}
        Key Responsibilities: {responsibilities or 'Standard responsibilities for this role'}
        Education Requirements: {education_requirements or "Bachelor's degree or equivalent experience"}
        Industry Projects: {industry_projects or 'Relevant project experience'}
        
        Please create a detailed job description that includes:
        
        1. **Position Overview**: A compelling summary of the role
        2. **Key Responsibilities**: 5-7 main duties and responsibilities
        3. **Required Qualifications**: Must-have skills, experience, and education
        4. **Preferred Qualifications**: Nice-to-have skills and experience
        5. **What We Offer**: Competitive compensation, benefits, and growth opportunities
        6. **Company Culture**: Brief description of work environment and values
        
        Make the job description:
        - Professional and engaging
        - Specific to the role and requirements provided
        - Attractive to top talent
        - Clear and well-structured
        - Include modern benefits and perks
        
        Format the response as a clean, professional job posting that could be posted on job boards.
        """
        
        return prompt
    
    def _get_mock_job_description(self, job_title: str) -> Dict[str, Any]:
        """Fallback mock job description"""
        return {
            'description': f"""**{job_title}**

**About the Role:**
We are seeking a talented {job_title} to join our dynamic team. This is an exciting opportunity to work with cutting-edge technologies and make a significant impact on our products.

**Key Responsibilities:**
• Develop and maintain high-quality software solutions
• Collaborate with cross-functional teams to deliver exceptional user experiences
• Write clean, maintainable, and well-documented code
• Participate in code reviews and technical discussions
• Stay up-to-date with industry trends and best practices

**Required Qualifications:**
• Bachelor's degree in Computer Science or related field
• 3+ years of relevant professional experience
• Strong problem-solving and communication skills
• Experience with modern development tools and practices

**What We Offer:**
• Competitive salary and equity package
• Comprehensive health, dental, and vision insurance
• Flexible PTO and remote work options
• Professional development opportunities
• Collaborative and inclusive work environment

Join us in building the future of technology!""",
            'generated_at': '2024-01-20T10:00:00Z',
            'status': 'generated',
            'job_title': job_title,
            'fallback': True
        }


# Singleton instance
ai_service = AIService()
