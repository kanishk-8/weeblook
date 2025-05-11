import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Navbar from "../components/navbar";
import { ThemeProvider } from "../context/themeContext";
import { MangaProvider } from "@/context/mangaContext";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "WeebLook",
  description: "website for weebs",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <ThemeProvider>
        <MangaProvider>
          <body
            className={`${geistSans.variable} ${geistMono.variable} antialiased bg-black`}
          >
            <Navbar />
            {children}
          </body>
        </MangaProvider>
      </ThemeProvider>
    </html>
  );
}
