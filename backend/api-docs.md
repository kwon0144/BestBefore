# BestBefore API Documentation

This document provides details on the available API endpoints for the BestBefore application.

## Table of Contents

- [Authentication](#authentication)
- [Food Information](#food-information)
- [Storage Advice](#storage-advice)
- [Meal Planning](#meal-planning)
- [Calendar Integration](#calendar-integration)
- [Food Waste Statistics](#food-waste-statistics)
- [Environmental Impact](#environmental-impact)
- [Food Donation](#food-donation)
- [Second Life DIY](#second-life-diy)
- [Game Functionality](#game-functionality)

## Authentication

### Login

```
POST /api/auth/login/
```

Authenticates a user and returns a token.

**Request Body:**
```json
{
  "username": "string",
  "password": "string"
}
```

**Response:**
```json
{
  "token": "string",
  "user_id": "string",
  "username": "string"
}
```

**Status Codes:**
- `200 OK`: Login successful
- `401 UNAUTHORIZED`: Invalid credentials

## Food Information

### Get Food Types

```
GET /api/food-types/
```

Returns a list of food types and their attributes.

**Response:**
```json
{
  "food_types": [
    {
      "type": "string",
      "storage_time": "integer",
      "method": "integer"
    }
  ]
}
```

### Detect Produce

```
POST /api/detect-produce/
```

Analyzes an image to detect the type of produce/food.

**Request Body:**
```json
{
  "image": "base64_encoded_string"
}
```

**Response:**
```json
{
  "detected_items": [
    {
      "name": "string",
      "confidence": "float",
      "expiry_date": "string",
      "storage_advice": "string"
    }
  ]
}
```

## Storage Advice

### Get Storage Advice

```
POST /api/storage-advice/
```

Provides storage recommendations for food items.

**Request Body:**
```json
{
  "food_type": "string"
}
```

**Response:**
```json
{
  "recommendations": [
    {
      "type": "string",
      "storage_time": "integer",
      "method": "string"
    }
  ]
}
```

## Meal Planning

### Search Dishes

```
POST /api/search-dishes/
```

Searches for dishes based on ingredients or dish name.

**Request Body:**
```json
{
  "query": "string",
  "query_type": "ingredient|dish_name"
}
```

**Response:**
```json
{
  "dishes": [
    {
      "id": "integer",
      "name": "string",
      "description": "string",
      "cuisine": "string",
      "url": "string"
    }
  ]
}
```

### Get Dish Ingredients

```
POST /api/dish-ingredients/
```

Retrieves ingredients for a specific dish.

**Request Body:**
```json
{
  "dish_name": "string"
}
```

**Response:**
```json
{
  "dish": "string",
  "ingredients": {
    "pantry": ["string"],
    "fridge": ["string"],
    "produce": ["string"],
    "other": ["string"]
  }
}
```

### Get Signature Dishes

```
GET /api/signature-dishes/
```

Retrieves a curated list of signature dishes.

**Response:**
```json
{
  "signature_dishes": [
    {
      "id": "integer",
      "name": "string",
      "description": "string",
      "cuisine": "string",
      "url": "string"
    }
  ]
}
```

## Calendar Integration

### Generate Calendar

```
POST /api/generate_calendar/
```

Creates a calendar with food expiry dates.

**Request Body:**
```json
{
  "items": [
    {
      "name": "string",
      "expiry_date": "YYYY-MM-DD"
    }
  ]
}
```

**Response:**
```json
{
  "calendar_id": "uuid",
  "calendar_url": "string"
}
```

### Get iCal File

```
GET /api/calendar/{calendar_id}.ics
```

Returns an iCalendar file for a specific calendar.

**Response:**
iCalendar (.ics) file

## Food Waste Statistics

### Get Waste Composition

```
GET /api/waste-composition/
```

Returns the composition of food waste by category.

**Response:**
```json
{
  "composition": [
    {
      "type": "string",
      "quantity": "float",
      "percentage": "float"
    }
  ],
  "total": "float"
}
```

### Get Food Waste by Category

```
GET /api/food-waste-by-category/
```

Returns food waste statistics by category.

**Query Parameters:**
- `country` (optional): Filter by country name
- `year` (optional): Filter by year

**Response:**
```json
{
  "categories": [
    {
      "food_category": "string",
      "total_waste_tons": "float",
      "economic_loss_millions": "float",
      "percentage_of_total": "float"
    }
  ],
  "total_waste": "float",
  "total_economic_loss": "float"
}
```

### Get Country Yearly Waste

```
GET /api/country-yearly-waste/
```

Returns food waste statistics by country and year.

**Query Parameters:**
- `country` (optional): Filter by country name
- `year` (optional): Filter by year

**Response:**
```json
{
  "countries": [
    {
      "country": "string",
      "year": "integer",
      "total_waste_tons": "float",
      "economic_loss_millions": "float",
      "avg_waste_per_capita": "float",
      "population_millions": "float",
      "household_waste_percentage": "float"
    }
  ]
}
```

## Environmental Impact

### Get Economic Impact

```
GET /api/economic-impact/
```

Returns economic impact data of food waste.

**Query Parameters:**
- `year` (optional): Filter by year

**Response:**
```json
{
  "global_impact": {
    "total_economic_loss_millions": "float",
    "total_waste_tons": "float",
    "avg_household_waste_percentage": "float"
  },
  "countries": [
    {
      "country": "string",
      "total_economic_loss_millions": "float",
      "total_waste_tons": "float",
      "cost_per_household_yearly": "float",
      "household_waste_percentage": "float"
    }
  ]
}
```

### Get Household Impact

```
GET /api/household-impact/
```

Returns the impact of food waste at the household level.

**Query Parameters:**
- `country` (optional): Country to calculate for

**Response:**
```json
{
  "country": "string",
  "cost_per_household_yearly": "float",
  "waste_per_household_yearly_kg": "float",
  "comparable_items": [
    {
      "item": "string",
      "quantity": "float",
      "unit": "string"
    }
  ],
  "reduction_potential": {
    "money_saved_yearly": "float",
    "carbon_saved_yearly_kg": "float"
  }
}
```

### Get Food Emissions

```
GET /api/food-emissions/
```

Returns greenhouse gas emission data for food types.

**Response:**
```json
{
  "emissions": [
    {
      "id": "integer",
      "food_type": "string",
      "ghg": "float"
    }
  ]
}
```

**Single Food Type:**
```
GET /api/food-emissions/{id}/
```

**Response:**
```json
{
  "id": "integer",
  "food_type": "string",
  "ghg": "float"
}
```

## Food Donation

### Get Foodbanks

```
GET /api/foodbanks/
```

Returns a list of nearby food donation centers.

**Query Parameters:**
- `latitude` (optional): User's latitude
- `longitude` (optional): User's longitude
- `radius` (optional): Search radius in kilometers

**Response:**
```json
{
  "foodbanks": [
    {
      "key": "string",
      "name": "string",
      "latitude": "float",
      "longitude": "float",
      "type": "string"
    }
  ]
}
```

**Detailed Foodbank Information:**
```
GET /api/foodbanks/{id}/
```

**Response:**
```json
{
  "key": "string",
  "name": "string",
  "latitude": "float",
  "longitude": "float",
  "type": "string",
  "address": "string",
  "opening_hours": {
    "Monday": "string",
    "Tuesday": "string",
    "Wednesday": "string",
    "Thursday": "string",
    "Friday": "string",
    "Saturday": "string",
    "Sunday": "string"
  }
}
```

## Second Life DIY

### Get Second Life Items

```
GET /api/second-life/
```

Returns a list of DIY ideas for food waste repurposing.

**Query Parameters:**
- `category` (optional): Filter by category
- `ingredient` (optional): Filter by ingredient

**Response:**
```json
{
  "items": [
    {
      "method_id": "integer",
      "method_name": "string",
      "is_combo": "string",
      "method_category": "string",
      "ingredient": "string",
      "description": "string",
      "picture": "string"
    }
  ]
}
```

### Get Second Life Item Detail

```
GET /api/second-life/{item_id}/
```

Returns detailed information about a specific DIY method.

**Response:**
```json
{
  "method_id": "integer",
  "method_name": "string",
  "is_combo": "string",
  "method_category": "string",
  "ingredient": "string",
  "description": "string",
  "picture": "string"
}
```

## Game Functionality

### Start Game

```
POST /api/game/start/
```

Initializes a new game session.

**Request Body:**
```json
{
  "player_id": "string"
}
```

**Response:**
```json
{
  "game_id": "string",
  "time_remaining": "integer",
  "score": "integer"
}
```

### Update Game

```
POST /api/game/update/
```

Updates the state of an active game.

**Request Body:**
```json
{
  "game_id": "string",
  "time_elapsed": "integer"
}
```

**Response:**
```json
{
  "game_id": "string",
  "time_remaining": "integer",
  "score": "integer",
  "is_active": "boolean"
}
```

### End Game

```
POST /api/game/end/
```

Ends an active game session.

**Request Body:**
```json
{
  "game_id": "string",
  "final_score": "integer"
}
```

**Response:**
```json
{
  "game_id": "string",
  "score": "integer",
  "rank": "integer"
}
```

### Get Leaderboard

```
GET /api/game/leaderboard/
```

Returns the game leaderboard.

**Query Parameters:**
- `limit` (optional): Number of top scores to return

**Response:**
```json
{
  "leaderboard": [
    {
      "player_id": "string",
      "score": "integer",
      "date": "string"
    }
  ]
}
```

### Get Food Items

```
GET /api/game/food-items/
```

Returns available food items for the game.

**Response:**
```json
{
  "food_items": [
    {
      "id": "integer",
      "name": "string",
      "type": "string",
      "image": "string",
      "description": "string"
    }
  ]
}
```

### Pickup Food

```
POST /api/game/pickup/
```

Records a food item pickup in the game.

**Request Body:**
```json
{
  "game_id": "string",
  "item_id": "integer"
}
```

**Response:**
```json
{
  "success": "boolean",
  "score": "integer",
  "message": "string"
}
```

### Perform Action

```
POST /api/game/action/
```

Performs an action on a food item in the game.

**Request Body:**
```json
{
  "game_id": "string",
  "item_id": "integer",
  "action": "string" 
}
```

**Response:**
```json
{
  "success": "boolean",
  "score": "integer",
  "message": "string"
}
```

### Get Game Resources

```
GET /api/game/resources/
```

Returns game resources like backgrounds, icons, etc.

**Query Parameters:**
- `type` (optional): Resource type to filter

**Response:**
```json
{
  "resources": [
    {
      "id": "integer",
      "name": "string",
      "type": "string",
      "description": "string",
      "image": "string"
    }
  ]
}
``` 