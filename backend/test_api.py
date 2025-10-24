import asyncio
import os
from routers.input_routes import enhanced_analysis

async def test_api_analysis():
    """Test the API analysis function directly"""
    
    test_file = "assets/test/uber-pitch-deck.pdf"
    
    if not os.path.exists(test_file):
        print(f"Test file not found: {test_file}")
        return
    
    print("Testing API analysis functions...")
    
    # Test all analysis types
    queries = [
        "founders_profile",
        "market_problem", 
        "unique_differentiator",
        "business_metrics",
        "risk_factor",
        "recommended_next_steps"
    ]
    
    for query in queries:
        print(f"\n=== Testing {query} ===")
        try:
            result = await enhanced_analysis("test_user", test_file, query)
            
            print(f"Score: {result['score']}")
            print(f"Confidence: {result['confidence']}")
            print(f"Text length: {len(result['text'])}")
            print(f"Preview: {result['text'][:200]}...")
            
            if result.get('is_error'):
                print(f"ERROR: {result['text']}")
            else:
                print("Analysis completed successfully")
                
        except Exception as e:
            print(f"Test failed: {e}")
    
    print("\n=== API Test Complete ===")

if __name__ == "__main__":
    asyncio.run(test_api_analysis())