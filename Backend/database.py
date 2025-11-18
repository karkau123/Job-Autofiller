import os
from datetime import datetime
from typing import List

from dotenv import load_dotenv
from sqlalchemy import (
    ARRAY,
    Boolean,
    Column,
    DateTime,
    ForeignKey,
    Integer,
    String,
    Text,
    UniqueConstraint,
    create_engine,
)
from sqlalchemy.orm import declarative_base, relationship, sessionmaker

# Load environment variables from .env file
load_dotenv()

# Get database configuration from environment variables
DB_USER = os.getenv("DB_USER", "postgres")
DB_PASSWORD = os.getenv("DB_PASSWORD", "postgres")
DB_HOST = os.getenv("DB_HOST", "localhost")
DB_PORT = os.getenv("DB_PORT", "5432")
DB_NAME = os.getenv("DB_NAME", "postgres")

# Construct DATABASE_URL from components
DATABASE_URL = os.getenv(
    "DATABASE_URL",
    f"postgresql+psycopg2://{DB_USER}:{DB_PASSWORD}@{DB_HOST}:{DB_PORT}/{DB_NAME}",
)

engine = create_engine(
    DATABASE_URL,
    pool_pre_ping=True,
)
SessionLocal = sessionmaker(bind=engine, autoflush=False, autocommit=False)

Base = declarative_base()


class Profile(Base):
    __tablename__ = "profiles"
    __allow_unmapped__ = True
    __table_args__ = (
        UniqueConstraint('email', name='uq_profile_email'),
    )

    id = Column(Integer, primary_key=True, index=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    last_updated = Column(DateTime, nullable=True)

    # Personal info
    first_name = Column(String(100))
    last_name = Column(String(100))
    email = Column(String(255), index=True, unique=True, nullable=True)
    phone = Column(String(50))
    address = Column(Text)
    city = Column(String(100))
    state = Column(String(100))
    zip_code = Column(String(20))
    country = Column(String(100))
    linkedin = Column(String(255))
    portfolio = Column(String(255))

    # Professional info
    current_title = Column(String(255))
    current_company = Column(String(255))
    summary = Column(Text)
    skills = Column(ARRAY(String))

    # Education
    degree = Column(String(255))
    field_of_study = Column(String(255))
    university = Column(String(255))
    graduation_year = Column(String(20))
    gpa = Column(String(20))

    # Documents
    resume_url = Column(Text)
    resume_file_name = Column(String(255))
    cover_letter = Column(Text)

    # Additional info
    availability = Column(String(100))
    salary_expectation = Column(String(100))
    work_authorization = Column(String(100))
    languages = Column(ARRAY(String))

    experiences: List["Experience"] = relationship(
        "Experience",
        back_populates="profile",
        cascade="all, delete-orphan",
        passive_deletes=True,
    )
    references: List["Reference"] = relationship(
        "Reference",
        back_populates="profile",
        cascade="all, delete-orphan",
        passive_deletes=True,
    )


class Experience(Base):
    __tablename__ = "experiences"
    __allow_unmapped__ = True

    id = Column(Integer, primary_key=True, index=True)
    profile_id = Column(
        Integer,
        ForeignKey("profiles.id", ondelete="CASCADE"),
        nullable=False,
    )
    title = Column(String(255))
    company = Column(String(255))
    start_date = Column(String(50))
    end_date = Column(String(50))
    current = Column(Boolean, default=False)
    description = Column(Text)

    profile = relationship("Profile", back_populates="experiences")


class Reference(Base):
    __tablename__ = "references"
    __allow_unmapped__ = True

    id = Column(Integer, primary_key=True, index=True)
    profile_id = Column(
        Integer,
        ForeignKey("profiles.id", ondelete="CASCADE"),
        nullable=False,
    )
    name = Column(String(255))
    title = Column(String(255))
    company = Column(String(255))
    email = Column(String(255))
    phone = Column(String(50))

    profile = relationship("Profile", back_populates="references")


def init_db() -> None:
    Base.metadata.create_all(bind=engine)

