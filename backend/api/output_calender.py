from flask import Flask, request, jsonify, Response
from datetime import datetime
import uuid
import socket

app = Flask(__name__)
food_storage = []  # Temporary in-memory storage (data lost on server restart)

def get_local_ip():
    """Automatically get local network IP (e.g., 192.168.x.x)"""
    try:
        # Create a temporary socket connection to external address (no actual data sent)
        s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
        s.connect(("8.8.8.8", 80))  # Connect to Google DNS server
        local_ip = s.getsockname()[0]
        s.close()
        return local_ip
    except:
        return "127.0.0.1"  # Fallback to localhost if fails

@app.route("/api/add_food", methods=["POST"])
def add_food():
    # Validate request data
    data = request.json
    if not data or "name" not in data or "expiry_date" not in data:
        return jsonify({"error": "Missing name or expiry_date"}), 400

    # Generate unique ID and store food data
    food_id = str(uuid.uuid4())
    food_storage.append({
        "id": food_id,
        "name": data["name"],
        "expiry_date": data["expiry_date"]
    })

    # Generate calendar subscription URL with local IP
    local_ip = get_local_ip()
    calendar_url = f"http://{local_ip}:5000/api/calendar/{food_id}.ics"

    return jsonify({
        "status": "success",
        "calendar_url": calendar_url  # Example: http://192.168.3.5:5000/api/calendar/xxx.ics
    })

@app.route("/api/calendar/<food_id>.ics")
def generate_ical(food_id):
    # Find food item by ID
    food = next((item for item in food_storage if item["id"] == food_id), None)
    if not food:
        return jsonify({"error": "Food not found"}), 404

    # Format expiry date for iCal
    expiry_date = datetime.strptime(food["expiry_date"], "%Y-%m-%d").strftime("%Y%m%d")
    
    # Generate iCal content
    ical_content = f"""BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Food Waste App//EN
BEGIN:VEVENT
UID:{food_id}@foodwasteapp.com
DTSTAMP:{datetime.now().strftime("%Y%m%dT%H%M%SZ")}
DTSTART;VALUE=DATE:{expiry_date}
DTEND;VALUE=DATE:{expiry_date}
SUMMARY:{food['name']} (Expires!)
DESCRIPTION:Your {food['name']} expires on {food['expiry_date']}.
END:VEVENT
END:VCALENDAR"""

    # Return iCal response
    return Response(
        ical_content,
        mimetype="text/calendar",  # Important: Tells browser this is calendar data
        headers={"Content-Disposition": "inline"}  # Prevents file download
    )

if __name__ == "__main__":
    # Run server accessible from local network
    app.run(host='0.0.0.0', port=5000, debug=True)