"""
Produce Detection Service

This service handles the detection and processing of produce-related data using computer vision
and AI models. It provides functionality to identify produce items from images and process
the results.

Key Features:
- Detect produce items from images using Claude API
- Process multiple images in a single request
- Combine results from multiple images
- Handle various image formats and encodings
- Provide structured output of detected items

Example Usage:
    >>> response = detect_produce(request)
    >>> # request should contain base64 encoded images
"""

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

@csrf_exempt
def detect_produce(request):
    """
    API endpoint to detect produce from uploaded webcam images using Claude API.
    
    This endpoint accepts POST requests with base64 encoded images and returns
    a JSON response containing detected produce items and their counts.
    
    Args:
        request (HttpRequest): Django HTTP request object containing:
            - body: JSON containing 'image' or 'images' field with base64 encoded images
    
    Returns:
        JsonResponse: JSON response containing:
            - success (bool): Whether the detection was successful
            - detections (list): List of detection results (currently empty as Claude doesn't provide bounding boxes)
            - produce_counts (dict): Dictionary of produce items and their counts
            - total_items (int): Total number of items detected
            - error (str, optional): Error message if something went wrong
    """
    if request.method != 'POST':
        return JsonResponse({'error': 'Only POST requests are allowed'}, status=405)
    
    try:
        # Get the base64 images from request
        data = json.loads(request.body)
        
        # Check if we're getting single image or multiple images
        if 'image' in data:
            images = [data.get('image', '')]
        elif 'images' in data:
            images = data.get('images', [])
        else:
            return JsonResponse({'error': 'No images provided'}, status=400)
        
        # Initialize combined results
        combined_produce_counts = {}
        total_items = 0
        
        # Process each image
        for base64_image in images:
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
            
            # Make request to Claude API
            response = requests.post(CLAUDE_API_URL, headers=headers, json=claude_request)
            
            if response.status_code != 200:
                continue
                
            # Parse response
            claude_response = response.json()
            
            # Extract JSON from Claude's response
            content = claude_response.get('content', [])
            text_response = next((item['text'] for item in content if item['type'] == 'text'), '')
            
            # Use regex to find JSON in Claude's response
            json_match = re.search(r'\{.*\}', text_response, re.DOTALL)
            if json_match:
                try:
                    produce_data = json.loads(json_match.group(0))
                    
                    # Combine the results
                    image_produce_counts = produce_data.get('produce_counts', {})
                    for item, count in image_produce_counts.items():
                        if item in combined_produce_counts:
                            combined_produce_counts[item] += count
                        else:
                            combined_produce_counts[item] = count
                    
                    total_items += produce_data.get('total_items', 0)
                except json.JSONDecodeError:
                    # Silent failure with JSON parsing
                    pass
            else:
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
        
        return JsonResponse({
            'success': True,
            'detections': [],  # No bounding boxes with Claude
            'produce_counts': combined_produce_counts,
            'total_items': total_items
        })
        
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)