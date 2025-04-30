"""
Output Calendar Service

This service handles the generation and management of calendar events for food expiry reminders.
It provides functionality to create calendar events with reminders and export them in iCal format.

Key Features:
- Generate calendar events for food expiry reminders
- Support multiple items with different expiry dates
- Customize reminder days and times
- Export to iCal (.ics) format
- Handle timezone conversions
- Cache calendar data for retrieval

Example Usage:
    >>> request_data = {
    ...     "items": [
    ...         {"name": "Milk", "expiry_date": "7", "reminder_days": 2},
    ...         {"name": "Bread", "expiry_date": "5", "reminder_time": "18:00"}
    ...     ]
    ... }
    >>> response = generate_calendar(request)
"""

from datetime import datetime, timedelta
import uuid
import json
from typing import List, Dict
from django.http import JsonResponse, HttpResponse
from django.views.decorators.csrf import csrf_exempt
import pytz
import os

# In-memory cache for calendar data
calendar_cache = {}

@csrf_exempt
def generate_calendar(request):
    """
    Generate a calendar with expiry reminders for food items.
    
    This endpoint accepts POST requests with a list of food items and their expiry dates.
    It creates calendar events with reminders and returns a URL to download the calendar.
    
    Args:
        request (HttpRequest): Django HTTP request object containing:
            - items (List[Dict]): List of food items with expiry dates
            - reminder_days (int, optional): Default days before expiry for reminder
            - reminder_time (str, optional): Default time for reminders (HH:MM format)
    
    Returns:
        JsonResponse: JSON response containing:
            - status (str): Success status
            - calendar_id (str): Unique identifier for the calendar
            - calendar_url (str): URL to download the calendar file
            - items (List[Dict]): Processed food items with reminder settings
            - error (str, optional): Error message if something went wrong
    """
    if request.method != 'POST':
        return JsonResponse({"error": "Only POST requests are allowed"}, status=405)
    
    try:
        data = json.loads(request.body)
    except json.JSONDecodeError:
        return JsonResponse({"error": "Invalid JSON"}, status=400)
    
    if not data or "items" not in data:
        return JsonResponse({"error": "Missing items"}, status=400)
    
    items: List[Dict] = data["items"]
    default_reminder_days = data.get("reminder_days", 2)
    default_reminder_time = data.get("reminder_time", "20:00")
    calendar_id = uuid.uuid4()
    
    saved_items = []
    for item in items:
        if not item.get("name") or not item.get("expiry_date"):
            continue
            
        try:
            # Calculate expiry date from current date
            current_date = datetime.now().date()
            days_to_add = int(item["expiry_date"])
            expiry_date = current_date + timedelta(days=days_to_add)
            
            # Get reminder settings
            hour, minute = map(int, (item.get("reminder_time") or default_reminder_time).split(":"))
            reminder_days = item.get("reminder_days", default_reminder_days)
            
            saved_items.append({
                "name": item["name"],
                "quantity": item.get("quantity", 1),
                "expiry_date": expiry_date.isoformat(),
                "reminder_days": reminder_days,
                "reminder_time": f"{hour:02d}:{minute:02d}"
            })
            
        except (ValueError, KeyError) as e:
            print(f"Error processing item: {str(e)}")
            continue
    
    # Store calendar data in cache
    calendar_cache[str(calendar_id)] = saved_items
    
    # Generate the calendar URL
    calendar_url = f"/api/calendar/{calendar_id}.ics"
    
    return JsonResponse({
        "status": "success",
        "calendar_id": str(calendar_id),
        "calendar_url": calendar_url,
        "items": saved_items
    })

def generate_ical(request, calendar_id):
    """
    Generate an iCal (.ics) file for food expiry reminders.
    
    This function takes a calendar ID and generates an iCal file containing
    reminder events for each food item. The events include the item name,
    quantity, and expiry date.
    
    Args:
        request (HttpRequest): Django HTTP request object
        calendar_id (str): Unique identifier for the calendar
    
    Returns:
        HttpResponse: iCal file as response with appropriate headers for download
        JsonResponse: Error response if calendar not found or ID invalid
    """
    try:
        # Validate calendar_id is a valid UUID
        calendar_uuid = uuid.UUID(str(calendar_id))
        
        # Get calendar data from cache
        items = calendar_cache.get(str(calendar_id), [])
        
        if not items:
            return JsonResponse({"error": "Calendar not found"}, status=404)
        
        # Create ICS file content
        ical_content = """BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//BestBefore//Calendar//EN
CALSCALE:GREGORIAN"""
        
        # Create an event for each item
        for item in items:
            # Parse dates and times
            expiry_date = datetime.fromisoformat(item["expiry_date"])
            reminder_days = item["reminder_days"]
            reminder_time = item["reminder_time"]
            
            # Calculate reminder date (expiry date minus reminder days)
            reminder_date = expiry_date - timedelta(days=reminder_days)
            
            # Parse reminder time
            hour, minute = map(int, reminder_time.split(":"))
            
            # Set reminder time
            reminder_datetime = reminder_date.replace(hour=hour, minute=minute)
            
            # Convert to UTC time
            reminder_datetime_utc = reminder_datetime.astimezone(pytz.UTC)
            
            # Format datetime for ICS format
            reminder_datetime_str = reminder_datetime_utc.strftime("%Y%m%dT%H%M%SZ")
            
            # Add event to ICS content
            ical_content += f"""
BEGIN:VEVENT
SUMMARY:Food Expiry Reminder: {item["name"]}
DTSTART:{reminder_datetime_str}
DTEND:{reminder_datetime_str}
DESCRIPTION:Your {item["name"]} (Qty: {item["quantity"]}) will expire on {expiry_date.strftime("%Y-%m-%d")}.
END:VEVENT"""
        
        # End ICS content
        ical_content += """
END:VCALENDAR"""
        
        # Set response headers for file download
        response = HttpResponse(ical_content, content_type='text/calendar')
        response['Content-Disposition'] = f'attachment; filename="best-before-reminders-{calendar_id}.ics"'
        return response
    except ValueError:
        return JsonResponse({"error": "Invalid calendar ID"}, status=400)

def list_calendars(request):
    """
    List all available calendars.
    
    Currently returns an empty list as calendars are stored in memory cache.
    In a production system, this would retrieve calendars from a database.
    
    Args:
        request (HttpRequest): Django HTTP request object
    
    Returns:
        JsonResponse: JSON response containing:
            - status (str): Success status
            - count (int): Number of calendars
            - calendars (List): List of calendar objects
    """
    return JsonResponse({
        "status": "success",
        "count": 0,
        "calendars": []
    })