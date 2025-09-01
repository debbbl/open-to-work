from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel, Field, conint
from typing import List, Dict, Any
import os
from dotenv import load_dotenv
import weaviate
from weaviate.classes.query import Filter, MetadataQuery, HybridFusion
from weaviate.classes.init import AdditionalConfig, Timeout
from sentence_transformers import SentenceTransformer
from google import genai
import json
import logging

load_dotenv()
router = APIRouter(tags=["screening"])
logger = logging.getLogger(__name__)

st = SentenceTransformer("all-mpnet-base-v2")

# ----- Pydantic models -----
Score = conint(ge=1, le=10)


class Evidence(BaseModel):
    notes: List[str] = Field(
        default_factory=list,
        description="Short quotes or paraphrased bullets supporting the score.",
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
    years_experience_score: Score
    years_experience_evidence: Evidence = Field(default_factory=Evidence)
    skills: SkillsAssessment
    industry_relevance: CriterionAssessment
    achievements_and_certs: CriterionAssessment
    education_alignment: CriterionAssessment
    overall_score_0_to_100: conint(ge=0, le=100)
    summary: str = Field(
        None, description="Brief narrative tying together strengths, risks, and fit."
    )


class ScreeningRequest(BaseModel):
    job_id: str = Field(..., examples=["769a7894"])
    top_k: conint(ge=1, le=200) = Field(30, description="Pool size for hybrid search")
    top_k_evaluated: conint(ge=1, le=50) = Field(
        10, description="How many to return after scoring"
    )
    search_all_candidates: bool = Field(
        True,
        description="If True, search ALL candidates in database. If False, only search candidates who applied to this job.",
    )
    max_all_candidates_limit: conint(ge=1, le=50) = Field(
        5,
        description="Maximum candidates to process when search_all_candidates=True (hardcoded safety limit)",
    )


# ----- Helper functions -----
def _client():
    client = weaviate.connect_to_weaviate_cloud(
        cluster_url=os.getenv("WEAVIATE_URL"),
        auth_credentials=weaviate.auth.AuthApiKey(os.getenv("WEAVIATE_API_KEY")),
        additional_config=AdditionalConfig(
            timeout=Timeout(init=60, query=600, insert=600)
        ),
    )
    logger.info("Connected to Weaviate")
    return client


def fetch_job_description(job_id: str):
    client = _client()
    try:
        logger.info(f"Fetching job description for job_id {job_id}")
        job_collection = client.collections.get("Job")
        resp = job_collection.query.fetch_objects(
            filters=Filter.by_property("job_id").equal(job_id),
            limit=1,
            return_properties=["name", "job_description"],
            include_vector=True,
        )
        if not resp.objects:
            logger.warning(f"No job found for job_id {job_id}")
            return None, None
        obj = resp.objects[0]
        job_desc = obj.properties.get("job_description")
        job_vec = obj.vector["default"]
        logger.info(f"Successfully fetched job description for job_id {job_id}")
        return job_desc, job_vec
    except Exception as e:
        logger.error(f"Failed to fetch job description for job_id {job_id}: {str(e)}")
        raise
    finally:
        client.close()


def fetch_job_title(job_id: str) -> str | None:
    client = _client()
    try:
        logger.info(f"Fetching job title for job_id {job_id}")
        job_collection = client.collections.get("Job")
        resp = job_collection.query.fetch_objects(
            filters=Filter.by_property("job_id").equal(job_id),
            limit=1,
            return_properties=["name"],  # Fetch only the job title
        )
        if not resp.objects:
            logger.warning(f"No job found for job_id {job_id}")
            return None
        obj = resp.objects[0]
        job_title = obj.properties.get("name") or "Untitled Job"
        logger.info(f"Successfully fetched job title for job_id {job_id}: {job_title}")
        return job_title
    except Exception as e:
        logger.error(f"Failed to fetch job title for job_id {job_id}: {str(e)}")
        return None
    finally:
        client.close()


def hybrid_search_applied_candidates(
    job_desc: str, job_desc_vec, top_k: int, job_id: str
) -> List[Dict]:
    """Search candidates who applied to this specific job"""
    client = _client()
    try:
        logger.info(
            f"Starting hybrid search for applied candidates to job_id {job_id} with top_k {top_k}"
        )
        candidate_collection = client.collections.get("Candidate")
        resp = candidate_collection.query.hybrid(
            query=job_desc,
            vector=job_desc_vec,
            alpha=0.7,
            limit=top_k,
            query_properties=["skills", "resume_summary"],
            return_metadata=MetadataQuery(score=True),
            fusion_type=HybridFusion.RELATIVE_SCORE,
            include_vector=False,
            filters=Filter.by_property("job_id").equal(job_id),
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
                "applied_to_job": True,  # Mark as applied
            }
            candidates.append(candidate)
        logger.info(
            f"Retrieved {len(candidates)} applied candidates for job_id {job_id}"
        )
        return candidates
    except Exception as e:
        logger.error(
            f"Hybrid search failed for applied candidates to job_id {job_id}: {str(e)}"
        )
        raise
    finally:
        client.close()


def hybrid_search_all_candidates(
    job_desc: str, job_desc_vec, top_k: int, job_id: str, max_limit: int = 5
) -> List[Dict]:
    """Search ALL candidates in database (not just those who applied to this job)"""
    client = _client()
    try:
        logger.info(
            f"Starting hybrid search for ALL candidates with top_k {top_k}, max_limit {max_limit}"
        )
        candidate_collection = client.collections.get("Candidate")

        # Search ALL candidates without job_id filter
        resp = candidate_collection.query.hybrid(
            query=job_desc,
            vector=job_desc_vec,
            alpha=0.7,
            limit=min(top_k, max_limit),  # Apply max_limit here
            query_properties=["skills", "resume_summary"],
            return_metadata=MetadataQuery(score=True),
            fusion_type=HybridFusion.RELATIVE_SCORE,
            include_vector=False,
            # NO job_id filter - search all candidates
        )

        candidates = []
        for obj in resp.objects:
            # Check if this candidate applied to the current job
            applied_to_job = obj.properties.get("job_id") == job_id

            candidate = {
                "name": obj.properties["name"],
                "candidate_id": obj.properties["candidate_id"],
                "skills": obj.properties["skills"],
                "resume_summary": obj.properties["resume_summary"],
                "experience": obj.properties["experience"],
                "projects": obj.properties["projects"],
                "years_of_experience": obj.properties["years_of_experience"],
                "education": obj.properties["education"],
                "applied_to_job": applied_to_job,  # Mark whether they applied
                "original_job_id": obj.properties.get(
                    "job_id"
                ),  # Keep original job_id for reference
            }
            candidates.append(candidate)

        logger.info(
            f"Retrieved {len(candidates)} total candidates (applied + potential fits)"
        )
        return candidates
    except Exception as e:
        logger.error(f"Hybrid search failed for all candidates: {str(e)}")
        raise
    finally:
        client.close()


def evaluate_candidate(resume_json: Dict, job_desc: str) -> Dict:
    try:
        logger.info(f"Starting evaluation for candidate {resume_json.get('name')}")
        client = genai.Client(api_key=os.getenv("GEMINI_API_KEY"))

        # Convert resume_json to JSON string with proper datetime handling
        # This is the key fix - use json.dumps with default=str to handle datetime objects
        resume_json_str = json.dumps(resume_json, ensure_ascii=False, default=str)

        prompt = f"""
        You are a meticulous technical recruiter assessing a candidate's resume against a specific job description.

        ## Inputs
        JOB DESCRIPTION:
        {job_desc}

        CANDIDATE RESUME:
        {resume_json_str}

        ## What to do
        1) Read both carefully. When the job description lists "must-have" items, treat them as essential.
        2) Evaluate the candidate on each criterion below, score 1–10 (1 = very poor, 10 = exceptional), and explain briefly with evidence (short quotes or bullet references).
        3) If a criterion doesn't apply (e.g., no certifications are relevant), still score it based on available signals and explain why.

        ## Criteria & guidance (score each 1–10)
        A. Years of experience & seniority alignment  
        - Map total relevant YOE vs. JD requirement.   
        - Consider depth in core areas, not just total years.

        B. Skills match (hard skills)  
        - Count how many essential and nice‑to‑have skills are satisfied.  
        - Penalize missing essentials more than missing "nice‑to‑haves".

        C. Industry / domain relevance & project fit  
        - Similar products, tech stack, domain, or customer segment.  
        - Prefer recent, hands‑on, outcome‑driven work.

        D. Achievements & certifications  
        - Concrete outcomes (metrics), notable awards, relevant certs.  
        - Prefer measurable impact (e.g., "↑CTR 12%", "↓latency 35%").

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
                "response_mime_type": "application/json",
                "response_schema": CandidateEvaluation,
            },
        )

        if not response or not response.text:
            raise ValueError("Failed to get a response from LLM.")

        logger.info(f"Successfully evaluated candidate {resume_json.get('name')}")
        return json.loads(response.text)
    except Exception as e:
        logger.error(
            f"Failed to evaluate candidate {resume_json.get('name')}: {str(e)}"
        )
        raise


@router.post("/screening/run", response_model=dict)
def run_screening(req: ScreeningRequest):
    job_id = req.job_id
    top_k = req.top_k
    top_k_evaluated = req.top_k_evaluated
    search_all_candidates = req.search_all_candidates
    max_all_candidates_limit = req.max_all_candidates_limit

    logger.info(
        f"Starting screening for job_id {job_id} with top_k {top_k}, top_k_evaluated {top_k_evaluated}, "
        f"search_all_candidates {search_all_candidates}, max_limit {max_all_candidates_limit}"
    )

    job_desc, job_vec = fetch_job_description(job_id)
    if not job_desc or not job_vec:
        logger.error(f"Job not found for job_id {job_id}")
        raise HTTPException(status_code=404, detail="Job not found")

    # Choose search strategy based on request
    if search_all_candidates:
        # Search ALL candidates in database (applied + potential fits)
        candidates = hybrid_search_all_candidates(
            job_desc, job_vec, top_k, job_id, max_all_candidates_limit
        )
        search_type = "all_candidates"
    else:
        # Search only candidates who applied to this job
        candidates = hybrid_search_applied_candidates(job_desc, job_vec, top_k, job_id)
        search_type = "applied_only"

    evaluated_candidates = []
    for idx, candidate in enumerate(candidates, start=1):
        resume_json = {
            "name": candidate["name"],
            "skills": candidate["skills"],
            "resume_summary": candidate["resume_summary"],
            "experience": candidate["experience"],
            "projects": candidate["projects"],
            "years_of_experience": candidate["years_of_experience"],
            "education": candidate["education"],
        }
        try:
            evaluation = evaluate_candidate(resume_json, job_desc)
            # Fetch original job title if original_job_id exists and differs from job_id
            original_job_title = None
            if (
                candidate.get("original_job_id")
                and candidate["original_job_id"] != job_id
            ):
                original_job_title = fetch_job_title(candidate["original_job_id"])

            evaluated_candidates.append(
                {
                    "candidate_id": candidate["candidate_id"],
                    "name": candidate["name"],
                    "skills": candidate["skills"],
                    "resume_summary": candidate["resume_summary"],
                    "experience": candidate["experience"],
                    "projects": candidate["projects"],
                    "years_of_experience": candidate["years_of_experience"],
                    "education": candidate["education"],
                    "applied_to_job": candidate.get("applied_to_job", True),
                    "original_job_id": candidate.get("original_job_id"),
                    "original_job_title": original_job_title,  # Add the job title
                    "evaluation": evaluation,
                }
            )
            logger.info(
                f"Evaluated candidate {candidate['candidate_id']} at position {idx} (applied: {candidate.get('applied_to_job', 'unknown')})"
            )
        except Exception as e:
            logger.error(
                f"Evaluation failed for candidate {candidate['candidate_id']}: {str(e)}"
            )
            continue

    evaluated_candidates.sort(
        key=lambda x: x["evaluation"].get("overall_score_0_to_100", 0), reverse=True
    )
    logger.info(
        f"Sorted {len(evaluated_candidates)} candidates, returning top {top_k_evaluated}"
    )
    top_candidates = evaluated_candidates[:top_k_evaluated]

    # Separate applied vs potential candidates for frontend
    applied_candidates = [c for c in top_candidates if c.get("applied_to_job", True)]
    potential_candidates = [
        c for c in top_candidates if not c.get("applied_to_job", True)
    ]

    return {
        "evaluated": top_candidates,
        "search_type": search_type,
        "stats": {
            "total_evaluated": len(evaluated_candidates),
            "applied_candidates": len(applied_candidates),
            "potential_candidates": len(potential_candidates),
            "returned_count": len(top_candidates),
        },
        "applied_candidates": applied_candidates,
        "potential_candidates": potential_candidates,
    }


@router.get("/screening/summary")
def screening_summary(job_id: str = Query(..., examples=["769a7894"])):
    if not job_id:
        raise HTTPException(status_code=422, detail="job_id is required")
    logger.info(f"Fetching screening summary for job_id {job_id}")
    client = _client()
    try:
        cand_coll = client.collections.get("Candidate")
        resp = cand_coll.query.fetch_objects(
            filters=Filter.by_property("job_id").equal(job_id),
            limit=1000,
            return_properties=["candidate_id"],
        )
        summary = {
            "fast_filter_processed": len(resp.objects),
            "fast_filter_filtered": 0,  # Placeholder, as no fast filter is implemented
            "semantic_matched": len(resp.objects),
            "llm_evaluated": len(resp.objects),
        }
        logger.info(f"Summary for job_id {job_id}: {summary}")
        return summary
    except Exception as e:
        logger.error(f"Failed to fetch screening summary for job_id {job_id}: {str(e)}")
        raise
    finally:
        client.close()
