"use client";

import Footer from "@/components/Footer";
import Header from "@/components/Header";
import ScrollToTop from "@/components/ScrollToTop";
import { AuthProvider } from "@/lib/useAuth";
import { Inter } from "next/font/google";
import "node_modules/react-modal-video/css/modal-video.css";
import "../styles/index.css";
import { usePathname } from "next/navigation";
import { Providers } from "./providers";

const inter = Inter({ subsets: ["latin"] });

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  // Lista stron, na których NIE chcemy nagłówka i stopki
  const noHeaderFooterRoutes = ["/error", "/404", "/403", "/signin", "/signup"];

  // Sprawdzamy, czy obecna ścieżka jest na liście wykluczonych
  const showHeaderFooter = !noHeaderFooterRoutes.includes(pathname);

  return (
    <html suppressHydrationWarning lang="pl">
      {/* TUTAJ ZMIANA: Zamiast <head /> wpisaliśmy tagi na sztywno.
         To rozwiązuje problem braku tytułu w komponentach "use client".
      */}
    <head>
        <title>Foodie - Odkryj najlepsze smaki</title>
        <meta name="description" content="Najlepsze jedzenie w Twojej okolicy." />
        {/* Wymuszamy nowe logo parametrem ?v=2 */}
        <link rel="icon" href="/favicon.ico" sizes="any" />
      </head>



      <body className={`bg-primary-light dark:bg-bg-color-dark ${inter.className}`}>
        <Providers>
          <AuthProvider>
            {/* Wyświetlamy Header tylko jeśli nie jesteśmy na stronie logowania/błędu */}
            {showHeaderFooter && <Header />}
            
            {children}
            
            {/* Wyświetlamy Footer tylko jeśli nie jesteśmy na stronie logowania/błędu */}
            {showHeaderFooter && <Footer />}
            
            <ScrollToTop />
          </AuthProvider>
        </Providers>
      </body>
    </html>
  );
}