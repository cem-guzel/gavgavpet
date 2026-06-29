import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import ContactFAB from '@/components/ContactFAB';

export const metadata: Metadata = {
  title: "Pet Kuaför Sarıyer & Maslak | GavgavPet – Premium Köpek ve Kedi Bakımı",
  description:
    "Sarıyer Maslak 1453'te hizmet veren GavgavPet; köpek tıraşı, kedi bakımı, spa ve grooming ile İstanbul'un en özel pet kuaförü.",
};
export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Navbar />
      
      <main className="flex-grow w-full">
        {children}
      </main>
<ContactFAB />
    </>
  );
}