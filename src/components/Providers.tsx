"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { SessionProvider } from "next-auth/react";
import { FC, ReactNode } from "react";

interface ILayoutProps {
  children: ReactNode;
}

const Providers: FC<ILayoutProps> = ({ children }) => {
  const queryClient = new QueryClient();

  return (
    <QueryClientProvider client={queryClient}>
      <SessionProvider>{children}</SessionProvider>
    </QueryClientProvider>
  );
};

export default Providers;
