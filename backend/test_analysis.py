import os
from dotenv import load_dotenv
from ml_services.generate_reports import GenerateReports

load_dotenv()

def test_document_analysis():
    """Test the document analysis with a real PDF file"""
    
    # Find a test PDF file
    test_files = [
        "assets/test/uber-pitch-deck.pdf",
        "assets/test/Pitch-Example-Air-BnB-PDF.pdf",
        "uploads/test/EcoTech_Startup_Pitch.pdf"
    ]
    
    test_file = None
    for file_path in test_files:
        if os.path.exists(file_path):
            test_file = file_path
            break
    
    if not test_file:
        print("No test PDF files found. Please upload a PDF file to test.")
        return False
    
    print(f"Testing with file: {test_file}")
    
    try:
        # Test founders profile analysis
        print("\n=== Testing Founders Profile Analysis ===")
        analyzer = GenerateReports("test", test_file, "founders_profile")
        
        # Step 1: Extract document content
        analyzer.get_vector_db()
        print(f"Document text extracted: {len(analyzer.document_text)} characters")
        
        # Step 2: Get context
        analyzer.get_context()
        print(f"Context prepared: {len(analyzer.context)} characters")
        
        # Step 3: Create prompt
        analyzer.create_prompt_template()
        print(f"Prompt created: {len(analyzer.prompt)} characters")
        
        # Step 4: Generate LLM response
        analyzer.generate_response()
        print(f"LLM response received: {len(analyzer.response)} characters")
        
        # Step 5: Extract score and text
        analyzer.get_suggestion_and_score()
        
        print(f"\n=== RESULTS ===")
        print(f"Score: {analyzer.score}")
        print(f"Analysis: {analyzer.text[:300]}...")
        
        return True
        
    except Exception as e:
        print(f"Test failed: {str(e)}")
        import traceback
        traceback.print_exc()
        return False

if __name__ == "__main__":
    print("Testing Document Analysis System...")
    success = test_document_analysis()
    if success:
        print("\nDocument analysis test completed successfully!")
    else:
        print("\nDocument analysis test failed!")