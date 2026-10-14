import { Footer } from "@/components/landing/Footer";
import { Navbar } from "@/components/landing/Navbar";

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Navbar />
      <main className="flex-1 flex flex-col w-full px-4 sm:px-8 md:px-14 lg:px-20 xl:px-28">
        {children}
      </main>
      <Footer />
    </>
  );
}
