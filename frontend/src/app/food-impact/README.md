# Food Impact Module

This module provides visualizations and information about food waste impacts.

## Folder Structure

```
food-impact/
├── interfaces/          # TypeScript interfaces
│   ├── AnimationVariants.ts  # Animation-related interfaces
│   ├── Components.ts    # Component prop interfaces
│   ├── FoodWaste.ts     # Food waste data interfaces
│   └── index.ts         # Re-exports all interfaces
├── hooks/               # Custom React hooks
│   ├── useFoodWasteData.ts  # Hook for fetching food waste data
│   └── index.ts         # Re-exports all hooks
├── AustraliaWaste/      # Australia food waste component
├── CostOfFoodWaste/     # Cost visualization component
├── EconomicLoss/        # Economic impact component
├── EconomicWasteViz/    # Economic waste visualization
├── EmissionsChart/      # Emissions data visualization
├── EnvironmentalImpact/ # Environmental impact component
├── GlobalImpact/        # Global food waste impact component
├── ProgressNav/         # Navigation progress component
├── Slogan/              # Slogan display component
├── Sources/             # Citation sources component
├── SupplyChain/         # Supply chain visualization
└── page.tsx             # Main page component
```

## Usage

The main page component (`page.tsx`) combines all the subcomponents to create a complete food impact visualization experience. The interfaces and hooks are organized in separate folders for better code organization and reusability.

To add a new component:
1. Create a new folder with your component
2. Add relevant interfaces to the interfaces directory
3. Add any custom hooks to the hooks directory
4. Import and use in the main page component 