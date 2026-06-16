import { Inter } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";
import { Toaster } from "react-hot-toast";
import { AuthProvider } from "@/context/AuthContext";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "NexaBus — Book Bus Tickets Online",
  description: "Book bus tickets easily across Maharashtra. Fast, simple, and reliable.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-gray-50 min-h-screen`}>
        <AuthProvider>
          <Header />
          <main>{children}</main>
          <Toaster position="top-right" toastOptions={{ duration: 3000 }} />
        </AuthProvider>
      </body>
    </html>
  );
}
