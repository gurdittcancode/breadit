"use client";

import { SessionProvider } from "next-auth/react";
import { FC, ReactNode } from "react";

interface ILayoutProps {
  children: ReactNode;
}

const Providers: FC<ILayoutProps> = ({ children }) => {
  return <SessionProvider>{children}</SessionProvider>;
};

export default Providers;
