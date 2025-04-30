# Backend Documentation

## Overview
The backend of BestBefore is built using Django and provides various services for managing ingredients, dishes, and other food-related data. This documentation covers the main components and services of the backend.

## Directory Structure
```
backend/
├── api/                    # Main API application
│   ├── service/           # Service layer implementations
│   ├── models.py          # Database models
│   ├── views.py           # API endpoints
│   ├── urls.py            # URL routing
│   └── serializer.py      # Data serialization
├── config/                # Configuration files
├── bestbefore/           # Django project settings
└── manage.py             # Django management script
```

## Services

### 1. Ingredient Combiner Service (`ingredient_combiner_service.py`)
The Ingredient Combiner Service is responsible for combining and managing ingredients from multiple dishes. It provides functionality to:
- Combine ingredients from multiple dishes
- Scale ingredient quantities based on servings
- Categorize ingredients by type (Meat, Fish, Produce, etc.)
- Handle unit conversions and quantity additions

Key functions:
- `combine_dish_ingredients()`: Main function to combine ingredients from selected dishes
- `scale_ingredients()`: Adjust ingredient quantities based on servings
- `combine_ingredients()`: Merge duplicate ingredients
- `categorize_ingredients()`: Group ingredients by category

### 2. Dish Ingredient Service (`dish_ingre_service.py`)
This service manages the relationship between dishes and their ingredients. It handles:
- Retrieving ingredients for specific dishes
- Managing dish-ingredient relationships
- Processing ingredient data

### 3. Produce Detection Service (`produce_detection_service.py`)
Handles the detection and processing of produce-related data, including:
- Identifying produce items
- Processing produce-related information
- Managing produce data

### 4. Hours Parser Service (`hours_parser_service.py`)
Manages the parsing and processing of time-related data, including:
- Parsing business hours
- Processing time-related information
- Formatting time data

### 5. Output Calendar Service (`output_calender_service.py`)
Handles calendar-related operations, including:
- Managing calendar events
- Processing date-related information
- Formatting calendar data

### 6. Database Service (`db_service.py`)
Provides database operations and utilities, including:
- Database connections
- Query operations
- Data management utilities

## Models
The backend uses Django models to represent data structures. Key models include:
- Dish model
- Ingredient model
- Category model
- Other related models

## API Endpoints
The API provides various endpoints for:
- Managing dishes and ingredients
- Processing ingredient combinations
- Handling produce detection
- Managing calendar events
- Other related operations

## Configuration
The backend uses several configuration files:
- `.env`: Environment variables
- `requirements.txt`: Python dependencies
- Django settings in `config/`

## Setup and Installation
1. Create a virtual environment:
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

2. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

3. Set up environment variables in `.env`

4. Run migrations:
   ```bash
   python manage.py migrate
   ```

5. Start the development server:
   ```bash
   python manage.py runserver
   ```

## Testing
The backend includes test files for various components:
- `test_second_life.py`: Tests for second life functionality
- Other test files in the `api/tests/` directory

## Best Practices
1. Follow the service-oriented architecture pattern
2. Keep business logic in service layer
3. Use proper error handling
4. Maintain comprehensive documentation
5. Follow Django best practices for models and views 