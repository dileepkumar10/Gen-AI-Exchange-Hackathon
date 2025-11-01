#!/usr/bin/env python3
"""
Test script for comprehensive analysis endpoint
"""
import requests
import json

# Test the comprehensive analysis endpoint
def test_comprehensive_analysis():
    url = "http://127.0.0.1:8000/api/v2/comprehensive-analysis"
    
    # Create a simple test file
    test_content = """
    Company: TestStartup Inc.
    
    We are a revolutionary AI-powered platform that transforms how businesses 
    analyze market data. Our team consists of experienced founders with 
    backgrounds in machine learning and business intelligence.
    
    Market Size: $50B TAM
    Revenue: $2M ARR
    Growth: 150% YoY
    Customers: 500+ enterprise clients
    
    Founded: 2022
    Location: San Francisco, CA
    Sector: AI/SaaS
    """
    
    # Prepare the request
    files = {
        'files': ('test_startup.txt', test_content, 'text/plain')
    }
    
    data = {
        'investor_preferences': json.dumps({
            'founder_weight': 25,
            'market_weight': 25,
            'product_weight': 20,
            'traction_weight': 15,
            'finance_weight': 10,
            'risk_weight': 5
        })
    }
    
    # Add authentication header (demo user)
    headers = {
        'Authorization': 'Bearer demo_token'  # This might need to be updated
    }
    
    try:
        print("Testing comprehensive analysis endpoint...")
        print(f"URL: {url}")
        
        # Make the request
        response = requests.post(url, files=files, data=data, headers=headers, timeout=30)
        
        print(f"Status Code: {response.status_code}")
        print(f"Response Headers: {dict(response.headers)}")
        
        if response.status_code == 200:
            result = response.json()
            print("✅ SUCCESS!")
            print(f"Analysis ID: {result.get('analysis_id', 'N/A')}")
            print(f"Company Name: {result.get('company_name', 'N/A')}")
            print(f"Overall Score: {result.get('overall_score', 'N/A')}")
            print(f"Agent Results: {list(result.get('agent_results', {}).keys())}")
            return True
        else:
            print("❌ FAILED!")
            print(f"Error: {response.text}")
            return False
            
    except Exception as e:
        print(f"❌ ERROR: {e}")
        return False

if __name__ == "__main__":
    test_comprehensive_analysis()