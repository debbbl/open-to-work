# Import libraries
import sys
import subprocess

subprocess.check_call([sys.executable, "-m", "pip", "install", "weaviate-client"])
subprocess.check_call([sys.executable, "-m", "pip", "install", "google-genai"])
subprocess.check_call([sys.executable, "-m", "pip", "install", "sentence-transformers"])

from google import genai
import os
from dotenv import load_dotenv
import weaviate
import weaviate.classes.config as wc
from sentence_transformers import SentenceTransformer
import hashlib
from datetime import datetime
load_dotenv()

st = SentenceTransformer("all-mpnet-base-v2")  # 768-dim, high accuracy
EMB_DIM = st.get_sentence_embedding_dimension()  # should be 768

# Generate job description if user chooses this option
def job_desc_prompt(job_title, required_skills, nice_to_have_skills, years_experience, relevant_industry_project_experience, education_requirement, responsibilities):
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

    response = client.models.generate_content(
        model="gemini-2.5-flash",
        contents=prompt)
    
    if not response or not response.text:
        raise ValueError("Failed to get a response from LLM.")
    
    return response.text

def generate_job_description(job_title, required_skills, nice_to_have_skills, years_experience, relevant_industry_project_experience, education_requirement, responsibilities):
    try:
        job_description = job_desc_prompt(job_title, required_skills, nice_to_have_skills, years_experience, relevant_industry_project_experience, education_requirement, responsibilities)
        return job_description
    except Exception as e:
        return f"Error generating job description: {e}"

# Helper function to convert date to RFC3339 format
def as_rfc3339(date_str: str) -> str:
    # turns "2025-08-25" into "2025-08-25T00:00:00Z"
    return f"{date_str}T00:00:00Z"

# Generate embedding using sentence transformers
def embed(text: str):
    # L2-normalized floats (best for cosine)
    return st.encode(text or "", normalize_embeddings=True).tolist()

# Generate unique job ID based on job title and creation date
def generate_job_id(job_title):
    today_str = datetime.now().strftime("%Y%m%d")
    text = f"{job_title}_{today_str}"
    full_hash = hashlib.sha256(text.encode("utf-8")).hexdigest()
    return full_hash[:8]

# Insert job into Weaviate
def insert_job_to_weaviate(job_title, job_description):
    today_str = datetime.now().strftime("%Y-%m-%d")
    # Connect to Weaviate
    client = weaviate.connect_to_weaviate_cloud(
        cluster_url=os.getenv("WEAVIATE_URL"),
        auth_credentials=weaviate.auth.AuthApiKey(os.getenv("WEAVIATE_API_KEY")),
    )
    # Get collection
    job_collection = client.collections.get("Job")
    job = {
        "name": job_title,
        "job_description": job_description,
        "job_creation_date": as_rfc3339(today_str),
        "job_id": generate_job_id(job_title),
    }
    # Generate embedding
    job_desc_vec = embed(job_description)
    # Upload to Weaviate
    job_collection.data.insert(
        properties=job,
        vector=job_desc_vec
    )
    client.close()

def main():
    # Example inputs
    job_title = "Junior Data Scientist"
    required_skills = "Python(pandas, NumPy), SQL, jupyter notebooks, supervised learning, scikit learn, classification, regression, model evaluation, cross-validation, data wrangling, feature engineering, handling missing data, outliers, leakage, data visualization (matploblib/plotly), storytelling with dashboards (power bi/tableau)"
    nice_to_have_skills = "pyspark, databricks, basic cloud (AWS/GCP/Azure), ML lifecycle tools (MLflow), orchestration (Airflow), containers (Docker), NLP basics, time-series forecasting"
    years_experience = "0-2 years in data science or analytics industry"
    relevant_industry_project_experience = "retail/e-commerce, wholesale, fintech, healthcare, marketing analytics, projects like churn/propensity modeling, demand forecasting, recommendation, anomaly/fraud detection, pricing/AB testing, NLP text classification, customer segmentation, work with messy, real-world datasets"
    education_requirement = "Bachelor’s degree in Data Science, Computer Science, Statistics, Mathematics, Engineering, or a related field"
    responsibilities = "Explore datasets, build clean feature sets, train baseline → improved models, validate results, document assumptions, communicate findings to non-technical stakeholders, ship analyses/dashboards, collaborate with product/engineering to move models from notebook to production" 
    
    # Generate job description
    job_description = generate_job_description(job_title, required_skills, nice_to_have_skills, years_experience, relevant_industry_project_experience, education_requirement, responsibilities)
    
    if job_description.startswith("Error generating job description"):
        print(job_description)
        return

    print("Generated Job Description:")
    print(job_description)

    # Insert job into Weaviate
    insert_job_to_weaviate(job_title, job_description)
    print("Job inserted into Weaviate successfully.")


if __name__ == "__main__":
    main()