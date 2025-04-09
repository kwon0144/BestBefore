# api/output_calender.py
from datetime import datetime, timedelta
import uuid
import json
from typing import List, Dict
from django.http import JsonResponse, HttpResponse
from django.views.decorators.csrf import csrf_exempt
from django.db import models
from django.utils import timezone
from django.conf import settings
import pytz

class FoodItem(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    calendar_id = models.UUIDField()
    name = models.CharField(max_length=100)
    quantity = models.IntegerField(default=1)
    expiry_date = models.DateField()
    reminder_date = models.DateTimeField()
    reminder_days = models.IntegerField(default=2)
    reminder_time = models.CharField(max_length=5, default="20:00")

    class Meta:
        indexes = [
            models.Index(fields=['calendar_id']), 
        ]

@csrf_exempt
def generate_calendar(request):
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
            
            food_item = FoodItem.objects.create(
                calendar_id=calendar_id,
                name=item["name"],
                quantity=item.get("quantity", 1),
                expiry_date=expiry_date,
                reminder_date=datetime.now(),  # This field is not used anymore
                reminder_days=reminder_days,
                reminder_time=f"{hour:02d}:{minute:02d}"
            )
            
            saved_items.append({
                "name": food_item.name,
                "quantity": food_item.quantity,
                "expiry_date": food_item.expiry_date.isoformat(),
                "reminder_days": food_item.reminder_days,
                "reminder_time": food_item.reminder_time
            })
        except (ValueError, KeyError) as e:
            continue
    
    if not saved_items:
        return JsonResponse({"error": "No valid items provided"}, status=400)
    
    calendar_url = f"http://192.168.3.5:8000/api/calendar/{calendar_id}.ics"
    
    return JsonResponse({
        "status": "success",
        "calendar_url": calendar_url,
        "calendar_id": str(calendar_id),
        "items": saved_items
    })

def generate_ical(request, calendar_id):
    try:
        uuid.UUID(str(calendar_id)) 
        items = FoodItem.objects.filter(calendar_id=calendar_id)
        if not items.exists():
            return JsonResponse({"error": "Calendar not found"}, status=404)
        
        ical_content = [
            "BEGIN:VCALENDAR",
            "VERSION:2.0",
            "PRODID:-//Food Waste App//EN",
            "CALSCALE:GREGORIAN",
            "METHOD:PUBLISH"
        ]
        
        for item in items:
            try:
                # Parse reminder time
                target_hour, target_minute = map(int, item.reminder_time.split(":"))
                
                # Calculate the hours to add to get the target time
                # If target time is 22:00, we want to set it as 2:00 (24 - 22)
                adjusted_hour = (24 - target_hour) % 24
                
                # Adjust days (reduce by 1)
                adjusted_days = max(0, item.reminder_days - 1)
                
                # Format dates
                expiry_str = item.expiry_date.strftime("%Y%m%d")
                created_str = datetime.now().strftime("%Y%m%dT%H%M%SZ")
                
                # Print reminder time information
                print(f"\nItem: {item.name}")
                print(f"Expiry date: {item.expiry_date}")
                print(f"Original reminder days: {item.reminder_days}")
                print(f"Adjusted reminder days: {adjusted_days}")
                print(f"Target time: {item.reminder_time}")
                print(f"Adjusted time: {adjusted_hour:02d}:{target_minute:02d}")
                print(f"Using relative time format: -P{adjusted_days}DT{adjusted_hour}H{target_minute}M")
                
                ical_content.extend([
                    f"BEGIN:VEVENT",
                    f"UID:{item.id}@foodwasteapp.com",
                    f"DTSTAMP:{created_str}",
                    f"CREATED:{created_str}",
                    f"DTSTART;VALUE=DATE:{expiry_str}",
                    f"DTEND;VALUE=DATE:{expiry_str}",
                    f"SUMMARY:{item.name} (Expires!)",
                    f"DESCRIPTION:Your {item.name} (Qty: {item.quantity}) expires on {item.expiry_date}.",
                    "BEGIN:VALARM",
                    f"TRIGGER:-P{adjusted_days}DT{adjusted_hour}H{target_minute}M",
                    "ACTION:DISPLAY",
                    f"DESCRIPTION:Reminder: {item.name} expires soon!",
                    "END:VALARM",
                    "END:VEVENT"
                ])
            except Exception as e:
                print(f"Error processing item: {e}")
                continue
        
        ical_content.append("END:VCALENDAR")
        
        response = HttpResponse(
            "\r\n".join(ical_content),
            content_type="text/calendar",
            headers={
                "Content-Disposition": f'attachment; filename="food_calendar_{calendar_id}.ics"'
            }
        )
        return response
        
    except ValueError:
        return JsonResponse({"error": "Invalid calendar ID"}, status=400)

def list_calendars(request):
    from django.core import serializers
    calendars = FoodItem.objects.values('calendar_id').distinct()
    return JsonResponse({
        "status": "success",
        "count": calendars.count(),
        "calendars": list(calendars)
    })