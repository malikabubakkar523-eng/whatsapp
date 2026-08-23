import type { Metadata } from "next";
import "./globals.css";
import { ThemeProvider } from "@/components/theme/ThemeProvider";
import { AuthProvider } from "@/components/auth/AuthContext";

export const metadata: Metadata = {
  title: "ChatFlow — Connect through Usernames. Chat in Real Time.",
  description:
    "ChatFlow is an original, privacy-first real-time messaging platform. Connect with people directly via unique @usernames with zero phone number requirements.",
  keywords: ["chat", "messaging", "real-time", "chatflow", "username", "socket.io", "next.js"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body
        suppressHydrationWarning
        className="antialiased min-h-screen bg-chat-bg-light dark:bg-chat-bg-dark text-chat-text-light dark:text-chat-text-dark selection:bg-brand-500 selection:text-white transition-colors duration-200"
      >
        <ThemeProvider>
          <AuthProvider>{children}</AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
