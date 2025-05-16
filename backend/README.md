# BestBefore Backend

This is the backend application for the BestBefore project, built with Django and Django REST Framework.

## 📋 Project Overview

The BestBefore backend provides API services for the frontend application, enabling:

- Food inventory management
- Storage planning assistance
- Food network connectivity
- Authentication and data persistence

## 🔧 Tech Stack

- **Framework**: [Django 5.2](https://www.djangoproject.com/)
- **API Framework**: [Django REST Framework 3.16](https://www.django-rest-framework.org/)
- **Database**: MySQL (with SQLite for development)
- **Authentication**: API Key based authentication
- **CORS**: Django CORS Headers for secure cross-origin requests
- **Runtime**: Python 3.11
- **AI Integration**: Claude API integration for smart features

## 🚀 Getting Started

### Prerequisites

- Python 3.11 or higher
- MySQL (for production) or SQLite (for development)
- Virtual environment tool (virtualenv or venv)

### Installation

1. Clone the repository
```bash
git clone <repository-url>
cd backend
```

2. Create and activate a virtual environment
```bash
python -m venv venv
# On Windows
venv\Scripts\activate
# On macOS/Linux
source venv/bin/activate
```

3. Install dependencies
```bash
pip install -r requirements.txt
```

4. Environment Setup
Create a `.env` file in the root directory with the following variables:
```
# Django settings
DEBUG=True
DJANGO_SECRET_KEY=your_secret_key
DJANGO_API_KEY=your_api_key
DJANGO_ALLOWED_ORIGIN=http://localhost:3000

# Database settings (for MySQL)
DB_NAME=your_db_name
DB_USER=your_db_user
DB_PASSWORD=your_db_password
DB_HOST=127.0.0.1
DB_PORT=3307

# AI Integration
CLAUDE_API_KEY=your_claude_api_key

# Security
SESSION_SECRET=your_session_secret
```

5. Apply migrations
```bash
python manage.py migrate
```

6. Run the development server
```bash
python manage.py runserver
```

The API will be available at http://localhost:8000/

## 📝 Available Commands

- `python manage.py runserver` - Start the development server
- `python manage.py migrate` - Apply database migrations
- `python manage.py makemigrations` - Create new migrations based on model changes
- `python manage.py createsuperuser` - Create an admin user
- `python manage.py test` - Run tests

## 📂 Project Structure

```
backend/
├── api/                       # Main application directory
│   ├── migrations/            # Database migrations
│   ├── service/               # Service layer
│   ├── models.py              # Database models
│   ├── serializer.py          # JSON serializers
│   ├── views.py               # API endpoint handlers
│   ├── urls.py                # URL routing
│   ├── produce_detection.py   # Food detection functionality
│   └── output_calender.py     # Calendar generation
├── config/                    # Django project settings
│   ├── settings.py            # Main Django configuration
│   ├── urls.py                # Root URL routing
│   ├── wsgi.py                # WSGI configuration 
│   └── asgi.py                # ASGI configuration
├── bestbefore/                # Project-specific settings
├── venv/                      # Virtual environment
├── .env                       # Environment variables
├── manage.py                  # Django management script
├── requirements.txt           # Python dependencies
└── Dockerfile                 # Docker configuration
```

## 🔌 API Endpoints

The backend provides the following key API endpoints:

- `GET /api/health/` - Health check endpoint
- `POST /api/items/` - Get and manage food items
- `POST /api/storage/` - Storage management
- `POST /api/identify/` - Food identification service
- `POST /api/calendar/` - Calendar generation

All API requests require an API key to be sent in the header:
```
X-API-Key: your_api_key_here
```

## 🔄 Development Workflow

1. Make changes to the models
2. Create migrations: `python manage.py makemigrations`
3. Apply migrations: `python manage.py migrate`
4. Test your changes: `python manage.py test`
5. Run the server: `python manage.py runserver`

## 🚢 Deployment

### Docker Deployment

The project includes a Dockerfile for containerized deployment:

```bash
# Build the Docker image
docker build -t bestbefore-backend .

# Run the container
docker run -p 8000:8000 bestbefore-backend
```

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