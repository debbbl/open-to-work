Hello

cd recruit-backend

python -m venv .venv

.venv/Scripts/activate

pip install -r requirements.txt

uvicorn app.main:app --reload --port 8000
