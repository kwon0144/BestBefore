![logo.png](https://s3-tp22.s3.ap-southeast-2.amazonaws.com/BestBefore/logo.png)

## 📋 Project Overview

BestBefore is a comprehensive food management system designed to help users track their food inventory and reduce waste. 

Visit our live application: [https://tp22-bestbefore.com](https://tp22-bestbefore.com)

Password: tp22-BestBefore


## 🌟 Key Features

- **Storage Assistant**: Monitor food expiration dates and receive optimal storage recommendations
- **Smart Detection**: Identify food items using computer vision technology
- **Calendar Integration**: Generate food usage calendars with expiration reminders
- **Eco-Grocery**: Generate eco-friendly shopping list with waste reduction in mind
- **Second Life**: Find creative ways to repurpose food that would otherwise be wasted
- **Food Network**: Connect with local food banks and community sharing initiatives
- **Waste Game**: Learn to sort food waste correctly to Food Bank, Green Bin and DIY through fun gameplay.
- **Food Waste Impact**: Provide data insight about food waste impact to ecnonomic and envoirnement.

## 🔧 Tech Stack

### Frontend
- **Framework**: Next.js 15 with React 19
- **Styling**: Tailwind CSS for responsive design
- **UI Components**: Material UI, HeroUI
- **State Management**: Zustand for efficient state handling
- **Maps Integration**: Google Maps API for location-based services
- **Data Visualisation**: D3.js for interactive visualisation
- **Language**: TypeScript for type safety

### Backend
- **Framework**: Django 5.2 with Django REST Framework 3.16
- **Database**: SQLite (development), MySQL (production)
- **Computer Vision**: Claude API integration for food detection
- **Language**: Python 3.11

## 🚀 Getting Started & Development Workflow

This project consists of a **Next.js frontend** and a **Django backend**, deployed on AWS with CI/CD pipelines and secure architecture.

To set up the development environment and follow the proper development workflow, please refer to the setup guides in each component:

- [Frontend Documentation](frontend/README.md)
- [Backend Documentation](backend/README.md)
- [API Documentation](backend/api-docs.md)

### Local Development URLs

- Frontend: http://localhost:3000  
- Backend API: http://localhost:8000  
- API Docs: http://localhost:8000/api-docs/

### Development Guidelines

1. Create a feature branch from develop (`git checkout -b feature/amazing-feature`)
2. Commit your changes (`git commit -m 'Add some amazing feature'`)
3. Push to the branch (`git push origin feature/amazing-feature`)
4. Open a Pull Request to merge into the develop branch

## 🏗️ Architecture

The BestBefore project follows follows a modern client-server architecture:

- **Frontend**: A Next.js application providing the user interface
- **Backend**: A Django REST API service managing data and business logic
- **Database**: SQLite database (development) / MySQL (production)

This diagram illustrates the overall architecture of the **BestBefore** web application deployed on AWS Cloud. The system is built using modern DevOps practices, secure networking, and a scalable web application framework.

![BestBefore-SystemDiagram](https://github.com/user-attachments/assets/8fc64b92-4531-417c-8245-0c4fdfb961df)

### 📦 Key Components:

- **Frontend (React)**
  - Located in the EC2 instance (public subnet).
  - Handles the user interface, sending requests to the backend and rendering returned data.

- **Backend (Django)**
  - Also hosted on the EC2 instance.
  - Composed of:
    - **Views**: Handles incoming HTTP requests.
    - **Models**: Communicates with the database to fetch/store data.
    - **Templates**: Pass data from Django to the React interface for rendering.

- **Web Server (Nginx)**
  - Routes requests to the Django backend.
  - Manages HTTPS encryption using **Let’s Encrypt**.
  - Delivers static and dynamic content securely.

- **Database (Amazon RDS – MySQL)**
  - Resides in a **private subnet** for enhanced security.
  - Accessed through an **SSH Tunnel** to protect database credentials and traffic.

- **CI/CD Pipeline (GitHub Actions)**
  - Automatically triggers on code changes.
  - Builds, tests, and pushes Docker images to DockerHub.
  - Deploys updates to EC2 using Docker for continuous integration and delivery.

- **IAM Server**
  - Controls access and manages permissions across all AWS services used in the architecture.

- **Data Import**
  - Cleaned CSV files can be securely imported into the database through the backend.

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
  --build-arg NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_google_maps_api_key \
  --build-arg NEXT_PUBLIC_MAP_ID=your_map_id \
  .
docker run -p 3000:3000 bestbefore-frontend
```

### Automated Deployment

For a quick deployment, use the provided script that handles both frontend and backend:

```bash
# From the frontend directory
chmod +x deploy.sh
./deploy.sh
```

## 👥 Team

- [Adam Zhao](https://github.com/Adam8208)
- Belle Thammapatcharakorn
- Francis Ying
- [Kinsey Wong](https://github.com/kwon0144)
- [Richard Xiong](https://github.com/LovHan) 
