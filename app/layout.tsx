import type { Metadata } from "next";
import "@uploadthing/react/styles.css";
import "./globals.css";
import { Toaster } from "sonner";
import { Playfair_Display, Lato } from "next/font/google";
import Loader from "@/components/Loader";

// 1. DEĞİŞİKLİK: Türkçe karakter sorunu için "latin-ext" eklendi
const playfair = Playfair_Display({
  variable: "--font-serif",
  subsets: ["latin", "latin-ext"],
  weight: ["400", "500", "600", "700"],
});

// 1. DEĞİŞİKLİK: Türkçe karakter sorunu için "latin-ext" eklendi
const lato = Lato({
  variable: "--font-sans",
  subsets: ["latin", "latin-ext"],
  weight: ["300", "400", "700"],
});

export const metadata: Metadata = {
  // 2. DEĞİŞİKLİK: WWW sorununu kökten çözen Base URL eklendi
  metadataBase: new URL("https://www.gavgavpet.com"),
  
  title: {
    default: "Pet Kuaför Sarıyer & Maslak | GavgavPet – Premium Köpek ve Kedi Bakımı",
    template: "%s | GavgavPet",
  },
  description:
    "Sarıyer Maslak 1453'te hizmet veren GavgavPet; köpek tıraşı, kedi bakımı, spa ve grooming hizmetleriyle İstanbul'un en özel pet kuaförü.",
  keywords: [
    "pet kuaför sarıyer",
    "pet kuaför maslak",
    "köpek kuaförü sarıyer",
    "köpek tıraşı maslak",
    "kedi tıraşı sarıyer",
    "pet grooming istanbul",
    "gavgavpet",
  ],
  openGraph: {
    title: "Pet Kuaför Sarıyer & Maslak | GavgavPet",
    description:
      "Sarıyer Maslak 1453'te köpek ve kedi bakımı. Makas tıraş, spa, ozon terapi ve daha fazlası.",
    url: "https://www.gavgavpet.com", // 3. DEĞİŞİKLİK: WWW eklendi
    siteName: "GavgavPet",
    locale: "tr_TR",
    type: "website",
  },
  icons: {
    icon: "/paw2.png",
    apple: "/paw2.png",
  },
  // 4. DEĞİŞİKLİK: metadataBase kullanıldığı için sadece "/" yazmak yeterli
  alternates: {
    canonical: "/",
  },
};

// ✅ JSON-LD SCHEMA
const jsonLd = {
  "@context": "https://schema.org",
  "@type": "LocalBusiness",
  "name": "GavgavPet",
  "description": "Sarıyer Maslak 1453'te hizmet veren premium pet kuaförü. Köpek tıraşı, kedi bakımı, spa ve grooming.",
  "url": "https://www.gavgavpet.com", // 3. DEĞİŞİKLİK: WWW eklendi
  "telephone": "+905368994374",
  "email": "gavgavpetkuafor@gmail.com",
  "address": {
    "@type": "PostalAddress",
    "streetAddress": "Maslak 1453 Sitesi, T4b Blok, -4. Kat, No: 213",
    "addressLocality": "Sarıyer",
    "addressRegion": "İstanbul",
    "postalCode": "34398",
    "addressCountry": "TR"
  },
  "geo": {
    "@type": "GeoCoordinates",
    "latitude": 41.1323326,
    "longitude": 29.0118659
  },
  "openingHoursSpecification": [
    {
      "@type": "OpeningHoursSpecification",
      "dayOfWeek": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday","Saturday","Sunday"],
      "opens": "09:00",
      "closes": "19:00"
    }
  ],
  "sameAs": [
    "https://www.instagram.com/gavgavpet_kuafor"
  ],
  "priceRange": "₺₺₺",
  "hasMap": "https://www.google.com/maps/search/?api=1&query=GavGavPet+Maslak+1453",
  "areaServed": [
    { "@type": "City", "name": "Sarıyer" },
    { "@type": "City", "name": "Maslak" },
    { "@type": "City", "name": "İstanbul" }
  ]
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="tr" suppressHydrationWarning>
      <head>
        {/* ✅ JSON-LD buraya ekleniyor */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className={`${playfair.variable} ${lato.variable} font-sans antialiased min-h-screen flex flex-col bg-stone-50 text-rich-black`}>
        <Loader />
        {children}
        <Toaster position="top-right" theme="dark" />
      </body>
    </html>
  );
}