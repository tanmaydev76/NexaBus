import type { Metadata } from "next";
import "./globals.css";
import { OperatorAuthProvider } from "@/context/OperatorAuthContext";

export const metadata: Metadata = {
  title: "NexaBus Operator",
  description: "NexaBus operator dashboard",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <OperatorAuthProvider>{children}</OperatorAuthProvider>
      </body>
    </html>
  );
}
