from sqlalchemy import Column, Integer, String, Float, DateTime, Text, JSON, ForeignKey, Boolean
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from core.database import Base

class AnalysisProject(Base):
    __tablename__ = "analysis_projects"
    
    id = Column(String, primary_key=True)  # UUID
    user_id = Column(Integer, ForeignKey("users.id"))
    company_name = Column(String, nullable=False)
    sector = Column(String)
    stage = Column(String)
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())
    status = Column(String, default="pending")  # pending, processing, completed, failed
    
    # Relationships
    user = relationship("UserDB", back_populates="projects")
    analyses = relationship("Analysis", back_populates="project")
    files = relationship("UploadedFile", back_populates="project")

class Analysis(Base):
    __tablename__ = "analyses"
    
    id = Column(String, primary_key=True)  # UUID
    project_id = Column(String, ForeignKey("analysis_projects.id"))
    overall_score = Column(Float)
    
    # Category scores
    founder_score = Column(Float)
    market_score = Column(Float)
    product_score = Column(Float)
    traction_score = Column(Float)
    finance_score = Column(Float)
    risk_score = Column(Float)
    competition_score = Column(Float)
    
    # Confidence metrics
    confidence_score = Column(Float)
    confidence_level = Column(String)  # high, medium, low
    model_agreement = Column(Integer)
    
    # Analysis results
    scores = Column(JSON)  # Detailed scores breakdown
    evidence = Column(JSON)  # Evidence and sources
    raw_llm_output = Column(Text)
    
    # Predictive analytics
    success_probability = Column(Float)
    investment_recommendation = Column(String)
    key_strengths = Column(JSON)
    key_risks = Column(JSON)
    
    # Metadata
    created_at = Column(DateTime, server_default=func.now())
    analysis_duration = Column(Float)  # seconds
    
    # Relationships
    project = relationship("AnalysisProject", back_populates="analyses")
    agent_results = relationship("AgentResult", back_populates="analysis")

class AgentResult(Base):
    __tablename__ = "agent_results"
    
    id = Column(String, primary_key=True)  # UUID
    analysis_id = Column(String, ForeignKey("analyses.id"))
    agent_type = Column(String)  # founder, market, product, traction, finance, risk, competition
    
    # Results
    score = Column(Float)
    summary = Column(Text)
    detailed_analysis = Column(Text)
    evidence = Column(JSON)
    confidence = Column(Float)
    
    # Calculations
    raw_metrics = Column(JSON)
    normalized_metrics = Column(JSON)
    calculation_details = Column(JSON)
    
    # Metadata
    processing_time = Column(Float)
    model_used = Column(String)
    created_at = Column(DateTime, server_default=func.now())
    
    # Relationships
    analysis = relationship("Analysis", back_populates="agent_results")

class UploadedFile(Base):
    __tablename__ = "uploaded_files"
    
    id = Column(String, primary_key=True)  # UUID
    project_id = Column(String, ForeignKey("analysis_projects.id"))
    filename = Column(String, nullable=False)
    file_path = Column(String, nullable=False)
    file_type = Column(String)
    file_size = Column(Integer)
    
    # Processing status
    status = Column(String, default="uploaded")  # uploaded, processing, processed, failed
    extracted_text = Column(Text)
    file_metadata = Column(JSON)
    
    # Timestamps
    uploaded_at = Column(DateTime, server_default=func.now())
    processed_at = Column(DateTime)
    
    # Relationships
    project = relationship("AnalysisProject", back_populates="files")

class CohortStats(Base):
    __tablename__ = "cohort_stats"
    
    id = Column(Integer, primary_key=True)
    vertical = Column(String, nullable=False)  # saas, fintech, ecommerce, etc.
    stage = Column(String, nullable=False)  # seed, series_a, series_b, etc.
    
    # Statistical metrics
    metric_name = Column(String, nullable=False)  # arr, burn_rate, cac, ltv, etc.
    mean_value = Column(Float)
    median_value = Column(Float)
    std_dev = Column(Float)
    percentile_25 = Column(Float)
    percentile_75 = Column(Float)
    percentile_90 = Column(Float)
    
    # Sample size
    sample_count = Column(Integer)
    last_updated = Column(DateTime, server_default=func.now())

class MarketIntelligence(Base):
    __tablename__ = "market_intelligence"
    
    id = Column(String, primary_key=True)  # UUID
    company_name = Column(String, nullable=False)
    
    # External data
    crunchbase_data = Column(JSON)
    linkedin_data = Column(JSON)
    news_mentions = Column(JSON)
    competitor_data = Column(JSON)
    
    # Market metrics
    tam_estimate = Column(Float)
    sam_estimate = Column(Float)
    som_estimate = Column(Float)
    market_growth_rate = Column(Float)
    
    # Validation flags
    data_freshness = Column(DateTime)
    validation_status = Column(String)  # validated, pending, failed
    
    created_at = Column(DateTime, server_default=func.now())

class InvestorPreferences(Base):
    __tablename__ = "investor_preferences"
    
    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    
    # Category weights (should sum to 100)
    founder_weight = Column(Float, default=25.0)
    market_weight = Column(Float, default=25.0)
    product_weight = Column(Float, default=20.0)
    traction_weight = Column(Float, default=15.0)
    finance_weight = Column(Float, default=10.0)
    risk_weight = Column(Float, default=5.0)
    
    # Sector preferences
    preferred_sectors = Column(JSON)
    avoided_sectors = Column(JSON)
    
    # Stage preferences
    preferred_stages = Column(JSON)
    
    # Risk tolerance
    risk_tolerance = Column(String, default="medium")  # low, medium, high
    
    # Investment criteria
    min_team_score = Column(Float, default=60.0)
    min_market_score = Column(Float, default=60.0)
    min_overall_score = Column(Float, default=70.0)
    
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())

class FeedbackLog(Base):
    __tablename__ = "feedback_logs"
    
    id = Column(String, primary_key=True)  # UUID
    analysis_id = Column(String, ForeignKey("analyses.id"))
    user_id = Column(Integer, ForeignKey("users.id"))
    
    # Feedback details
    category = Column(String)  # score_adjustment, evidence_correction, etc.
    original_score = Column(Float)
    adjusted_score = Column(Float)
    feedback_text = Column(Text)
    
    # Improvement tracking
    accepted = Column(Boolean, default=False)
    improvement_impact = Column(Float)
    
    created_at = Column(DateTime, server_default=func.now())

# Update UserDB to include relationships
from models.user import UserDB
UserDB.projects = relationship("AnalysisProject", back_populates="user")