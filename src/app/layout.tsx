import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Ethio Parents' School Portal",
  description: "Connecting Admins, Teachers, Students, and Parents around attendance, grades, tests, and communication.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased min-h-screen">
        {children}
      </body>
    </html>
  );
}
