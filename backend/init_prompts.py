import os
import psycopg2
from dotenv import load_dotenv

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")

def init_prompts():
    """Initialize database with analysis prompts"""
    
    prompts = {
        "founders_profile": """
Analyze the founder profile from the following startup pitch document:

{pitch}

Provide a comprehensive analysis covering:
1. Founder backgrounds and experience
2. Team composition and complementarity
3. Previous startup experience or relevant industry experience
4. Leadership capabilities and track record
5. Technical expertise alignment with the business

End your analysis with a numerical score from 0-100 based on:
- Relevant experience (30%)
- Team completeness (25%) 
- Previous success/track record (25%)
- Leadership potential (20%)

Score: [Your score 0-100]
""",
        
        "market_problem": """
Analyze the market opportunity and problem statement from the following startup pitch:

{pitch}

Provide analysis covering:
1. Problem definition and market pain points
2. Market size (TAM, SAM, SOM if available)
3. Market growth trends and dynamics
4. Target customer segments
5. Market timing and opportunity window

End your analysis with a numerical score from 0-100 based on:
- Problem significance (30%)
- Market size potential (30%)
- Market growth rate (20%)
- Market timing (20%)

Score: [Your score 0-100]
""",
        
        "unique_differentiator": """
Analyze the competitive advantage and differentiation from the following startup pitch:

{pitch}

Provide analysis covering:
1. Unique value proposition
2. Competitive landscape analysis
3. Barriers to entry and moats
4. Intellectual property and patents
5. Technology or business model innovation

End your analysis with a numerical score from 0-100 based on:
- Uniqueness of solution (35%)
- Competitive moats (30%)
- IP protection (20%)
- Innovation level (15%)

Score: [Your score 0-100]
""",
        
        "business_metrics": """
Analyze the business model and financial metrics from the following startup pitch:

{pitch}

Provide analysis covering:
1. Revenue model and monetization strategy
2. Key financial metrics (revenue, growth rate, margins)
3. Unit economics and scalability
4. Customer acquisition and retention
5. Path to profitability

End your analysis with a numerical score from 0-100 based on:
- Revenue model viability (25%)
- Financial performance (30%)
- Unit economics (25%)
- Scalability potential (20%)

Score: [Your score 0-100]
""",
        
        "risk_factor": """
Analyze the key risks and challenges from the following startup pitch:

{pitch}

Provide analysis covering:
1. Market risks and competitive threats
2. Technology and execution risks
3. Team and operational risks
4. Financial and funding risks
5. Regulatory and compliance risks

End your analysis with a numerical score from 0-100 (higher score = lower risk) based on:
- Market risk level (25%)
- Execution risk (30%)
- Financial risk (25%)
- Regulatory risk (20%)

Score: [Your score 0-100]
""",
        
        "recommended_next_steps": """
Based on the following startup pitch, provide investment recommendations and next steps:

{pitch}

Provide recommendations covering:
1. Investment recommendation (invest/pass/further due diligence)
2. Key areas for deeper investigation
3. Suggested investment terms or structure
4. Timeline for decision making
5. Specific action items for follow-up

End your analysis with a numerical score from 0-100 representing overall investment attractiveness:
- Overall investment potential (40%)
- Risk-adjusted returns (30%)
- Strategic fit (20%)
- Execution probability (10%)

Score: [Your score 0-100]
"""
    }
    
    try:
        conn = psycopg2.connect(DATABASE_URL)
        cursor = conn.cursor()
        
        # Check if prompts table exists and get its structure
        cursor.execute("""
            SELECT column_name FROM information_schema.columns 
            WHERE table_name = 'prompts'
        """)
        columns = [row[0] for row in cursor.fetchall()]
        
        if not columns:
            # Create prompts table
            cursor.execute("""
                CREATE TABLE prompts (
                    name VARCHAR(100) PRIMARY KEY,
                    prompt TEXT NOT NULL,
                    status VARCHAR(20) DEFAULT 'current'
                )
            """)
            print("Created prompts table")
        
        # Insert or update prompts
        for name, prompt in prompts.items():
            # Check if prompt exists
            cursor.execute("SELECT name FROM prompts WHERE name = %s", (name,))
            existing = cursor.fetchone()
            
            if existing:
                # Update existing prompt
                cursor.execute("""
                    UPDATE prompts SET prompt = %s, status = 'current' 
                    WHERE name = %s
                """, (prompt, name))
                print(f"Updated prompt: {name}")
            else:
                # Insert new prompt
                cursor.execute("""
                    INSERT INTO prompts (name, prompt, status) 
                    VALUES (%s, %s, 'current')
                """, (name, prompt))
                print(f"Inserted prompt: {name}")
        
        conn.commit()
        print(f"Successfully initialized {len(prompts)} prompts in database")
        
        # Verify prompts were inserted
        cursor.execute("SELECT name FROM prompts WHERE status = 'current'")
        results = cursor.fetchall()
        print(f"Verified prompts in database: {[r[0] for r in results]}")
        
        # Test one prompt retrieval
        cursor.execute("SELECT prompt FROM prompts WHERE name = 'founders_profile' LIMIT 1")
        test_prompt = cursor.fetchone()
        if test_prompt:
            print(f"Sample prompt length: {len(test_prompt[0])} characters")
        
        conn.close()
        return True
        
    except Exception as e:
        print(f"Database initialization error: {e}")
        return False

if __name__ == "__main__":
    success = init_prompts()
    if success:
        print("Database prompts initialized successfully!")
    else:
        print("Failed to initialize database prompts")