import type { Metadata } from "next";
import "./globals.scss";

export const metadata: Metadata = {
  title: "Kairo Trading",
  description: "A considered workspace for your trading research and market tools.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
