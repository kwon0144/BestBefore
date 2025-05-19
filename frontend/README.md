# BestBefore Frontend
The frontend of BestBefore is a modern web application built with Next.js 15, React 19, and TypeScript. It provides a user interface for managing ingredients, dishes, and other food-related data with features for sustainable food management, eco-grocery shopping, and food impact tracking.

## 🔧 Technology Stack
- **Framework**: Next.js 15.2.4
- **UI Library**: React 19.0.0
- **Styling**: Tailwind CSS 3.4.17
- **State Management**: Zustand 5.0.3
- **Maps Integration**: Google Maps API
- **Data Visualization**: D3.js, ECharts
- **Animations**: Framer Motion
- **HTTP Client**: Axios
- **UI Components**: MaterialUI, HeroUI
- **Icons**: FontAwesome, Iconify, Lucide React
- **Theming**: Next-themes (light/dark mode support)

## 📁 Directory Structure
```
frontend/
├── src/                  # Main application code
│   ├── app/              # Next.js App Router pages and components
│   │   ├── (components)/ # Shared components for pages
│   │   ├── eco-grocery/
│   │   ├── food-impact/
│   │   ├── food-network/
│   │   ├── game/
│   │   ├── login/
│   │   ├── second-life/
│   │   ├── storage-assistant/
│   │   └── ...
│   ├── services/         # Service layer for API communication
│   ├── store/            # Zustand state management
│   ├── config/           # Application configuration
│   ├── middleware.ts     # Next.js middleware
├── public/               # Static assets
├── .next/                # Next.js build output
```

## 🔐 Environment Variables
The application uses the following environment variables:
- `NEXT_PUBLIC_API_URL`: Backend API URL
- `NEXT_PUBLIC_API_KEY`: API key for authentication
- `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY`: Google Maps API key
- `NEXT_PUBLIC_MAP_ID`: Google Maps Map ID

## 🚀 Getting Started

### Prerequisites
- Node.js 20 or higher
- npm or yarn package manager

### Installation
1. Install dependencies:
```bash
npm install
# or
yarn install
```

2. Create a `.env.local` file with the required environment variables

3. Start the development server:
```bash
npm run dev
# or
yarn dev
```

5. Open [http://localhost:3000](http://localhost:3000) with your browser to see the application

## 🖇️ Available Scripts
- `npm run dev`: Start the development server
- `npm run build`: Build the application for production
- `npm run start`: Start the production server
- `npm run lint`: Run ESLint to check code quality

## 📝 Development Workflow
1. Make component or page changes
2. Check for TypeScript errors: `npm run type-check`
3. Verify linting: `npm run lint`
4. Run the development server: `npm run dev`

## 🚢 Deployment
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

## 🔗 Connection to Backend
The frontend communicates with the Django backend using REST API calls. 

See the [Backend Documentation](backend/README.md) for more details on available endpoints.

## 📚 Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs)
- [Learn Next.js](https://nextjs.org/learn)
