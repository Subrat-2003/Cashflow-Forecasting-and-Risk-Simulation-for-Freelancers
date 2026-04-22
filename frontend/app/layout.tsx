import "./globals.css";

export const metadata = {
  title: "Cashflow Forecasting & Risk Simulation",
  description: "AI-driven financial distress early warning system for freelancers",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="antialiased font-sans bg-black">
        {children}
      </body>
    </html>
  );
}
