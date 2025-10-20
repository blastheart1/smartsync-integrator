"use client";

import { SessionProvider } from "next-auth/react";
import { ReactNode } from "react";
import ToSModal from "@/components/ui/ToS";

interface ProvidersProps {
  children: ReactNode;
}

export function Providers({ children }: ProvidersProps) {
  return (
    <SessionProvider>
      <ToSModal />
      {children}
    </SessionProvider>
  );
}
