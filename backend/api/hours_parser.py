def parse_operating_hours(hours_text):
    """
    Parse hours_of_operation text into a structured format.
    
    Args:
        hours_text (str): Raw hours text from database
        
    Returns:
        dict: Structured operation hours with days and times
    """
    if not hours_text or hours_text.strip().lower() == '24 hours':
        return {
            'is_24_hours': True,
            'schedule': {
                'monday': {'open': '00:00', 'close': '24:00'},
                'tuesday': {'open': '00:00', 'close': '24:00'},
                'wednesday': {'open': '00:00', 'close': '24:00'},
                'thursday': {'open': '00:00', 'close': '24:00'},
                'friday': {'open': '00:00', 'close': '24:00'},
                'saturday': {'open': '00:00', 'close': '24:00'},
                'sunday': {'open': '00:00', 'close': '24:00'}
            },
            'raw_text': hours_text
        }
    
    weekdays = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday']
    weekend = ['saturday', 'sunday']
    all_days = weekdays + weekend
    
    # Initialize default schedule (closed)
    schedule = {day: {'open': None, 'close': None} for day in all_days}
    
    try:
        # Handle common patterns
        hours_text = hours_text.lower().strip()
        
        # Case 1: Weekday hours, closed on weekends
        if 'weekdays' in hours_text and ('close in weekends' in hours_text or 'closed in weekends' in hours_text):
            time_part = hours_text.split('in weekdays')[0].strip()
            hours = time_part.split('-')
            if len(hours) == 2:
                for day in weekdays:
                    schedule[day]['open'] = hours[0].strip()
                    schedule[day]['close'] = hours[1].strip()
        
        # Case 2: Daily hours except certain days
        elif 'daily beside' in hours_text:
            excluded_day = hours_text.split('daily beside')[1].strip().split()[0].lower()
            excluded_day = excluded_day.rstrip(',.:;')
            
            if excluded_day in ['sunday', 'wednesday', 'monday', 'tuesday', 'thursday', 'friday', 'saturday']:
                time_part = hours_text.split('daily beside')[0].strip()
                hours = time_part.split('-')
                if len(hours) == 2:
                    for day in all_days:
                        if excluded_day not in day:  # Skip the excluded day
                            schedule[day]['open'] = hours[0].strip()
                            schedule[day]['close'] = hours[1].strip()
        
        # Case 3: Specific days with specific hours
        elif any(day in hours_text for day in ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']):
            parts = hours_text.split(',')
            for part in parts:
                part = part.strip()
                if ' in ' in part or ' on ' in part:
                    separator = ' in ' if ' in ' in part else ' on '
                    time_info, day_info = part.split(separator)
                    
                    hours = time_info.strip().split('-')
                    if len(hours) != 2:
                        continue
                        
                    time_open = hours[0].strip()
                    time_close = hours[1].strip()
                    
                    # Handle day ranges and multiple days
                    if 'weekdays' in day_info or 'mon-fri' in day_info:
                        for day in weekdays:
                            schedule[day]['open'] = time_open
                            schedule[day]['close'] = time_close
                    elif 'weekends' in day_info or 'sat-sun' in day_info:
                        for day in weekend:
                            schedule[day]['open'] = time_open
                            schedule[day]['close'] = time_close
                    else:
                        days_mentioned = []
                        for day in all_days:
                            if day in day_info or day[:3] in day_info.lower():
                                days_mentioned.append(day)
                        
                        for day in days_mentioned:
                            schedule[day]['open'] = time_open
                            schedule[day]['close'] = time_close
        
        # Case 4: Specific format like "9am to 10pm daily"
        elif 'daily' in hours_text:
            time_part = hours_text.replace('daily', '').strip()
            
            # Handle formats like "9am to 10pm"
            if 'to' in time_part:
                open_time, close_time = time_part.split('to')
                # Convert to 24-hour format if needed
                open_time = convert_to_24hr_format(open_time.strip())
                close_time = convert_to_24hr_format(close_time.strip())
                
                for day in all_days:
                    schedule[day]['open'] = open_time
                    schedule[day]['close'] = close_time
        
        # Case 5: Complex special cases
        else:
            # Handle any other patterns here as special cases
            pass
    
    except Exception as e:
        # Log the error but return the best effort parsing
        print(f"Error parsing hours: {e}")
    
    # Determine if any valid hours were parsed
    has_valid_hours = any(
        schedule[day]['open'] is not None and schedule[day]['close'] is not None
        for day in all_days
    )
    
    return {
        'is_24_hours': '24 hours' in hours_text.lower(),
        'schedule': schedule,
        'raw_text': hours_text,
        'is_parsed': has_valid_hours
    }


def convert_to_24hr_format(time_str):
    """
    Convert time strings like "9am", "10pm" to 24-hour format
    """
    time_str = time_str.lower().strip()
    if not time_str:
        return None
        
    # Handle special cases
    if time_str == '24:00' or time_str == '24:00:00':
        return '24:00'
    
    # Handle AM/PM format
    if 'am' in time_str or 'pm' in time_str:
        is_pm = 'pm' in time_str
        time_part = time_str.replace('am', '').replace('pm', '').strip()
        
        # Handle cases with colons like "9:30am"
        if ':' in time_part:
            hour, minute = time_part.split(':')
            hour = int(hour)
            if is_pm and hour < 12:
                hour += 12
            elif not is_pm and hour == 12:
                hour = 0
        else:
            # Handle cases without colons like "9am"
            hour = int(time_part)
            if is_pm and hour < 12:
                hour += 12
            elif not is_pm and hour == 12:
                hour = 0
            minute = 0
        
        return f"{hour:02d}:{minute:02d}"
    
    # Already in 24-hour format
    return time_str