# BestBefore Backend

A Django-based REST API serving the BestBefore application, which focuses on food waste reduction and management. This backend provides various services for managing ingredients, dishes, food waste tracking, and other food-related data.

## Tech Stack

- **Framework**: [Django 5.2](https://docs.djangoproject.com/en/5.2/)
- **REST API**: [Django REST Framework 3.16](https://www.django-rest-framework.org/)
- **Database**: SQLite (development), MySQL (production)
- **Authentication**: Django's built-in authentication system
- **Dependencies**: See [requirements.txt](requirements.txt)

## Directory Structure

```
backend/
├── api/                          # Main API application
│   ├── service/                  # Service layer implementations
│   │   ├── ingredient_combiner_service.py  # Ingredient combination logic
│   │   ├── dish_ingre_service.py           # Dish-ingredient relations
│   │   ├── produce_detection_service.py    # Produce detection functionality
│   │   ├── hours_parser_service.py         # Hours parsing utilities
│   │   ├── output_calender_service.py      # Calendar output functions
│   │   └── db_service.py                   # Database service utilities
│   ├── migrations/               # Database migrations
│   ├── tests/                    # Unit tests
│   ├── models.py                 # Database models
│   ├── views.py                  # API endpoints and controllers
│   ├── urls.py                   # URL routing configuration
│   └── serializer.py             # Data serializers
├── bestbefore/                   # Django project settings
│   ├── settings.py               # Project settings
│   ├── urls.py                   # Project URL configuration
│   ├── wsgi.py                   # WSGI configuration
│   └── asgi.py                   # ASGI configuration
├── config/                       # Configuration files
├── venv/                         # Virtual environment (not in version control)
├── .env                          # Environment variables
├── requirements.txt              # Python dependencies
├── manage.py                     # Django management script
└── Dockerfile                    # Docker configuration
```

## Key Features

- **Ingredient Management**: Create, update, and delete ingredients
- **Dish Management**: Manage dishes and their associated ingredients
- **Ingredient Combiner**: Combine ingredients from multiple dishes
- **Produce Detection**: Identify and manage produce items
- **Calendar Integration**: Generate and manage food-related calendar events
- **API Endpoints**: RESTful API endpoints for frontend integration

## Services

### 1. Ingredient Combiner Service
Handles the combination of ingredients from multiple dishes with features:
- Combining ingredients across different dishes
- Scaling ingredients based on serving sizes
- Categorizing ingredients (Meat, Fish, Produce, etc.)
- Unit conversions and quantity aggregation

### 2. Dish Ingredient Service
Manages the relationship between dishes and their ingredients:
- Retrieving ingredients for specific dishes
- Managing dish-ingredient associations
- Ingredient data processing

### 3. Produce Detection Service
Focuses on produce-related functionality:
- Identifying produce items
- Processing produce information
- Expiration date tracking

### 4. Hours Parser Service
Handles time-related data:
- Business hours parsing
- Time format management
- Schedule processing

### 5. Output Calendar Service
Manages calendar-related operations:
- Calendar event creation
- Date-based scheduling
- Expiration reminders

### 6. Database Service
Provides database utilities:
- Database connection management
- Query optimization
- Data model interactions

## Setup Instructions

### Prerequisites
- Python 3.9+
- pip
- Virtual environment (recommended)

### Installation

1. Clone the repository:
   ```bash
   git clone https://your-repository-url/bestbefore.git
   cd bestbefore/backend
   ```

2. Create and activate a virtual environment:
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

4. Set up environment variables by creating a `.env` file in the root directory:
   ```
   DEBUG=True
   SECRET_KEY=your_secret_key
   DATABASE_URL=your_database_url
   ALLOWED_HOSTS=localhost,127.0.0.1
   ```

5. Run migrations:
   ```bash
   python manage.py migrate
   ```

6. Create a superuser (optional):
   ```bash
   python manage.py createsuperuser
   ```

7. Start the development server:
   ```bash
   python manage.py runserver
   ```

The API will be available at `http://localhost:8000/`.

## Development

### Running Tests
```bash
python manage.py test
```

### API Endpoints

The BestBefore backend provides the following API endpoints:

#### Authentication
`POST /api/auth/login/` - User authentication via password

#### Food Storage & Information
`POST /api/storage-advice/` - Get food storage recommendations by food type
`GET /api/food-types/` - List all available food types

#### Produce Detection
`POST /api/detect-produce/` - Identify food items from images

#### Calendar & Reminders
`POST /api/generate_calendar/` - Generate expiration reminder calendar
`GET /api/calendar/<uuid:calendar_id>.ics` - Get iCalendar file for import

#### Food Banks & Community Resources
`GET /api/foodbanks/` - List food banks with location and hours

#### Second Life (Food Repurposing)
`GET /api/second-life/` - Find ways to repurpose food items
`GET /api/second-life/<int:item_id>/` - Get specific repurposing method details

#### Meal Planning & Grocery Lists
`POST /api/search-dishes/` - Generate grocery lists from selected meals
`POST /api/dish-ingredients/` - Get ingredients for a specific dish
`GET /api/signature-dishes/` - List signature dishes with optional cuisine filter

#### Admin Panel
`GET /admin/` - Django admin interface (superuser access only)

## 🔄 Development Workflow

1. Make changes to the models
2. Create migrations: `python manage.py makemigrations`
3. Apply migrations: `python manage.py migrate`
4. Test your changes: `python manage.py test`
5. Run the server: `python manage.py runserver`

## Deployment

### Using Docker

1. Build the Docker image:
   ```bash
   docker build -t react-django-backend .
   ```

2. Run the container:
   ```bash
   docker run -p 8000:8000 react-django-backend
   ```

### Using the Deployment Script

The backend can be deployed using the project's `deploy.sh` script:
```bash
./deploy.sh
```

The script:
- Pulls the latest Docker images
- Stops any existing containers
- Creates a Docker network
- Runs the backend container
- Sets up the proper environment variables

### Environment Variables in Production

For production deployment, ensure to set all environment variables properly, especially:

- `DEBUG=False`
- Secure `DJANGO_SECRET_KEY`
- Proper `DJANGO_ALLOWED_ORIGIN`
- Production database credentials

## 🔒 Security Considerations

- The API uses API key authentication
- CORS is configured to allow only specific origins
- Sensitive data is stored in environment variables, not in code
- Use HTTPS in production environments

## 📚 Learn More

- [Django Documentation](https://docs.djangoproject.com/)
- [Django REST Framework Documentation](https://www.django-rest-framework.org/)
- [Python Documentation](https://docs.python.org/3/)