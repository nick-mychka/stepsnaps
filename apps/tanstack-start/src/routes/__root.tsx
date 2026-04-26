/// <reference types="vite/client" />
import type { QueryClient } from "@tanstack/react-query";
import type { TRPCOptionsProxy } from "@trpc/tanstack-react-query";
import type * as React from "react";
import {
  createRootRouteWithContext,
  HeadContent,
  Outlet,
  Scripts,
} from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";

import type { AppRouter } from "@stepsnaps/api";
import { ThemeProvider } from "@stepsnaps/ui/theme";
import { Toaster } from "@stepsnaps/ui/toast";
import { TooltipProvider } from "@stepsnaps/ui/tooltip";

import appCss from "~/styles.css?url";

export const Route = createRootRouteWithContext<{
  queryClient: QueryClient;
  trpc: TRPCOptionsProxy<AppRouter>;
}>()({
  head: () => ({
    links: [{ rel: "stylesheet", href: appCss }],
  }),
  component: RootComponent,
});

function RootComponent() {
  return (
    <RootDocument>
      <Outlet />
    </RootDocument>
  );
}

function RootDocument({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <html lang="en" suppressHydrationWarning>
        <head>
          <HeadContent />
        </head>
        <body className="bg-muted dark:bg-background text-foreground min-h-screen font-sans antialiased">
          <TooltipProvider delayDuration={200}>{children}</TooltipProvider>
          <Toaster />
          <TanStackRouterDevtools position="bottom-right" />
          <Scripts />
        </body>
      </html>
    </ThemeProvider>
  );
}
