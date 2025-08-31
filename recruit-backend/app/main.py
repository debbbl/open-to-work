from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routers import jobs, resumes, screening

app = FastAPI(title="Recruit Backend", version="1.0.0")

# 👇 list ALL front-end origins you use in dev
origins = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "http://localhost:5173",
    "http://127.0.0.1:5173",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,  # <- do NOT use "*" if you set allow_credentials=True
    allow_credentials=False,  # set True only if you actually send cookies
    allow_methods=["*"],  # allow POST/GET/OPTIONS/etc
    allow_headers=["*"],  # allow "content-type", "authorization", etc
)

# Routers
app.include_router(jobs.router, prefix="/api")
app.include_router(resumes.router, prefix="/api")
app.include_router(screening.router, prefix="/api")


@app.get("/")
def root():
    return {"message": "Recruit Backend running"}


if __name__ == "__main__":
    import uvicorn

    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
