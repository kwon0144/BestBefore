![logo.png](https://s3-tp22.s3.ap-southeast-2.amazonaws.com/BestBefore/logo.png)

# BestBefore - Food Management Solution

## 🌐 Live Demo

Visit our live application: [BestBefore - Iteration 2](https://tp22-bestbefore.com/iteration2)

## 📋 Project Overview

BestBefore is a comprehensive food management system designed to help users track their food inventory, reduce waste, and connect with a food network. Our goal is to minimize food waste through smart technology and community engagement.

### Key Features

- **Storage Assistant**: Monitor food expiration dates and receive optimal storage recommendations
- **Eco-Grocery**: Plan eco-friendly shopping with waste reduction in mind
- **Second Life**: Find creative ways to repurpose food that would otherwise be wasted
- **Food Network**: Connect with local food banks and community sharing initiatives
- **Smart Detection**: Identify food items using computer vision technology
- **Calendar Integration**: Generate food usage calendars with expiration reminders

## 🏗️ Architecture

BestBefore follows a modern client-server architecture:

- **Frontend**: A Next.js application providing a responsive and intuitive user interface
- **Backend**: A Django REST API service handling data processing and business logic
- **Database**: SQLite for development, MySQL for production environments
- **AI Integration**: Claude API for food detection and smart recommendations

## 🔧 Tech Stack

### Frontend
- **Framework**: Next.js 15 with React 19
- **Styling**: Tailwind CSS for responsive design
- **UI Components**: Material UI, HeroUI
- **State Management**: Zustand for efficient state handling
- **Maps Integration**: Google Maps API for location-based services
- **Language**: TypeScript for type safety

### Backend
- **Framework**: Django 5.2 with Django REST Framework 3.16
- **Database**: SQLite (development), MySQL (production)
- **Computer Vision**: Claude API integration for food detection
- **Authentication**: Token-based authentication
- **Calendar**: iCalendar generation for reminders
- **Language**: Python 3.11

## 🚀 Getting Started

To set up the full BestBefore project, follow these steps to configure both the frontend and backend components.

### Prerequisites

- Node.js 20.x or higher
- Python 3.11 or higher
- MySQL (for production) or SQLite (for development)
- Git

### Installation

1. Clone the repository
```bash
git clone <repository-url>
cd BestBefore
```

2. Set up the Backend
```bash
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Configure environment variables
# Create .env file with the following variables:
# DEBUG=True
# SECRET_KEY=your_secret_key
# DATABASE_URL=your_database_url
# ALLOWED_HOSTS=localhost,127.0.0.1
# CLAUDE_API_KEY=your_claude_api_key

# Apply migrations
python manage.py migrate

# Start the backend server
python manage.py runserver
```

3. Set up the Frontend
```bash
cd ../frontend

# Install dependencies
npm install

# Configure environment variables
# Create .env file with the following variables:
# NEXT_PUBLIC_API_URL=http://localhost:8000
# NEXT_PUBLIC_API_KEY=your_google_maps_api_key
# NEXT_PUBLIC_MAP_ID=your_map_id

# Start the frontend development server
npm run dev
```

4. Access the application
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:8000
   - API Documentation: http://localhost:8000/api-docs/

## 🔐 Environment Configuration

Both frontend and backend require environment variables to be set:

- **Frontend**: `.env` file in the `frontend/` directory
- **Backend**: `.env` file in the `backend/` directory

See the respective README files for detailed environment variable requirements.

## 📝 Development Workflow

### Backend Development

1. Make model changes
2. Create migrations: `python manage.py makemigrations`
3. Apply migrations: `python manage.py migrate`
4. Test your changes: `python manage.py test`
5. Run the server: `python manage.py runserver`

### Frontend Development

1. Make component or page changes
2. Check for TypeScript errors: `npm run type-check`
3. Verify linting: `npm run lint`
4. Run the development server: `npm run dev`

For detailed development workflows, refer to the README files in the respective directories:

- [Frontend Development](frontend/README.md)
- [Backend Development](backend/README.md)

## 🚢 Deployment

BestBefore can be deployed using Docker containers for both frontend and backend.

### Docker Deployment

1. Build and deploy the backend:
```bash
cd backend
docker build -t bestbefore-backend .
docker run -p 8000:8000 bestbefore-backend
```

2. Build and deploy the frontend:
```bash
cd frontend
docker build -t bestbefore-frontend .
docker run -p 3000:3000 bestbefore-frontend
```

### Automated Deployment

For a quick deployment, use the provided script that handles both frontend and backend:

```bash
chmod +x deploy.sh
./deploy.sh
```

The script:
- Pulls the latest Docker images
- Stops any existing containers
- Creates a Docker network
- Runs both containers with proper environment variables

## 📚 Documentation

- [Frontend Documentation](frontend/README.md)
- [Backend Documentation](backend/README.md)
- [API Documentation](backend/api-docs.md)

## 👥 Team

- [Adam Zhao](https://github.com/Adam8208)
- Belle Thammapatcharakorn
- Francis Ying
- [Kinsey Wong](https://github.com/kwon0144)
- [Richard Xiong](https://github.com/LovHan)