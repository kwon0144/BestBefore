# BestBefore Frontend

This is the frontend application for the BestBefore project, built with Next.js 15 and React 19.

## 📋 Project Overview

BestBefore is an application designed to help users manage food inventory, reduce waste, and connect with a food network. The frontend provides intuitive interfaces for:

- Storage assistant functionality
- Food network connections
- Interactive maps using Google Maps API
- User-friendly inventory management

## 🔧 Tech Stack

- **Framework**: [Next.js 15](https://nextjs.org/)
- **UI Library**: [React 19](https://react.dev/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **UI Components**: Material UI, HeroUI
- **Maps**: Google Maps API integration
- **Animation**: Framer Motion
- **Theme**: Next Themes (light/dark mode support)
- **TypeScript**: Type safety throughout the application

## 🚀 Getting Started

### Prerequisites

- Node.js 20.x or higher
- npm or yarn package manager

### Installation

1. Clone the repository
```bash
git clone <repository-url>
cd frontend
```

2. Install dependencies
```bash
npm install
# or
yarn install
```

3. Environment Setup
Create a `.env` file in the root directory with the following variables:
```
NEXT_PUBLIC_API_KEY=your_api_key
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_google_maps_api_key
NEXT_PUBLIC_MAP_ID=your_map_id
```

4. Start the development server
```bash
npm run dev
# or
yarn dev
```

5. Open [http://localhost:3000](http://localhost:3000) with your browser to see the application.

## 📝 Available Scripts

- `npm run dev` - Starts the development server
- `npm run build` - Builds the application for production
- `npm run start` - Starts the production server
- `npm run lint` - Runs ESLint to check code quality

## 📂 Project Structure

```
frontend/
├── src/
│   ├── app/                   # Next.js App Router
│   │   ├── (components)/      # Shared components
│   │   ├── api/               # API route handlers
│   │   ├── food-network/      # Food network features
│   │   ├── storage-assistant/ # Storage assistant features
│   │   ├── store/             # Store management features
│   │   ├── test/              # Test pages
│   │   ├── layout.tsx         # Root layout
│   │   ├── page.tsx           # Home page
│   │   └── providers.tsx      # App providers
│   ├── hooks/                 # Custom React hooks
│   ├── config/                # Configuration files
│   └── utils/                 # Utility functions
├── public/                    # Static assets
├── .env                       # Environment variables
├── next.config.ts             # Next.js configuration
├── tailwind.config.js         # Tailwind CSS configuration
├── package.json               # Dependencies and scripts
└── Dockerfile                 # Docker configuration
```

## 🔄 Development Workflow

1. Make changes to the code
2. The page automatically updates as you edit files
3. Use the built-in linting tools to ensure code quality:
   ```bash
   npm run lint
   ```

## 🚢 Deployment

### Docker Deployment

The project includes a Dockerfile for containerized deployment:

```bash
# Build the Docker image
docker build -t bestbefore-frontend \
  --build-arg NEXT_PUBLIC_API_URL=your_api_url \
  --build-arg NEXT_PUBLIC_API_KEY=your_api_key \
  --build-arg NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_google_maps_api_key \
  --build-arg NEXT_PUBLIC_MAP_ID=your_map_id \
  .

# Run the container
docker run -p 3000:3000 bestbefore-frontend
```

### Automated Deployment

Use the included `deploy.sh` script to automate the deployment process:

```bash
chmod +x deploy.sh
./deploy.sh
```

## 📚 Learn More

- [Next.js Documentation](https://nextjs.org/docs)
- [React Documentation](https://react.dev/learn)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)


