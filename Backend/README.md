# Job Autofiller Backend API

FastAPI backend for the Job Autofiller Chrome extension.

## Setup

1. **Install Python dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

2. **Configure PostgreSQL (once):**
   - Create a database (e.g. `job_autofiller`) and note the credentials.
   - Export a `DATABASE_URL` so FastAPI can connect:
     ```bash
     # Windows PowerShell example
     $env:DATABASE_URL = "postgresql+psycopg2://postgres:password@localhost:5432/job_autofiller"
     ```
   - If you skip this, the app will try the default URL in `database.py`
     (`postgresql+psycopg2://postgres:postgres@localhost:5432/postgres`).

3. **Run the server:**
   ```bash
   python main.py
   ```
   
   Or using uvicorn directly:
   ```bash
   uvicorn main:app --reload --host 0.0.0.0 --port 8000
   ```

4. **Access the API:**
   - API will be available at: `http://localhost:8000`
   - API Documentation (Swagger UI): `http://localhost:8000/docs`
   - Alternative docs (ReDoc): `http://localhost:8000/redoc`

## API Endpoints

### POST `/api/save-profile`
Saves user profile data and persists it in PostgreSQL (`profiles`, `experiences`, `references` tables). The incoming payload mirrors the Chrome extension data model.

**Request Body:**
```json
{
  "personal": {
    "firstName": "John",
    "lastName": "Doe",
    "email": "john@example.com",
    ...
  },
  "professional": { ... },
  "education": { ... },
  "experience": [ ... ],
  "references": [ ... ],
  "documents": { ... },
  "additional": { ... },
  "lastUpdated": "2024-01-01T00:00:00.000Z"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Profile saved successfully",
  "timestamp": "2024-01-01T00:00:00.000000",
  "profile_id": 42,
  "data_received": {
    "personal_info": true,
    "professional_info": true,
    "education_info": true,
    "experience_count": 2,
    "references_count": 1,
    "has_resume": true,
    "has_cover_letter": true
  }
}
```

### GET `/api/health`
Health check endpoint.

### GET `/`
Root endpoint with API information.

## Testing the database flow

1. Start PostgreSQL and the FastAPI server (`python main.py`).
2. Open Swagger (`http://localhost:8000/docs`) and expand `POST /api/save-profile`.
3. Click **Try it out**, paste a sample payload, and execute.
4. The response returns `profile_id`; verify rows in PostgreSQL via DBeaver:
   ```sql
   SELECT * FROM profiles ORDER BY id DESC LIMIT 5;
   SELECT * FROM experiences WHERE profile_id = <profile_id>;
   SELECT * FROM references WHERE profile_id = <profile_id>;
   ```
