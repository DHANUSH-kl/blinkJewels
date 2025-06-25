// ✅ src/app/layout.tsx
"use client";


import "./globals.css";
import { ReactNode } from "react";
import { Toaster } from "react-hot-toast";

import { SessionProvider } from "next-auth/react";

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <SessionProvider>
          <Toaster position="top-right" />
          {children}
        </SessionProvider>
      </body>
    </html>
  );
}
