from fastapi import APIRouter, Query, HTTPException
from pydantic import BaseModel, Field
from typing import List, Optional
from google import genai
import os
from dotenv import load_dotenv
from sentence_transformers import SentenceTransformer
import weaviate
from weaviate.classes.query import Filter  # Correct import
from datetime import datetime
import hashlib

load_dotenv()

router = APIRouter(tags=["jobs"])

st = SentenceTransformer("all-mpnet-base-v2")
EMB_DIM = st.get_sentence_embedding_dimension()


# ----- request/response models -----
class JobRequest(BaseModel):
    job_title: str = Field(..., examples=["Senior Frontend Developer"])
    required_skills: str = Field(..., examples=["React, TypeScript, Node.js"])
    nice_to_have_skills: str = Field(..., examples=["GraphQL, AWS"])
    years_experience: str = Field(..., examples=["3-5 years"])
    relevant_industry_project_experience: str = Field(
        ..., examples=["e-commerce, fintech, SaaS"]
    )
    education_requirement: str = Field(
        ..., examples=["Bachelor’s in CS or related field"]
    )
    responsibilities: str = Field(
        ..., examples=["Build UI features, collaborate with backend, mentor juniors"]
    )


class JobResponse(BaseModel):
    job_id: str
    title: str
    description: str


class JobLite(BaseModel):
    job_id: str
    title: Optional[str] = None
    job_creation_date: Optional[str] = None


class JobFull(BaseModel):
    job_id: str
    title: Optional[str] = None
    description: Optional[str] = None
    job_creation_date: Optional[str] = None


# Helper function to convert date to RFC3339 format
def as_rfc3339(date_str: str) -> str:
    return f"{date_str}T00:00:00Z"


# Generate embedding using sentence transformers
def embed(text: str):
    return st.encode(text or "", normalize_embeddings=True).tolist()


# Generate unique job ID based on job title and creation date
def generate_job_id(job_title):
    today_str = datetime.now().strftime("%Y%m%d")
    text = f"{job_title}_{today_str}"
    full_hash = hashlib.sha256(text.encode("utf-8")).hexdigest()
    return full_hash[:8]


# Generate job description
def job_desc_prompt(
    job_title,
    required_skills,
    nice_to_have_skills,
    years_experience,
    relevant_industry_project_experience,
    education_requirement,
    responsibilities,
):
    client = genai.Client(api_key=os.getenv("GEMINI_API_KEY"))
    prompt = f"""
    You are an expert technical recruiter and hiring manager.

    Your task is to generate a detailed job description for a specific role based on the provided inputs.
    
    1) Output format:
    ### {job_title} — Job Description

    ### Technical Skills (Required)
    - {required_skills}

    ### Nice to Have
    - {nice_to_have_skills}

    ### Years of Experience Needed
    - **{years_experience}**

    ### Relevant Industry/Project Experience
    - {relevant_industry_project_experience}

    ### Education Requirement
    - {education_requirement}

    ### Responsibilities
    - {responsibilities}

    2) Response guidelines:
    - Rewrite the inputs into a coherent, well-structured job description.
    - Use markdown formatting with headers and bullet points ('-') as shown above.
    - Convert comma-separated lists into bullet points ('-').
    - Ensure clarity, conciseness, and professionalism in tone.
    - Avoid repetition and redundancy.
    - Do not add any unrelated information.
    - You may lightly elaborate on the provided inputs with common, widely expected requirements in the job market. However, keep elaboration minimal.
    - Avoid buzzwords and overused adjectives.
    - User provided inputs might be not well formatted or grammatically correct, please return a well formatted and professionally written job description.
    - Keep the job description under 250 words"""

    response = client.models.generate_content(model="gemini-2.5-flash", contents=prompt)

    if not response or not response.text:
        raise ValueError("Failed to get a response from LLM.")

    return response.text


def generate_job_description(
    job_title,
    required_skills,
    nice_to_have_skills,
    years_experience,
    relevant_industry_project_experience,
    education_requirement,
    responsibilities,
):
    try:
        job_description = job_desc_prompt(
            job_title,
            required_skills,
            nice_to_have_skills,
            years_experience,
            relevant_industry_project_experience,
            education_requirement,
            responsibilities,
        )
        return job_description
    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Error generating job description: {e}"
        )


# ----- endpoints -----
@router.post(
    "/jobs/generate", response_model=dict, summary="Generate a job description (LLM)"
)
def generate_job(req: JobRequest):
    text = generate_job_description(**req.model_dump())
    return {"description": text}


@router.post(
    "/jobs/create",
    response_model=JobResponse,
    summary="Create a Job object in Weaviate",
)
def create_job(req: JobRequest):
    job_title = req.job_title
    job_desc = generate_job_description(**req.model_dump())
    today_str = datetime.now().strftime("%Y-%m-%d")

    client = weaviate.connect_to_weaviate_cloud(
        cluster_url=os.getenv("WEAVIATE_URL"),
        auth_credentials=weaviate.auth.AuthApiKey(os.getenv("WEAVIATE_API_KEY")),
    )
    try:
        coll = client.collections.get("Job")
        job_id = generate_job_id(job_title)
        job_desc_vec = embed(job_desc)
        coll.data.insert(
            properties={
                "name": job_title,
                "job_description": job_desc,
                "job_creation_date": as_rfc3339(today_str),
                "job_id": job_id,
            },
            vector=job_desc_vec,
        )
        return {"job_id": job_id, "title": job_title, "description": job_desc}
    finally:
        client.close()


@router.get(
    "/jobs/list", response_model=List[JobLite], summary="List recent jobs from Weaviate"
)
def list_jobs(limit: int = Query(25, ge=1, le=200)):
    client = weaviate.connect_to_weaviate_cloud(
        cluster_url=os.getenv("WEAVIATE_URL"),
        auth_credentials=weaviate.auth.AuthApiKey(os.getenv("WEAVIATE_API_KEY")),
    )
    try:
        coll = client.collections.get("Job")
        resp = coll.query.fetch_objects(
            limit=limit,
            return_properties=[
                "name",
                "job_description",
                "job_creation_date",
                "job_id",
            ],
        )
        out = []
        for o in resp.objects:
            job_creation_date = o.properties.get("job_creation_date")
            # Ensure job_creation_date is a string
            if isinstance(job_creation_date, datetime):
                job_creation_date = job_creation_date.strftime("%Y-%m-%dT%H:%M:%SZ")
            out.append(
                {
                    "job_id": o.properties.get("job_id"),
                    "title": o.properties.get("name"),
                    "job_creation_date": job_creation_date,
                }
            )
        out.sort(key=lambda x: x.get("job_creation_date") or "", reverse=True)
        return out
    finally:
        client.close()


@router.get(
    "/jobs/by-id", response_model=JobFull, summary="Get a job by job_id from Weaviate"
)
def job_by_id(job_id: str = Query(...)):
    client = weaviate.connect_to_weaviate_cloud(
        cluster_url=os.getenv("WEAVIATE_URL"),
        auth_credentials=weaviate.auth.AuthApiKey(os.getenv("WEAVIATE_API_KEY")),
    )
    try:
        coll = client.collections.get("Job")
        resp = coll.query.fetch_objects(
            filters=Filter.by_property("job_id").equal(job_id),
            limit=1,
            return_properties=[
                "name",
                "job_description",
                "job_creation_date",
                "job_id",
            ],
        )
        if not resp.objects:
            raise HTTPException(status_code=404, detail="Job not found")
        o = resp.objects[0]
        job_creation_date = o.properties.get("job_creation_date")
        # Ensure job_creation_date is a string
        if isinstance(job_creation_date, datetime):
            job_creation_date = job_creation_date.strftime("%Y-%m-%dT%H:%M:%SZ")
        return {
            "job_id": o.properties.get("job_id"),
            "title": o.properties.get("name"),
            "description": o.properties.get("job_description"),
            "job_creation_date": job_creation_date,
        }
    finally:
        client.close()
