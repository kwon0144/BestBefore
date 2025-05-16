# BestBefore Frontend

A modern Next.js application focused on food waste reduction and management. This frontend provides interfaces for multiple services including food storage assistance, eco-friendly grocery shopping, second life for food, and food network.

## Tech Stack

- **Framework**: [Next.js 15](https://nextjs.org/) with React 19
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **UI Components**: Material UI, HeroUI
- **State Management**: [Zustand](https://github.com/pmndrs/zustand)
- **Maps Integration**: Google Maps API
- **TypeScript**: For type safety and better developer experience

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm, yarn, or pnpm

### Installation

1. Clone the repository
2. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```
3. Install dependencies:
   ```bash
   npm install
   # or
   yarn
   # or
   pnpm install
   ```
4. Create a `.env` file based on the provided example:
   ```
   NEXT_PUBLIC_API_URL=http://localhost:8000
   NEXT_PUBLIC_API_KEY=your_google_maps_api_key
   ```

### Development

Run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to see the application.

## Project Structure

```
frontend/
├── src/
│   ├── app/               # Next.js App Router
│   │   ├── (components)/  # Shared components
│   │   ├── api/           # API route handlers
│   │   ├── eco-grocery/   # Eco-friendly grocery feature
│   │   ├── food-network/  # Food network feature
│   │   ├── login/         # Authentication
│   │   ├── second-life/   # Second life for food feature
│   │   ├── storage-assistant/ # Food storage assistant
│   │   ├── store/         # App-specific state
│   │   ├── globals.css    # Global styles
│   │   ├── layout.tsx     # Root layout
│   │   ├── page.tsx       # Home page
│   │   └── providers.tsx  # Context providers
│   ├── config/            # Configuration files
│   ├── hooks/             # Custom React hooks
│   ├── store/             # Global state management 
│   ├── utils/             # Utility functions
│   └── middleware.ts      # Next.js middleware
├── public/                # Static assets
├── .env                   # Environment variables
├── next.config.ts         # Next.js configuration
├── tailwind.config.js     # Tailwind CSS configuration
└── tsconfig.json          # TypeScript configuration
```

## Features

- **Food Storage Assistant**: Helps track and manage food items
- **Eco-Grocery**: Eco-friendly grocery shopping guide
- **Second Life for Food**: Find creative uses for food about to expire
- **Food Network**: Connect with others to share/exchange food

## Deployment

The application is containerized using Docker and can be deployed using the included `deploy.sh` script.

### With Docker

1. Build the Docker image:
   ```bash
   docker build -t react-django-frontend .
   ```

2. Run the container:
   ```bash
   docker run -p 3000:3000 react-django-frontend
   ```

### Automated Deployment

Run the deployment script:
```bash
./deploy.sh
```

This script:
- Pulls the latest Docker images
- Stops any existing containers
- Creates a Docker network
- Runs the frontend and backend containers
- Sets up the proper environment variables

## Learn More

To learn more about the technologies used:

- [Next.js Documentation](https://nextjs.org/docs)
- [React Documentation](https://react.dev/)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [Zustand State Management](https://docs.pmnd.rs/zustand/getting-started/introduction)
