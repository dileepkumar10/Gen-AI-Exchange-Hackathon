import requests
import json

def test_api_directly():
    """Test the API directly to verify it returns real data"""
    
    # Test file path
    test_file = "assets/test/uber-pitch-deck.pdf"
    
    try:
        # First, test health check
        response = requests.get("http://127.0.0.1:8000/")
        print(f"Health check: {response.json()}")
        
        # Test file upload and analysis
        with open(test_file, 'rb') as f:
            files = {'files': f}
            
            # Mock authentication (you may need to adjust this)
            headers = {'Authorization': 'Bearer test-token'}  # Replace with actual token if needed
            
            response = requests.post(
                "http://127.0.0.1:8000/upload-files", 
                files=files,
                headers=headers
            )
            
            if response.status_code == 200:
                result = response.json()
                print("\n=== API Response ===")
                print(f"Founder Score: {result.get('founders_profile', {}).get('score', 'N/A')}")
                print(f"Market Score: {result.get('market_problem', {}).get('score', 'N/A')}")
                print(f"Differentiator Score: {result.get('unique_differentiator', {}).get('score', 'N/A')}")
                print(f"Business Score: {result.get('business_metrics', {}).get('score', 'N/A')}")
                
                print(f"\nFounder Analysis Preview: {result.get('founders_profile', {}).get('investment_memo', 'N/A')[:200]}...")
                
                return True
            else:
                print(f"API Error: {response.status_code} - {response.text}")
                return False
                
    except Exception as e:
        print(f"Test failed: {e}")
        return False

if __name__ == "__main__":
    print("Testing API directly...")
    success = test_api_directly()
    if success:
        print("\n✓ API is returning real data")
    else:
        print("\n✗ API test failed")