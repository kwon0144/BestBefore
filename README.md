# BestBefore

![BestBefore Logo](logo.png)

## 📋 Project Overview

BestBefore is a comprehensive food management system designed to help users track their food inventory, reduce waste, and connect with a food network. This application enables users to:

- Monitor food expiration dates
- Plan storage efficiently
- Find nearby food sharing opportunities
- Identify foods using smart detection
- Generate food usage calendars

## 🏗️ Architecture

The BestBefore project follows a client-server architecture with two main components:

- **Frontend**: A Next.js application providing the user interface
- **Backend**: A Django REST API service managing data and business logic

## 🔧 Tech Stack

### Frontend
- Next.js 15 / React 19
- Tailwind CSS
- Google Maps integration
- TypeScript

### Backend
- Django 5.2 / Django REST Framework
- MySQL database
- Claude API integration
- Python 3.11

## 🚀 Getting Started

To set up the full BestBefore project, you'll need to configure both the frontend and backend components.

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
# Create .env file based on instructions in backend/README.md

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
# Create .env file based on instructions in frontend/README.md

# Start the frontend development server
npm run dev
```

4. Access the application
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:8000

## 📝 Development Workflow

For detailed development workflows, refer to the README files in the respective directories:

- [Frontend Development](frontend/README.md)
- [Backend Development](backend/README.md)

### Typical Workflow

1. Make backend changes (models, views, etc.) in the `backend/` directory
2. Update frontend components and pages in the `frontend/` directory
3. Test API endpoints with the backend running
4. View UI changes with the frontend running
5. Commit changes to version control

## 🚢 Deployment

The BestBefore application can be deployed using Docker containers for both frontend and backend.

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
docker build -t bestbefore-frontend \
  --build-arg NEXT_PUBLIC_API_URL=your_api_url \
  --build-arg NEXT_PUBLIC_API_KEY=your_api_key \
  --build-arg NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_google_maps_api_key \
  --build-arg NEXT_PUBLIC_MAP_ID=your_map_id \
  .
docker run -p 3000:3000 bestbefore-frontend
```

### Automated Deployment

You can use the deployment scripts provided in each component:

```bash
# From the frontend directory
chmod +x deploy.sh
./deploy.sh
```

## 🔐 Environment Configuration

Both frontend and backend require environment variables to be set:

- **Frontend**: `.env` file in the `frontend/` directory
- **Backend**: `.env` file in the `backend/` directory

See the respective README files for detailed environment variable requirements.

## 🧪 Testing

### Backend Tests
```bash
cd backend
python manage.py test
```

### Frontend Tests
```bash
cd frontend
npm run test
```

## 📚 Documentation

- [Frontend Documentation](frontend/README.md)
- [Backend Documentation](backend/README.md)
- [API Documentation](backend/api-docs.md)

### Development Guidelines

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 👥 Team

- [Adam Zhao](https://github.com/Adam8208)
- Belle Thammapatcharakorn
- Francis Ying
- [Kinsey Wong](https://github.com/kwon0144)
- [Richard Xiong](https://github.com/LovHan)
