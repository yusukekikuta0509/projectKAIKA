// lib/providers.tsx
'use client';
import { ChakraProvider, ColorModeScript } from '@chakra-ui/react';
import { kaikaTheme } from '@/theme/kaika';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ChakraProvider theme={kaikaTheme}>
      {/* ensures “dark” renders identically on server & client */}
      <ColorModeScript initialColorMode={kaikaTheme.config.initialColorMode} />
      {children}
    </ChakraProvider>
  );
}
