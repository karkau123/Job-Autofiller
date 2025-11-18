from datetime import datetime
import json
from typing import List, Optional

from fastapi import Depends, FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session

from database import (
    Experience as ExperienceModel,
    Profile as ProfileModel,
    Reference as ReferenceModel,
    SessionLocal,
    init_db,
)

app = FastAPI(title="Job Autofiller API", version="1.0.0")
init_db()

# Enable CORS for Chrome extension
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify your extension's origin
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Pydantic models for request validation
class PersonalInfo(BaseModel):
    firstName: Optional[str] = None
    lastName: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    address: Optional[str] = None
    city: Optional[str] = None
    state: Optional[str] = None
    zipCode: Optional[str] = None
    country: Optional[str] = None
    linkedin: Optional[str] = None
    portfolio: Optional[str] = None

class ProfessionalInfo(BaseModel):
    currentTitle: Optional[str] = None
    currentCompany: Optional[str] = None
    summary: Optional[str] = None
    skills: List[str] = Field(default_factory=list)

class EducationInfo(BaseModel):
    degree: Optional[str] = None
    fieldOfStudy: Optional[str] = None
    university: Optional[str] = None
    graduationYear: Optional[str] = None
    gpa: Optional[str] = None

class Experience(BaseModel):
    title: Optional[str] = None
    company: Optional[str] = None
    startDate: Optional[str] = None
    endDate: Optional[str] = None
    current: bool = False
    description: Optional[str] = None

class Reference(BaseModel):
    name: Optional[str] = None
    title: Optional[str] = None
    company: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None

class Documents(BaseModel):
    resumeUrl: Optional[str] = None
    resumeFileName: Optional[str] = None
    coverLetter: Optional[str] = None

class AdditionalInfo(BaseModel):
    availability: Optional[str] = None
    salaryExpectation: Optional[str] = None
    workAuthorization: Optional[str] = None
    languages: List[str] = Field(default_factory=list)

class ProfileData(BaseModel):
    personal: PersonalInfo
    professional: ProfessionalInfo
    education: EducationInfo
    experience: List[Experience] = Field(default_factory=list)
    references: List[Reference] = Field(default_factory=list)
    documents: Documents
    additional: AdditionalInfo
    lastUpdated: Optional[str] = None


def parse_iso_datetime(value: Optional[str]) -> Optional[datetime]:
    if not value:
        return None
    try:
        if value.endswith("Z"):
            value = value.replace("Z", "+00:00")
        return datetime.fromisoformat(value)
    except ValueError:
        return None


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


@app.get("/")
def read_root():
    return {"message": "Job Autofiller API is running!", "version": "1.0.0"}

@app.post("/api/save-profile")
async def save_profile(profile: ProfileData, db: Session = Depends(get_db)):
    """Persist the submitted profile in PostgreSQL."""
    try:
        profile_dict = profile.model_dump()

        print("\n" + "=" * 80)
        print("PROFILE DATA RECEIVED")
        print("=" * 80)
        print(json.dumps(profile_dict, indent=2, ensure_ascii=False))
        print("=" * 80 + "\n")

        profile_record = ProfileModel(
            first_name=profile.personal.firstName,
            last_name=profile.personal.lastName,
            email=profile.personal.email,
            phone=profile.personal.phone,
            address=profile.personal.address,
            city=profile.personal.city,
            state=profile.personal.state,
            zip_code=profile.personal.zipCode,
            country=profile.personal.country,
            linkedin=profile.personal.linkedin,
            portfolio=profile.personal.portfolio,
            current_title=profile.professional.currentTitle,
            current_company=profile.professional.currentCompany,
            summary=profile.professional.summary,
            skills=profile.professional.skills or [],
            degree=profile.education.degree,
            field_of_study=profile.education.fieldOfStudy,
            university=profile.education.university,
            graduation_year=profile.education.graduationYear,
            gpa=profile.education.gpa,
            resume_url=profile.documents.resumeUrl,
            resume_file_name=profile.documents.resumeFileName,
            cover_letter=profile.documents.coverLetter,
            availability=profile.additional.availability,
            salary_expectation=profile.additional.salaryExpectation,
            work_authorization=profile.additional.workAuthorization,
            languages=profile.additional.languages or [],
            last_updated=parse_iso_datetime(profile.lastUpdated),
        )

        for exp in profile.experience:
            profile_record.experiences.append(
                ExperienceModel(
                    title=exp.title,
                    company=exp.company,
                    start_date=exp.startDate,
                    end_date=exp.endDate,
                    current=exp.current,
                    description=exp.description,
                )
            )

        for ref in profile.references:
            profile_record.references.append(
                ReferenceModel(
                    name=ref.name,
                    title=ref.title,
                    company=ref.company,
                    email=ref.email,
                    phone=ref.phone,
                )
            )

        db.add(profile_record)
        db.commit()
        db.refresh(profile_record)

        return {
            "success": True,
            "message": "Profile saved successfully",
            "timestamp": datetime.now().isoformat(),
            "profile_id": profile_record.id,
            "data_received": {
                "personal_info": bool(profile.personal.email),
                "professional_info": bool(profile.professional.currentTitle),
                "education_info": bool(profile.education.degree),
                "experience_count": len(profile.experience),
                "references_count": len(profile.references),
                "has_resume": bool(profile.documents.resumeUrl),
                "resume_url": profile.documents.resumeUrl,
                "has_cover_letter": bool(profile.documents.coverLetter),
            },
        }
    except Exception as e:
        db.rollback()
        print(f"Error processing profile: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error saving profile: {str(e)}")

@app.get("/api/health")
def health_check():
    """Health check endpoint"""
    return {"status": "healthy", "service": "Job Autofiller API"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)

