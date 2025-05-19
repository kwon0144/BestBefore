# BestBefore Backend

## Overview
The backend of BestBefore is built using Django 5.2 and provides a RESTful API for managing food-related data, including ingredients, dishes, food storage information, and sustainability metrics. The application follows a service-oriented architecture with a clear separation of concerns.

## Tech Stack
- **Framework**: Django 5.2
- **REST API**: Django REST Framework 3.16.0
- **Database**: MySQL (configured) / SQLite (development)
- **Python Version**: 3.11
- **Authentication**: API Key-based authentication
- **CORS**: Configured for cross-origin requests
- **Deployment**: Docker containerization

## Directory Structure
```
backend/
|-- api/                    # Main API application
|   |-- service/            # Service layer implementations
|   |   |-- ingredient_combiner_service.py
|   |   |-- dish_ingre_service.py
|   |   |-- produce_detection_service.py
|   |   |-- produce_expiry_date_service.py
|   |   |-- hours_parser_service.py
|   |   |-- output_calender_service.py
|   |   |-- db_service.py
|   |-- models.py           # Database models
|   |-- views.py            # API endpoints
|   |-- urls.py             # URL routing
|   |-- serializer.py       # Data serialization
|   |-- game_core.py        # Game functionality
|   |-- game_validators.py  # Game validation utilities
|   |-- tests/              # Test files
|       |-- test_second_life.py
|       |-- test_dish_service.py
|       |-- test_game.py
|       |-- test_hours_parser.py
|       |-- test_food_emissions.py
|       |-- test_global_food_wastage.py
|       |-- test_waste_composition.py
|       |-- test_db_service.py
|-- config/                 # Configuration files
|   |-- settings.py         # Django project settings
|   |-- urls.py             # Main URL routing
|   |-- db_connector.py     # Database connection utility
|-- bestbefore/             # Django project settings
|-- manage.py               # Django management script
```

## Key Models
The application includes the following data models:

- **Dish**: Represents food dishes with name, description, cuisine, and URL
- **FoodIngredient**: Maps dishes to their ingredients
- **FoodStorage**: Information about food storage methods and times
- **SecondLife**: DIY methods for repurposing food waste
- **Geospatial**: Locations of food-related facilities (stores, community gardens, etc.)
- **Game**: Game session data for the educational food game
- **GameFoodResources** & **GameResources**: Resources for the educational game
- **FoodWasteComposition**: Data on types and quantities of food waste
- **GlobalFoodWastageDataset**: Global food wastage statistics by country, year, and category
- **FoodEmissions**: Greenhouse gas emissions data for different food types

## Services

### 1. Ingredient Combiner Service
- Combines ingredients from multiple dishes
- Scales ingredient quantities based on servings
- Categorizes ingredients by type
- Handles unit conversions and quantity additions

### 2. Dish Ingredient Service
- Manages the relationship between dishes and their ingredients
- Processes ingredient data

### 3. Produce Detection Service
- Identifies produce items
- Processes produce-related information

### 4. Produce Expiry Date Service
- Tracks and predicts expiry dates for produce items
- Helps reduce food waste by managing freshness

### 5. Hours Parser Service
- Parses business hours
- Processes time-related information

### 6. Output Calendar Service
- Manages calendar events
- Processes date-related information

### 7. Database Service
- Provides database operations and utilities
- Manages data connections and queries

## API Endpoints
The API provides endpoints for accessing and manipulating data related to:
- Dishes and ingredients
- Food storage information
- DIY food waste repurposing methods
- Location-based food resources
- Food waste statistics and environmental impact data
- Game functionality

## Environment Variables
The application uses the following environment variables:
- `DJANGO_SECRET_KEY`: Secret key for the Django application
- `DEBUG`: Enable/disable debug mode (True/False)
- `DJANGO_ALLOWED_ORIGIN`: Additional CORS allowed origin
- `DJANGO_API_KEY`: API key for authentication
- `DB_NAME`: Database name
- `DB_USER`: Database username
- `DB_PASSWORD`: Database password
- `DB_HOST`: Database host (default: 127.0.0.1)
- `DB_PORT`: Database port (default: 3307)
- `CLAUDE_API_KEY`: API key for Claude (if used)

## Setup and Installation

### Local Development

1. Create a virtual environment:
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

2. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

3. Set up environment variables by creating a `.env` file in the project root:
   ```
   DJANGO_SECRET_KEY=your_secret_key
   DEBUG=True
   DJANGO_API_KEY=your_api_key
   DB_NAME=bestbefore
   DB_USER=dbuser
   DB_PASSWORD=dbpassword
   DB_HOST=127.0.0.1
   DB_PORT=3307
   ```

4. Run migrations:
   ```bash
   python manage.py migrate
   ```

5. Start the development server:
   ```bash
   python manage.py runserver
   ```

### Docker Deployment

1. Build the Docker image:
   ```bash
   docker build -t bestbefore-backend .
   ```

2. Run the container:
   ```bash
   docker run -p 8000:8000 \
     -e DJANGO_SECRET_KEY=your_secret_key \
     -e DJANGO_API_KEY=your_api_key \
     -e DB_NAME=bestbefore \
     -e DB_USER=dbuser \
     -e DB_PASSWORD=dbpassword \
     -e DB_HOST=your_db_host \
     bestbefore-backend
   ```

## Testing
The application includes comprehensive tests for various components:

1. Run all tests:
   ```bash
   python manage.py test
   ```

2. Run specific test files:
   ```bash
   python manage.py test api.tests.test_dish_service
   ```

## Authentication
The API uses key-based authentication. Include the API key in the request header:
```
X-API-Key: your_api_key
```

## CORS Configuration
The application is configured to allow cross-origin requests from:
- http://localhost:3000 (Next.js frontend)
- http://localhost:3001
- http://localhost:443
- http://localhost:8000
- Additional origins specified via environment variables

## Best Practices
1. Follow the service-oriented architecture pattern
2. Keep business logic in the service layer
3. Use proper error handling
4. Maintain comprehensive documentation
5. Write tests for all functionality
6. Follow Django best practices for models and views 