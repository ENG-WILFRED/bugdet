import { UserProvider } from "@/app/UserContext";
import { ReactNode } from "react";
import "./globals.css";


export const metadata = {
  title: "Budget and Personal Management",
  description: "Manage your budget and personal finances",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html>
      <head>
        <title>Budget and Personal Management</title>
      </head>
      <body>
        <UserProvider>
          {children}
        </UserProvider>
      </body>
    </html>
  );
}