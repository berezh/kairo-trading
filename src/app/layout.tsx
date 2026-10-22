import type { Metadata } from "next";
import { Suspense } from "react";
import Providers from "./providers";
import "antd/dist/reset.css";
import "./globals.scss";

export const metadata: Metadata = {
  title: "Kairo Trading",
  description: "A considered workspace for your trading research and market tools.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en">
      <body>
        <Suspense fallback={<p role="status">Loading Kairo Trading...</p>}>
          <Providers>{children}</Providers>
        </Suspense>
      </body>
    </html>
  );
}
