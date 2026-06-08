import { AuthNavbar } from "@/components/auth-navbar";

export default function CustomerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <AuthNavbar />
      <main className="flex-1 flex flex-col w-full">
        {children}
      </main>
    </>
  );
}

