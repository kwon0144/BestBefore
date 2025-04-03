# api/produce_detection.py

import base64
import io
import json
from PIL import Image
import numpy as np
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.conf import settings
import os
import torch

# Add ultralytics import
from ultralytics import YOLO

# Initialize the YOLOv8 model
MODEL_PATH = os.path.join(settings.BASE_DIR, 'models', 'yolov8m.pt')

# Define an expanded list of produce classes your model can detect
PRODUCE_CLASSES = [
    # Fruits
    'apple', 'banana', 'orange', 'tomato', 'avocado', 'lemon', 'lime',
    'strawberry', 'blueberry', 'raspberry', 'grape', 'pear', 'peach',
    'watermelon', 'kiwi', 'mango', 'pineapple',
    
    # Vegetables
    'potato', 'carrot', 'broccoli', 'cucumber', 'lettuce', 'pepper',
    'onion', 'garlic', 'zucchini', 'eggplant', 'cabbage', 'cauliflower',
    'spinach', 'kale', 'celery', 'asparagus', 'corn', 'mushroom',
    'green beans', 'peas', 'sweet potato', 'pumpkin', 'squash',
    
    # Herbs
    'basil', 'parsley', 'cilantro', 'mint', 'rosemary', 'thyme',
    
    # Other
    'bread', 'cheese', 'egg', 'tofu', 'rice', 'pasta'
]

# Create a lazy-loading model to avoid loading it on server startup
_model = None

def get_model():
    """Lazy-load the model to improve startup performance"""
    global _model
    if _model is None:
        try:
            _model = YOLO(MODEL_PATH)
            print(f"YOLOv8 model loaded from {MODEL_PATH}")
        except Exception as e:
            print(f"Error loading model: {str(e)}")
            _model = None
    return _model

@csrf_exempt
def detect_produce(request):
    """
    API endpoint to detect produce from uploaded webcam images
    """
    if request.method != 'POST':
        return JsonResponse({'error': 'Only POST requests are allowed'}, status=405)
    
    try:
        # Get the base64 image from request
        data = json.loads(request.body)
        base64_image = data.get('image', '')
        
        # Remove data URL prefix if present (e.g., "data:image/jpeg;base64,")
        if ',' in base64_image:
            base64_image = base64_image.split(',')[1]
        
        # Decode base64 to image
        image_data = base64.b64decode(base64_image)
        image = Image.open(io.BytesIO(image_data))
        
        # Convert to numpy array for YOLOv8
        img_array = np.array(image)
        
        # Get model
        model = get_model()
        if model is None:
            return JsonResponse({'error': 'Model not available'}, status=500)
        
        # Run inference
        results = model(img_array)
        
        # Process results
        detections = []
        for result in results:
            boxes = result.boxes
            for box in boxes:
                x1, y1, x2, y2 = box.xyxy[0].tolist()
                conf = float(box.conf[0])
                cls = int(box.cls[0])
                
                # Map COCO classes to produce classes based on closest match
                # Standard YOLOv8 uses COCO dataset with 80 classes
                # We're mapping the relevant ones to our produce categories
                coco_class_name = result.names[cls].lower()
                
                # Try to map COCO class to our produce class
                matched_class = None
                
                # Direct mapping for exact matches
                if coco_class_name in PRODUCE_CLASSES:
                    matched_class = coco_class_name
                # Mapping for close matches (e.g. "apple" might be detected as "orange")
                else:
                    if cls == 46:
                        matched_class = "banana"                  
                    elif cls == 48:
                        matched_class = "apple"                   
                    elif cls == 49:
                        matched_class = "orange"                   
                    elif cls == 56:
                        matched_class = "broccoli"                   
                    elif cls == 51:
                        matched_class = "carrot"

                    # For any other classes that could be produce, use a fallback
                    elif "food" in coco_class_name or "fruit" in coco_class_name or "vegetable" in coco_class_name:
                        matched_class = "unknown-produce"
                
                # Only include if confidence is high enough and we have a match
                if conf > 0.5 and matched_class:
                    detections.append({
                        'class': matched_class,
                        'confidence': conf,
                        'bbox': [x1, y1, x2, y2]
                    })
        
        # Count occurrences of each produce type
        produce_counts = {}
        for detection in detections:
            produce_type = detection['class']
            if produce_type in produce_counts:
                produce_counts[produce_type] += 1
            else:
                produce_counts[produce_type] = 1
        
        return JsonResponse({
            'success': True,
            'detections': detections,
            'produce_counts': produce_counts,
            'total_items': len(detections)
        })
        
    except Exception as e:
        import traceback
        print(f"Error in detect_produce: {str(e)}")
        print(traceback.format_exc())
        return JsonResponse({'error': str(e)}, status=500)