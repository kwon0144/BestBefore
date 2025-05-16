# BestBefore API Documentation

This document provides comprehensive information about the API endpoints available in the BestBefore backend service.

## Authentication

All API requests require authentication using an API key. Include the API key in the request headers:

```
X-API-Key: your_api_key_here
```

## Base URL

Base URL for all API endpoints: `http://localhost:8000/api/` (development)

## Endpoints

### Food Detection

Detect food items from images using AI.

**Endpoint:** `POST /detect-produce/`

**Request:**
```json
{
  "image": "base64_encoded_image_string"
}
```

Or, for multiple images:
```json
{
  "images": [
    "base64_encoded_image_string_1",
    "base64_encoded_image_string_2"
  ]
}
```

**Response:**
```json
{
  "success": true,
  "detections": [],
  "produce_counts": {
    "apple": 2,
    "banana": 1,
    "carrot": 3
  },
  "total_items": 6
}
```

**Error Responses:**
- `400 Bad Request`: No images provided
- `405 Method Not Allowed`: Method other than POST used
- `500 Internal Server Error`: Server-side error processing the image

---

### Storage Advice

Get storage recommendations for a specific food type.

**Endpoint:** `POST /storage-advice/`

**Request:**
```json
{
  "food_type": "apple"
}
```

**Response:**
```json
{
  "type": "apple",
  "storage_time": 30,
  "method": 2
}
```

**Error Responses:**
- `400 Bad Request`: Food type is missing
- `404 Not Found`: No storage recommendation found for the food type
- `500 Internal Server Error`: Server-side error

---

### Food Types

Get a list of all available food types.

**Endpoint:** `GET /food-types/`

**Response:**
```json
{
  "food_types": [
    "apple",
    "banana",
    "carrot",
    "potato",
    ...
  ]
}
```

**Error Responses:**
- `500 Internal Server Error`: Server-side error

---

### Food Banks

Get a list of food banks.

**Endpoint:** `GET /foodbanks/`

**Response:**
```json
{
  "success": true,
  "foodbanks": [
    {
      "id": 1,
      "name": "Community Food Bank",
      "latitude": -37.8136,
      "longitude": 144.9631,
      "type": "food_bank",
      "address": "123 Main St, Melbourne, VIC 3000",
      "operating_hours": {
        "is_24_hours": false,
        "days": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
        "hours": "9:00-17:00",
        "daily_schedule": {
          "monday": {"is_open": true, "hours": "9:00-17:00"},
          "tuesday": {"is_open": true, "hours": "9:00-17:00"},
          "wednesday": {"is_open": true, "hours": "9:00-17:00"},
          "thursday": {"is_open": true, "hours": "9:00-17:00"},
          "friday": {"is_open": true, "hours": "9:00-17:00"},
          "saturday": {"is_open": false, "hours": null},
          "sunday": {"is_open": false, "hours": null}
        }
      }
    },
    ...
  ]
}
```

**Error Responses:**
- `500 Internal Server Error`: Server-side error

---

### Calendar Generation

Generate a calendar with food expiration reminders.

**Endpoint:** `POST /generate_calendar/`

**Request:**
```json
{
  "items": [
    {
      "name": "Milk",
      "quantity": 1,
      "expiry_date": 7,
      "reminder_days": 2,
      "reminder_time": "20:00"
    },
    {
      "name": "Cheese",
      "quantity": 2,
      "expiry_date": 14,
      "reminder_days": 3,
      "reminder_time": "18:00"
    }
  ],
  "reminder_days": 2,
  "reminder_time": "20:00"
}
```

**Response:**
```json
{
  "status": "success",
  "calendar_url": "http://localhost:8000/api/calendar/123e4567-e89b-12d3-a456-426614174000.ics",
  "calendar_id": "123e4567-e89b-12d3-a456-426614174000",
  "items": [
    {
      "name": "Milk",
      "quantity": 1,
      "expiry_date": "2023-12-31",
      "reminder_days": 2,
      "reminder_time": "20:00"
    },
    {
      "name": "Cheese",
      "quantity": 2,
      "expiry_date": "2024-01-07",
      "reminder_days": 3,
      "reminder_time": "18:00"
    }
  ]
}
```

**Error Responses:**
- `400 Bad Request`: Invalid JSON or missing items
- `405 Method Not Allowed`: Method other than POST used
- `500 Internal Server Error`: Server-side error

---

### Calendar iCal Export

Export a calendar in iCal format.

**Endpoint:** `GET /calendar/{calendar_id}.ics`

**Path Parameters:**
- `calendar_id`: UUID of the calendar to export

**Response:**
iCalendar file (.ics) with the following information:
- Food items as events on their expiration dates
- Reminder alarms configured according to preferences
- Details about each food item

**Error Responses:**
- `400 Bad Request`: Invalid calendar ID
- `404 Not Found`: Calendar not found

## Data Models

### Food Storage

```json
{
  "type": "string",        // Food type name
  "storage_time": "integer", // Days the food can be stored
  "method": "integer"      // Storage method code
}
```

### Geospatial (Food Banks)

```json
{
  "id": "integer",
  "name": "string",
  "latitude": "float",
  "longitude": "float",
  "type": "string",
  "hours_of_operation": "string",
  "address": "string"
}
```

### Food Item (Calendar)

```json
{
  "name": "string",           // Name of the food item
  "quantity": "integer",      // Quantity of the item
  "expiry_date": "string",    // ISO format date (YYYY-MM-DD)
  "reminder_days": "integer", // Days before expiry to send reminder
  "reminder_time": "string"   // Time of day for reminder (HH:MM)
}
```

## Error Handling

All endpoints return a JSON response with an `error` field when an error occurs. The HTTP status code indicates the type of error:

- `400`: Bad Request - The request is malformed or missing required parameters
- `404`: Not Found - The requested resource was not found
- `405`: Method Not Allowed - The HTTP method is not supported
- `500`: Internal Server Error - Server-side error

Example error response:
```json
{
  "error": "Food type is required"
}
```

## Rate Limiting

API requests are limited to 100 requests per minute per API key. If you exceed this limit, you'll receive a `429 Too Many Requests` response.