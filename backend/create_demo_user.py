import os
import psycopg2
from passlib.context import CryptContext
from dotenv import load_dotenv

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def create_demo_user():
    """Create a demo user for testing"""
    try:
        conn = psycopg2.connect(DATABASE_URL)
        cursor = conn.cursor()
        
        # Create users table if it doesn't exist
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS users (
                id SERIAL PRIMARY KEY,
                username VARCHAR(50) UNIQUE NOT NULL,
                email VARCHAR(100) UNIQUE NOT NULL,
                hashed_password VARCHAR(255) NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        """)
        
        # Hash the demo password
        hashed_password = pwd_context.hash("demo")
        
        # Insert demo user
        cursor.execute("""
            INSERT INTO users (username, email, hashed_password) 
            VALUES (%s, %s, %s)
            ON CONFLICT (username) DO UPDATE SET 
            hashed_password = EXCLUDED.hashed_password
        """, ("demo", "demo@example.com", hashed_password))
        
        conn.commit()
        conn.close()
        
        print("Demo user created successfully!")
        print("Username: demo")
        print("Password: demo")
        return True
        
    except Exception as e:
        print(f"Error creating demo user: {e}")
        return False

if __name__ == "__main__":
    create_demo_user()