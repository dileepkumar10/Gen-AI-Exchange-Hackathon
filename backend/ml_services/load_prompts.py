import os
import psycopg2

from dotenv import load_dotenv

load_dotenv()



class LoadPrompts:

    def __init__(self, DATABASE_URL):
        conn = psycopg2.connect(DATABASE_URL)
        cursor = conn.cursor()
        sql_query = """SELECT prompt FROM prompts WHERE name in {name} and status = 'current'"""
        names = (
            "founders_profile",
            "market_problem",
            "unique_differentiator",
            "business_metrics",
            "risk_factor",
            "recommended_next_steps"
        )
        query = sql_query.format(name=names)
        cursor.execute(query)
        prompts = cursor.fetchall()

        self.founders_profile = prompts[0][0]
        self.market_problem = prompts[1][0]
        self.unique_differentiator = prompts[2][0]
        self.business_metrics = prompts[3][0]
        self.risk_factor = prompts[4][0]
        self.recommended_next_steps = prompts[5][0]
        
    