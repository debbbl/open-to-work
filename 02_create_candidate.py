# Import libraries
import sys
import subprocess

subprocess.check_call([sys.executable, "-m", "pip", "install", "pydantic[email]"])
subprocess.check_call([sys.executable, "-m", "pip", "install", "llama_parse"])
subprocess.check_call([sys.executable, "-m", "pip", "install", "llama-index"])
subprocess.check_call([sys.executable, "-m", "pip", "install", "google-genai"])
subprocess.check_call([sys.executable, "-m", "pip", "install", "sentence-transformers"])
subprocess.check_call([sys.executable, "-m", "pip", "install", "weaviate-client"])

import os
import json
from datetime import datetime, date, timezone
from typing import List, Optional
from pydantic import BaseModel, Field, field_validator, root_validator
from llama_parse import LlamaParse
from dotenv import load_dotenv
from llama_index.core import SimpleDirectoryReader
from google import genai
import glob
import re
from sentence_transformers import SentenceTransformer
from typing import Optional
import weaviate
import weaviate.classes.config as wc
import hashlib
load_dotenv()

st = SentenceTransformer("all-mpnet-base-v2")
EMB_DIM = st.get_sentence_embedding_dimension()

# Define Pydantic models for structured data
class Education(BaseModel):
    institution: Optional[str] = Field(
        None, 
        description="The name of the educational institution.")
    qualification: Optional[str] = Field(
        None, 
        description="The degree or qualification obtained.")
    graduation_date: Optional[str] = Field(
        None, 
        description="The graduation date (e.g., 'YYYY-MM').")
    details: Optional[List[str]] = Field(
        None, 
        description="Additional details about the education, such as courseworks, or achievements.")
    
    @root_validator(pre=True)
    def handle_invalid_values(cls, values):
        for key, value in values.items():
            if isinstance(value, str) and value.lower() in {'n/a', 'none', ''}:
                values[key] = None
        return values
    
    @field_validator("details", mode="before")
    def validate_details(cls, v):
        if isinstance(v, str) and v.lower() in {'n/a', 'none', ''}:
            return ["None"]
        elif not isinstance(v, list):
            return ["None"]
        elif v == []:
            return ["None"]
        return v

class Experience(BaseModel):
    company: Optional[str] = Field(
        default=None, 
        description="The name of the company or organization."
    )
    location: Optional[str] = Field(
        default=None, 
        description="The location of the company or organization."
    )
    role: Optional[str] = Field(
        default=None, 
        description="The role or job title held by the candidate."
    )
    start_date: Optional[str] = Field(
        default=None, 
        description="The start date of the job (e.g., 'YYYY-MM')."
    )
    end_date: Optional[str] = Field(
        default=None, 
        description="The end date of the job or 'Present' if ongoing (e.g., 'YYYY-MM')."
    )
    responsibilities: Optional[List[str]] = Field(
        default=None, 
        description="A list of responsibilities and tasks handled during the job."
    )

    @root_validator(pre=True)
    def handle_invalid_values(cls, values):
        for key, value in values.items():
            if isinstance(value, str) and value.lower() in {'n/a', 'none', ''}:
                values[key] = None
        return values

    @field_validator("responsibilities", mode="before")
    def validate_responsibilities(cls, v):
        if isinstance(v, str) and v.lower() in {'n/a', 'none', ''}:
            return ["None"]
        elif not isinstance(v, list):
            return ["None"]
        elif v == []:
            return ["None"]
        return v
    
class Project(BaseModel):
    name: Optional[str] = Field(
        None, 
        description="The name/title of the project done.")
    description: Optional[str] = Field(
        None, 
        description="The description of the project.")
    
    @root_validator(pre=True)
    def handle_invalid_values(cls, values):
        for key, value in values.items():
            if isinstance(value, str) and value.lower() in {'n/a', 'none', ''}:
                values[key] = None
        return values
    
class ApplicantProfile(BaseModel):
    name: Optional[str] = Field(
        default=..., 
        description="The full name of the candidate."
    )
    email: Optional[str] = Field(
        default=..., 
        description="The email of the candidate."
    )
    age: Optional[int] = Field(
        None,
        description=f"The age of the candidate as of {datetime.now().date().strftime('%Y-%m-%d')}. Return an integer only, excluding months."
    )
    skills: Optional[List[str]] = Field(
        default=..., 
        description="The technical and interpersonal skills possessed by candidate. List tool names or skill names only (e.g., 'Java', 'Data Visualization'). If no skills are found, return an empty list."
    )
    social_links: Optional[List[str]] = Field(
        None, description="A list of URLs to the candidate's social media or professional profiles (e.g., LinkedIn, GitHub). If no social links are found, return an empty list."
    )
    experience: Optional[List[Experience]] = Field(
        None, description="A list of experiences detailing previous jobs, roles, and responsibilities. If no experience are found, return an empty list."
    )
    education: Optional[List[Education]] = Field(
        None, description="A list of educational qualifications of the candidate including degrees, institutions studied in, and dates of start and end. If no education details are found, return an empty list."
    )
    projects: Optional[List[Project]] = Field(
        None, description="A list of projects or coursework done by candidate including title of the project and description. If no project is found, return an empty list."
    )
    years_of_experience: Optional[int] = Field(
        default=...,
        description=f"Total years of work experience from the candidate’s earliest start date up to {datetime.now().date().strftime('%Y-%m-%d')}. Return an integer only, rounded down to full years."
    )
    highest_education: Optional[str] = Field(
        default=...,
        description="The highest level of education achieved by the candidate. Can be 'High School', 'Bachelor's Degree', 'Master's Degree', or 'Doctorate"
    )
    current_role: Optional[str] = Field(
        default=...,
        description="Candidate’s current job title. Exclude company or project info."
    )
    function: Optional[str]=Field(
        default=...,
        description="Candidate’s primary business function (e.g., Marketing, Finance, IT) based on his role in current company. Return only the core function."
    )
    @root_validator(pre=True)
    def handle_invalid_values(cls, values):
        for key, value in values.items():
            if isinstance(value, str) and value.lower() in {'n/a', 'none', ''}:
                values[key] = None
        return values
    
    @field_validator("skills", mode="before")
    def validate_details(cls, v):
        if isinstance(v, str) and v.lower() in {'n/a', 'none', ''}:
            return ["None"]
        elif not isinstance(v, list):
            return ["None"]
        elif v == []:
            return ["None"]
        return v

# Extract content from PDF
def extract_content(file_path):
    #Initialize LlamaParse parser
    parser = LlamaParse(
        result_type="markdown",
        parsing_instructions="Extract each section separately based on the document structure.",
        auto_mode=True,
        api_key=os.getenv("LLAMA_API_KEY"),
        split_by_page=False,
        verbose=True
    )
    file_extractor = {".pdf": parser}

    # Load the document
    documents = SimpleDirectoryReader(
        input_files=[file_path], file_extractor=file_extractor
    ).load_data()
    text_content = "\n".join([doc.text for doc in documents])

    return text_content

# Extract structured information using LLM
def extract_information(document_text):
    client = genai.Client(api_key=os.getenv("GEMINI_API_KEY"))

    prompt = f"""
    You are an expert in analyzing resume/curriculum vitae (CV). 

    Your task:
    1.Use the following JSON schema to extract relevant information:
    ```json
    {ApplicantProfile.model_json_schema()}
    ```json
    2.Extract the information from the following document and provide a structured JSON response strictly adhering to the schema above. 
    3.Do not make up any information.

    Response format:
    1.Please remove any ```json ``` characters from the output. 
    2.If a field cannot be extracted or information is not available, mark it as `n/a`.
    
    Document:
    ----------------
    {document_text}
    ----------------
    """
    response = client.models.generate_content(
        model="gemini-2.5-flash",
        contents=prompt,
        config={
            "response_mime_type":"application/json",
            "response_schema":ApplicantProfile,
        })
    
    if not response or not response.text:
        raise ValueError("Failed to get a response from LLM.")
    
    #print(response.text)

    return response.text 

# Process all PDFs in a folder
def process_folder(folder_path: str) -> List[dict]:
    """
    Process all PDFs in a folder.
    Returns:
      - candidates: list of validated dicts (candidates[i] == parsed CV i)
    """
    if not os.path.isdir(folder_path):
        raise NotADirectoryError(f"{folder_path} is not a folder.")

    pdf_paths = sorted(glob.glob(os.path.join(folder_path, "*.pdf")))
    if not pdf_paths:
        raise FileNotFoundError(f"No PDFs found in {folder_path}")

    candidates: List[dict] = []

    for idx, pdf_path in enumerate(pdf_paths):
        print(f"\n[{idx+1}/{len(pdf_paths)}] Processing: {os.path.basename(pdf_path)}")

        try:
            # 1) Extract raw text from PDF
            document_content = extract_content(pdf_path)

            # 2) Ask LLM to structure it & validate with Pydantic models
            info_json = extract_information(document_content)
            parsed = json.loads(info_json)
            parsed["experience"] = [Experience.model_validate(e) for e in parsed["experience"]]
            parsed["education"] = [Education.model_validate(e) for e in parsed["education"]]
            validated = ApplicantProfile.model_validate(parsed)

            # 3) Append to results
            candidates.append(validated.model_dump())

        except Exception as e:
            print(f"⚠️ Skipped {os.path.basename(pdf_path)} due to error: {e}")

    if not candidates:
        raise RuntimeError("No candidates were successfully parsed/validated.")

    return candidates

# Generate summary for each candidate
def generate_summary(resume_json):
    client = genai.Client(api_key=os.getenv("GEMINI_API_KEY"))

    prompt = f"""
    You are a professional career assistant that specialized in summarizing resumes for recruiters. Your task is to generate summary of a candidate's resume.

    Your summary must include:
    1.Core skills - list programming languages, frameworks, tools and technical expertise in a single line, separated by commas (avoid sentences or adjectives).
    2.Work experience - emphasize relevant roles, industries and contributions.
    3.Education - highlight highest degree and relevant qualifications.
    4.Projects & Achievements - highlight key projects, outcome, innovations or impact.
    5.Transferable skills - highlight key transferable skills that can be applied across different roles or industries. Point out cross-functional strengths that make the candidate a strong hire.
    6.Years of experience - highlight total years of experience in the field.

    Response format:
    1.Reply in a concise and professional tone.
    2.Keep the summary between 200 to 250 words.
    3.Make sure you dont exceed the word limit of 250 words.
    
    Summarize the following resume:
    ----------------
    {resume_json}
    ----------------
    """
    response = client.models.generate_content(
        model="gemini-2.5-flash",
        contents=prompt)
    
    if not response or not response.text:
        raise ValueError("Failed to get a response from LLM.")
    
    return response.text 

# Generate embedding for each candidate summary
def embed(text: str):
    # L2-normalized floats (best for cosine)
    return st.encode(text or "", normalize_embeddings=True).tolist()

def to_rfc3339(date_str: Optional[str]) -> Optional[str]:
    """
    Convert 'YYYY', 'YYYY-MM', 'YYYY-MM-DD' into RFC3339 ('YYYY-MM-DDT00:00:00Z').
    If 'Present' → use today's date.
    Returns None if input is None or unrecognized.
    """
    if not date_str:
        return None

    s = str(date_str).strip()

    # Handle Present → today's date
    if s.lower() == "present":
        today = datetime.now(timezone.utc).strftime("%Y-%m-%d")
        return f"{today}T00:00:00Z"

    # YYYY
    if re.fullmatch(r"\d{4}", s):
        s = f"{s}-01-01"
    # YYYY-MM
    elif re.fullmatch(r"\d{4}-\d{2}", s):
        s = f"{s}-01"
    # YYYY-MM-DD OK
    elif not re.fullmatch(r"\d{4}-\d{2}-\d{2}", s):
        return None  # unknown format

    return f"{s}T00:00:00Z"

def map_education(edu_list):
    out = []
    for e in edu_list or []:
        out.append({
            "institution": e.get("institution"),
            "qualification": e.get("qualification"),
            "graduation_date": to_rfc3339(e.get("graduation_date")),
            "details": e.get("details") or [],
        })
    return out

def map_experience(exp_list):
    out = []
    for e in exp_list or []:
        out.append({
            "company": e.get("company"),
            "location": e.get("location"),
            "role": e.get("role"),
            "start_date": to_rfc3339(e.get("start_date")),
            "end_date": to_rfc3339(e.get("end_date")),
            "responsibilities": e.get("responsibilities") or [],
        })
    return out

def map_projects(prj_list):
    out = []
    for p in prj_list or []:
        out.append({
            "name": p.get("name"),
            "description": p.get("description"),
        })
    return out

def generate_candidate_id(candidate_name, resume_summary):
    text = f"{candidate_name}_{resume_summary}"
    full_hash = hashlib.sha256(text.encode("utf-8")).hexdigest()
    return full_hash[:8]

if __name__ == "__main__":
    # Path to the document folder
    document_path = "/workspaces/talentoptimization/Resume"
    job_id = "769a7894" # Need to get this input from user selection

    try:
        # Extract candidates information
        candidates = process_folder(document_path)
        print(f"\n Parsed {len(candidates)} candidates")

        # Generate summary for each candidate
        for idx, candidate in enumerate(candidates):
            print(f"\n Generating [{idx+1}/{len(candidates)}] of summary for candidates")
            resume_summary = generate_summary(json.dumps(candidate))
            candidate["resume_summary"] = resume_summary

            summary_vec = embed(resume_summary)
            candidate["resume_summary_vector"] = summary_vec
            candidate["job_id"] = job_id
            candidate["candidate_id"] = generate_candidate_id(candidate.get("name"), resume_summary)

        client = weaviate.connect_to_weaviate_cloud(
            cluster_url=os.getenv("WEAVIATE_URL"),
            auth_credentials=weaviate.auth.AuthApiKey(os.getenv("WEAVIATE_API_KEY")),
        )

        # Upload candidates to Weaviate
        cand = client.collections.get("Candidate")

        for idx, item in enumerate(candidates):
            try:
                properties = {
                    "name": item.get("name"),
                    "email": item.get("email"),
                    "age": item.get("age"),
                    "skills": item.get("skills") or [],
                    "years_of_experience": item.get("years_of_experience"),
                    "highest_education": item.get("highest_education"),
                    "current_role": item.get("current_role"),
                    "function": item.get("function"),
                    "resume_summary": item.get("resume_summary"),
                    "education": map_education(item.get("education")),
                    "experience": map_experience(item.get("experience")),
                    "projects": map_projects(item.get("projects")),
                    "job_id": item.get("job_id"),
                    "social_links": item.get("social_links") or [],
                    "candidate_id": item.get("candidate_id"),
                }

                # vector for this candidate
                resume_vec = item.get("resume_summary_vector")
                if not resume_vec:
                    print(f"⚠️ Candidate {idx} missing resume_summary_vector. Skipped.")
                    continue
                # insert into Weaviate
                obj_id = cand.data.insert(
                    properties=properties,
                    vector=resume_vec,  # default vector space
                )
                print(f"✅ Inserted candidate[{idx}] with UUID: {obj_id}")

            except Exception as e:
                print(f"❌ Error inserting candidate[{idx}]: {e}")

        client.close()

    except Exception as e:
        print(f"An error occurred: {e}")