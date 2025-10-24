import os
from dotenv import load_dotenv
from ml_services.generate_reports import GenerateReports

load_dotenv()

def debug_llm_response():
    """Debug the LLM response to see the exact format"""
    
    test_file = "assets/test/uber-pitch-deck.pdf"
    
    try:
        analyzer = GenerateReports("test", test_file, "founders_profile")
        analyzer.get_vector_db()
        analyzer.get_context()
        analyzer.create_prompt_template()
        analyzer.generate_response()
        
        print("=== FULL LLM RESPONSE ===")
        print(analyzer.response)
        print("\n=== END RESPONSE ===")
        
        # Test score extraction
        analyzer.get_suggestion_and_score()
        print(f"\nExtracted Score: {analyzer.score}")
        print(f"Extracted Text Length: {len(analyzer.text)}")
        
    except Exception as e:
        print(f"Debug failed: {e}")

if __name__ == "__main__":
    debug_llm_response()