import json
import requests
import os
from django.conf import settings

# Claude API settings
CLAUDE_API_KEY = os.environ.get('CLAUDE_API_KEY')
CLAUDE_API_URL = "https://api.anthropic.com/v1/messages"

def get_produce_expiry_info_from_claude(produce_name):
    """
    Get storage information for a produce item from Claude API.
    Used as a fallback when database doesn't have information.
    
    Args:
        produce_name (str): Name of the produce to look up
        
    Returns:
        dict: Dictionary with storage recommendations in the same format
        as returned by get_storage_recommendations function
    """
    # Prepare Claude API request
    headers = {
        "x-api-key": CLAUDE_API_KEY,
        "anthropic-version": "2023-06-01",
        "content-type": "application/json"
    }
    
    # Create Claude API request body
    claude_request = {
        "model": "claude-3-haiku-20240307",
        "max_tokens": 150,
        "messages": [
            {
                "role": "user",
                "content": [
                    {
                        "type": "text",
                        "text": f"For the food item '{produce_name}', tell me: 1) the exact number of days it will last (give a single number, not a range), and 2) where it should be stored (answer ONLY with either 'fridge' or 'pantry'). Format your response as a valid JSON object like this: {{\"days\": 14, \"method\": \"fridge\"}}. Only respond with the JSON object, no explanations or other text."
                    }
                ]
            }
        ]
    }
    
    try:
        # Make request to Claude API
        response = requests.post(CLAUDE_API_URL, headers=headers, json=claude_request)
        
        if response.status_code != 200:
            return None
            
        # Parse response
        claude_response = response.json()
        
        # Extract text from Claude's response
        content = claude_response.get('content', [])
        text_response = next((item['text'] for item in content if item['type'] == 'text'), '')
        
        # Try to extract JSON from Claude's response
        import re
        json_match = re.search(r'\{.*\}', text_response, re.DOTALL)
        if json_match:
            expiry_data = json.loads(json_match.group(0))
            days = expiry_data.get('days')
            method = expiry_data.get('method')
            
            # Validate the response
            if days is not None and method in ['fridge', 'pantry']:
                # Convert to the same format as get_storage_recommendations
                method_num = 1 if method == 'fridge' else 0
                fridge_days = days if method == 'fridge' else 0
                pantry_days = days if method == 'pantry' else 0
                
                # Return in the same format as the database service
                return {
                    'Type': produce_name.capitalize(),
                    'method': method_num,
                    'fridge': fridge_days,
                    'pantry': pantry_days,
                    'source': 'claude'
                }
        
        return None
    except Exception:
        return None
