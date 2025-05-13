import json
import requests
import os
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.conf import settings
from django.db import connection

# Claude API settings
CLAUDE_API_KEY = os.environ.get('CLAUDE_API_KEY')
CLAUDE_API_URL = "https://api.anthropic.com/v1/messages"

@csrf_exempt
def storage_assistant(request):
    """
    API endpoint that provides storage information for produce items.
    First checks database for known expiry data, then falls back to Claude API if not found.
    
    This endpoint accepts POST requests with produce item names and returns
    a JSON response containing the expiry date in days and recommended storage method.
    
    Args:
        request (HttpRequest): Django HTTP request object containing:
            - body: JSON containing 'produce_name' field with the name of the produce
    
    Returns:
        JsonResponse: JSON response containing:
            - days: Number of days the produce will last (integer)
            - method: Recommended storage method (string, either 'fridge' or 'pantry')
            - source: Where the data came from ('database' or 'claude')
            - error (str, optional): Error message if something went wrong
    """
    if request.method != 'POST':
        return JsonResponse({'error': 'Only POST requests are allowed'}, status=405)
    
    try:
        # Get produce name from request
        data = json.loads(request.body)
        produce_name = data.get('produce_name', '')
        
        if not produce_name:
            return JsonResponse({'error': 'No produce name provided'}, status=400)
        
        # First check database
        storage_info = check_database_for_storage_info(produce_name)
        
        # If found in database, return it
        if storage_info:
            return JsonResponse({
                'days': storage_info['days'],
                'method': storage_info['method'],
                'source': 'database'
            })
        
        # If not found in database, consult Claude API
        return get_produce_expiry_info_from_claude(produce_name)
        
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)

def check_database_for_storage_info(produce_name):
    """
    Check the database for storage information about a produce item.
    
    Args:
        produce_name (str): Name of the produce to look up
        
    Returns:
        dict or None: Dictionary with 'days' and 'method' if found, None otherwise
    """
    try:
        with connection.cursor() as cursor:
            # Assuming a table named 'produce_storage_info' with columns: 
            # produce_name, storage_days, storage_method
            cursor.execute(
                "SELECT storage_days, storage_method FROM produce_storage_info WHERE LOWER(produce_name) = LOWER(%s)",
                [produce_name]
            )
            result = cursor.fetchone()
            
            if result:
                return {
                    'days': result[0],
                    'method': result[1]
                }
            return None
    except Exception:
        # If there's a database error, return None to fall back to Claude API
        return None

def get_produce_expiry_info_from_claude(produce_name):
    """
    Get storage information for a produce item from Claude API.
    
    Args:
        produce_name (str): Name of the produce to look up
        
    Returns:
        JsonResponse: JSON response with days and method
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
    
    # Make request to Claude API
    response = requests.post(CLAUDE_API_URL, headers=headers, json=claude_request)
    
    if response.status_code != 200:
        return JsonResponse({'error': f'Claude API error: {response.status_code}'}, status=500)
        
    # Parse response
    claude_response = response.json()
    
    # Extract text from Claude's response
    content = claude_response.get('content', [])
    text_response = next((item['text'] for item in content if item['type'] == 'text'), '')
    
    # Try to extract JSON from Claude's response
    try:
        # Find JSON object in the response
        import re
        json_match = re.search(r'\{.*\}', text_response, re.DOTALL)
        if json_match:
            expiry_data = json.loads(json_match.group(0))
            days = expiry_data.get('days')
            method = expiry_data.get('method')
            
            # Validate the response
            if days is not None and method in ['fridge', 'pantry']:
                return JsonResponse({
                    'days': days,
                    'method': method,
                    'source': 'claude'
                })
            else:
                return JsonResponse({'error': 'Invalid response format from Claude API'}, status=500)
        else:
            return JsonResponse({'error': 'Could not extract JSON from Claude response'}, status=500)
    except json.JSONDecodeError:
        return JsonResponse({'error': 'Invalid JSON in Claude response'}, status=500)
