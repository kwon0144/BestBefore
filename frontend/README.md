# BestBefore Frontend

## Overview
The frontend of BestBefore is a modern web application built with Next.js 15, React 19, and TypeScript. It provides a user interface for managing ingredients, dishes, and other food-related data with features for sustainable food management, eco-grocery shopping, and food impact tracking.

## Features
- **Food Network Management**: Connect with local food suppliers
- **Storage Assistant**: Manage and track food inventory
- **Second Life**: Repurpose food waste
- **Food Impact Tracker**: Monitor environmental impacts of food choices
- **Eco-Grocery**: Support sustainable shopping habits
- **Interactive Game**: Educational component on food sustainability

## Technology Stack
- **Framework**: Next.js 15.2.4
- **UI Library**: React 19.0.0
- **Styling**: Tailwind CSS 3.4.17, HeroUI
- **State Management**: Zustand 5.0.3
- **Maps Integration**: Google Maps API
- **Data Visualization**: D3.js, ECharts
- **Animations**: Framer Motion
- **HTTP Client**: Axios
- **UI Components**: Material UI 7.0.2
- **Icons**: FontAwesome, Iconify, Lucide React
- **Theming**: Next-themes (light/dark mode support)
- **Notifications**: React Hot Toast

## Directory Structure
```
frontend/
├── src/                  # Main application code
│   ├── app/              # Next.js App Router pages and components
│   │   ├── login/
│   │   ├── food-network/
│   │   ├── storage-assistant/
│   │   ├── second-life/
│   │   ├── food-impact/
│   │   ├── eco-grocery/
│   │   ├── game/
│   │   ├── (components)/ # Shared components for pages
│   │   ├── api/          # API route handlers
│   │   └── ...
│   ├── services/         # Service layer for API communication
│   ├── store/            # Zustand state management
│   ├── config/           # Application configuration
│   ├── middleware.ts     # Next.js middleware
├── public/               # Static assets
├── .next/                # Next.js build output
```

## Environment Variables
The application uses the following environment variables:
- `NEXT_PUBLIC_API_URL`: Backend API URL
- `NEXT_PUBLIC_API_KEY`: API key for authentication
- `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY`: Google Maps API key
- `NEXT_PUBLIC_MAP_ID`: Google Maps Map ID
- `NEXT_PUBLIC_BRANCH_NAME`: Current branch name for deployment
- `NEXT_PUBLIC_SITE_PASSWORD`: Password protection for site (if used)

## Getting Started

### Prerequisites
- Node.js 20 or higher
- npm or yarn package manager

### Installation
1. Clone the repository
2. Install dependencies:
```bash
npm install
# or
yarn install
```

3. Create a `.env.local` file with the required environment variables

4. Start the development server:
```bash
npm run dev
# or
yarn dev
```

5. Open [http://localhost:3000](http://localhost:3000) with your browser to see the application

## Available Scripts
- `npm run dev`: Start the development server
- `npm run build`: Build the application for production
- `npm run start`: Start the production server
- `npm run lint`: Run ESLint to check code quality

## Deployment
The application can be deployed using Docker:

1. Build the Docker image:
```bash
docker build -t bestbefore-frontend \
  --build-arg NEXT_PUBLIC_API_URL=<your-api-url> \
  --build-arg NEXT_PUBLIC_API_KEY=<your-api-key> \
  --build-arg NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=<your-google-maps-key> \
  --build-arg NEXT_PUBLIC_MAP_ID=<your-map-id> \
  .
```

2. Run the container:
```bash
docker run -p 3000:3000 bestbefore-frontend
```

Alternatively, use the included `deploy.sh` script for deploying both frontend and backend containers together.

## Connection to Backend
The frontend communicates with the Django backend using REST API calls. See the backend documentation for more details on available endpoints.

## Theme Customization
The application uses a customized Tailwind CSS configuration with BestBefore's color scheme:
- Primary: `#0d9488` (teal)
- Light green: `#78bba2`
- Dark green: `#2d5a4b`
- Background: `#f5f6f2`

## Key Features
- Ingredient management
- Dish creation and management
- Recipe viewing
- Meal planning
- Shopping list generation

## Technologies Used
- Next.js
- React
- TypeScript
- Tailwind CSS
- SWR for data fetching

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs)
- [Learn Next.js](https://nextjs.org/learn)
