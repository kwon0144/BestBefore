// app/providers.tsx
"use client";

import { useRouter } from "next/navigation";
import { HeroUIProvider } from "@heroui/react";
import { ThemeProvider as NextThemesProvider } from "next-themes";
import { createTheme } from '@mui/material/styles';
import { green, lightGreen, amber } from '@mui/material/colors';
import { ThemeProvider } from '@mui/material/styles';

// Only if using TypeScript
declare module "@react-types/shared" {
  interface RouterConfig {
    routerOptions: NonNullable<
      Parameters<ReturnType<typeof useRouter>["push"]>[1]
    >;
  }
}

const muiTheme = createTheme({
  palette: {
    primary: {
      light: lightGreen[500],
      main: green[500],
      dark: green[800],
      contrastText: '#FFFFFF',
    },
    secondary: amber,
  },
  typography: {
    fontFamily: 'var(--font-poppins)',
    button: {
      textTransform: 'none',
      fontSize: '1rem',
      fontWeight: 500,
    },
  }
});



export function Providers({ children }: { children: React.ReactNode }) {
  const router = useRouter();

  return (
    <ThemeProvider theme={muiTheme}>
      <HeroUIProvider navigate={router.push}>
        <NextThemesProvider attribute="class" defaultTheme="light">
          {children}
        </NextThemesProvider>
      </HeroUIProvider>
    </ThemeProvider>
  );
}
