import { Navbar } from "@/components/landing/Navbar";

export default function CustomerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col w-full bg-white text-landing-dark">
      <Navbar />
      <main className="flex-1 flex flex-col w-full pt-16 sm:pt-20">
        {children}
      </main>
    </div>
  );
}

