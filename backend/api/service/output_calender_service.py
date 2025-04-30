# api/output_calender.py
from datetime import datetime, timedelta
import uuid
import json
from typing import List, Dict
from django.http import JsonResponse, HttpResponse
from django.views.decorators.csrf import csrf_exempt
import pytz
import os


calendar_cache = {}

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
    
    # 将日历数据存储到缓存中
    calendar_cache[str(calendar_id)] = saved_items
    
    return JsonResponse({
        "status": "success",
        "calendar_id": str(calendar_id),
        "items": saved_items
    })

def generate_ical(request, calendar_id):
    try:
        # 验证 calendar_id 是否为有效的 UUID
        calendar_uuid = uuid.UUID(str(calendar_id))
        
        # 从缓存中获取日历数据
        items = calendar_cache.get(str(calendar_id), [])
        
        if not items:
            return JsonResponse({"error": "Calendar not found"}, status=404)
        
        # 创建 ICS 文件内容
        ical_content = """BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//BestBefore//Calendar//EN
CALSCALE:GREGORIAN"""
        
        # 为每个项目创建一个事件
        for item in items:
            # 解析日期和时间
            expiry_date = datetime.fromisoformat(item["expiry_date"])
            reminder_days = item["reminder_days"]
            reminder_time = item["reminder_time"]
            
            # 计算提醒日期（到期日期减去提醒天数）
            reminder_date = expiry_date - timedelta(days=reminder_days)
            
            # 解析提醒时间
            hour, minute = map(int, reminder_time.split(":"))
            
            # 设置提醒时间
            reminder_datetime = reminder_date.replace(hour=hour, minute=minute)
            
            # 转换为 UTC 时间
            reminder_datetime_utc = reminder_datetime.astimezone(pytz.UTC)
            
            # 格式化日期时间为 ICS 格式
            reminder_datetime_str = reminder_datetime_utc.strftime("%Y%m%dT%H%M%SZ")
            
            # 添加事件到 ICS 内容
            ical_content += f"""
BEGIN:VEVENT
SUMMARY:Food Expiry Reminder: {item["name"]}
DTSTART:{reminder_datetime_str}
DTEND:{reminder_datetime_str}
DESCRIPTION:Your {item["name"]} (Qty: {item["quantity"]}) will expire on {expiry_date.strftime("%Y-%m-%d")}.
END:VEVENT"""
        
        # 结束 ICS 内容
        ical_content += """
END:VCALENDAR"""
        
        # 设置响应头，使浏览器下载文件
        response = HttpResponse(ical_content, content_type='text/calendar')
        response['Content-Disposition'] = f'attachment; filename="best-before-reminders-{calendar_id}.ics"'
        return response
    except ValueError:
        return JsonResponse({"error": "Invalid calendar ID"}, status=400)

def list_calendars(request):
    return JsonResponse({
        "status": "success",
        "count": 0,
        "calendars": []
    })