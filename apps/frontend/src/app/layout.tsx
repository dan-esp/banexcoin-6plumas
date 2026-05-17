import { ClerkProvider } from "@clerk/nextjs";
import type { Metadata } from "next";
import { Geist_Mono, Inter } from "next/font/google";
import { cookies } from "next/headers";
import { ThemeProvider } from "@/components/theme/theme-provider";
import { brandMetadata } from "@/lib/brand";
import { isDarkTheme, THEME_COOKIE_NAME } from "@/lib/theme";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  applicationName: brandMetadata.applicationName,
  description: brandMetadata.description,
  icons: {
    icon: "/icon.svg",
    shortcut: "/icon.svg",
  },
  title: brandMetadata.title,
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const cookieStore = await cookies();
  const initialTheme = isDarkTheme(cookieStore.get(THEME_COOKIE_NAME)?.value)
    ? "dark"
    : "light";

  return (
    <ClerkProvider>
      <html
        lang="es"
        suppressHydrationWarning
        className={`${inter.variable} ${geistMono.variable} h-full antialiased ${initialTheme === "dark" ? "dark" : ""}`}
        data-theme={initialTheme}
      >
        <body className="min-h-full flex flex-col">
          <ThemeProvider>{children}</ThemeProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
