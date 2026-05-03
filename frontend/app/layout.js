import "./globals.css";

export const metadata = {
  title: "HR Screening Agent",
  description: "AI-Powered Candidate Screening by Gemini",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
