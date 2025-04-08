import base64
import json
import requests
import re
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.conf import settings
import os

# Claude API settings
CLAUDE_API_KEY = os.environ.get('CLAUDE_API_KEY')
CLAUDE_API_URL = "https://api.anthropic.com/v1/messages"

# Import the ProduceClassifier
from api.produce_classfier import ProduceClassifier


@csrf_exempt
def detect_produce(request):
    """
    API endpoint to detect produce from uploaded webcam images using Claude API
    and provides storage recommendations
    """
    if request.method != 'POST':
        return JsonResponse({'error': 'Only POST requests are allowed'}, status=405)
    
    # First check: API key configuration
    if not CLAUDE_API_KEY:
        return JsonResponse({
            'success': False,
            'error': 'API key not configured',
            'message': 'Claude API key is missing or invalid. Please configure a valid API key.'
        }, status=401)

    try:
        # Get the base64 images from request
        data = json.loads(request.body)
        
        # Second check: Image data validation
        if not ('image' in data or 'images' in data):
            return JsonResponse({
                'success': False,
                'error': 'No images provided',
                'message': 'Please provide at least one image for analysis.'
            }, status=400)
        
        # Process images array
        images = [data.get('image', '')] if 'image' in data else data.get('images', [])
        if not images:
            return JsonResponse({
                'success': False,
                'error': 'Empty images',
                'message': 'The provided image data is empty.'
            }, status=400)

        print(f"Received {len(images)} images for analysis")
        
        # Initialize combined results
        combined_produce_counts = {}
        total_items = 0
        
        # Process each image
        for i, base64_image in enumerate(images):
            print(f"Processing image {i+1}/{len(images)}")
            
            # Remove data URL prefix if present
            if ',' in base64_image:
                base64_image = base64_image.split(',')[1]
            
            # Prepare Claude API request
            headers = {
                "x-api-key": CLAUDE_API_KEY,
                "anthropic-version": "2023-06-01",
                "content-type": "application/json"
            }
            
            # Create Claude API request body
            claude_request = {
                "model": "claude-3-haiku-20240307",
                "max_tokens": 1024,
                "messages": [
                    {
                        "role": "user",
                        "content": [
                            {
                                "type": "text",
                                "text": "Identify all food items in this image. For each item, tell me what it is. Format your response as a valid JSON object like this: {\"produce_counts\": {\"apple\": 1, \"banana\": 2}, \"total_items\": 3}. Only respond with the JSON object, no explanations."
                            },
                            {
                                "type": "image",
                                "source": {
                                    "type": "base64",
                                    "media_type": "image/jpeg",
                                    "data": base64_image
                                }
                            }
                        ]
                    }
                ]
            }
            
            # Third check: Claude API connectivity
            try:
                print("Sending request to Claude API...")
                response = requests.post(CLAUDE_API_URL, headers=headers, json=claude_request)
                print(f"Claude API Response status: {response.status_code}")
                
                if response.status_code != 200:
                    return JsonResponse({
                        'success': False,
                        'error': 'api_connection_failed',
                        'message': f'Failed to connect to Claude API: {response.text}'
                    }, status=503)
                    
                # Parse response
                claude_response = response.json()
                
                # Extract JSON from Claude's response
                content = claude_response.get('content', [])
                text_response = next((item['text'] for item in content if item['type'] == 'text'), '')
                print(f"Claude text response preview: {text_response[:200]}...")
                
                # Use regex to find JSON in Claude's response
                json_match = re.search(r'\{.*\}', text_response, re.DOTALL)
                if json_match:
                    try:
                        produce_data = json.loads(json_match.group(0))
                        print(f"Successfully extracted JSON data from Claude response")
                        
                        # Combine the results
                        image_produce_counts = produce_data.get('produce_counts', {})
                        for item, count in image_produce_counts.items():
                            if item in combined_produce_counts:
                                combined_produce_counts[item] += count
                            else:
                                combined_produce_counts[item] = count
                        
                        total_items += produce_data.get('total_items', 0)
                    except json.JSONDecodeError as e:
                        print(f"JSON parsing error: {e}")
                        print(f"Problematic JSON: {json_match.group(0)}")
                else:
                    print("No JSON object found in Claude's response, trying fallback parsing")
                    # Fallback - do basic parsing if Claude doesn't return proper JSON
                    items = re.findall(r'([a-zA-Z]+)\s*:\s*(\d+)', text_response)
                    for item, count in items:
                        item_lower = item.lower()
                        count_int = int(count)
                        if item_lower in combined_produce_counts:
                            combined_produce_counts[item_lower] += count_int
                        else:
                            combined_produce_counts[item_lower] = count_int
                        total_items += count_int
            except Exception as e:
                print(f"Error in Claude API connection: {e}")
                return JsonResponse({
                    'success': False,
                    'error': 'api_connection_failed',
                    'message': f'Failed to connect to Claude API: {e}'
                }, status=503)
        
        # Enrich the results with storage recommendations
        enriched_produce_data = ProduceClassifier.enrich_detection_results(combined_produce_counts)
        
        print(f"Final combined results with storage: {enriched_produce_data}")
        
        # Add a message if no items were detected
        message = ""
        if total_items == 0:
            message = "No food items detected. Try taking clearer photos with better lighting or positioning your food items more prominently in the frame."
        
        # Organize items by storage location
        pantry_items = {}
        refrigerator_items = {}
        
        for item, details in enriched_produce_data.items():
            if details["storage"] == "pantry":
                pantry_items[item] = details["count"]
            else:
                refrigerator_items[item] = details["count"]
        
        return JsonResponse({
            'success': True,
            'detections': [],  # No bounding boxes with Claude
            'produce_data': enriched_produce_data,
            'storage_summary': {
                'pantry': pantry_items,
                'refrigerator': refrigerator_items
            },
            'total_items': total_items,
            'message': message  # Add the message field
        })
        
    except Exception as e:
        import traceback
        print(f"Error in detect_produce: {str(e)}")
        print(traceback.format_exc())
        return JsonResponse({
            'error': str(e), 
            'message': "There was an issue analyzing your images. Please try again."
        }, status=500)