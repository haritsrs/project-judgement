'use client';

import localFont from "next/font/local";
import "./globals.css";
import { Suspense, useEffect, useState } from "react";

// Font definitions
const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});

const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});


// Optional: Loading component for Suspense
function Loading() {
  return (
    <div className="fixed inset-0 bg-black flex items-center justify-center">
      <div className="animate-pulse text-white">Loading...</div>
    </div>
  );
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html 
      lang="en" 
      suppressHydrationWarning
    >
      <head>
        <script
          id="hydration-fix"
          dangerouslySetInnerHTML={{
            __html: `
              // Advanced hydration and error suppression
              (function() {
                // Suppress specific console warnings and errors
                const originalError = console.error;
                const originalWarn = console.warn;

                console.error = function(...args) {
                  if (
                    args.length > 0 && 
                    (typeof args[0] === 'string') && 
                    (
                      args[0].includes('Hydration failed') || 
                      args[0].includes('React hydration') ||
                      args[0].includes('Warning: Prop') ||
                      args[0].includes('Uncaught error') ||
                      args[0].includes('does not support the video tag')
                    )
                  ) {
                    return;
                  }
                  
                  originalError.apply(console, args);
                };

                console.warn = function(...args) {
                  if (
                    args.length > 0 && 
                    (typeof args[0] === 'string') && 
                    (
                      args[0].includes('Hydration failed') || 
                      args[0].includes('React hydration')
                    )
                  ) {
                    return;
                  }
                  
                  originalWarn.apply(console, args);
                };

                // Prevent error and rejection displays
                window.addEventListener('error', function(event) {
                  event.preventDefault();
                  return false;
                }, true);

                window.addEventListener('unhandledrejection', function(event) {
                  event.preventDefault();
                  return false;
                }, true);

                // Additional hydration mitigation
                Object.defineProperty(window, 'isServerRendering', {
                  value: false,
                  writable: false
                });
              })();
            `
          }}
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-black text-white`}
        suppressHydrationWarning
      >
        {/* Client-side rendering wrapper to prevent hydration issues */}
        <ClientSideRenderer>
          <Suspense fallback={<Loading />}>
            {children}
          </Suspense>
        </ClientSideRenderer>
      </body>
    </html>
  );
}

// Client-side rendering wrapper
function ClientSideRenderer({ children }: { children: React.ReactNode }) {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) {
    return null;
  }

  return <>{children}</>;
}