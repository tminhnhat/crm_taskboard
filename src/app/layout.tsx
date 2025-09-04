import type { Metadata } from "next";
import { ThemeProvider } from "@/theme/ThemeProvider";
import "./globals.css";

export const metadata: Metadata = {
  title: "CRM TaskBoard - Modern Management System",
  description: "A modern CRM and task management application with Material-UI design",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        <ThemeProvider>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
