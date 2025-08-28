# Import libraries
import sys
import subprocess

subprocess.check_call([sys.executable, "-m", "pip", "install", "google-genai"])
subprocess.check_call([sys.executable, "-m", "pip", "install", "weaviate-client"])

import weaviate
from weaviate.classes.init import AdditionalConfig, Timeout, Auth
import weaviate.classes.config as wc
import os
from weaviate.classes.query import Filter, MetadataQuery, HybridFusion
from dotenv import load_dotenv
from typing import List, Literal, Optional
from pydantic import BaseModel, Field, conint
from google import genai
import json

load_dotenv()

# Fetch job description and its vector based on job ID
def fetch_job_description(job_id):

    job_collection = client.collections.get("Job")

    resp = job_collection.query.fetch_objects(
        filters=Filter.by_property("job_id").equal(job_id),   # <-- your job ID
        limit=1,  # or more if IDs aren’t unique
        return_properties=["name", "job_description"],
        include_vector=True   
)

    for obj in resp.objects:
        vec = obj.vector["default"]
        job_desc = obj.properties["job_description"]
        return job_desc, vec

# Hybrid search with candidate vector database (get top k = 30)
def hybrid_search(job_desc, job_desc_vec, top_k, job_id):

    candidate_collection = client.collections.get("Candidate")

    # Hybrid search: vector + text
    resp = candidate_collection.query.hybrid(
        query=job_desc,
        vector=job_desc_vec,
        alpha=0.7,   
        limit=top_k,
        query_properties=["skills", "resume_summary"],
        return_metadata=MetadataQuery(score=True),
        fusion_type=HybridFusion.RELATIVE_SCORE,
        include_vector=False,
        filters=Filter.by_property("job_id").equal(job_id)
    )

    candidates = []
    for obj in resp.objects:
        candidate = {
            "name": obj.properties["name"],
            "candidate_id": obj.properties["candidate_id"],
            "skills": obj.properties["skills"],
            "resume_summary": obj.properties["resume_summary"],
            "experience": obj.properties["experience"],
            "projects": obj.properties["projects"],
            "years_of_experience": obj.properties["years_of_experience"],
            "education": obj.properties["education"],
        }
        candidates.append(candidate)

    return candidates

# Candidate evaluation (get top k = 15) highest score
Score = conint(ge=1, le=10)

class Evidence(BaseModel):
    notes: List[str] = Field(
        default_factory=list,
        description="Short quotes or paraphrased bullets supporting the score."
    )

class SkillsAssessment(BaseModel):
    score: Score
    matched_skills: List[str] = Field(default_factory=list)
    missing_essential_skills: List[str] = Field(default_factory=list)
    nice_to_have_matched: List[str] = Field(default_factory=list)
    evidence: Evidence = Field(default_factory=Evidence)

class CriterionAssessment(BaseModel):
    score: Score
    evidence: Evidence = Field(default_factory=Evidence)

class CandidateEvaluation(BaseModel):
    # Core criteria
    years_experience_score: Score
    years_experience_evidence: Evidence = Field(default_factory=Evidence)

    skills: SkillsAssessment

    industry_relevance: CriterionAssessment
    achievements_and_certs: CriterionAssessment

    # Additional criteria
    education_alignment: CriterionAssessment

    # Rollup
    overall_score_0_to_100: conint(ge=0, le=100)
    summary: str = Field(None, description="Brief narrative tying together strengths, risks, and fit.")

def evaluate_candidate(resume_json, job_desc):
    client = genai.Client(api_key=os.getenv("GEMINI_API_KEY"))

    prompt = f"""
    You are a meticulous technical recruiter assessing a candidate’s resume against a specific job description.

    ## Inputs
    JOB DESCRIPTION:
    {job_desc}

    CANDIDATE RESUME:
    {resume_json}

    ## What to do
    1) Read both carefully. When the job description lists “must-have” items, treat them as essential.
    2) Evaluate the candidate on each criterion below, score 1–10 (1 = very poor, 10 = exceptional), and explain briefly with evidence (short quotes or bullet references).
    3) If a criterion doesn’t apply (e.g., no certifications are relevant), still score it based on available signals and explain why.

    ## Criteria & guidance (score each 1–10)
    A. Years of experience & seniority alignment  
    - Map total relevant YOE vs. JD requirement.   
    - Consider depth in core areas, not just total years.

    B. Skills match (hard skills)  
    - Count how many essential and nice‑to‑have skills are satisfied.  
    - Penalize missing essentials more than missing “nice‑to‑haves”.

    C. Industry / domain relevance & project fit  
    - Similar products, tech stack, domain, or customer segment.  
    - Prefer recent, hands‑on, outcome‑driven work.

    D. Achievements & certifications  
    - Concrete outcomes (metrics), notable awards, relevant certs.  
    - Prefer measurable impact (e.g., “↑CTR 12%”, “↓latency 35%”).

    E. Education alignment (bonus criterion)  
    - Degree relevance, advanced study, coursework that maps to JD.

    ## Output format (STRICT)
    1.Provide a structured JSON response strictly adhering to this schema:
    ```json
    {CandidateEvaluation.model_json_schema()}
    ```json
    2.Return ONLY valid JSON matching this schema:
    - All scores are integers 1–10.
    - Include short evidence lists (quotes or paraphrases) per criterion.
    - Provide `matched_skills`, `missing_essential_skills`, `nice_to_have_matched`.
    3.Also compute an overall score (0–100) using weights:
    - Years/Seniority 20%
    - Skills 30%
    - Industry/Project fit 30%
    - Achievements/Certs 15%
    - Education 5%
    Round to nearest integer, and include a one‑paragraph `summary`.
    4.Please remove any ```json ``` characters from the output. 
    """
    response = client.models.generate_content(
        model="gemini-2.5-flash",
        contents=prompt,
        config={
            "response_mime_type":"application/json",
            "response_schema":CandidateEvaluation,
        })
    
    if not response or not response.text:
        raise ValueError("Failed to get a response from LLM.")
    
    return response.text

if __name__ == "__main__":
    job_id = "769a7894"  # <-- your job ID
    top_k_candidates = 30
    top_k_evaluated = 10

    client = weaviate.connect_to_weaviate_cloud(
    cluster_url=os.getenv("WEAVIATE_URL"),
    auth_credentials=weaviate.auth.AuthApiKey(os.getenv("WEAVIATE_API_KEY")),
    additional_config=AdditionalConfig(
        timeout=Timeout(
            init=60,   # time to wait for client init checks
            query=600, # gRPC query deadline (seconds)
            insert=600 # insert/batch deadline (seconds)
        )
    ),
)

    job_desc, job_desc_vec = fetch_job_description(job_id)
    print(f"Job Description: {job_desc}")

    candidates = hybrid_search(job_desc, job_desc_vec, top_k_candidates, job_id)
    (print(f"Found {len(candidates)} candidates from hybrid search."))

    client.close()

    evaluated_candidates = []
    for idx, candidate in enumerate(candidates, start=1):
        resume_json = {
            "name": candidate["name"],
            "skills": candidate["skills"],
            "resume_summary": candidate["resume_summary"],
            "experience": candidate["experience"],
            "projects": candidate["projects"],
            "years_of_experience": candidate["years_of_experience"],
            "education": candidate["education"]
        }
        evaluation = evaluate_candidate(resume_json, job_desc)
        evaluation = json.loads(evaluation)
        evaluated_candidates.append({
            "candidate_id": candidate["candidate_id"],
            "name": candidate["name"],
            "skills": candidate["skills"],
            "resume_summary": candidate["resume_summary"],
            "experience": candidate["experience"],
            "projects": candidate["projects"],
            "years_of_experience": candidate["years_of_experience"],
            "education": candidate["education"],
            "evaluation": evaluation
        })
        print(f"Complete evaluation [{idx}/{len(candidates)}]")

    evaluated_candidates.sort(
    key=lambda x: x["evaluation"].get("overall_score_0_to_100", 0),
    reverse=True
    )
    top_candidates = evaluated_candidates[:top_k_evaluated]

    # --- SAVE results ---
    with open(f"evaluated_candidates_{job_id}.json", "w", encoding="utf-8") as f:
        json.dump(evaluated_candidates, f, indent=2, ensure_ascii=False, default=str)

    with open(f"top_candidates_{job_id}.json", "w", encoding="utf-8") as f:
        json.dump(top_candidates, f, indent=2, ensure_ascii=False, default=str)

    for c in top_candidates:
        print(f"Candidate ID: {c['candidate_id']}")
        print(f"Name: {c['name']}")
        print(f"Evaluation: {c['evaluation']}")
        print("--------------------------------------------------")